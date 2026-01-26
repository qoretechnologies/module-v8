import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { CANVA_APP_NAME, CanvaError } from '../constants';
import { canvaApiClient } from '../helpers/constants';

const action = 'list_designs';

const options = {
  query: { type: 'string', required: false },
  continuation: { type: 'string', required: false },
  ownership: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: 'any', display_name: 'Any' },
      { value: 'owned', display_name: 'Owned' },
      { value: 'shared', display_name: 'Shared' },
    ],
  },
  sort_by: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: 'relevance', display_name: 'Relevance' },
      { value: 'modified_descending', display_name: 'Modified Descending' },
      { value: 'modified_ascending', display_name: 'Modified Ascending' },
      { value: 'title_descending', display_name: 'Title Descending' },
      { value: 'title_ascending', display_name: 'Title Ascending' },
    ],
  },
} satisfies TQoreOptions;

const getImage = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CANVA_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: CanvaError,
    });

    const { continuation, ownership, query, sort_by } = obj || {};

    try {
      const response = await canvaApiClient({
        path: `designs`,
        method: 'GET',
        params: {
          ...(continuation && { continuation }),
          ...(ownership && { ownership }),
          ...(query && { query }),
          ...(sort_by && { sort_by }),
        },
        token,
      });

      return response;
    } catch (error) {
      throw new CanvaError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      continuation: {
        type: 'string',
      },
      items: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              title: { type: 'string' },
              owner: {
                type: {
                  type: 'hash',
                  fields: {
                    user_id: { type: 'string' },
                    team_id: { type: 'string' },
                  },
                },
              },
              thumbnail: {
                type: {
                  type: 'hash',
                  fields: {
                    width: { type: 'integer' },
                    height: { type: 'integer' },
                    url: { type: 'string' },
                  },
                },
              },
              urls: {
                type: {
                  type: 'hash',
                  fields: {
                    edit_url: { type: 'string' },
                    view_url: { type: 'string' },
                  },
                },
              },
              created_at: { type: 'integer' },
              updated_at: { type: 'integer' },
              page_count: { type: 'integer' },
            },
          },
        },
      },
    },
  },
});

export default getImage;
