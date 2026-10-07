import { ZoomError } from '../apps/zoom/constants';
import {
  getZoomMeetingIDAllowedValues,
  getZoomMeetingUUIDAllowedValues,
} from '../apps/zoom/helpers/get-meeting-id-allowed-values';
import { getZoomMeetingOccurrenceIdAllowedValues } from '../apps/zoom/helpers/get-meeting-occurrence-id-allowed-values';
import { getZoomMeetingTemplateIdAllowedValues } from '../apps/zoom/helpers/get-meeting-template-allowed-values';
import { getZoomWebinarIdAllowedValues } from '../apps/zoom/helpers/get-webinar-id-allowed-values';
import { NewZoomMeetingSummary, NewZoomMeetingTrigger } from '../apps/zoom/triggers';
import { delay } from '../global/helpers';

const messageOf = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

/**
 * Zoom's answer on an account without the Webinar add-on. The webinar tests report it and stop rather
 * than fail: the request reached Zoom with the right scope, which is what can be checked without the
 * add-on (qorus#658).
 */
const isMissingWebinarPlan = (error: unknown): boolean =>
  /webinar plan is missing/i.test(messageOf(error));

/** Zoom's answer to the summaries listing on a free account: the endpoint and scope are right, the feature is not there. */
const isPaidAccountOnly = (error: unknown): boolean =>
  /only available for paid account/i.test(messageOf(error));

let connection: string;

