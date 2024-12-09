import { TAllowedPaths } from '../../global/models/qore';

export const GITHUB_APP_NAME = 'Github';
export const GITHUB_ALLOWED_PATHS: TAllowedPaths = {
  '/repos/{owner}/{repo}/pulls': {
    GET: {},
    POST: {
      override_options: {
        title: { required: true },
        head: { required: true },
        base: { required: true },
        body: { required: true },
      },
    },
  },
  '/repos/{owner}/{repo}/pulls/{pull_number}': {
    GET: {},
    PATCH: {},
  },
  '/repos/{owner}/{repo}/issues': {
    GET: {},
    POST: {
      override_options: {
        title: { required: true },
        body: { required: true },
      },
    },
  },
  '/repos/{owner}/{repo}/issues/{issue_number}': {
    GET: {},
    PATCH: {},
  },
  '/repos/{owner}/{repo}/commits': {
    GET: {},
  },
  '/repos/{owner}/{repo}/branches': {
    GET: {},
  },
  '/repos/{owner}/{repo}/releases': {
    GET: {},
    POST: {
      override_options: {
        tag_name: { required: true },
        name: { required: true },
        body: { required: true },
      },
    },
  },
  '/repos/{owner}/{repo}/contributors': {
    GET: {},
  },
  '/orgs/{org}/members': {
    GET: {},
  },
  '/orgs/{org}/repos': {
    GET: {},
    POST: {
      override_options: {
        name: { required: true },
      },
    },
  },
  '/repos/{owner}/{repo}': {
    GET: {},
    PATCH: {},
    DELETE: {},
  },
  '/repos/{owner}/{repo}/contents/{path}': {
    GET: {},
    PUT: {},
    DELETE: {},
  },
  '/issues': {
    GET: {},
  },
  '/user/repos': {
    GET: {},
    POST: {
      override_options: {
        name: { required: true },
      },
    },
  },
  '/search/repositories': {
    GET: {},
  },
  '/search/issues': {
    GET: {},
  },
  '/repos/{owner}/{repo}/collaborators': {
    GET: {},
  },
  '/repos/{owner}/{repo}/actions/workflows': {
    GET: {},
  },
  '/repos/{owner}/{repo}/issues/{issue_number}/assignees': {
    POST: {
      override_options: {
        assignees: { required: true },
      },
    },
    DELETE: {},
  },
  '/repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers': {
    POST: {
      override_options: {
        reviewers: { required_groups: ['reviewers'] },
        team_reviewers: { required_groups: ['team_reviewers'] },
      },
    },
    DELETE: {},
    GET: {},
  },
  '/repos/{owner}/{repo}/git/refs': {
    POST: {
      override_options: {
        ref: { required: true },
        sha: { required: true },
      },
    },
  },
  '/repos/{owner}/{repo}/branches/{branch}': {
    GET: {},
  },
  '/repos/{owner}/{repo}/actions/secrets/{secret_name}': {
    PUT: {},
    DELETE: {},
    GET: {},
  },
  '/repos/{owner}/{repo}/actions/secrets/public-key': { GET: {} },
};
