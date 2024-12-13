import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { Octokit } from '@octokit/rest';
import { Debugger } from '../../../utils/Debugger';

export const getGitHubIssueIdAllowedValues: TQoreGetAllowedValuesFunction = async (
  context
): Promise<IQoreAllowedValue[]> => {
  const {
    conn_opts: { token },
    opts: { owner, repo },
  } = context;
  const octokit = new Octokit({
    auth: token,
  });

  Debugger.log('Github Issue allowed values opts', {
    opts: context.opts,
    isTokenPresent: !!token,
  });

  const issues = await octokit.paginate(`GET /repos/{owner}/{repo}/issues`, {
    owner,
    repo,
    per_page: 100,
  });

  return issues.map(
    (issue): IQoreAllowedValue => ({
      value: issue.number.toString(),
      display_name: issue.title,
      short_desc:
        `Title:${issue.title}\n\n` +
        `Labels: [${issue.labels.map((label) => (typeof label === 'string' ? label : label.name)).join(', ')}]`,
      desc: issue.body,
      image: issue.user?.avatar_url,
    })
  );
};
