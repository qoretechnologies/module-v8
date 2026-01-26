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

export const getIntercomTagIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('Token is required to fetch Intercom tags');
  }

  return await getIntercomAllowedValues<IntercomTag>({
    token,
    path: '/tags',
    dataPath: 'data',
    mapFn: mapIntercomTagToAllowedValue,
  });
};
