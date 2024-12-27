import { Octokit } from '@octokit/rest';
import { TQoreGetDefaultValueFunction } from '../../../global/models/qore';
import { Debugger } from '../../../utils/Debugger';
import { GITHUB_ALLOWED_VALUES_TIMEOUT } from './constants';

const PER_PAGE = 100;
const MAX_ITEMS = 600;

export const getGitHubOwnerDefaultValue: TQoreGetDefaultValueFunction<
  any,
  Promise<string>
> = async (context) => {
  const {
    conn_opts: { token },
    opts,
  } = context;

  const octokit = new Octokit({
    auth: token,
  });
  try {
    const repos: { owner: { login: string } }[] = [];
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

        repos.push(...response.data.filter((repository) => repository.name === opts.repo));

        if (itemCount >= MAX_ITEMS || Date.now() - startTime > GITHUB_ALLOWED_VALUES_TIMEOUT) {
          break;
        }
      }
      if (repos[0]) {
        return repos[0].owner.login;
      }
    } else {
      const user = await octokit.users.getAuthenticated();

      return user.data.login;
    }
  } catch (err) {
    Debugger.log('Github Owner allowed values error', err);

    if (!opts?.repo) {
      const user = await octokit.users.getAuthenticated();

      return user.data.login;
    }
  }
};
