import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { Octokit } from '@octokit/rest';

const PER_PAGE = 100;

export const getGitHubRepositoryIdAllowedValues: TQoreGetAllowedValuesFunction = async (
  context
): Promise<IQoreAllowedValue[]> => {
  const {
    conn_opts: { token },
    opts: { owner },
  } = context;
  const octokit = new Octokit({
    auth: token,
  });

  try {
    let repos = [];

    if (owner) {
      repos = await octokit.paginate(`GET /search/repositories`, {
        q: `user:${owner}`,
        per_page: PER_PAGE,
      });
    } else {
      repos = await octokit.paginate(`GET /user/repos`, {
        per_page: PER_PAGE,
      });
    }

    return repos.map(
      (repo): IQoreAllowedValue => ({
        value: repo.id.toString(),
        display_name: repo.name,
        short_desc: repo.full_name,
        desc: repo.description,
      })
    );
  } catch (err) {
    return [];
  }
};
