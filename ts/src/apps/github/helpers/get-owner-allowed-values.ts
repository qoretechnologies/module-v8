import { Octokit } from '@octokit/rest';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { Debugger } from '../../../utils/Debugger';
import { GITHUB_ALLOWED_VALUES_TIMEOUT } from './constants';

const PER_PAGE = 100;
const MAX_ITEMS = 600;

const mapGithubRepoToOwner = (repo: {
  owner: { login: string; type: string; html_url: string; avatar_url: string };
}): IQoreAllowedValue<string> => {
  return {
    value: repo.owner.login,
    display_name: repo.owner.login,
    desc: `Type: ${repo.owner.type}\n\n Link: [View on GitHub](${repo.owner.html_url})`,
    image: repo.owner.avatar_url,
  };
};

export const getGitHubOwnerAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;
  const opts = context?.opts;

  if (!token) {
    throw new Error('The token is required to get Github owner allowed values');
  }

  const octokit = new Octokit({
    auth: token,
  });

  const owners: IQoreAllowedValue<string>[] = [];
  const startTime = Date.now();

  Debugger.log('Github Owner allowed values opts', {
    opts: context.opts,
    isTokenPresent: !!token,
  });

  try {
    if (opts?.repo) {
      let itemCount = 0;

      for await (const response of octokit.paginate.iterator('GET /search/repositories', {
        q: `${opts.repo} in:name`,
        per_page: PER_PAGE,
      })) {
        itemCount += response.data.length;

        const repos = response.data.filter((repository) => repository.name === opts.repo);

        const reposWithOwner = repos.filter((repository) => repository.owner) as {
          owner: { login: string; type: string; html_url: string; avatar_url: string };
        }[];

        owners.push(...reposWithOwner.map(mapGithubRepoToOwner));

        if (itemCount >= MAX_ITEMS || Date.now() - startTime > GITHUB_ALLOWED_VALUES_TIMEOUT) {
          break;
        }
      }
    } else {
      for await (const response of octokit.paginate.iterator('GET /user/repos', {
        per_page: PER_PAGE,
      })) {
        const repos = Array.from(
          new Map(response.data.map((repository) => [repository.owner.login, repository])).values()
        );

        const reposWithOwner = repos.filter((repository) => repository.owner);

        owners.push(...reposWithOwner.map(mapGithubRepoToOwner));

        if (Date.now() - startTime > GITHUB_ALLOWED_VALUES_TIMEOUT) {
          break;
        }
      }
    }

    return owners;
  } catch (err) {
    Debugger.log('Github Owner allowed values error', err);

    return owners;
  }
};
