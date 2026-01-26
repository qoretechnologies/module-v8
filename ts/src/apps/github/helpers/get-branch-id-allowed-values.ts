import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { Debugger } from '../../../utils/Debugger';
import { createGitHubClient, GITHUB_ALLOWED_VALUES_TIMEOUT } from './constants';

export const getGitHubBranchIdAllowedValues: TQoreGetAllowedValuesFunction = async (
  context
): Promise<IQoreAllowedValue[]> => {
  const token = context?.conn_opts?.token;
  const owner = context?.opts?.owner;
  const repo = context?.opts?.repo;

  if (!token || !owner || !repo) {
    throw new Error('The token, owner and repo are required to get Github branch allowed values');
  }

  Debugger.log('Github Branch allowed values opts', {
    opts: context.opts,
    isTokenPresent: !!token,
  });

  const octokit = await createGitHubClient(token);

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
