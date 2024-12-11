import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';

type TGithubRepo = {
  id: number;
  name: string;
  full_name: string;
  description: string;
};

export const getGitHubRepositoryIdAllowedValues: TQoreGetAllowedValuesFunction = async (
  context
): Promise<IQoreAllowedValue[]> => {
  const { Octokit } = await import('@octokit/rest');
  const octokit = new Octokit({});

  const {
    conn_opts: { token },
  } = context;

  const repos = await octokit.paginate(`GET https://api.github.com/user/repos`, {
    per_page: 100,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return repos.map(
    (repo: TGithubRepo): IQoreAllowedValue => ({
      value: repo.id.toString(),
      display_name: repo.name,
      short_desc: repo.full_name,
      desc: repo.description,
    })
  );
};
