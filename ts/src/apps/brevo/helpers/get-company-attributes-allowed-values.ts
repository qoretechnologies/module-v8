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

export const getBrevoCompanyAttributes = async (
  token: string
): Promise<CompanyAttributesInner[]> => {
  const client = createBrevoClient(token);

  try {
    const response = await client.companiesClient.companiesAttributesGet();

    return response.body;
  } catch (error) {
    throw new BrevoError(`Failed to get company attributes: ${extractBrevoError(error)}`);
  }
};

export const getBrevoCompanyAttributesMap = async (
  context: TQoreAppActionFunctionContext | undefined
) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: BrevoError,
  });

  const attributes = await getBrevoCompanyAttributes(token);
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

const createGetBrevoCompanyAttributeOptionsTypeFunction =
  (includeAllowedValues: boolean): TQoreGetDynamicTypeFunction =>
  async (context) => {
    const attributesMap = await getBrevoCompanyAttributesMap(context);

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

export const getBrevoCompanyAttributeOptionsTypeWithoutAllowedValues =
  createGetBrevoCompanyAttributeOptionsTypeFunction(false);

export const getBrevoCompanyAttributeOptionsTypeWithAllowedValues =
  createGetBrevoCompanyAttributeOptionsTypeFunction(true);

export const getBrevoCompanyAttributesAllowedValues: TQoreGetAllowedValuesFunction<
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

export const BrevoCompanyFilterOption: TQoreAppActionOption<TCustomConnOptions> = {
  type: {
    type: 'hash',
    fields: {
      field: {
        type: 'string',
        required: true,
        get_allowed_values: getBrevoCompanyAttributesAllowedValues,
        on_change: ['refetch'],
      },
      value: {
        type: 'string',
        required: true,
        get_dynamic_type: async (context) => {
          const attributesMap = await getBrevoCompanyAttributesMap(context);

          const selectedField = context?.opts?.filter?.field;
          if (!selectedField || !attributesMap[selectedField]?.attributeTypeName) {
            return 'string';
          }

          return BrevoAttributeTypeToQoreTypeMap[attributesMap[selectedField].attributeTypeName];
        },
        allowed_values_creatable: true,
        get_allowed_values: async (context) => {
          const attributesMap = await getBrevoCompanyAttributesMap(context);
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
