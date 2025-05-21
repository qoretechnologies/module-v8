import { drive_v3 } from '@googleapis/drive';
import { meet_v2 } from '@googleapis/meet';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { createGoogleDriveClient } from '../../google-drive/helpers/constants';
import { GOOGLE_MEET_APP_NAME, GoogleMeetError } from '../constants';
import { createGoogleMeetClient, formatDate } from '../helpers/constants';
import { getConferenceIdByMeetingCode } from '../helpers/get-conference-id-by-meeting-code.helper';
import { getGoogleMeetConferenceIdAllowedValues } from '../helpers/get-conference-id-allowed-values';

const options = {
  conference: {
    type: 'string',
    preselected: true,
    get_allowed_values: getGoogleMeetConferenceIdAllowedValues,
    allowed_values_creatable: true,
    required: true,
  },
} satisfies TQoreOptions;

const getConferenceRecordings = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_MEET_APP_NAME,
  action: 'get_conference_recordings',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: GoogleMeetError,
    });

    const meetClient = createGoogleMeetClient(token);
    const driveClient = createGoogleDriveClient(token);

    let conference = obj?.conference;

    if (conference?.length === 10 && conference.split('-').length === 3) {
      const foundId = await getConferenceIdByMeetingCode(conference, token);

      if (!foundId) {
        throw new GoogleMeetError(`Invalid meeting code: ${conference}`);
      }

      conference = foundId;
    }

    try {
      let pageToken: string | undefined = undefined;
      let allRecordings: meet_v2.Schema$Recording[] = [];

      do {
        const recordingsResponse: { data: meet_v2.Schema$ListRecordingsResponse } =
          await meetClient.conferenceRecords.recordings.list({
            parent: conference,
            pageSize: 100,
            pageToken,
          });

        const recordings = recordingsResponse.data.recordings || [];
        allRecordings = [...allRecordings, ...recordings];

        pageToken = recordingsResponse.data.nextPageToken || undefined;
      } while (pageToken);

      return await Promise.all(
        allRecordings.map(async (recording) => {
          let file: drive_v3.Schema$File | undefined = undefined;

          try {
            const fileId = recording.driveDestination?.file;
            if (fileId) {
              file = (
                await driveClient.files.get({
                  fileId,
                  fields: '*',
                })
              ).data;
            }
          } catch (error) {
            console.error('Error fetching file metadata:', error);
          }

          return {
            id: recording.name || '',
            ...(file && {
              display_name: file?.name || '',
              drive_file_id: file?.id || '',
              content_type: file?.mimeType || '',
              download_url: file?.webContentLink || '',
              content_uri: file?.webViewLink || '',
              size: file?.size ? Number(file.size) : 0,
            }),
            state: recording.state || '',
            start_time: formatDate(recording.startTime || ''),
            end_time: formatDate(recording.endTime || ''),
            duration_seconds: calculateDuration(recording.startTime, recording.endTime),
          };
        })
      );
    } catch (error) {
      throw new GoogleMeetError(`Failed to get meeting recordings: ${error.message}`);
    }
  },
  response_type: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        drive_file_id: { type: 'string' },
        display_name: { type: 'string' },
        state: { type: 'string' },
        media_type: { type: 'string' },
        created_time: { type: 'string' },
        start_time: { type: 'string' },
        end_time: { type: 'string' },
        duration_seconds: { type: 'number' },
        content_type: { type: 'string' },
        download_url: { type: 'string' },
        content_uri: { type: 'string' },
        size: { type: 'number' },
      },
    },
  },
});

const calculateDuration = (startTime?: string | null, endTime?: string | null): number => {
  if (!startTime || !endTime) return 0;

  try {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    return Math.floor((end - start) / 1000);
  } catch (error) {
    return 0;
  }
};

export default getConferenceRecordings;
