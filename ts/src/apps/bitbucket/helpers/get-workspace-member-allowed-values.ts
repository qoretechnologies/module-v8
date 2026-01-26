import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { BitbucketError } from '../constants';
import { fetchBitbucketAllowedValues } from './constants';

type TBitBucketWorkspaceMember = {
  user: {
    display_name: string;
    links: {
      avatar: {
        href: string;
      };
    };
    uuid: string;
  };
};

const mapBitbucketWorkspaceMemberToAllowedValue = (
  member: TBitBucketWorkspaceMember
): IQoreAllowedValue<string> => {
  return {
    value: member.user.uuid,
    display_name: member.user.display_name,
    ...(member.user.links.avatar && { image: member.user.links.avatar.href }),
  };
};

export const getBitbucketWorkspaceMemberAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, workspace } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    optionFields: ['workspace'],
    ErrorClass: BitbucketError,
  });

  return await fetchBitbucketAllowedValues<TBitBucketWorkspaceMember>({
    token,
    path: `/workspaces/${workspace}/members`,
    mapItemToAllowedValue: mapBitbucketWorkspaceMemberToAllowedValue,
  });
};
