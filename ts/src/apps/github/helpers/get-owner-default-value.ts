import { Octokit } from '@octokit/rest';
import { TCustomConnOptions, TQoreGetDefaultValueFunction } from '@qoretechnologies/ts-toolkit';
import { Debugger } from '../../../utils/Debugger';
import { GITHUB_ALLOWED_VALUES_TIMEOUT } from './constants';

const PER_PAGE = 100;
const MAX_ITEMS = 600;

export const getGitHubOwnerDefaultValue: TQoreGetDefaultValueFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const token = context?.conn_opts?.token;
  const opts = context?.opts;

  if (!token) {
    throw new Error('The token is required to get Github owner allowed values');
  }

  const octokit = new Octokit({
    auth: token,
  });

  try {
    const repos: { owner: { login: string } }[] = [];
    const user = await octokit.users.getAuthenticated();
    const startTime = Date.now();

    Debugger.log('Github Owner allowed values opts', {
      opts: context.opts,
      isTokenPresent: !!token,
    });

    if (opts?.repo) {
      let itemCount = 0;
      for await (const response of octokit.paginate.iterator('GET /search/repositories', {
        q: `${opts.repo} in:name`,
        per_page: PER_PAGE,
      })) {
        itemCount += response.data.length;

        const reposWithOwner = response.data.filter(
          (repository) => repository.name === opts.repo && repository.owner
        ) as { owner: { login: string } }[];

        repos.push(...reposWithOwner);

        if (itemCount >= MAX_ITEMS || Date.now() - startTime > GITHUB_ALLOWED_VALUES_TIMEOUT) {
          break;
        }
      }
      if (repos[0]) {
        return repos[0].owner.login;
      }
    }

    return user.data.login;
  } catch (err) {
    Debugger.log('Github Owner allowed values error', err);

    if (!opts?.repo) {
      const user = await octokit.users.getAuthenticated();

      return user.data.login;
    }

    return '';
  }
};
