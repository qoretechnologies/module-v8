import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import freshDeskSchema from '../../../schemas/freshdesk.swagger.json';
import { FRESHDESK_APP_NAME } from '../constants';
import {
  getFreshdeskRecordCurrentValue,
  getFreshdeskRecordIdAllowedValues,
  getFreshdeskRecordVersion,
  getFreshdeskSchemaRecordValue,
} from '../helpers/get-record-allowed-values';
import { getFreshdeskSchemaIdAllowedValues } from '../helpers/get-schema-id-allowed-values';

export const FRESHDESK_CUSTOM_OBJECTS_ALLOWED_PATHS = {
  '/api/v2/custom_objects/schemas': {
    GET: {},
  },
  '/api/v2/custom_objects/schemas/{id}/fields': {
    GET: {
      override_options: {
        id: {
          get_allowed_values: getFreshdeskSchemaIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
  },
  '/api/v2/custom_objects/schemas/{id}/records': {
    GET: {
      override_options: {
        id: {
          get_allowed_values: getFreshdeskSchemaIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
    POST: {
      override_options: {
        id: {
          get_allowed_values: getFreshdeskSchemaIdAllowedValues,
          allowed_values_creatable: true,
        },
        data: {
          required: true,
          get_default_value: getFreshdeskSchemaRecordValue,
        },
      },
    },
  },
  '/api/v2/custom_objects/schemas/{schemaId}/records/{id}': {
    GET: {
      override_options: {
        schemaId: {
          get_allowed_values: getFreshdeskSchemaIdAllowedValues,
          allowed_values_creatable: true,
        },
        id: {
          get_allowed_values: getFreshdeskRecordIdAllowedValues,
          allowed_values_creatable: true,
          depends_on: ['schemaId'],
        },
      },
    },
    PUT: {
      override_options: {
        schemaId: {
          get_allowed_values: getFreshdeskSchemaIdAllowedValues,
          allowed_values_creatable: true,
        },
        id: {
          get_allowed_values: getFreshdeskRecordIdAllowedValues,
          allowed_values_creatable: true,
          depends_on: ['schemaId'],
        },
        'body.data': {
          get_default_value: getFreshdeskRecordCurrentValue,
          depends_on: ['schemaId', 'id'],
          required: true,
        },
        'body.version': {
          get_default_value: getFreshdeskRecordVersion,
          depends_on: ['schemaId', 'id'],
          required: true,
        },
      },
    },
    DELETE: {
      override_options: {
        schemaId: {
          get_allowed_values: getFreshdeskSchemaIdAllowedValues,
          allowed_values_creatable: true,
        },
        id: {
          get_allowed_values: getFreshdeskRecordIdAllowedValues,
          allowed_values_creatable: true,
          depends_on: ['schemaId'],
        },
      },
    },
  },
} satisfies TAllowedPaths;

export const FRESHDESK_CUSTOM_OBJECTS_ACTIONS = buildActionsFromSwaggerSchema({
  schema: freshDeskSchema,
  allowedPaths: FRESHDESK_CUSTOM_OBJECTS_ALLOWED_PATHS,
  app: FRESHDESK_APP_NAME,
});
