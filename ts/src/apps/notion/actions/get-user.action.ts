import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { NOTION_APP_NAME, NotionError } from '../constants';
import { createNotionClient } from '../helpers/constants';
import { getNotionUserAllowedValues } from '../helpers/get-user-allowed-values';

const action = 'get_user';

const options = {
  user_id: {
    type: 'string',
    required: true,
    get_allowed_values: getNotionUserAllowedValues,
  },
} satisfies TQoreOptions;

const getUser = QoreAppCreator.createLocalizedAction<typeof options>({
  app: NOTION_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, user_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['user_id'],
      ErrorClass: NotionError,
    });

    try {
      const client = createNotionClient(token);

      const response = await client.users.retrieve({
        user_id,
      });

      return omit(response, ['object', 'request_id']);
    } catch (error) {
      throw new NotionError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
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
});

export default getUser;
