import {
  GetGoogleMeetConference,
  GetGoogleMeetConferenceParticipants,
  GetGoogleMeetConferenceRecordings,
  GetGoogleMeetConferenceTranscript,
  GetGoogleMeetConferences,
} from '../apps/google-meet/actions';
import { getGoogleMeetConferenceIdAllowedValues } from '../apps/google-meet/helpers/get-conference-id-allowed-values';
import { getGoogleMeetConferenceTranscriptIdAllowedValues } from '../apps/google-meet/helpers/get-transcript-id-allowed-values';
import { Debugger, DebugLevels } from '../utils/Debugger';

Debugger.level = DebugLevels.Verbose;

describe('Google Drive', () => {
  const base_context = {
    conn_opts: {
      token: '',
    } as any,
  };

  beforeAll(async () => {
    const refreshToken = process.env.GOOGLE_MEET_REFRESH_TOKEN;
    const clientId = process.env.GOOGLE_MEET_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_MEET_CLIENT_SECRET;

    if (!refreshToken || !clientId || !clientSecret) {
      throw new Error(
        `Please set the` +
          `GOOGLE_MEET_REFRESH_TOKEN, GOOGLE_MEET_CLIENT_ID, and GOOGLE_MEET_CLIENT_SECRET environment variables.`
      );
    }

    const data = {
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    };

    const formBody = Object.keys(data)
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key as keyof typeof data])}`
      )
      .join('&');

    const response = await fetch('https://oauth2.googleapis.com/token', {
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

    base_context.conn_opts.token = responseData.access_token;
  });

  let conferenceId: string | undefined;
  let transcriptId: string | undefined;
  describe('Should test google meet allowed values', () => {
    it('Should get Google Conference IDs', async () => {
      const allowed_values = await getGoogleMeetConferenceIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();
      conferenceId = allowed_values[0].value;
    });

    it('Should get Google Transcript IDs', async () => {
      const allowed_values = await getGoogleMeetConferenceTranscriptIdAllowedValues({
        ...base_context,
        opts: { conference: conferenceId },
      });

      expect(allowed_values).toBeDefined();
      transcriptId = allowed_values[0]?.value;
    });
  });

  describe('Should test google meet actions', () => {
    it('Should get conference participants', async () => {
      const action = GetGoogleMeetConferenceParticipants;

      if (!('api_function' in action)) {
        throw new Error('api_function is not defined in action');
      }

      const result = await action.api_function(
        {
          conference: conferenceId,
        },
        undefined,
        base_context
      );
      expect(result).toBeDefined();
    });

    it('Should get conference recordings', async () => {
      const action = GetGoogleMeetConferenceRecordings;

      if (!('api_function' in action)) {
        throw new Error('api_function is not defined in action');
      }

      const result = await action.api_function(
        {
          conference: conferenceId,
        },
        undefined,
        base_context
      );
      expect(result).toBeDefined();
    });

    it('Should get conference transcript', async () => {
      const action = GetGoogleMeetConferenceTranscript;

      if (!('api_function' in action)) {
        throw new Error('api_function is not defined in action');
      }

      if (!transcriptId) return;

      const result = await action.api_function(
        {
          conference: conferenceId,
          transcript: transcriptId,
        },
        undefined,
        base_context
      );
      expect(result).toBeDefined();
    });

    it('Should get conference', async () => {
      const action = GetGoogleMeetConference;

      if (!('api_function' in action)) {
        throw new Error('api_function is not defined in action');
      }

      const result = await action.api_function(
        {
          conference: conferenceId,
        },
        undefined,
        base_context
      );
      expect(result).toBeDefined();
    });

    it('Should list conference', async () => {
      const action = GetGoogleMeetConferences;

      if (!('api_function' in action)) {
        throw new Error('api_function is not defined in action');
      }

      const result = await action.api_function({}, undefined, base_context);
      expect(result).toBeDefined();
    });
  });
});
