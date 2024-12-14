import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { Octokit } from '@octokit/rest';
import { Debugger } from '../../../utils/Debugger';

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

  const pulls = await octokit.paginate(`GET /repos/{owner}/{repo}/pulls`, {
    owner,
    repo,
    per_page: 100,
  });

  return pulls.map(
    (pull): IQoreAllowedValue => ({
      value: pull.number.toString(),
      display_name: pull.title,
      desc: pull.body,
      image: pull.user?.avatar_url,
    })
  );
};
