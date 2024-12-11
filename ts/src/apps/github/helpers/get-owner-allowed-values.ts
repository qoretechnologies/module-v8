import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { Octokit } from '@octokit/rest';

const PER_PAGE = 100;
const MAX_ITEMS = 300;

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
      repos = await octokit.paginate(`GET /user/repos`, {
        per_page: PER_PAGE,
      });
    }

    return repos.map(
      (repo): IQoreAllowedValue => ({
        value: repo?.owner?.login,
        display_name: repo?.owner?.login,
        desc: `Type: ${repo.owner.type}\n\n Link: [View on GitHub](${repo.owner.url})`,
      })
    );
  } catch (err) {
    return [];
  }
};
