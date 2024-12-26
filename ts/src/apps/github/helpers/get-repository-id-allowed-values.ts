import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { Octokit } from '@octokit/rest';
import { Debugger } from '../../../utils/Debugger';

const PER_PAGE = 100;

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

  try {
    let repos = [];

    if (opts?.owner) {
      repos = await octokit.paginate(`GET /search/repositories`, {
        q: `user:${opts.owner}`,
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
        image: repo.owner?.avatar_url,
      })
    );
  } catch (err) {
    Debugger.log('Github Repo allowed values error', err);

    return [];
  }
};
