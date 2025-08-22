import { CompanyAttributesInner } from '@getbrevo/brevo';
import {
  TCustomConnOptions,
  TQoreAnyType,
  TQoreAppActionFunctionContext,
  TQoreAppActionOption,
  TQoreGetAllowedValuesFunction,
  TQoreGetDynamicTypeFunction,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { BREVO_CONN_OPTIONS, BrevoError, extractBrevoError } from '../constants';
import { BrevoAttributeTypeToQoreTypeMap, createBrevoClient } from './constants';

export const getBrevoDealAttributes = async (token: string): Promise<CompanyAttributesInner[]> => {
  const client = createBrevoClient(token);

  try {
    const response = await client.dealsClient.crmAttributesDealsGet();

    return response.body;
  } catch (error) {
    throw new BrevoError(`Failed to get deal attributes: ${extractBrevoError(error)}`);
  }
};

export const getBrevoDealAttributesMap = async (
  context: TQoreAppActionFunctionContext | undefined
) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: BrevoError,
  });

  const attributes = await getBrevoDealAttributes(token);
  const attributesMap = attributes
    .filter((attribute) => attribute.internalName)
    .reduce(
      (acc, attribute) => {
        acc[attribute.internalName!] = attribute;

        return acc;
      },
      {} as Record<string, CompanyAttributesInner>
    );

  return attributesMap;
};

const createGetBrevoDealAttributeOptionsTypeFunction =
  (includeAllowedValues: boolean): TQoreGetDynamicTypeFunction =>
  async (context) => {
    const attributesMap = await getBrevoDealAttributesMap(context);

    const options: TQoreOptions = {};

    Object.entries(attributesMap).forEach(([field, attribute]) => {
      if (!attribute?.attributeTypeName) return;
      options[field] = {
        display_name: attribute.label,
        required: false,
        type: BrevoAttributeTypeToQoreTypeMap[attribute.attributeTypeName] as TQoreAnyType,
        ...(includeAllowedValues &&
          attribute?.attributeOptions?.length && {
            allowed_values: attribute.attributeOptions.map(
              (value: { key: string; value: any }) => ({
                value: value.value,
                display_name: value.key,
              })
            ),
          }),
      };
    });

    return {
      type: 'hash',
      fields: options,
    };
  };

export const getBrevoDealAttributeOptionsTypeWithoutAllowedValues =
  createGetBrevoDealAttributeOptionsTypeFunction(false);

export const getBrevoDealAttributeOptionsTypeWithAllowedValues =
  createGetBrevoDealAttributeOptionsTypeFunction(true);

export const getBrevoDealAttributesAllowedValues: TQoreGetAllowedValuesFunction<
  typeof BREVO_CONN_OPTIONS,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: BrevoError,
  });

  const client = createBrevoClient(token);

  try {
    const response = await client.companiesClient.companiesAttributesGet();

    return response.body.map((attribute) => {
      return {
        value: attribute.internalName!,
        display_name: attribute.label,
      };
    });
  } catch (error) {
    throw new BrevoError(`Failed to get company attributes: ${extractBrevoError(error)}`);
  }
};

export const BrevoDealFilterOption: TQoreAppActionOption<TCustomConnOptions> = {
  type: {
    type: 'hash',
    fields: {
      field: {
        type: 'string',
        required: true,
        get_allowed_values: getBrevoDealAttributesAllowedValues,
        on_change: ['refetch'],
      },
      value: {
        type: 'string',
        required: true,
        get_dynamic_type: async (context) => {
          const attributesMap = await getBrevoDealAttributesMap(context);

          const selectedField = context?.opts?.filter?.field;
          if (!selectedField || !attributesMap[selectedField]?.attributeTypeName) {
            return 'string';
          }

          return BrevoAttributeTypeToQoreTypeMap[attributesMap[selectedField].attributeTypeName];
        },
        allowed_values_creatable: true,
        get_allowed_values: async (context) => {
          const attributesMap = await getBrevoDealAttributesMap(context);
          const selectedField = context?.opts?.filter?.field;
          const attribute = attributesMap[selectedField];

          if (!selectedField || !attribute?.attributeOptions) {
            return [];
          }

          return attribute.attributeOptions.map((value: { key: string; value: any }) => ({
            value: value.value,
            display_name: value.key,
          }));
        },
      },
    },
  },
};
