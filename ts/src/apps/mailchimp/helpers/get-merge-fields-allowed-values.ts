import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { getMailchimpAllowedValues } from './constants';

type TMailchimpMergeField = {
  tag: string;
  name: string;
  type: string;
  required: boolean;
};

const mapMailchimpMergeFieldToAllowedValue = (
  item: TMailchimpMergeField
): IQoreAllowedValue<string> => ({
  display_name: item.name,
  value: item.tag,
  desc:
    `Name: ${item.name}\n\n` +
    `Type: ${item.type}\n\n` +
    `Required: ${item.required ? 'Yes' : 'No'}`.trim(),
});

export const getMailchimpMergeFieldAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, datacenter, list_id } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'datacenter'],
    optionFields: ['list_id'],
  });

  const path = `lists/${list_id}/merge-fields`;

  return await getMailchimpAllowedValues({
    token,
    datacenter,
    path,
    mapItemToAllowedValue: mapMailchimpMergeFieldToAllowedValue,
    dataPath: 'merge_fields',
  });
};
