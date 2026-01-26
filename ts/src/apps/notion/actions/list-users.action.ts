import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { NOTION_APP_NAME, NotionError } from '../constants';
import { createNotionClient } from '../helpers/constants';

const action = 'list_users';

const options = {
  page_size: {
    type: 'number',
    required: false,
    default_value: 20,
  },
  next_cursor: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const listUsers = QoreAppCreator.createLocalizedAction<typeof options>({
  app: NOTION_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: NotionError,
    });

    try {
      const client = createNotionClient(token);
      const { page_size, next_cursor } = obj || {};

      const response = await client.users.list({
        page_size: page_size || 20,
        start_cursor: next_cursor || undefined,
      });

      return omit(response, ['type', 'user']);
    } catch (error) {
      throw new NotionError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      results: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              object: {
                type: 'string',
                example_value: 'user',
              },
              id: {
                type: 'string',
                example_value: '12345678-1234-1234-1234-123456789012',
              },
              name: {
                type: 'string',
                example_value: 'John Doe',
              },
              type: {
                type: 'string',
                example_value: 'person',
              },
              person: {
                type: {
                  type: 'hash',
                  fields: {
                    email: {
                      type: 'string',
                    },
                  },
                },
              },
              bot: {
                type: {
                  type: 'hash',
                  fields: {
                    workspace_name: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
        },
        display_name: 'Results',
        short_desc: 'The list of users in the workspace',
        desc: 'The list of users in the workspace',
        example_value: [
          {
            object: 'user',
            id: '12345678-1234-1234-1234-123456789012',
            name: 'John Doe',
            type: 'person',
            person: {
              email: 'email@example.com',
            },
          },
          {
            object: 'user',
            id: '12345678-1234-1234-1234-123456789013',
            name: 'Jane Doe',
            type: 'bot',
            bot: {
              workspace_name: 'Workspace Name',
            },
          },
        ],
      },
      next_cursor: {
        type: 'string',
        example_value: 'd8f3f8c2-1dd2-4e9f-9a4d-3c8e4e5f6b7a',
      },
      has_more: {
        type: 'bool',
        example_value: false,
      },
    },
  },
});

export default listUsers;
