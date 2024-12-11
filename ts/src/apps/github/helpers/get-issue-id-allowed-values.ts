import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';

type TGithubIssue = {
  id: number;
  number: string;
  title: string;
  body: string;
  labels: { name: string }[];
};

export const getGitHubIssueIdAllowedValues: TQoreGetAllowedValuesFunction = async (
  context
): Promise<IQoreAllowedValue[]> => {
  const { Octokit } = await import('@octokit/rest');
  const octokit = new Octokit({});
  const {
    conn_opts: { token },
    opts: { owner, repo },
  } = context;

  const issues = await octokit.paginate(`GET https://api.github.com/repos/{owner}/{repo}/issues`, {
    owner,
    repo,
    per_page: 100,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return issues.map(
    (issue: TGithubIssue): IQoreAllowedValue => ({
      value: issue.number.toString(),
      display_name: issue.title,
      short_desc: `Title:${issue.title}\n\nLabels: [${issue.labels.map((label) => label?.name).join(', ')}]`,
      desc: issue.body,
    })
  );
};
