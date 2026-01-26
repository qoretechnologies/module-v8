import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { Debugger } from '../../../utils/Debugger';
import { createGitHubClient, GITHUB_ALLOWED_VALUES_TIMEOUT } from './constants';

export const getGitHubPullIdAllowedValues: TQoreGetAllowedValuesFunction = async (
  context
): Promise<IQoreAllowedValue[]> => {
  const token = context?.conn_opts?.token;
  const repo = context?.opts?.repo;
  const owner = context?.opts?.owner;

  if (!token || !owner || !repo) {
    throw new Error('The token, owner and repo are required to get Github pull allowed values');
  }

  const octokit = await createGitHubClient(token);

  Debugger.log('Github Pull allowed values opts', {
    opts: context.opts,
    isTokenPresent: !!token,
  });

  const pulls: IQoreAllowedValue[] = [];
  const startTime = Date.now();

  try {
    for await (const response of octokit.paginate.iterator('GET /repos/{owner}/{repo}/pulls', {
      owner,
      repo,
      per_page: 100,
    })) {
      pulls.push(
        ...response.data.map(
          (pull): IQoreAllowedValue => ({
            value: pull.number.toString(),
            display_name: pull.title,
            ...(pull.body && { desc: pull.body }),
            image: pull.user?.avatar_url,
          })
        )
      );

      if (Date.now() - startTime > GITHUB_ALLOWED_VALUES_TIMEOUT) {
        break;
      }
    }

    return pulls;
  } catch (err) {
    Debugger.log('Github Pull allowed values error', err);

    return pulls;
  }
};
