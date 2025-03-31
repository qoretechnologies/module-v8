import { Octokit } from '@octokit/rest';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { Debugger } from '../../../utils/Debugger';
import { GITHUB_ALLOWED_VALUES_TIMEOUT } from './constants';

export const getGitHubIssueLabelsAllowedValues: TQoreGetAllowedValuesFunction = async (
  context
): Promise<IQoreAllowedValue[]> => {
  const token = context?.conn_opts?.token;
  const owner = context?.opts?.owner;
  const repo = context?.opts?.repo;

  if (!token || !owner || !repo) {
    throw new Error(
      'The token, owner and repo are required to get Github issue labels allowed values'
    );
  }

  const octokit = new Octokit({
    auth: token,
  });

  Debugger.log('Github Issue Labels allowed values opts', {
    opts: context.opts,
    isTokenPresent: !!token,
  });

  const labels: IQoreAllowedValue[] = [];
  const startTime = Date.now();

  try {
    for await (const response of octokit.paginate.iterator('GET /repos/{owner}/{repo}/labels', {
      owner,
      repo,
      per_page: 100,
    })) {
      labels.push(
        ...response.data.map(
          (label): IQoreAllowedValue => ({
            value: label.name,
            display_name: label.name,
            short_desc: label.description || `Color: #${label.color}`,
            desc: `Description: ${label.description}\n\nColor: #${label.color}`,
          })
        )
      );

      if (Date.now() - startTime > GITHUB_ALLOWED_VALUES_TIMEOUT) {
        break;
      }
    }

    return labels;
  } catch (err) {
    Debugger.log('Github Issue Labels allowed values error', err);

    return labels;
  }
};
