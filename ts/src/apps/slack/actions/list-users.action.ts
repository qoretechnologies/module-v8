import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { slackClient } from '../client';
import { SLACK_APP_NAME, SlackError } from '../constants';
import { SlackListUsersResponseType, TSlackUser } from '../response-types';

const action = 'list_users';

const options = {
  limit: {
    type: 'integer',
    required: false,
    default_value: 200,
  },
} satisfies TQoreOptions;

const ListUsers = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SLACK_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: SlackListUsersResponseType,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: [],
      connectionFields: ['token'],
      ErrorClass: SlackError,
    });

    const limit = obj?.limit || 200;

    try {
      const members = await slackClient.fetchPaginatedPost<TSlackUser>({
        token,
        path: 'users.list',
        itemsPath: 'members',
        maxResults: limit,
      });

      return { members };
    } catch (error) {
      throw new SlackError(`Failed to list users: ${error.message || error}`);
    }
  },
});

export default ListUsers;
