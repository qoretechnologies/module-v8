import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { AttioError } from '../constants';
import { getAttioAllowedValues, getAttioTokenRequired } from './constants';

interface TAttioListEntry {
  entry_values: {
    entry_id: {
      value: string;
    }[];
    stage: {
      status: {
        title: string;
      };
    }[];
  };
}

const mapAttioListEntryToAllowedValue = (item: TAttioListEntry): IQoreAllowedValue<string> => ({
  display_name: `${item.entry_values.entry_id[0].value} - ${item.entry_values.stage[0].status.title || ''}`,
  value: item.entry_values.entry_id[0].value,
});

export const getAttioListEntryIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  try {
    const token = getAttioTokenRequired(context);
    const list = context?.opts?.list;

    if (!list) {
      throw new Error('List is required to get allowed values for entries');
    }

    return await getAttioAllowedValues<TAttioListEntry, string>({
      path: `lists/${list}/entries/query`,
      token,
      method: 'POST',
      mapItemToAllowedValue: mapAttioListEntryToAllowedValue,
    });
  } catch (error) {
    throw new AttioError(`Failed to get Attio list entries allowed values: ${error}`);
  }
};
