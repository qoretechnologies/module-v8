import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { Octokit } from '@octokit/rest';
import { Debugger } from '../../../utils/Debugger';
import { GITHUB_ALLOWED_VALUES_TIMEOUT } from './constants';

export const getGitHubPullIdAllowedValues: TQoreGetAllowedValuesFunction = async (
  context
): Promise<IQoreAllowedValue[]> => {
  const {
    conn_opts: { token },
    opts: { owner, repo },
  } = context;
  const octokit = new Octokit({
    auth: token,
  });

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
            desc: pull.body,
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
