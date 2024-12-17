import { Octokit } from '@octokit/rest';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { Debugger } from '../../../utils/Debugger';

const PER_PAGE = 100;
const MAX_ITEMS = 600;

export const getGitHubOwnerAllowedValues: TQoreGetAllowedValuesFunction = async (
  context
): Promise<IQoreAllowedValue[]> => {
  const {
    conn_opts: { token },
    opts: { repo },
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

    if (repo) {
      let itemCount = 0;
      const foundRepos = await octokit.paginate(
        `GET /search/repositories`,
        {
          q: `${repo} in:name`,
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

      repos = foundRepos.filter((repository) => repository.name === repo);
    } else {
      const userRepos = await octokit.paginate(`GET /user/repos`, {
        per_page: PER_PAGE,
      });

      repos = Array.from(
        new Map(userRepos.map((repository) => [repository.owner.login, repository])).values()
      );
    }

    return repos.map(
      (repo): IQoreAllowedValue => ({
        value: repo.owner.login,
        display_name: repo.owner.login,
        desc: `Type: ${repo.owner.type}\n\n Link: [View on GitHub](${repo.owner.html_url})`,
        image: repo.owner.avatar_url,
      })
    );
  } catch (err) {
    Debugger.log('Github Owner allowed values error', err);

    return [];
  }
};
