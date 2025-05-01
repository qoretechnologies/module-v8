import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getIntercomAllowedValues } from '.';

interface IntercomSection {
  type: string;
  id: string;
  name: string;
  parent_id: string;
  created_at: number;
  updated_at: number;
  url?: string;
  articles_count?: number;
}

const mapIntercomSectionToAllowedValue = (section: IntercomSection): IQoreAllowedValue<string> => {
  return {
    display_name: section.name,
    value: section.id,
    desc:
      `ID: ${section.id}\n\n` +
      `Name: ${section.name}\n\n` +
      `Collection ID: ${section.parent_id}\n\n` +
      `Articles Count: ${section.articles_count || 0}\n\n` +
      `Created at: ${new Date(section.created_at * 1000).toISOString()}\n\n` +
      `Updated at: ${new Date(section.updated_at * 1000).toISOString()}`,
  };
};

export const getIntercomSectionIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;
  const collectionId = context?.opts?.collection_id;

  if (!token) {
    throw new Error('Token is required to fetch Intercom sections');
  }

  let path = '/help_center/sections';

  if (collectionId) {
    path = `/help_center/collections/${collectionId}/sections`;
  }

  return await getIntercomAllowedValues<IntercomSection>({
    token,
    path,
    dataPath: 'data',
    mapFn: mapIntercomSectionToAllowedValue,
  });
};
