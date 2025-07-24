import {
  EQoreAppActionCode,
  QoreAppCreator,
  QorusRequest,
  TQoreMappedOptions,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
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
            type: { type: 'string' },
            title: { type: 'string' },
            last_updated_at: { type: 'string' },
            created_at: { type: 'string' },
            settings: {
              type: {
                type: 'hash',
                fields: {
                  is_public: { type: 'boolean' },
                  is_trial: { type: 'boolean' },
                },
              },
            },
            self: {
              type: {
                type: 'hash',
                fields: {
                  href: { type: 'string' },
                },
              },
            },
            theme: {
              type: {
                type: 'hash',
                fields: {
                  href: { type: 'string' },
                },
              },
            },
            _links: {
              type: {
                type: 'hash',
                fields: {
                  display: { type: 'string' },
                  responses: { type: 'string' },
                },
              },
            },
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
  workspace_id: {
    type: 'string',
    required: false,
  },
  order: {
    type: {
      type: 'hash',
      fields: {
        field: {
          type: 'string',
          allowed_values: [
            { value: 'created_at', display_name: 'Created At' },
            { value: 'last_updated_at', display_name: 'Updated At' },
          ],
          required: true,
        },
        direction: {
          type: 'string',
          preselected: true,
          allowed_values: [
            { value: 'asc', display_name: 'Ascending' },
            { value: 'desc', display_name: 'Descending' },
          ],
        },
      },
    },
  },
} satisfies TQoreOptions;

const listForms = QoreAppCreator.createLocalizedAction<typeof options>({
  app: TYPEFORM_APP_NAME,
  action: 'list_forms',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: TypeformError,
    });

    const search = obj?.search;
    const workspace_id = obj?.workspace_id;
    const page = obj?.page;
    const page_size = obj?.page_size ? Math.min(obj.page_size, 200) : 10;
    const order_by = obj?.order?.direction || 'desc';
    const sort_by = obj?.order?.field || 'created_at';

    try {
      const response = await QorusRequest.get<{
        data: TQoreMappedOptions<(typeof response_type)['fields']>;
      }>(
        {
          path: '/forms',
          params: {
            ...(search && { search }),
            ...(workspace_id && { workspace_id }),
            ...(page && { page }),
            order_by,
            sort_by,
            page_size,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        {
          url: 'https://api.typeform.com',
          endpointId: TYPEFORM_APP_NAME,
        }
      );

      return response?.data;
    } catch (error) {
      throw new TypeformError(`Failed to list forms: ${extractTypeformErrorMessage(error)}`);
    }
  },
  response_type,
});

export default listForms;
