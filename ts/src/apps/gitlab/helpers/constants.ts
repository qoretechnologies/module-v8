import { Gitlab } from '@gitbeaker/rest';

export const createGitlabClient = (opts: { url: string; token: string }) => {
  return new Gitlab({
    host: opts.url,
    token: opts.token,
  });
};
