import { ZoomError } from '../apps/zoom/constants';
import {
  getZoomMeetingIDAllowedValues,
  getZoomMeetingUUIDAllowedValues,
} from '../apps/zoom/helpers/get-meeting-id-allowed-values';
import { getZoomMeetingOccurrenceIdAllowedValues } from '../apps/zoom/helpers/get-meeting-occurrence-id-allowed-values';
import { getZoomMeetingTemplateIdAllowedValues } from '../apps/zoom/helpers/get-meeting-template-allowed-values';
import { delay } from '../global/helpers';

let connection: string;

describe('Tests Zendesk Actions', () => {
  const base_context = {
    conn_opts: {
      token: '',
    } as any,
  };

  beforeAll(async () => {
    const refresh_token = process.env.ZOOM_REFRESH_TOKEN;
    const client_id = process.env.ZOOM_CLIENT_ID;
    const client_secret = process.env.ZOOM_CLIENT_SECRET;

    if (!refresh_token || !client_id || !client_secret) {
      throw new ZoomError(
        'Please set the ZOOM_REFRESH_TOKEN, ZOOM_CLIENT_ID, and ZOOM_CLIENT_SECRET environment variables'
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

    const token = responseData.access_token;

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
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();
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
});
