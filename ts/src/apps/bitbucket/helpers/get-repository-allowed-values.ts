import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { BitbucketError } from '../constants';
import { fetchBitbucketAllowedValues } from './constants';

type TBitBucketRepository = {
  type: string;
  links: {
    avatar?: {
      href: string;
    };
  };
  full_name: string;
  name: string;
  slug: string;
  description: string;
};

const mapBitbucketRepositoryToAllowedValue = (
  repository: TBitBucketRepository
): IQoreAllowedValue<string> => {
  return {
    value: repository.slug,
    display_name: repository.full_name,
    ...(repository.links.avatar && {
      image: repository.links.avatar?.href,
    }),
    desc: `Name: ${repository.name}\nDescription: ${repository.description || 'No description'}`,
  };
};

export const getBitbucketRepositoryAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, workspace } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    optionFields: ['workspace'],
    ErrorClass: BitbucketError,
  });

  return await fetchBitbucketAllowedValues<TBitBucketRepository>({
    token,
    path: `/repositories/${workspace}`,
    mapItemToAllowedValue: mapBitbucketRepositoryToAllowedValue,
  });
};
