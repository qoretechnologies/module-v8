import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';

export const getGitHubPullIdAllowedValues: TQoreGetAllowedValuesFunction = async (
  context
): Promise<IQoreAllowedValue[]> => {
  const { Octokit } = await import('@octokit/rest');
  const {
    conn_opts: { token },
    opts: { owner, repo },
  } = context;
  const octokit = new Octokit({
    auth: token,
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
    })
  );
};
