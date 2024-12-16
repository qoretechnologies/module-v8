import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { Octokit } from '@octokit/rest';
import { Debugger } from '../../../utils/Debugger';

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

  const branches = await octokit.paginate(`GET /repos/{owner}/{repo}/branches`, {
    owner,
    repo,
    per_page: 100,
  });

  return branches.map(
    (branch): IQoreAllowedValue => ({
      value: branch.name,
      display_name: branch.name,
    })
  );
};
