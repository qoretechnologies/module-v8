import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { BitbucketError } from '../constants';
import { fetchBitbucketAllowedValues } from './constants';

type TBitBucketCommit = {
  hash: string;
  message: string;
  author: {
    raw: string;
    user: {
      links: {
        avatar: {
          href: string;
        };
      };
    };
  };
};

const mapBitbucketCommitToAllowedValue = (commit: TBitBucketCommit): IQoreAllowedValue<string> => {
  return {
    value: commit.hash,
    display_name: commit.message,
    ...(commit.author.user.links.avatar && {
      image: commit.author.user.links.avatar?.href,
    }),
    desc: `Author: ${commit.author.raw}\nMessage: ${commit.message}`,
  };
};

export const getBitbucketCommitAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, workspace, repo_slug } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    optionFields: ['workspace', 'repo_slug'],
    ErrorClass: BitbucketError,
  });

  return await fetchBitbucketAllowedValues<TBitBucketCommit>({
    token,
    path: `/repositories/${workspace}/${repo_slug}/commits`,
    mapItemToAllowedValue: mapBitbucketCommitToAllowedValue,
  });
};
