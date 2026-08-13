export const MONDAY_APP_NAME = 'Monday';

/**
 * The monday.com API version every request pins itself to.
 *
 * monday rolls a new version to *Current* every quarter and a request that sends no `API-Version`
 * header rides whatever Current happens to be, so the application silently changes behaviour on
 * monday's schedule. Always the current stable version, **never** the release candidate: `2026-10`
 * is RC until it becomes Current on 2026-10-01, and it removes the deprecated `User` fields this
 * application still selects (`enabled`, `is_guest`, `photo_thumb`).
 */
export const MONDAY_API_VERSION = '2026-07';

/**
 * The maximum page size monday accepts for the paged root queries.
 *
 * `2026-07` caps `users` at 1000 and rejects anything larger; the same query returns only 200 rows
 * when `limit` is omitted, so the argument is never optional.
 */
export const MONDAY_MAX_PAGE_SIZE = 1000;

/**
 * The page size used for the `boards` query.
 *
 * `boards` documents a default of 25 and no maximum. 100 matches the cap monday applies to its
 * other paginated root queries and keeps a board page well inside the per-minute complexity
 * budget, which a 1000-board page selecting nested fields would not.
 */
export const MONDAY_BOARD_PAGE_SIZE = 100;

/**
 * How many board items a picker offers.
 *
 * `items_page` defaults to 25 and a board is unbounded — tens of thousands of items is ordinary —
 * so a dropdown deliberately shows a bounded, most-recent window rather than paging the whole
 * board. The bound is stated here so it is a decision rather than monday's default applied by
 * accident.
 */
export const MONDAY_ALLOWED_VALUES_PAGE_SIZE = 100;

/**
 * How many board items are read per page when every matching item is genuinely needed.
 *
 * `items_page` accepts at most 500.
 */
export const MONDAY_ITEMS_PAGE_SIZE = 500;

export const MONDAY_APP_LOGO =
  `PHN2ZyBoZWlnaHQ9IjE1NDkiIHZpZXdCb3g9Ii0xLjY2IC00LjEwMjA0OTMyID` +
  `I0My4wNSAxNDcuNTEyMDQ5MzIiIHdpZHRoPSIyNTAwIiB4bWxucz0iaHR0cDov` +
  `L3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Im0xMjAuMjQgMTQzLjE2Yy` +
  `D0xMC42My0uMjYtMTkuNC00Ljk1LTI1LTE0Ljc0LTUuNzQtMTAuMTItNS40OS0` +
  `yMC40OC42My0zMC4zNSAxNC41Ny0yMy40OSAyOS4zMy00Ni44NSA0NC03MC4yN` +
  `yAzLTQuNzkgNS45My05LjY1IDkuMDctMTQuMzVhMjkuNCAyOS40IDAgMCAxIDQ` +
  `wLTkuMDljMTMuODEgOC41MSAxOC40MyAyNi4yMSA5LjgzIDQwLjE2cS0yNi4zN` +
  `yA0Mi45NS01My40OSA4NS40OGMtNS41NyA4Ljc3LTE0LjAyIDEzLTI1LjA0IDE` +
  `zLjE2eiIgZmlsbD0iI2ZmY2IwMCIvPjxwYXRoIGQ9Im0yOC45NCAxNDMuMTZj` +
  `LTEwLjczLS4yNi0xOS40NS01LjE2LTI0Ljk0LTE0LjkxLTUuNjYtMTAuMTItNS` +
  `4zLTIwLjUuODQtMzAuMzdxMjMuNTEtMzcuNzIgNDcuMjMtNzUuMzNjMi0zLjI0` +
  `IDQtNi41NiA2LjE0LTkuN2EyOS40MSAyOS40MSAwIDAgMSA0OS40MSAzMS44Nm` +
  `MtMTcuNTIgMjguMjktMzUuMjggNTYuNDgtNTMuMDUgODQuNjQtNS43NyA5LjEz` +
  `LTE0LjI2IDEzLjY1LTI1LjYzIDEzLjgxeiIgZmlsbD0iI2ZmM2Q1NyIvPjxwYX` +
  `RoIGQ9Im0yMTIuMTMgODUuODJjMTYuMTcuMDggMjkuMjYgMTIuOTMgMjkuMjMg` +
  `MjguNjkgMCAxNi0xMy40NCAyOC45LTI5Ljc2IDI4LjdzLTI5LjE4LTEyLjkxLT` +
  `I5LjE2LTI4Ljc0Yy4wMi0xNi4wNiAxMy4xNi0yOC43NSAyOS42OS0yOC42NXoi` +
  `IGZpbGw9IiMwMGQ2NDciLz48L3N2Zz4`;

export class MondayError extends Error {
  public errorCode?: string;

  constructor(message: string, errorCode?: string) {
    super(message);
    this.name = 'MondayError';
    this.errorCode = errorCode;
  }
}
