import {
  TQoreAnyType,
  TQoreAppActionOption,
  TQoreOptions,
  TQoreType,
  TQoreTypeObject,
} from '@qoretechnologies/ts-toolkit';
import { Field, FieldType } from 'webflow-api/api';
import { createWebflowClient } from './constants';

export const CUSTOM_TYPE_TO_QORE_TYPE_MAP: Record<
  FieldType | 'SkuValues' | 'Price' | 'MultiExternalFile' | 'MembershipPlan' | 'TextOption',
  TQoreTypeObject | TQoreType | TQoreAnyType
> = {
  Price: 'number',
  Color: 'string',
  DateTime: 'date',
  Email: 'string',
  Link: 'string',
  Number: 'number',
  Option: 'string',
  Phone: 'string',
  PlainText: 'string',
  Reference: 'string',
  RichText: 'string',
  Switch: 'bool',
  VideoLink: 'string',

  SkuValues: {
    type: 'hash',
  },

  ExtFileRef: {
    type: 'hash',
    fields: {
      url: { type: 'string', required: true },
      alt: { type: 'string', required: false },
    },
  },

  MultiExternalFile: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        url: { type: 'string', required: true },
        alt: { type: 'string', required: false },
      },
    },
  },

  File: {
    type: 'hash',
    fields: {
      fileId: { type: 'string', required: true },
      url: { type: 'string', required: true },
      alt: { type: 'string', required: false },
    },
  },

  Image: {
    type: 'hash',
    fields: {
      fileId: { type: 'string', required: true },
      url: { type: 'string', required: true },
      alt: { type: 'string', required: false },
    },
  },

  MultiImage: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        fileId: { type: 'string', required: true },
        url: { type: 'string', required: true },
        alt: { type: 'string', required: false },
      },
    },
  },

  MultiReference: {
    type: 'list',
    element_type: 'string',
  },

  TextOption: 'string',
  MembershipPlan: 'string',
};

export const getWebflowItemFields = async (options: { token: string; collection: string }) => {
  const { token, collection } = options;

  const client = createWebflowClient(token);

  const collectionResponse = await client.collections.get(collection);

  return collectionResponse.fields;
};

export const mapWebflowFieldsToQoreOptions = (
  fields: Field[],
  markRequired = true
): TQoreOptions => {
  return fields
    .filter((field) => field.isEditable && field.slug)
    .reduce((acc, field) => {
      const type = CUSTOM_TYPE_TO_QORE_TYPE_MAP[field.type] || 'any';

      return {
        ...acc,
        [field.slug!]: {
          type,
          required: markRequired ? field.isRequired : false,
          ...(field.helpText && { desc: field.helpText }),
        } as TQoreAppActionOption,
      };
    }, {} as TQoreOptions);
};
