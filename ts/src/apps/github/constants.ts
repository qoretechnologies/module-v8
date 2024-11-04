import { TAllowedPaths } from '../../global/models/qore';

export const GITHUB_APP_NAME = 'Github';
export const GITHUB_ALLOWED_PATHS: TAllowedPaths = {
  '/repos/{owner}/{repo}/pulls': {},
  '/repos/{owner}/{repo}/pulls/{pull_number}': {},
  '/repos/{owner}/{repo}/issues': {},
  '/repos/{owner}/{repo}/issues/{issue_number}': {},
  '/repos/{owner}/{repo}/commits': {},
  '/repos/{owner}/{repo}/branches': {},
  '/repos/{owner}/{repo}/releases': {},
  '/repos/{owner}/{repo}/contributors': {},
  '/orgs/{org}/members': {},
  '/orgs/{org}/repos': {},
  '/repos/{owner}/{repo}': {},
  '/repos/{owner}/{repo}/contents/{path}': {},
  '/issues': {},
  '/user/repos': {},
  '/search/repositories': {},
  '/search/issues': {},
  '/repos/{owner}/{repo}/collaborators': {},
  '/repos/{owner}/{repo}/actions/workflows': {},
  '/repos/{owner}/{repo}/issues/{issue_number}/assignees': {},
  '/repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers': {},
  '/repos/{owner}/{repo}/git/refs': {},
  '/repos/{owner}/{repo}/branches/{branch}': {},
  '/repos/{owner}/{repo}/actions/secrets/{secret_name}': {},
  '/repos/{owner}/{repo}/actions/secrets/public-key': {},
};
