import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { Octokit } from '@octokit/rest';
import { Debugger } from '../../../utils/Debugger';
import { GITHUB_ALLOWED_VALUES_TIMEOUT } from './constants';

const PER_PAGE = 100;

const mapGithubRepo = (repo: {
  id: number;
  name: string;
  full_name: string | null;
  description: string | null;
  owner: { avatar_url: string } | null;
}): IQoreAllowedValue<string> => ({
  value: repo.name,
  display_name: repo.name,
  short_desc: repo.full_name || undefined,
  desc: repo.description || undefined,
  ...(repo.owner?.avatar_url && { image: repo.owner.avatar_url }),
});

export const getGitHubRepositoryIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;
  const opts = context?.opts;

  if (!token) {
    throw new Error('The token is required to get Github repository allowed values');
  }

  const octokit = new Octokit({
    auth: token,
  });

  Debugger.log('Github Repo allowed values opts', {
    opts: context.opts,
    isTokenPresent: !!token,
  });

  const repos: IQoreAllowedValue<string>[] = [];
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
