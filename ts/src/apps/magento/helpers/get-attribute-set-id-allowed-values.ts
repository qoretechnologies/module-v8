import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { fetchMagentoAllowedValues } from './constants';

type TMagentoAttributeSet = {
  attribute_set_id: number;
  attribute_set_name: string;
  sort_order: number;
  entity_type_id: number;
};

const mapMagentoAttributeSetToAllowedValue = (
  attributeSet: TMagentoAttributeSet
): IQoreAllowedValue<string> => ({
  display_name: attributeSet.attribute_set_name,
  value: attributeSet.attribute_set_id.toString(),
  desc:
    `Attribute Set ID: ${attributeSet.attribute_set_id}\n\n` +
    `Name: ${attributeSet.attribute_set_name}\n\n` +
    `Sort Order: ${attributeSet.sort_order}\n\n` +
    `Entity Type ID: ${attributeSet.entity_type_id}`,
});

export const getMagentoAttributeSetIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;
  const url = context?.conn_opts?.url;

  const missingValues: string[] = [];

  if (!url) missingValues.push('url');
  if (!token) missingValues.push('token');

  if (missingValues.length) {
    throw new Error(
      `All of the following values are required: ${missingValues.join(', ')}` +
        ` to fetch attribute set allowed values for Magento`
    );
  }

  const attributeSets = await fetchMagentoAllowedValues<TMagentoAttributeSet, string>({
    url: url!,
    token: token!,
    mapItemToAllowedValue: mapMagentoAttributeSetToAllowedValue,
    path: '/V1/products/attribute-sets/sets/list',
  });

  return attributeSets;
};
