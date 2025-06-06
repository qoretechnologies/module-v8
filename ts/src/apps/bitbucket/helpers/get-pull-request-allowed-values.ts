import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { BitbucketError } from '../constants';
import { fetchBitbucketAllowedValues } from './constants';

type TBitBucketPullRequest = {
  id: number;
  title: string;
  description: string;
  author: {
    display_name: string;
    links: {
      avatar?: {
        href: string;
      };
    };
  };
  state: string;
  destination: {
    branch: {
      name: string;
    };
  };

  source: {
    branch: {
      name: string;
    };
  };
};

const mapBitbucketPullRequestToAllowedValue = (
  pullRequest: TBitBucketPullRequest
): IQoreAllowedValue<string> => {
  return {
    value: pullRequest.id.toString(),
    display_name: `${pullRequest.title} [${pullRequest.source.branch.name} -> ${pullRequest.destination.branch.name}]`,
    ...(pullRequest.author.links.avatar && {
      image: pullRequest.author.links.avatar?.href,
    }),
    desc:
      `Author: ${pullRequest.author.display_name}\n` +
      `State: ${pullRequest.state}\n` +
      `Description: ${pullRequest.description || 'No description'}`,
  };
};

export const getBitbucketPullRequestAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, workspace, repo_slug } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    optionFields: ['workspace', 'repo_slug'],
    ErrorClass: BitbucketError,
  });

  return await fetchBitbucketAllowedValues<TBitBucketPullRequest>({
    token,
    limit: 50,
    path: `/repositories/${workspace}/${repo_slug}/pullrequests`,
    mapItemToAllowedValue: mapBitbucketPullRequestToAllowedValue,
  });
};
