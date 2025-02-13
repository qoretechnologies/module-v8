import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { fetchHubspotAllowedValues } from './constants';

type THubspotCustomObject = {
  id: string;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
};

const mapHubspotCustomObject = (customObject: THubspotCustomObject): IQoreAllowedValue<string> => ({
  value: customObject.id,
  display_name: customObject.id,
  short_desc:
    `Archived: ${customObject.archived}\n\nCreated at: ${customObject.createdAt}\n\n` +
    `Updated at: ${customObject.updatedAt}`,
});

export const getHubspotCustomObjectIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;
  const objectType = context?.opts?.objectType;

  if (!token || !objectType) {
    throw new Error(
      'The token and objectType is required to get Hubspot custom object id allowed values'
    );
  }

  const customObjectIds = await fetchHubspotAllowedValues<THubspotCustomObject>({
    token,
    object: objectType,
    mapItemToAllowedValue: mapHubspotCustomObject,
  });

  return customObjectIds;
};
