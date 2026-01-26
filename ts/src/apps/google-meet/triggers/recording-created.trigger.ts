import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { GOOGLE_MEET_APP_NAME, GoogleMeetError } from '../constants';
import { createGoogleMeetClient } from '../helpers/constants';
import { getGoogleMeetConferenceIdAllowedValues } from '../helpers/get-conference-id-allowed-values';
import { getGoogleMeetConferenceOption } from '../helpers/get-conference-id-by-meeting-code.helper';

const GoogleMeetRecordingCreatedTrigger = QoreAppCreator.createLocalizedTrigger({
  app: GOOGLE_MEET_APP_NAME,
  action: 'recording_created',
  action_code: EQoreAppActionCode.EVENT,
  options: {
    conference: {
      required: true,
      type: 'string',
      get_allowed_values: getGoogleMeetConferenceIdAllowedValues,
      allowed_values_creatable: true,
    },
  },
  event_function: async (context, update, should_stop) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['conference'],
      ErrorClass: GoogleMeetError,
    });

    const conference = await getGoogleMeetConferenceOption(context?.opts, token);

    const getItems = () => {
      return fetchLatestRecordings(token, conference);
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'google_meet_recording_created',
      uniqueField: 'name',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: GoogleMeetError,
    });

    const conference = await getGoogleMeetConferenceOption(context?.opts, token);

    const responses = await fetchLatestRecordings(token, conference);

    return responses?.length > 0 ? responses[0] : null;
  },
  event_info: {
    desc: 'Triggered when a new Google Meet recording is created.',
    type: {
      type: 'hash',
      fields: {
        name: {
          type: 'string',
        },
        state: {
          type: 'string',
        },
        startTime: {
          type: 'string',
        },
        endTime: {
          type: 'string',
        },
        driveDestination: {
          type: {
            type: 'hash',
            fields: {
              file: {
                type: 'string',
              },
              folder: {
                type: 'string',
              },
            },
          },
        },
      },
    },
  },
});

export default GoogleMeetRecordingCreatedTrigger;

const fetchLatestRecordings = async (token: string, conference_id?: string) => {
  const limit = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;

  try {
    const meetClient = createGoogleMeetClient(token);

    const response = await meetClient.conferenceRecords.recordings.list({
      pageSize: limit,
      parent: conference_id,
    });

    return (response.data.recordings || []).filter(
      (recording) => recording.state === 'FILE_GENERATED'
    );
  } catch (error) {
    throw new GoogleMeetError(`Failed to fetch latest recordings: ${error.message || error}`);
  }
};
