import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { AttioError } from '../constants';
import { getAttioAllowedValues, getAttioTokenRequired } from './constants';

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

export const getAttioObjectRecordIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  try {
    const token = getAttioTokenRequired(context);
    const object =
      context?.opts?.object || context?.opts?.parent_object || context?.opts?.linked_object;

    if (!object) {
      throw new Error('Object is required to get allowed values for records');
    }

    return await getAttioAllowedValues<TAttioObjectRecord, string>({
      path: `objects/${object}/records/query`,
      token,
      method: 'POST',
      mapItemToAllowedValue: mapAttioObjectRecordToAllowedValue,
    });
  } catch (error) {
    throw new AttioError(`Failed to get Attio objects allowed values: ${error}`);
  }
};
