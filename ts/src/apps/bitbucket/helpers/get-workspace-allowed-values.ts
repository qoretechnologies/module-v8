import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { BitbucketError } from '../constants';
import { fetchBitbucketAllowedValues } from './constants';

type TBitBucketWorkspace = {
  type: string;
  workspace: {
    type: string;
    uuid: string;
    name: string;
    slug: string;
    links: {
      avatar?: {
        href: string;
      };
    };
  };
  permission: string;
};

const mapBitbucketWorkspaceToAllowedValue = (
  response: TBitBucketWorkspace
): IQoreAllowedValue<string> => {
  return {
    value: response.workspace.slug,
    display_name: response.workspace.name,
    ...(response.workspace.links.avatar && {
      image: response.workspace.links.avatar?.href,
    }),
    desc: `Type: ${response.workspace.type}\nPermission: ${response.permission}`,
  };
};

export const getBitbucketWorkspaceIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: BitbucketError,
  });

  return await fetchBitbucketAllowedValues<TBitBucketWorkspace>({
    token,
    path: '/user/permissions/workspaces',
    mapItemToAllowedValue: mapBitbucketWorkspaceToAllowedValue,
  });
};
