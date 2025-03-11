import { IQoreAppActionWithFunction } from '@qoretechnologies/ts-toolkit';
import { UpdateTeamsChannel } from '../apps/teams/actions/update-channel';
import { getTeamsAttendeesAllowedValues } from '../apps/teams/helpers/get-attendee-allowed-values';
import { getTeamsChannelIdAllowedValues } from '../apps/teams/helpers/get-channel-id-allowed-values';
import { getTeamsChannelMembersAllowedValues } from '../apps/teams/helpers/get-channel-member-allowed-values';
import { getTeamsChatIdAllowedValues } from '../apps/teams/helpers/get-chat-id-allowed-values';
import { getTeamsMeetingIdAllowedValues } from '../apps/teams/helpers/get-meeting-id-allowed-values';
import { getTeamsChannelAddableMembersAllowedValues } from '../apps/teams/helpers/get-member-allowed-values';
import { getTeamsTeamIdAllowedValues } from '../apps/teams/helpers/get-team-id-allowed-values';
import {
  CreateTeamsMeeting,
  DeleteTeamsMeeting,
  SendTeamsChannelMessage,
  UpdateTeamsMeeting,
} from '../apps/teams/actions';

describe('Should test Microsoft Teams actions', () => {
  const refreshToken = process.env.TEAMS_REFRESH_TOKEN;
  const clientId = process.env.TEAMS_CLIENT_ID;
  const clientSecret = process.env.TEAMS_CLIENT_SECRET;

  let token: string;
  let teamId: string;
  let channelId: string | undefined;

  beforeAll(async () => {
    if (!refreshToken || !clientId || !clientSecret) {
      throw new Error('Microsoft Teams credentials are not provided');
    }

    const data: {
      client_id: string;
      client_secret: string;
      refresh_token: string;
      grant_type: string;
    } = {
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    };

    const formBody = Object.keys(data)
      .map(
        (key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key as keyof typeof data])
      )
      .join('&');

    const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formBody,
    });

    const responseData = await response.json();
    if (!responseData?.access_token) {
      throw new Error('Failed to get access token');
    }

    token = responseData.access_token;
  });

  describe('Should test Teams allowed values', () => {
    it('Should get Teams team ID allowed values', async () => {
      const allowed_values = await getTeamsTeamIdAllowedValues({
        conn_opts: { token } as any,
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      teamId = allowed_values[0].value;
    });

    it('Should get Teams Channel ID allowed values', async () => {
      const allowed_values = await getTeamsChannelIdAllowedValues({
        conn_opts: { token } as any,
        opts: { teamId },
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      channelId = allowed_values.find((value) => value.display_name === 'Testing Channel')?.value;
    });

    it('Should get Teams Chat ID allowed values', async () => {
      const allowedValues = await getTeamsChatIdAllowedValues({
        conn_opts: { token } as any,
      });

      expect(allowedValues).toBeDefined();
    });

    it('Should get Teams Member ID allowed values', async () => {
      const allowedValues = await getTeamsChannelAddableMembersAllowedValues({
        conn_opts: { token } as any,
        opts: { teamId, channelId },
      });

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
    });

    it('Should get Teams Channel Member ID allowed values', async () => {
      const allowedValues = await getTeamsChannelMembersAllowedValues({
        conn_opts: { token } as any,
        opts: { teamId, channelId },
      });

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
    });

    it('Should get Teams Attendee ID allowed values', async () => {
      const allowedValues = await getTeamsAttendeesAllowedValues({
        conn_opts: { token } as any,
        opts: { teamId },
      });

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan;
    });

    it('Should get Teams meeting ID allowed values', async () => {
      const allowedValues = await getTeamsMeetingIdAllowedValues({
        conn_opts: { token } as any,
        opts: { teamId, channelId },
      });

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
    });
  });

  describe('Should test Teams actions', () => {
    let meetingId: string;
    it('Should send Teams channel message', async () => {
      expect(channelId).toBeDefined();
      expect(teamId).toBeDefined();
      const action = SendTeamsChannelMessage as IQoreAppActionWithFunction;
      const result = await action.api_function(
        {
          channelId,
          teamId,
          message: 'Hello from Qore Technologies',
        },
        undefined,
        {
          conn_opts: {
            token,
          } as any,
        }
      );
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
    it('Should create Teams meeting', async () => {
      expect(channelId).toBeDefined();
      expect(teamId).toBeDefined();
      const action = CreateTeamsMeeting as IQoreAppActionWithFunction;
      const result = await action.api_function(
        {
          subject: 'Test meeting',
          startDateTime: new Date().toISOString(),
          endDateTime: new Date(new Date().getTime() + 10 * 60 * 1000).toISOString(),
          attendees: ['mykyta.mazurenko@qoretechnologies.com'],
        },
        undefined,
        {
          conn_opts: {
            token,
          } as any,
        }
      );
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      meetingId = result.id;
    });

    it('Should update Teams meeting', async () => {
      expect(meetingId).toBeDefined();
      const action = UpdateTeamsMeeting as IQoreAppActionWithFunction;
      const result = await action.api_function(
        {
          meetingId,
          subject: 'Updated Test meeting',
        },
        undefined,
        {
          conn_opts: {
            token,
          } as any,
        }
      );
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('Should delete Teams meeting', async () => {
      const action = DeleteTeamsMeeting as IQoreAppActionWithFunction;
      const result = await action.api_function(
        {
          meetingId,
        },
        undefined,
        {
          conn_opts: {
            token,
          } as any,
        }
      );
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('Should update Teams channel', async () => {
      expect(channelId).toBeDefined();
      expect(teamId).toBeDefined();
      const action = UpdateTeamsChannel as IQoreAppActionWithFunction;
      const result = await action.api_function(
        {
          teamId,
          channelId,
          description: 'Updated description',
        },
        undefined,
        {
          conn_opts: {
            token,
          } as any,
        }
      );
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });
});
