import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ConfluenceError } from '../constants';
import { fetchConfluenceAllowedValues } from './constants';

type TConfluencePage = {
  id: string;
  status: string;
  title: string;
};

const mapConfluencePageToAllowedValue = (page: TConfluencePage): IQoreAllowedValue<string> => {
  return {
    value: page.id,
    display_name: page.title,
    desc: `Status: ${page.status}\nTitle: ${page.title}`,
  };
};

export const getConfluencePageIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { cloud_id, token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['cloud_id', 'token'],
    ErrorClass: ConfluenceError,
  });

  return await fetchConfluenceAllowedValues<TConfluencePage>({
    token,
    cloudId: cloud_id,
    path: '/pages',
    mapItemToAllowedValue: mapConfluencePageToAllowedValue,
  });
};
