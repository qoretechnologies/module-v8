import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { slackClient } from '../client';
import { SLACK_APP_NAME, SlackError } from '../constants';
import { getSlackUsersAllowedValues } from '../helpers';
import { SlackGetUserInfoResponseType } from '../response-types';

const action = 'get_user_info';

const options = {
  userId: {
    type: 'string',
    required: true,
    get_allowed_values: getSlackUsersAllowedValues,
  },
} satisfies TQoreOptions;

const GetUserInfo = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SLACK_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: SlackGetUserInfoResponseType,
  api_function: async (obj, _opts, context) => {
    const { token, userId } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['userId'],
      connectionFields: ['token'],
      ErrorClass: SlackError,
    });

    try {
      const result = await slackClient.post<{ ok: boolean; user: any }>(
        'users.info',
        { user: userId },
        { token }
      );

      return result;
    } catch (error) {
      throw new SlackError(`Failed to get user info: ${error.message || error}`);
    }
  },
});

export default GetUserInfo;
