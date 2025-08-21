import {
  TQoreAnyType,
  TQoreGetDynamicResponseTypeFunction,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { cloneDeep, set } from 'lodash';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { BrevoError } from '../constants';
import { BrevoAttributeTypeToQoreTypeMap } from './constants';
import { getBrevoContactAttributesMap } from './get-contact-attributes-allowed-values';

export const defaultBrevoContactsListResponseType = {
  type: 'hash',
  fields: {
    count: { type: 'number' },
    contacts: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            id: { type: 'number' },
            emailBlacklisted: { type: 'boolean' },
            smsBlacklisted: { type: 'boolean' },
            createdAt: { type: 'string' },
            modifiedAt: { type: 'string' },
            listIds: {
              type: {
                type: 'list',
                element_type: {
                  type: 'number',
                },
              },
            },
            attributes: {
              type: {
                type: 'hash',
                fields: {},
              },
            },
          },
        },
      },
    },
  },
} satisfies TQoreResponseType;

export const getBrevoContactAttributesResponseType = async (
  token: string
): Promise<TQoreResponseType> => {
  const attributesMap = await getBrevoContactAttributesMap({ conn_opts: { token } });

  const attributesType: TQoreOptions = {};

  for (const [key, attribute] of Object.entries(attributesMap)) {
    attributesType[key] = {
      type: attribute.type
        ? (BrevoAttributeTypeToQoreTypeMap[attribute.type] as TQoreAnyType)
        : 'string',
    };
  }

  return {
    type: 'hash',
    fields: attributesType,
  };
};

export const getBrevoContactsListResponseType: TQoreGetDynamicResponseTypeFunction = async (
  context
) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: BrevoError,
  });

  const attributesType = await getBrevoContactAttributesResponseType(token);

  const responseType = cloneDeep(defaultBrevoContactsListResponseType);

  set(responseType, 'fields.contacts.element_type.fields.attributes', {
    type: attributesType,
  });

  return responseType;
};
