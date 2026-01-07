import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { slackClient } from '../client';
import { SLACK_APP_NAME, SlackError } from '../constants';
import { SlackFindUserByEmailResponseType } from '../response-types';

const action = 'find_user_by_email';

const options = {
  email: {
    type: 'string',
    required: true,
  },
} satisfies TQoreOptions;

const FindUserByEmail = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SLACK_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: SlackFindUserByEmailResponseType,
  api_function: async (obj, _opts, context) => {
    const { token, email } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['email'],
      connectionFields: ['token'],
      ErrorClass: SlackError,
    });

    try {
      const result = await slackClient.post<{ ok: boolean; user: any }>(
        'users.lookupByEmail',
        { email },
        { token }
      );

      return result;
    } catch (error) {
      throw new SlackError(`Failed to find user by email: ${error.message || error}`);
    }
  },
});

export default FindUserByEmail;
