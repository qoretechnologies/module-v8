import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_MEET_APP_NAME, GoogleMeetError } from '../constants';
import { createGoogleMeetClient } from '../helpers/constants';
import { getGoogleMeetConferenceIdAllowedValues } from '../helpers/get-conference-id-allowed-values';
import { getConferenceIdByMeetingCode } from '../helpers/get-conference-id-by-meeting-code.helper';

const options = {
  conference: {
    type: 'string',
    required: true,
    get_allowed_values: getGoogleMeetConferenceIdAllowedValues,
    allowed_values_creatable: true,
  },
} satisfies TQoreOptions;

const getConference = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_MEET_APP_NAME,
  action: 'get_conference',
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

    let conference = obj?.conference;

    if (conference?.length === 10 && conference.split('-').length === 3) {
      const foundId = await getConferenceIdByMeetingCode(conference, token);

      if (!foundId) {
        throw new GoogleMeetError(`Invalid meeting code: ${conference}`);
      }

      conference = foundId;
    }

    const meetClient = createGoogleMeetClient(token);

    try {
      const [
        conferenceResponse,
        conferenceRecordings,
        conferenceParticipants,
        conferenceTranscripts,
      ] = await Promise.all([
        meetClient.conferenceRecords.get({ name: conference }),
        meetClient.conferenceRecords.recordings.list({ parent: conference }),
        meetClient.conferenceRecords.participants.list({ parent: conference }),
        meetClient.conferenceRecords.transcripts.list({ parent: conference }),
      ]);

      return {
        ...conferenceResponse.data,
        recordings: conferenceRecordings.data.recordings || [],
        participants: conferenceParticipants.data.participants || [],
        transcripts: conferenceTranscripts.data.transcripts || [],
      };
    } catch (error) {
      throw new GoogleMeetError(`Failed to list conferences: ${error.message}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      startTime: { type: 'string' },
      endTime: { type: 'string' },
      expireTime: { type: 'string' },
      space: { type: 'string' },
      transcripts: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              state: { type: 'string' },
              startTime: { type: 'string' },
              endTime: { type: 'string' },
              docsDestination: {
                type: {
                  type: 'hash',
                  fields: {
                    document: { type: 'string' },
                    exportUri: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
      participants: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              name: { type: 'string' },
              earliestStartTime: { type: 'string' },
              latestEndTime: { type: 'string' },
              signedinUser: {
                type: {
                  type: 'hash',
                  fields: {
                    user: { type: 'string' },
                    displayName: { type: 'string' },
                  },
                },
              },
              phoneUser: {
                type: {
                  type: 'hash',
                  fields: {
                    displayName: { type: 'string' },
                  },
                },
              },
              anonymousUser: {
                type: {
                  type: 'hash',
                  fields: {
                    displayName: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
      recordings: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              state: { type: 'string' },
              startTime: { type: 'string' },
              endTime: { type: 'string' },
              driveDestination: {
                type: {
                  type: 'hash',
                  fields: {
                    file: { type: 'string' },
                    exportUri: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
});

export default getConference;
