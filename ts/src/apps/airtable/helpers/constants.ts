import { TQoreType } from '@qoretechnologies/ts-toolkit';
import Airtable from 'airtable';

export const createAirtableClient = (apiKey: string) => {
  return new Airtable({
    apiKey,
  });
};

export const AirtableReadTypeToQoreTypeMap: Record<string, TQoreType> = {
  aiText: 'string',
  multipleAttachments: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        type: { type: 'string' },
        filename: { type: 'string' },
        height: { type: 'integer' },
        size: { type: 'integer' },
        url: { type: 'string' },
        width: { type: 'integer' },
        thumbnails: {
          type: {
            type: 'hash',
            fields: {
              full: {
                type: {
                  type: 'hash',
                  fields: {
                    url: { type: 'string' },
                    width: { type: 'integer' },
                    height: { type: 'integer' },
                  },
                },
              },
              large: {
                type: {
                  type: 'hash',
                  fields: {
                    url: { type: 'string' },
                    width: { type: 'integer' },
                    height: { type: 'integer' },
                  },
                },
              },
              small: {
                type: {
                  type: 'hash',
                  fields: {
                    url: { type: 'string' },
                    width: { type: 'integer' },
                    height: { type: 'integer' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  autoNumber: 'number',
  barcode: {
    type: 'hash',
    fields: {
      type: { type: 'string' },
      text: { type: 'string' },
    },
  },
  button: {
    type: 'hash',
    fields: {
      label: { type: 'string' },
      url: { type: 'string' },
    },
  },
  checkbox: 'boolean',
  singleCollaborator: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      email: { type: 'string' },
      name: { type: 'string' },
      permissionsLevel: { type: 'string' },
      profilePicUrl: { type: 'string' },
    },
  },
  count: 'number',
  createdBy: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      email: { type: 'string' },
      name: { type: 'string' },
      permissionsLevel: { type: 'string' },
      profilePicUrl: { type: 'string' },
    },
  },
  createdTime: 'string',
  currency: 'softnumber',
  date: 'string',
  dateTime: 'string',
  duration: 'softnumber',
  email: 'string',
  formula: 'any',
  lastModifiedBy: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      email: { type: 'string' },
      name: { type: 'string' },
      permissionsLevel: { type: 'string' },
      profilePicUrl: { type: 'string' },
    },
  },
  lastModifiedTime: 'string',
  multipleRecordLinks: {
    type: 'list',
    element_type: 'string',
  },
  multilineText: 'string',
  multipleLookupValues: 'any',
  multipleCollaborators: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        email: { type: 'string' },
        name: { type: 'string' },
        permissionsLevel: { type: 'string' },
        profilePicUrl: { type: 'string' },
      },
    },
  },
  multipleSelects: {
    type: 'list',
    element_type: 'string',
  },
  number: 'number',
  percent: 'number',
  phoneNumber: 'string',
  rating: 'number',
  richText: 'string',
  rollup: 'softstring',
  singleLineText: 'string',
  singleSelect: 'string',
  externalSyncSource: 'string',
  url: 'string',
} as const;

export const AirtableWriteTypeToQoreTypeMap: Record<string, TQoreType> = {
  multipleAttachments: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        filename: { type: 'string', required: false },
        url: { type: 'string', required: true },
      },
    },
  },
  barcode: {
    type: 'hash',
    fields: {
      type: {
        type: 'string',
        required: false,
        allowed_values: [
          { value: 'upc', display_name: 'UPC' },
          { value: 'upce', display_name: 'UPC-E' },
          { value: 'ean13', display_name: 'EAN-13' },
          { value: 'ean8', display_name: 'EAN-8' },
          { value: 'code39', display_name: 'Code 39' },
          { value: 'code128', display_name: 'Code 128' },
        ],
        allowed_values_creatable: true,
      },
      text: { type: 'string', required: true },
    },
  },
  checkbox: 'boolean',
  singleCollaborator: {
    type: 'hash',
    fields: {
      id: { type: 'string', required_groups: ['single_collaborator'] },
      email: { type: 'string', required_groups: ['single_collaborator'] },
    },
  },
  currency: 'softnumber',
  date: 'string',
  dateTime: 'date',
  duration: 'softnumber',
  email: 'string',
  multipleRecordLinks: {
    type: 'list',
    element_type: 'string',
  },
  multilineText: 'string',
  multipleCollaborators: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        id: { type: 'string', required_groups: ['single_collaborator'] },
        email: { type: 'string', required_groups: ['single_collaborator'] },
      },
    },
  },
  multipleSelects: {
    type: 'list',
    element_type: 'softstring',
  },
  number: 'number',
  percent: 'number',
  phoneNumber: 'string',
  rating: 'number',
  richText: 'string',
  singleLineText: 'string',
  singleSelect: 'string',
  externalSyncSource: 'string',
  url: 'string',
} as const;
