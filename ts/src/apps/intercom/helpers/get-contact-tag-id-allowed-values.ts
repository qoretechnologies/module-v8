import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getIntercomAllowedValues } from '.';

interface IntercomTag {
  type: string;
  id: string;
  name: string;
}

const mapIntercomTagToAllowedValue = (tag: IntercomTag): IQoreAllowedValue<string> => {
  return {
    display_name: tag.name,
    value: tag.id,
    desc: `ID: ${tag.id}\n\nName: ${tag.name}`,
  };
};

export const getIntercomContactTagsAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;
  const contactId = context?.opts?.contact_id || context?.opts?.id;

  if (!token) {
    throw new Error('Token is required to fetch Intercom contact tags');
  }

  if (!contactId) {
    throw new Error('Contact ID is required to fetch Intercom contact tags');
  }

  return await getIntercomAllowedValues<IntercomTag>({
    token,
    path: `/contacts/${contactId}/tags`,
    dataPath: 'data',
    mapFn: mapIntercomTagToAllowedValue,
  });
};
