import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { GOOGLE_MEET_APP_NAME, GoogleMeetError } from '../constants';
import { createGoogleMeetClient } from '../helpers/constants';

const GoogleMeetConferenceEndedTrigger = QoreAppCreator.createLocalizedTrigger({
  app: GOOGLE_MEET_APP_NAME,
  action: 'conference_ended',
  action_code: EQoreAppActionCode.EVENT,
  event_function: async (context, update, should_stop) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: GoogleMeetError,
    });

    const getItems = () => {
      return fetchLatestConferences(token);
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'google_meet_conference_ended',
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

    const responses = await fetchLatestConferences(token);

    return responses?.length > 0 ? responses[0] : null;
  },
  event_info: {
    desc: 'Triggered when a Google Meet conference ends.',
    type: {
      type: 'hash',
      fields: {
        name: {
          type: 'string',
        },
        start_time: {
          type: 'string',
        },
        end_time: {
          type: 'string',
        },
        expire_time: {
          type: 'string',
        },
        space: {
          type: 'string',
        },
      },
    },
  },
});

export default GoogleMeetConferenceEndedTrigger;

const fetchLatestConferences = async (token: string) => {
  const limit = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;

  try {
    const meetClient = createGoogleMeetClient(token);

    const response = await meetClient.conferenceRecords.list({
      pageSize: limit,
      filter: `end_time <= "${new Date().toISOString()}"`,
    });

    return (response.data.conferenceRecords || []).filter((conference) => conference.endTime);
  } catch (error) {
    throw new GoogleMeetError(`Failed to fetch latest conferences: ${error.message || error}`);
  }
};
