import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_MEET_APP_NAME, GoogleMeetError } from '../constants';
import { createGoogleMeetClient, formatDate } from '../helpers/constants';

const options = {
  limit: {
    type: 'number',
    preselected: true,
    required: false,
    default_value: 100,
  },
  nextPageToken: {
    type: 'string',
    preselected: true,
    required: false,
  },
  meeting_code: {
    type: 'string',
    preselected: true,
    required: false,
  },
  start_time: {
    type: 'date',
    preselected: true,
    required: false,
  },
  end_time: {
    type: 'date',
    preselected: true,
    required: false,
  },
  space_name: {
    type: 'string',
    preselected: true,
    required: false,
  },
} satisfies TQoreOptions;

const listConferences = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_MEET_APP_NAME,
  action: 'list_conferences',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues<{
      token: string;
    }>({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: GoogleMeetError,
    });

    const meetClient = createGoogleMeetClient(token);

    try {
      const limit = obj?.limit || 100;
      const pageToken = obj?.nextPageToken;
      const meetingCode = obj?.meeting_code;
      const startTime = obj?.start_time;
      const endTime = obj?.end_time;
      const spaceName = obj?.space_name;

      let filter = '';
      const filterParts = [];

      if (meetingCode) {
        filterParts.push(`space.meeting_code="${meetingCode}"`);
      }

      if (startTime) {
        const formattedStartTime = new Date(startTime).toISOString();
        filterParts.push(`start_time>="${formattedStartTime}"`);
      }

      if (endTime) {
        const formattedEndTime = new Date(endTime).toISOString();
        filterParts.push(`end_time<="${formattedEndTime}"`);
      }

      if (spaceName) {
        filterParts.push(`space.name="${spaceName}"`);
      }

      if (filterParts.length > 0) {
        filter = filterParts.join(' AND ');
      }

      const response = await meetClient.conferenceRecords.list({
        pageSize: limit,
        pageToken,
        filter,
      });

      const conferences = response.data.conferenceRecords || [];

      const formattedConferences = conferences.map((conference) => ({
        id: conference.name || '',
        start_time: formatDate(conference.startTime || ''),
        end_time: formatDate(conference.endTime || ''),
        expire_time: formatDate(conference.expireTime || ''),
        space: conference.space,
      }));

      return {
        conferences: formattedConferences,
        next_page_token: response.data.nextPageToken || null,
      };
    } catch (error) {
      throw new GoogleMeetError(`Failed to list conferences: ${error.message}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      conferences: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              start_time: { type: 'string' },
              end_time: { type: 'string' },
              expire_time: { type: 'string' },
              space: { type: 'string' },
            },
          },
        },
      },
      next_page_token: { type: 'string' },
    },
  },
});

export default listConferences;
