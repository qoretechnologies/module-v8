import { Octokit } from '@octokit/rest';
import { TQoreGetDefaultValueFunction } from '../../../global/models/qore';
import { Debugger } from '../../../utils/Debugger';

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
    let repos = [];

    Debugger.log('Github Owner allowed values opts', {
      opts: context.opts,
      isTokenPresent: !!token,
    });

    if (opts?.repo) {
      let itemCount = 0;
      const foundRepos = await octokit.paginate(
        `GET /search/repositories`,
        {
          q: `${opts?.repo} in:name`,
          per_page: PER_PAGE,
        },
        (response, done) => {
          itemCount += response.data.length;
          if (itemCount >= MAX_ITEMS) {
            done();
          }

          return response.data;
        }
      );

      repos = foundRepos.filter((repository) => repository.name === opts?.repo);

      if (repos[0]) {
        return repos[0].owner.login;
      }
    }
  } catch (err) {
    Debugger.log('Github Owner allowed values error', err);

    if (!opts?.repo) {
      const user = await octokit.users.getAuthenticated();

      return user.data.login;
    }
  }
};
