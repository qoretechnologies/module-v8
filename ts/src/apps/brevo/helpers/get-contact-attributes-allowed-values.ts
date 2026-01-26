import { GetAttributesAttributesInner } from '@getbrevo/brevo';
import {
  TCustomConnOptions,
  TQoreAnyType,
  TQoreAppActionFunctionContext,
  TQoreAppActionOption,
  TQoreGetAllowedValuesFunction,
  TQoreGetDynamicTypeFunction,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { BREVO_CONN_OPTIONS, BrevoError, extractBrevoError } from '../constants';
import { BrevoAttributeTypeToQoreTypeMap, createBrevoClient } from './constants';

export const getBrevoContactsAttributes = async (
  token: string
): Promise<GetAttributesAttributesInner[]> => {
  const client = createBrevoClient(token);

  try {
    const response = await client.contactsClient.getAttributes();

    return response.body.attributes;
  } catch (error) {
    throw new BrevoError(`Failed to get contact attributes: ${extractBrevoError(error)}`);
  }
};

export const getBrevoContactAttributesMap = async (
  context: TQoreAppActionFunctionContext | undefined
) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: BrevoError,
  });

  const attributes = await getBrevoContactsAttributes(token);
  const attributesMap = attributes.reduce(
    (acc, attribute) => {
      acc[attribute.name] = attribute;

      return acc;
    },
    {} as Record<string, GetAttributesAttributesInner>
  );

  return attributesMap;
};

export const getBrevoContactAttributesAllowedValues: TQoreGetAllowedValuesFunction<
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
    const response = await client.contactsClient.getAttributes();

    return response.body.attributes.map((attribute) => {
      return {
        value: attribute.name,
        display_name: attribute.name,
      };
    });
  } catch (error) {
    throw new BrevoError(`Failed to get contact attributes: ${extractBrevoError(error)}`);
  }
};

const createGetBrevoContactAttributeOptionsTypeFunction =
  (includeAllowedValues: boolean): TQoreGetDynamicTypeFunction =>
  async (context) => {
    const attributesMap = await getBrevoContactAttributesMap(context);

    const options: TQoreOptions = {};

    Object.entries(attributesMap).forEach(([field, attribute]) => {
      if (!attribute?.type) return;
      options[field] = {
        display_name: humanizeNameTitle(field),
        required: false,
        type: BrevoAttributeTypeToQoreTypeMap[attribute.type] as TQoreAnyType,
        ...(includeAllowedValues &&
          attribute?.enumeration?.length && {
            allowed_values: attribute.enumeration.map((value) => ({
              value: value.value,
              display_name: value.label,
            })),
          }),
      };
    });

    return {
      type: 'hash',
      fields: options,
    };
  };

export const getBrevoContactAttributeOptionsTypeWithoutAllowedValues =
  createGetBrevoContactAttributeOptionsTypeFunction(false);

export const getBrevoContactAttributeOptionsTypeWithAllowedValues =
  createGetBrevoContactAttributeOptionsTypeFunction(true);

export const BrevoContactFilterOption: TQoreAppActionOption<TCustomConnOptions> = {
  type: {
    type: 'hash',
    fields: {
      field: {
        type: 'string',
        required: true,
        get_allowed_values: getBrevoContactAttributesAllowedValues,
        on_change: ['refetch'],
      },
      // @ts-expect-error type is defined based on the selected field, same goes for allowed values
      value: {
        type: 'string',
        required: true,
        get_dynamic_type: async (context) => {
          const attributesMap = await getBrevoContactAttributesMap(context);

          const selectedField = context?.opts?.filter?.field;
          if (!selectedField || !attributesMap[selectedField]?.type) {
            return 'string';
          }

          return BrevoAttributeTypeToQoreTypeMap[attributesMap[selectedField].type];
        },
        allowed_values_creatable: true,
        get_allowed_values: async (context) => {
          const attributesMap = await getBrevoContactAttributesMap(context);
          const selectedField = context?.opts?.filter?.field;
          const attribute = attributesMap[selectedField];

          if (!selectedField || !attribute?.enumeration) {
            return [];
          }

          return attribute.enumeration.map((value) => ({
            value: value.value,
            display_name: value.label,
          }));
        },
      },
    },
  },
};
