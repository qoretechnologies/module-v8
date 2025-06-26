import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { createClient } from '@typeform/api-client';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { TYPEFORM_APP_NAME, TypeformError } from '../constants';
import { getTypeformFormIdAllowedValues } from '../helpers/get-form-allowed-values';

const options = {
  form_id: {
    required: true,
    type: 'string',
    get_allowed_values: getTypeformFormIdAllowedValues,
  },
  page_size: {
    type: 'integer',
    default_value: 25,
    required: false,
  },
  since: {
    type: 'date',
    required: false,
  },
  until: {
    type: 'date',
    required: false,
  },
  after: {
    type: 'string',
    required: false,
  },
  before: {
    type: 'string',
    required: false,
  },
  included_response_ids: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    required: false,
  },

  excluded_response_ids: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    required: false,
  },

  response_type: {
    required: false,
    type: {
      type: 'list',
      element_type: 'string',
    },
    element_allowed_values: [
      { value: 'started', display_name: 'Started' },
      { value: 'partial', display_name: 'Partial' },
      { value: 'completed', display_name: 'Completed' },
    ],
  },
  completed: {
    type: 'boolean',
    required: false,
  },
  order: {
    type: {
      type: 'hash',
      fields: {
        field: {
          type: 'string',
          allowed_values: [
            { value: 'submitted_at', display_name: 'Submitted At' },
            { value: 'staged_at', display_name: 'Staged At' },
            { value: 'landed_at', display_name: 'Landed At' },
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
  query: {
    type: 'string',
    required: false,
  },
  fields: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    required: false,
  },
  answered_fields: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    required: false,
  },
} satisfies TQoreOptions;

const listResponses = QoreAppCreator.createLocalizedAction({
  app: TYPEFORM_APP_NAME,
  action: 'list_responses',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, form_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['form_id'],
      ErrorClass: TypeformError,
    });

    const pageSize = obj?.page_size ? Math.min(obj.page_size, 1000) : 25;
    const since = obj?.since;
    const until = obj?.until;
    const after = obj?.after;
    const before = obj?.before;
    const includedResponseIds = obj?.included_response_ids;
    const excludedResponseIds = obj?.excluded_response_ids;
    const responseType = obj?.response_type;
    const completed = obj?.completed;
    const order = obj?.order?.direction || 'desc';
    const sortBy = obj?.order?.field || 'submitted_at';
    const query = obj?.query;
    const fields = obj?.fields;
    const answeredFields = obj?.answered_fields;

    try {
      const client = createClient({ token });

      return await client.responses.list({
        uid: form_id,
        pageSize,
        sort: `${sortBy},${order}`,
        ...(since && { since }),
        ...(until && { until }),
        ...(after && { after }),
        ...(before && { before }),
        ...(includedResponseIds && { includedResponseIds }),
        ...(excludedResponseIds && { excludedResponseIds }),
        ...(responseType && { responseType }),
        ...(completed !== undefined && { completed }),
        ...(query && { query }),
        ...(fields && { fields }),
        ...(answeredFields && { answeredFields }),
      });
    } catch (error) {
      throw new TypeformError(`Failed to list responses: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      items: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              landing_id: { type: 'string' },
              token: { type: 'string' },
              response_id: { type: 'string' },
              response_type: { type: 'string' },
              landed_at: { type: 'string' },
              submitted_at: { type: 'string' },
              metadata: {
                type: {
                  type: 'hash',
                  fields: {
                    user_agent: { type: 'string' },
                    platform: { type: 'string' },
                    referer: { type: 'string' },
                    network_id: { type: 'string' },
                    browser: { type: 'string' },
                  },
                },
              },
              hidden: {
                type: {
                  type: 'hash',
                },
              },
              calculated: {
                type: {
                  type: 'hash',
                  fields: {
                    score: { type: 'number' },
                  },
                },
              },
              answers: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      field: {
                        type: {
                          type: 'hash',
                          fields: {
                            id: { type: 'string' },
                            type: { type: 'string' },
                            ref: { type: 'string' },
                          },
                        },
                      },
                      type: { type: 'string' },
                      text: { type: 'string' },
                      phone_number: { type: 'string' },
                      email: { type: 'string' },
                    },
                  },
                },
              },
              thankyou_screen_ref: { type: 'string' },
            },
          },
        },
      },
      total_items: { type: 'number' },
      page_count: { type: 'number' },
    },
  },
});

export default listResponses;
