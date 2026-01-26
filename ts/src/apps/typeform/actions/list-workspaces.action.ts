import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { createClient } from '@typeform/api-client';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { extractTypeformErrorMessage, TYPEFORM_APP_NAME, TypeformError } from '../constants';

const response_type = {
  type: 'hash',
  fields: {
    total_items: { type: 'integer' },
    page_count: { type: 'integer' },
    items: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            id: { type: 'string' },
            default: { type: 'bool' },
            forms: {
              type: {
                type: 'hash',
                fields: {
                  count: { type: 'integer' },
                  href: { type: 'string' },
                },
              },
            },
            name: { type: 'string' },
            account_id: { type: 'string' },
            self: {
              type: {
                type: 'hash',
                fields: {
                  href: { type: 'string' },
                },
              },
            },
            shared: { type: 'bool' },
          },
        },
      },
    },
  },
} satisfies TQoreResponseType;

const options = {
  search: {
    type: 'string',
    required: false,
  },
  page: {
    type: 'integer',
    default_value: 1,
    required: false,
  },
  page_size: {
    type: 'integer',
    default_value: 10,
    required: false,
  },
} satisfies TQoreOptions;

const listWorkspaces = QoreAppCreator.createLocalizedAction<typeof options>({
  app: TYPEFORM_APP_NAME,
  action: 'list_workspaces',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: TypeformError,
    });

    const search = obj?.search;
    const page = obj?.page;
    const pageSize = obj?.page_size ? Math.min(obj.page_size, 200) : 10;

    try {
      const client = createClient({ token });

      const response = await client.workspaces.list({
        ...(search && { search }),
        page,
        pageSize,
      });

      return response;
    } catch (error) {
      throw new TypeformError(`Failed to list workspaces: ${extractTypeformErrorMessage(error)}`);
    }
  },
  response_type,
});

export default listWorkspaces;
