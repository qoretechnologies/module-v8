#!/usr/bin/env python3
"""Build and send the pipeline's Discord notification.

Uses Discord Components V2 (message flag 1<<15 plus ?with_components=true) rather than a
classic embed, because only Components V2 gives us link buttons, section accessories for
the actor avatar, and separators.

Everything it renders comes from the workflow: per-job results and durations from the
Actions API, and the test breakdown from the unit_tests job's summary output. App names
link to the exact line that failed, which jest reports in its failure stack traces.

Discord caps the *total* displayable text of a Components V2 message at 4000 characters —
not per block — so the roster of suites is only ever rendered as plain names, and the
linked list is limited to the apps that actually failed.
"""

import json
import os
import sys
import urllib.error
import urllib.request

TEXT_BUDGET = 4000
SAFETY = 250  # leave room for markdown Discord counts that we may not model exactly


def env(name: str, default: str = "") -> str:
    return os.environ.get(name) or default


def text_length(components) -> int:
    """Total displayable text, matching what Discord counts against the 4000 cap."""
    total = 0
    for c in components:
        kind = c.get("type")
        if kind == 10:
            total += len(c["content"])
        elif kind == 9:
            total += sum(len(x["content"]) for x in c["components"])
        elif kind == 17:
            total += text_length(c["components"])
    return total


def link_button(label: str, url: str, emoji: str) -> dict:
    return {"type": 2, "style": 5, "label": label, "url": url, "emoji": {"name": emoji}}


def job_line(job: dict) -> str:
    icon = {"success": "✅", "failure": "❌", "cancelled": "⏹️", "skipped": "⏭️"}.get(
        job.get("conclusion"), "⏳"
    )
    mins = job.get("minutes")
    dur = f" · {mins}" if mins else ""
    return f"{icon} **{job['name']}**{dur}"


