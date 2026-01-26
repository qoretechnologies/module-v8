import { Client } from '@microsoft/microsoft-graph-client';
import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { TEAMS_APP_NAME } from '../constants';
import { getTeamsMeetingIdAllowedValues } from '../helpers/get-meeting-id-allowed-values';
import { TeamsMeetingSourceOption } from '../triggers/constants';

const options = {
  meetingId: {
    type: 'string',
    required: true,
    get_allowed_values: getTeamsMeetingIdAllowedValues,
  },
  meetingSource: TeamsMeetingSourceOption,
} satisfies TQoreOptions;

const additionalOptions = {
  teamId: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const response_type = {
  type: 'hash',
  fields: {
    success: {
      type: 'bool',
    },
    error: {
      type: 'string',
    },
  },
} satisfies TQoreResponseType;

const DeleteTeamsMeeting = QoreAppCreator.createLocalizedAction<
  typeof options & Partial<typeof additionalOptions>
>({
  action: 'delete-meeting',
  app: TEAMS_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (data, _opts, context) => {
    const token = context?.conn_opts?.token;
    const meetingId = data?.meetingId;
    const meetingSource = data?.meetingSource || 'personal';
    const teamId = data?.teamId;

    if (!token) {
      throw new Error('Authentication token is required to delete Teams meeting');
    }

    if (!meetingId) {
      throw new Error('Meeting ID is required to delete Teams meeting');
    }

    if (meetingSource === 'team' && !teamId) {
      throw new Error('Team ID is required to delete team meetings');
    }

    const client = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: () => Promise.resolve(token),
      },
    });

    try {
      const headers: Record<string, string> = {};
      let endpoint = '';

      if (meetingSource === 'personal') {
        endpoint = `/me/events/${meetingId}`;
      } else if (meetingSource === 'team') {
        endpoint = `/groups/${teamId}/events/${meetingId}`;
      }

      await client.api(endpoint).headers(headers).delete();

      return {
        success: true,
        error: '',
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete Teams meeting: ${error.message}`,
      };
    }
  },
  options,
  response_type,
});

export default DeleteTeamsMeeting;
