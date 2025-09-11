import { Octokit } from '@octokit/rest';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { Debugger } from '../../../utils/Debugger';
import { GITHUB_ALLOWED_VALUES_TIMEOUT } from './constants';

export const getGitHubOrgAllowedValues: TQoreGetAllowedValuesFunction = async (
  context
): Promise<IQoreAllowedValue[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('The token is required to get Github org allowed values');
  }

  const octokit = new Octokit({
    auth: token,
  });

  const orgs: IQoreAllowedValue[] = [];
  const startTime = Date.now();

  try {
    for await (const response of octokit.paginate.iterator('GET /user/orgs', {
      per_page: 100,
    })) {
      orgs.push(
        ...response.data.map(
          (org): IQoreAllowedValue => ({
            value: org.login,
            display_name: org.login,
            desc: org.description || undefined,
            image: org.avatar_url,
          })
        )
      );

      if (Date.now() - startTime > GITHUB_ALLOWED_VALUES_TIMEOUT) {
        break;
      }
    }

    return orgs;
  } catch (err) {
    Debugger.log('Github Orgs allowed values error', err);

    return orgs;
  }
};