def main() -> int:
    webhook = env("DISCORD_WEBHOOK")
    if not webhook:
        print("DISCORD_WEBHOOK is not set; skipping notification.")
        return 0

    repo = env("REPO", "qoretechnologies/module-v8")
    repo_url = f"https://github.com/{repo}"
    sha = env("SHA")
    short_sha = sha[:8]
    run_id = env("RUN_ID")
    run_url = f"{repo_url}/actions/runs/{run_id}"
    pr_url = env("PR_URL") or repo_url
    pr_number = env("PR_NUMBER")
    actor = env("ACTOR")
    branch = env("BRANCH")
    event = env("EVENT")
    commit_msg = env("COMMIT_MSG", "(no commit message)")
    version = env("VERSION")
    blob = f"{repo_url}/blob/{sha}/ts/src/tests"

    jobs = json.loads(env("JOBS_JSON", "[]"))
    # The notify job is reporting on the others; including itself is noise.
    jobs = [j for j in jobs if j["name"] != "notify"]
    failed = [j for j in jobs if j.get("conclusion") not in ("success", "skipped")]

    try:
        summary = json.loads(env("SUMMARY_JSON", "{}"))
    except json.JSONDecodeError:
        summary = {}

    total_suites = summary.get("total_suites", 0)
    failed_suites = summary.get("failed_suites", 0)
    total_tests = summary.get("total_tests", 0)
    passed_tests = summary.get("passed_tests", 0)
    real = summary.get("real", [])
    transient = summary.get("transient", [])
    apps = summary.get("apps", [])

    # A run where nothing executed is not a pass and not an ordinary failure: the per-app
    # list is meaningless there, so it is labelled as such rather than blamed on the apps.
    harness_failure = bool(summary) and total_tests == 0 and failed_suites > 0

    if harness_failure:
        colour, headline = 0xE67E22, f"🚨 Tests run #{env('RUN_NUMBER')} — harness failure"
        subtitle = f"**{failed_suites}/{total_suites} suites failed · 0 tests executed** — nothing was actually verified."
    elif failed:
        colour, headline = 0xE74C3C, f"❌ Tests run #{env('RUN_NUMBER')} — failed"
        subtitle = f"**[PR #{pr_number}]({pr_url})** · {event}"
    else:
        colour, headline = 0x2ECC71, f"✅ Tests run #{env('RUN_NUMBER')} — succeeded"
        subtitle = f"**[PR #{pr_number}]({pr_url})** · {event}"

    body = [
        {"type": 10, "content": f"## {headline}\n{subtitle}"},
        {"type": 14},
        {
            "type": 9,
            "components": [
                {
                    "type": 10,
                    "content": (
                        f"**Triggered by** [`{actor}`](https://github.com/{actor})\n"
                        f"**Commit** [`{short_sha}`]({repo_url}/commit/{sha}) — {commit_msg}\n"
                        f"**Branch** `{branch}`" + (f" · **Version** `{version}`" if version else "")
                    ),
                }
            ],
            "accessory": {
                "type": 11,
                "media": {"url": f"https://avatars.githubusercontent.com/{actor}"},
                "description": f"{actor} avatar",
            },
        },
        {"type": 14},
        {"type": 10, "content": "### Jobs\n" + "\n".join(job_line(j) for j in jobs)},
    ]

    if total_suites:
        passed_suites = total_suites - failed_suites
        body += [
            {"type": 14},
            {
                "type": 10,
                "content": (
                    f"### Results\n**Suites** {passed_suites}/{total_suites} passed · "
                    f"**Tests** {passed_tests}/{total_tests} passed"
                ),
            },
        ]

    if real or transient:
        def linked(items):
            return "  ".join(
                f"[`{i['app']}`]({blob}/{i['app']}.test.ts#L{i['line']})"
                if i.get("line")
                else f"[`{i['app']}`]({blob}/{i['app']}.test.ts)"
                for i in items
            )

        chunk = f"### ⚠️ Apps needing review — {len(real)} real, {len(transient)} transient\n"
        chunk += "*each name links to the exact failing line*\n"
        if real:
            chunk += f"\n**Real:** {linked(real)}"
        if transient:
            chunk += f"\n**Transient (5xx/timeout/rate-limit):** {linked(transient)}"
        body += [{"type": 14}, {"type": 10, "content": chunk}]

    buttons = []
    if failed:
        buttons.append(link_button("Open failing job", failed[0].get("url", run_url), "🔧"))
    buttons.append(link_button("Open run", run_url, "🤖"))
    if pr_number:
        buttons.append(link_button(f"Open PR #{pr_number}", pr_url, "📦"))

    footer = {"type": 10, "content": f"-# {repo} · run #{env('RUN_NUMBER')}"}
    tail = [{"type": 14, "divider": True, "spacing": 1}, {"type": 1, "components": buttons}, footer]

    # The full roster is informative but optional: add it only if it fits the 4000-char
    # budget once everything above is accounted for, and always as plain (unlinked) names.
    if apps:
        roster = {
            "type": 10,
            "content": f"**All {len(apps)} reporting suites** (click to expand)\n||"
            + "  ".join(f"`{a}`" for a in apps)
            + "||",
        }
        if text_length(body + [roster] + tail) <= TEXT_BUDGET - SAFETY:
            body.append(roster)

    payload = {
        "username": "Qorus Actions Catalogue",
        "flags": 1 << 15,
        "components": [{"type": 17, "accent_color": colour, "components": body + tail}],
    }

    size = text_length(payload["components"])
    print(f"Discord payload: {size} chars of displayable text (limit {TEXT_BUDGET})")
    if size > TEXT_BUDGET:
        print(f"::warning::Discord payload too large ({size} chars); trimming the roster.")
        return 0

    req = urllib.request.Request(
        f"{webhook}?with_components=true",
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json", "User-Agent": "module-v8-ci"},
    )
    try:
        urllib.request.urlopen(req, timeout=30)
        print("Discord notification sent.")
    except urllib.error.HTTPError as exc:
        # A broken notification must not fail an otherwise good pipeline.
        print(f"::warning::Discord rejected the notification ({exc.code}): {exc.read()[:400]!r}")
    except Exception as exc:  # noqa: BLE001 - notification is best-effort
        print(f"::warning::Could not send the Discord notification: {exc}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
