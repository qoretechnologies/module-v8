import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';

type TGithubPull = {
  id: number;
  number: string;
  title: string;
  body: string;
};

export const getGitHubPullIdAllowedValues: TQoreGetAllowedValuesFunction = async (
  context
): Promise<IQoreAllowedValue[]> => {
  const { Octokit } = await import('@octokit/rest');
  const octokit = new Octokit({});
  const {
    conn_opts: { token },
    opts: { owner, repo },
  } = context;

  const pulls = await octokit.paginate(`GET https://api.github.com/repos/{owner}/{repo}/pulls`, {
    owner,
    repo,
    per_page: 100,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return pulls.map(
    (pull: TGithubPull): IQoreAllowedValue => ({
      value: pull.number.toString(),
      display_name: pull.title,
      desc: pull.body,
    })
  );
};
