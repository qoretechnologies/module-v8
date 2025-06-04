import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ConfluenceError } from '../constants';
import { fetchConfluenceAllowedValues } from './constants';

type TConfluenceBlogpost = {
  id: string;
  spaceId: string;
  title: string;
  status: string;
};

const mapConfluenceBlogpostToAllowedValue = (
  blogpost: TConfluenceBlogpost
): IQoreAllowedValue<string> => ({
  value: blogpost.id,
  display_name: blogpost.title,
  desc: `Space ID: ${blogpost.spaceId}\nStatus: ${blogpost.status}`,
});

export const getConfluenceBlogpostIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { cloud_id, token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['cloud_id', 'token'],
    ErrorClass: ConfluenceError,
  });

  return await fetchConfluenceAllowedValues<TConfluenceBlogpost>({
    token,
    cloudId: cloud_id,
    path: '/blogposts',
    mapItemToAllowedValue: mapConfluenceBlogpostToAllowedValue,
  });
};
