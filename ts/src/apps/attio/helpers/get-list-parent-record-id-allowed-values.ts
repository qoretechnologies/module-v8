import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { AttioError } from '../constants';
import { fetchAttioAllowedValues } from './client';
import { getAttioTokenRequired } from './constants';
import { getListParentObjectDefaultValue } from './get-list-parent-object-default-value';

interface TAttioObjectRecord {
  values: {
    record_id: {
      value: string;
    }[];
    name: {
      value?: string;
      full_name?: string;
    }[];
  };
}

const mapAttioObjectRecordToAllowedValue = (
  item: TAttioObjectRecord
): IQoreAllowedValue<string> => ({
  display_name:
    item.values.name[0].value || item.values.name[0].full_name || item.values.record_id[0].value,
  value: item.values.record_id[0].value,
});

export const getAttioListParentRecordIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  try {
    const token = getAttioTokenRequired(context);
    const list = context?.opts?.list;

    if (!list) {
      throw new Error('List is required to get allowed values for parent records');
    }

    const parentObject =
      context?.opts?.parent_object || (await getListParentObjectDefaultValue(context));

    return await fetchAttioAllowedValues<TAttioObjectRecord>({
      path: `objects/${parentObject}/records/query`,
      token,
      method: 'POST',
      mapItemToAllowedValue: mapAttioObjectRecordToAllowedValue,
    });
  } catch (error) {
    throw new AttioError(`Failed to get Attio objects allowed values: ${error}`);
  }
};
