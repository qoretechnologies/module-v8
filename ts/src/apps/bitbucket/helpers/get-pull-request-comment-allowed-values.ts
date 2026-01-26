import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { BitbucketError } from '../constants';
import { fetchBitbucketAllowedValues } from './constants';

type TBitBucketPullRequestComment = {
  id: number;
  content: {
    raw: string;
  };
  user: {
    display_name: string;
    links: {
      avatar?: {
        href: string;
      };
    };
  };
};

const CONTENT_LENGTH_LIMIT = 20;

const mapBitbucketPullRequestCommentToAllowedValue = (
  comment: TBitBucketPullRequestComment
): IQoreAllowedValue<string> => {
  const displayName =
    comment.content.raw.length > CONTENT_LENGTH_LIMIT
      ? `${comment.content.raw.slice(0, CONTENT_LENGTH_LIMIT)}...`
      : comment.content.raw;

  return {
    value: comment.id.toString(),
    display_name: `[${comment.user.display_name}] ${displayName}`,
    ...(comment.user.links.avatar && {
      image: comment.user.links.avatar?.href,
    }),
    desc:
      `Author: ${comment.user.display_name}\n` + `Content: ${comment.content.raw || 'No content'}`,
  };
};

export const getBitbucketPullRequestCommentAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, workspace, repo_slug, pull_request_id } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    optionFields: ['workspace', 'repo_slug', 'pull_request_id'],
    ErrorClass: BitbucketError,
  });

  return await fetchBitbucketAllowedValues<TBitBucketPullRequestComment>({
    token,
    limit: 50,
    path: `/repositories/${workspace}/${repo_slug}/pullrequests/${pull_request_id}/comments`,
    mapItemToAllowedValue: mapBitbucketPullRequestCommentToAllowedValue,
  });
};
