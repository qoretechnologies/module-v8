import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { Octokit } from '@octokit/rest';
import { Debugger } from '../../../utils/Debugger';
import { GITHUB_ALLOWED_VALUES_TIMEOUT } from './constants';

const PER_PAGE = 100;

const mapGithubRepo = (repo: {
  id: number;
  name: string;
  full_name: string;
  description: string;
  owner: { avatar_url: string };
}): IQoreAllowedValue => ({
  value: repo.name,
  display_name: repo.name,
  short_desc: repo.full_name,
  desc: repo.description,
  image: repo.owner?.avatar_url,
});

export const getGitHubRepositoryIdAllowedValues: TQoreGetAllowedValuesFunction = async (
  context
): Promise<IQoreAllowedValue[]> => {
  const {
    conn_opts: { token },
    opts,
  } = context;
  const octokit = new Octokit({
    auth: token,
  });

  Debugger.log('Github Repo allowed values opts', {
    opts: context.opts,
    isTokenPresent: !!token,
  });

  const repos: IQoreAllowedValue[] = [];
  const startTime = Date.now();
  try {
    if (opts?.owner) {
      for await (const response of octokit.paginate.iterator(`GET /search/repositories`, {
        q: `user:${opts.owner}`,
        per_page: PER_PAGE,
      })) {
        repos.push(...response.data.map(mapGithubRepo));

        if (Date.now() - startTime > GITHUB_ALLOWED_VALUES_TIMEOUT) {
          break;
        }
      }
    } else {
      for await (const response of octokit.paginate.iterator(`GET /user/repos`, {
        per_page: PER_PAGE,
      })) {
        repos.push(...response.data.map(mapGithubRepo));

        if (Date.now() - startTime > GITHUB_ALLOWED_VALUES_TIMEOUT) {
          break;
        }
      }
    }

    return repos;
  } catch (err) {
    Debugger.log('Github Repo allowed values error', err);

    return repos;
  }
};
