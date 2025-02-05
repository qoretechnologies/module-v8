import { Octokit } from '@octokit/rest';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { Debugger } from '../../../utils/Debugger';
import { GITHUB_ALLOWED_VALUES_TIMEOUT } from './constants';

export const getGitHubIssueIdAllowedValues: TQoreGetAllowedValuesFunction = async (
  context
): Promise<IQoreAllowedValue[]> => {
  const token = context?.conn_opts?.token;
  const owner = context?.opts?.owner;
  const repo = context?.opts?.repo;

  if (!token || !owner || !repo) {
    throw new Error('The token, owner and repo are required to get Github issue allowed values');
  }

  const octokit = new Octokit({
    auth: token,
  });

  Debugger.log('Github Issue allowed values opts', {
    opts: context.opts,
    isTokenPresent: !!token,
  });

  const issues: IQoreAllowedValue[] = [];
  const startTime = Date.now();

  try {
    for await (const response of octokit.paginate.iterator('GET /repos/{owner}/{repo}/issues', {
      owner,
      repo,
      per_page: 100,
    })) {
      issues.push(
        ...response.data.map(
          (issue): IQoreAllowedValue => ({
            value: issue.number.toString(),
            display_name: issue.title,
            short_desc:
              `Title:${issue.title}\n\n` +
              `Labels: [${issue.labels.map((label) => (typeof label === 'string' ? label : label.name)).join(', ')}]`,
            desc: issue.body || undefined,
            image: issue.user?.avatar_url,
          })
        )
      );

      if (Date.now() - startTime > GITHUB_ALLOWED_VALUES_TIMEOUT) {
        break;
      }
    }

    return issues;
  } catch (err) {
    Debugger.log('Github Issue allowed values error', err);

    return issues;
  }
};
