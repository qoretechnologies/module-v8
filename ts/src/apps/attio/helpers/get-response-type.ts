import {
  TQoreAnyType,
  TQoreAppActionOption,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { ATTIO_TO_QORUS_RESPONSE_TYPE_MAP, ATTIO_TO_QORUS_TYPE_MAP } from './attio-types-map';
import {
  getAttioListAttributes,
  getAttioObjectAttributes,
  TAttioAttribute,
} from './get-object-properties';

type TGetAttioResponseTypeOptions = {
  object?: string;
  list?: string;
  token: string;
};

export const getAttioResponseType = async (
  options: TGetAttioResponseTypeOptions
): Promise<TQoreResponseType> => {
  const { object, list, token } = options;

  if (!object && !list) {
    throw new Error('Either object or list must be provided');
  }

  const responseType: TQoreResponseType = {
    type: 'hash',
    fields: {
      id: {
        type: 'string',
      },
      created_at: {
        type: 'string',
      },
    },
  };

  let attributes: TAttioAttribute[] = [];

  if (object) {
    attributes = await getAttioObjectAttributes(object, token);
  }

  if (list) {
    attributes = await getAttioListAttributes(list, token);
  }

  const fields: Record<string, TQoreAppActionOption> = {};

  attributes.forEach((attribute) => {
    const { is_multiselect, type, api_slug } = attribute;
    const qorusType = ATTIO_TO_QORUS_RESPONSE_TYPE_MAP[type] || ATTIO_TO_QORUS_TYPE_MAP[type];

    if (api_slug === 'record_id' || api_slug === 'created_at' || api_slug === 'entry_id') return;

    if (is_multiselect) {
      fields[api_slug] = {
        type: {
          type: 'list',
          element_type: qorusType as TQoreAnyType,
        },
      };
    } else {
      fields[api_slug] = {
        type: qorusType as TQoreAnyType,
      };
    }
  });

  responseType.fields = {
    ...responseType.fields,
    ...fields,
  };

  return responseType;
};
