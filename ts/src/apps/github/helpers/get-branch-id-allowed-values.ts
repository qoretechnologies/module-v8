import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { Octokit } from '@octokit/rest';
import { Debugger } from '../../../utils/Debugger';
import { GITHUB_ALLOWED_VALUES_TIMEOUT } from './constants';

export const getGitHubBranchIdAllowedValues: TQoreGetAllowedValuesFunction = async (
  context
): Promise<IQoreAllowedValue[]> => {
  const {
    conn_opts: { token },
    opts: { owner, repo },
  } = context;

  Debugger.log('Github Branch allowed values opts', {
    opts: context.opts,
    isTokenPresent: !!token,
  });

  const octokit = new Octokit({
    auth: token,
  });

  const branches: IQoreAllowedValue[] = [];
  const startTime = Date.now();

  try {
    for await (const response of octokit.paginate.iterator('GET /repos/{owner}/{repo}/branches', {
      owner,
      repo,
      per_page: 100,
    })) {
      branches.push(
        ...response.data.map(
          (branch): IQoreAllowedValue => ({
            value: branch.name,
            display_name: branch.name,
          })
        )
      );

      if (Date.now() - startTime > GITHUB_ALLOWED_VALUES_TIMEOUT) {
        break;
      }
    }
  } catch (err) {
    Debugger.log('Github Branch allowed values error', err);

    return branches;
  }

  return branches;
};
