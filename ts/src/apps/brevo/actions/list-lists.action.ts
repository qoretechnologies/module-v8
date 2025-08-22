import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { BREVO_APP_NAME, BrevoError, extractBrevoError } from '../constants';
import { createBrevoClient } from '../helpers/constants';

const action = 'list_lists';

const options = {
  limit: {
    type: 'number',
    required: false,
  },
  offset: {
    type: 'number',
    required: false,
  },
  sort: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: 'desc', display_name: 'Newest first' },
      { value: 'asc', display_name: 'Oldest first' },
    ],
  },
} satisfies TQoreOptions;

const listLists = QoreAppCreator.createLocalizedAction<typeof options>({
  app: BREVO_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: BrevoError,
    });

    const { limit = 10, offset = 0, sort = 'desc' } = obj || {};

    const client = createBrevoClient(token);

    try {
      const response = await client.contactsClient.getLists(limit, offset, sort as 'desc' | 'asc');

      return response.body;
    } catch (error) {
      throw new BrevoError(`Failed to ${humanizeNameTitle(action)}: ${extractBrevoError(error)}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      count: { type: 'number' },
      lists: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'number' },
              name: { type: 'string' },
              totalBlacklisted: { type: 'number' },
              totalSubscribers: { type: 'number' },
              folderId: { type: 'number' },
              createdAt: { type: 'string' },
              dynamicList: { type: 'boolean' },
            },
          },
        },
      },
    },
  },
});

export default listLists;
