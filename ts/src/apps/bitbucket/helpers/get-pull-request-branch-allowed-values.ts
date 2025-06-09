import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { BitbucketError } from '../constants';
import { fetchBitbucketAllowedValues } from './constants';

type TBitBucketBranch = {
  name: string;
};

const mapBitbucketBranchToAllowedValue = (branch: TBitBucketBranch): IQoreAllowedValue<string> => {
  return {
    value: branch.name,
    display_name: branch.name,
    desc: `Branch: ${branch.name}`,
  };
};

export const getBitbucketBranchAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, workspace, repo_slug } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    optionFields: ['workspace', 'repo_slug'],
    ErrorClass: BitbucketError,
  });

  return await fetchBitbucketAllowedValues<TBitBucketBranch>({
    token,
    path: `/repositories/${workspace}/${repo_slug}/refs/branches`,
    mapItemToAllowedValue: mapBitbucketBranchToAllowedValue,
  });
};
