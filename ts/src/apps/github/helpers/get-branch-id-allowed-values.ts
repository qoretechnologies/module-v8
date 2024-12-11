import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';

type TGithubBranch = {
  name: string;
};

export const getGitHubBranchIdAllowedValues: TQoreGetAllowedValuesFunction = async (
  context
): Promise<IQoreAllowedValue[]> => {
  const { Octokit } = await import('@octokit/rest');
  const octokit = new Octokit({});

  const {
    conn_opts: { token },
    opts: { owner, repo },
  } = context;

  const branches = await octokit.paginate(
    `GET https://api.github.com/repos/{owner}/{repo}/branches`,
    {
      owner,
      repo,
      per_page: 100,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return branches.map(
    (branch: TGithubBranch): IQoreAllowedValue => ({
      value: branch.name,
      display_name: branch.name,
    })
  );
};
