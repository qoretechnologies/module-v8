import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { slackClient } from '../client';
import { SLACK_APP_NAME, SlackError } from '../constants';
import { SlackUpdateProfileResponseType } from '../response-types';

const action = 'update_profile';

const options = {
  firstName: {
    type: 'string',
    required: false,
  },
  lastName: {
    type: 'string',
    required: false,
  },
  email: {
    type: 'string',
    required: false,
  },
  userId: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const UpdateProfile = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SLACK_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: SlackUpdateProfileResponseType,
  api_function: async (obj, _opts, context) => {
    // Update profile requires user token, not bot token
    const userToken = context?.conn_opts?.authed_user?.access_token;

    if (!userToken) {
      throw new SlackError('Missing user token. Please re-authenticate with user scopes.');
    }

    const firstName = obj?.firstName;
    const lastName = obj?.lastName;
    const email = obj?.email;
    const userId = obj?.userId;

    try {
      const profile: Record<string, any> = {};

      if (firstName !== undefined) profile.first_name = firstName;
      if (lastName !== undefined) profile.last_name = lastName;
      if (email !== undefined) profile.email = email;

      const body: Record<string, any> = { profile };
      if (userId) body.user = userId;

      const result = await slackClient.post<{ ok: boolean; profile: any }>(
        'users.profile.set',
        body,
        { token: userToken }
      );

      return result;
    } catch (error) {
      throw new SlackError(`Failed to update profile: ${error.message || error}`);
    }
  },
});

export default UpdateProfile;
