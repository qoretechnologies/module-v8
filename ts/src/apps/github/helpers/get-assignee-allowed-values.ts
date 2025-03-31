import { Octokit } from '@octokit/rest';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { Debugger } from '../../../utils/Debugger';
import { GITHUB_ALLOWED_VALUES_TIMEOUT } from './constants';

const mapGithubUser = (user: {
  login?: string;
  name?: string;
  type: string;
  avatar_url?: string;
}): IQoreAllowedValue<string> => ({
  value: user.login!,
  display_name: user.login,
  desc: `Name: ${user.name}\n\nType: ${user.type}\n\nGitHub profile: [${user.login}](https://github.com/${user.login})`,
  image: user.avatar_url,
});

export const getGitHubAssigneesAllowedValues: TQoreGetAllowedValuesFunction = async (
  context
): Promise<IQoreAllowedValue[]> => {
  const token = context?.conn_opts?.token;
  const owner = context?.opts?.owner;
  const repo = context?.opts?.repo;

  if (!token || !owner || !repo) {
    throw new Error(
      'The token, owner and repo are required to get Github assignees allowed values'
    );
  }

  const octokit = new Octokit({
    auth: token,
  });

  Debugger.log('Github Assignees allowed values opts', {
    opts: context.opts,
    isTokenPresent: !!token,
  });

  const assignees: IQoreAllowedValue[] = [];
  const startTime = Date.now();

  try {
    for await (const response of octokit.paginate.iterator(
      'GET /repos/{owner}/{repo}/contributors',
      {
        owner,
        repo,
        per_page: 100,
      }
    )) {
      assignees.push(...response.data.map(mapGithubUser));

      if (Date.now() - startTime > GITHUB_ALLOWED_VALUES_TIMEOUT) {
        break;
      }
    }

    Debugger.log('Github Contributors fetched successfully', {
      count: assignees.length,
      contributors: assignees.map((a) => a.value),
    });

    return assignees;
  } catch (err) {
    Debugger.log('Github Contributors allowed values error', {
      error: err,
      status: err.status,
      message: err.message,
      response: err.response?.data,
    });

    return assignees;
  }
};