/** Exchanges the stored refresh token for an access token, when no `ZOOM_ACCESS_TOKEN` is given. */
const refreshAccessToken = async (): Promise<string> => {
  const refresh_token = process.env.ZOOM_REFRESH_TOKEN;
  const client_id = process.env.ZOOM_CLIENT_ID;
  const client_secret = process.env.ZOOM_CLIENT_SECRET;

  if (!refresh_token || !client_id || !client_secret) {
    throw new ZoomError(
      'Please set ZOOM_ACCESS_TOKEN, or the ZOOM_REFRESH_TOKEN, ZOOM_CLIENT_ID, and ZOOM_CLIENT_SECRET environment variables'
    );
  }

  const body = {
    refresh_token,
    client_id,
    client_secret,
    grant_type: 'refresh_token',
  };

  const formBody = Object.keys(body)
    .map(
      (key) => `${encodeURIComponent(key)}=${encodeURIComponent(body[key as keyof typeof body])}`
    )
    .join('&');

  const response = await fetch('https://zoom.us/oauth/token', {
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

  return responseData.access_token as string;
};

describe('Tests Zoom Actions', () => {
  const base_context = {
    conn_opts: {
      token: '',
    } as any,
  };

  beforeAll(async () => {
    // an access token minted outside the run is used as is: every refresh rotates the stored refresh
    // token, which a test run does not persist, so refreshing here would strand the next run
    const token = process.env.ZOOM_ACCESS_TOKEN || (await refreshAccessToken());

    base_context.conn_opts.token = token;

    connection = testApi.createConnection('zoom', {
      opts: {
        token,
        oauth2_grant_type: 'none',
      } as any,
    });

    expect(connection).toBeDefined();
  });

  describe('Should test Zoom allowed values', () => {
    afterEach(async () => {
      await delay(1000);
    });
    let meetingId: string | undefined;

    it('Should get zoom meeting uuid allowed values', async () => {
      const allowed_values = await getZoomMeetingUUIDAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();

      meetingId = allowed_values.find(
        (allowed_value) => allowed_value.display_name === 'Qorus Test Recurring Meeting'
      )?.value;
    });

    it('Should get zoom meeting id allowed values', async () => {
      const allowed_values = await getZoomMeetingIDAllowedValues(base_context);
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();
    });

    it('Should get meeting template allowed values', async () => {
      const allowed_values = await getZoomMeetingTemplateIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();
    });

    // Only available for pro accounts
    // it('Should get webinar meeting source allowed values', async () => {
    //   const allowed_values = await getZoomWebinarTrackingSourceIdAllowedValues(base_context);

    //   expect(allowed_values).toBeDefined();
    //   expect(allowed_values.length).toBeGreaterThan(0);
    //   expect(allowed_values[0].value).toBeDefined();
    // });

    it('Should get meeting occurrence allowed values', async () => {
      const allowed_values = await getZoomMeetingOccurrenceIdAllowedValues({
        ...base_context,
        opts: {
          meetingId,
        },
      });
      expect(allowed_values).toBeDefined();
    });
  });

  describe('Should test Zoom Actions', () => {
    let meetingId: string | undefined;
    it('Should create a meeting', async () => {
      const { body } = await testApi.execAppAction('zoom', 'meetingCreate', connection, {
        topic: 'Qorus Test Meeting',
      });

      expect(body).toHaveProperty('id');
      expect(body.id).toBeDefined();

      meetingId = body.id;
    });

    it('Should get a meeting by ID', async () => {
      const { body } = await testApi.execAppAction('zoom', 'meeting', connection, {
        meetingId: meetingId as string,
      });

      expect(body).toHaveProperty('id');
      expect(body.id).toBe(meetingId);
    });

    it('Should update a meeting by ID', async () => {
      const agenda = 'This is a test agenda for the meeting.';
      const response = await testApi.execAppAction('zoom', 'meetingUpdate', connection, {
        meetingId: meetingId as string,
        agenda,
      });

      expect(response).toBeDefined();
    });

    it('Should list meetings', async () => {
      const { body } = await testApi.execAppAction('zoom', 'meetings', connection, {
        userId: 'me',
      });

      expect(body).toHaveProperty('meetings');
      expect(Array.isArray(body.meetings)).toBe(true);
    });

    it('Should delete a meeting by ID', async () => {
      const response = await testApi.execAppAction('zoom', 'meetingDelete', connection, {
        meetingId: meetingId as string,
      });

      expect(response).toBeDefined();
    });
  });

  describe('Should test Zoom webinars', () => {
    it('Should offer integer webinar IDs', async () => {
      let allowed_values;

      try {
        allowed_values = await getZoomWebinarIdAllowedValues(base_context);
      } catch (error) {
        if (isMissingWebinarPlan(error)) {
          console.warn(`⚠ SKIPPED (no Webinar plan on this account): ${messageOf(error)}`);
          return;
        }
        throw error;
      }

      expect(allowed_values).toBeDefined();

      // the integer webinar ID, never the instance UUID: Update, Delete and the registrant endpoints
      // take only the integer
      for (const allowed_value of allowed_values) {
        expect(allowed_value.value).toMatch(/^\d+$/);
      }
    });

    it('Should create, read and delete a webinar', async () => {
      let created: any;

      try {
        created = await testApi.execAppAction('zoom', 'webinarCreate', connection, {
          topic: 'Qorus Test Webinar',
        });
      } catch (error) {
        if (isMissingWebinarPlan(error)) {
          console.warn(`⚠ SKIPPED (no Webinar plan on this account): ${messageOf(error)}`);
          return;
        }
        throw error;
      }

      expect(created.body).toHaveProperty('id');
      const webinarId = created.body.id.toString();

      const { body } = await testApi.execAppAction('zoom', 'webinar', connection, { webinarId });
      expect(body.id.toString()).toBe(webinarId);

      const deleted = await testApi.execAppAction('zoom', 'webinarDelete', connection, {
        webinarId,
      });
      expect(deleted).toBeDefined();
    });
  });

  describe('Should test Zoom triggers', () => {
    it("Should request the user's own meeting summaries", async () => {
      let example: any;

      try {
        example = await NewZoomMeetingSummary.get_example_event_data!(base_context);
      } catch (error) {
        if (isPaidAccountOnly(error)) {
          console.warn(`⚠ SKIPPED (no meeting summaries on this account): ${messageOf(error)}`);
          return;
        }
        throw error;
      }

      // a paid account with AI Companion on: either no summary yet, or one with its instance UUID
      if (example) {
        expect(example).toHaveProperty('meeting_uuid');
        expect(example).toHaveProperty('meeting_id');
      }
    });

    it('Should show an example of a created meeting', async () => {
      const example = await NewZoomMeetingTrigger.get_example_event_data!({
        ...base_context,
        opts: { meeting_event_type: 'upcoming' },
      });

      if (example) {
        expect(example).toHaveProperty('uuid');
        expect(example).toHaveProperty('id');
        expect(example).toHaveProperty('meeting_type_name');
      }
    });
  });
});
