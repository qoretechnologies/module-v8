import { Octokit } from '@octokit/rest';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { Debugger } from '../../../utils/Debugger';
import { GITHUB_ALLOWED_VALUES_TIMEOUT } from './constants';

const PER_PAGE = 100;
const MAX_ITEMS = 600;

const mapGithubRepoToOwner = (repo: {
  owner: { login: string; type: string; html_url: string; avatar_url: string };
}): IQoreAllowedValue => ({
  value: repo.owner.login,
  display_name: repo.owner.login,
  desc: `Type: ${repo.owner.type}\n\n Link: [View on GitHub](${repo.owner.html_url})`,
  image: repo.owner.avatar_url,
});

export const getGitHubOwnerAllowedValues: TQoreGetAllowedValuesFunction = async (
  context
): Promise<IQoreAllowedValue[]> => {
  const {
    conn_opts: { token },
    opts,
  } = context;

  const octokit = new Octokit({
    auth: token,
  });

  const owners: IQoreAllowedValue[] = [];
  const startTime = Date.now();

  Debugger.log('Github Owner allowed values opts', {
    opts: context.opts,
    isTokenPresent: !!token,
  });

  try {
    if (opts?.repo) {
      let itemCount = 0;

      for await (const response of octokit.paginate.iterator('GET /search/repositories', {
        q: `${opts.repo} in:name`,
        per_page: PER_PAGE,
      })) {
        itemCount += response.data.length;

        const repos = response.data.filter((repository) => repository.name === opts.repo);
        owners.push(...repos.map(mapGithubRepoToOwner));

        if (itemCount >= MAX_ITEMS || Date.now() - startTime > GITHUB_ALLOWED_VALUES_TIMEOUT) {
          break;
        }
      }
    } else {
      for await (const response of octokit.paginate.iterator('GET /user/repos', {
        per_page: PER_PAGE,
      })) {
        const repos = Array.from(
          new Map(response.data.map((repository) => [repository.owner.login, repository])).values()
        );

        owners.push(...repos.map(mapGithubRepoToOwner));

        if (Date.now() - startTime > GITHUB_ALLOWED_VALUES_TIMEOUT) {
          break;
        }
      }
    }

    return owners;
  } catch (err) {
    Debugger.log('Github Owner allowed values error', err);

    return owners;
  }
};
