import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { RecordingListInstanceEachOptions } from 'twilio/lib/rest/api/v2010/account/recording';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { TWILIO_APP_NAME, TwilioError } from '../constants';
import { createTwilioClient } from '../helpers/constants';
import { getTwilioCallAllowedValues } from '../helpers/get-call-allowed-values';
import { TwilioTranscriptionResponseType } from '../response-types/transcription';

const TwilioNewTranscriptionTrigger = QoreAppCreator.createLocalizedTrigger({
  app: TWILIO_APP_NAME,
  action: 'new_transcription',
  action_code: EQoreAppActionCode.EVENT,
  options: {
    callSid: {
      type: 'string',
      required: false,
      get_allowed_values: getTwilioCallAllowedValues,
    },
    conferenceSid: {
      type: 'string',
      required: false,
    },
  },
  event_function: async (context, update, should_stop) => {
    const { username, password } = getQoreContextRequiredValues({
      context,
      connectionFields: ['username', 'password'],
      ErrorClass: TwilioError,
    });

    const callSid = context.opts?.callSid;
    const conferenceSid = context.opts?.conferenceSid;

    let lastPollTime = new Date().toISOString();

    const updateLastPollTime = (lastPoll: Date) => {
      lastPollTime = lastPoll.toISOString();
    };

    const getItems = () => {
      return fetchLatestTranscriptions(username, password, {
        callSid,
        conferenceSid,
        dateCreatedAfter: lastPollTime,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'twilio_new_transcription',
      uniqueField: 'sid',
      getItems,
      updateLastPollTime,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { username, password } = getQoreContextRequiredValues({
      context,
      connectionFields: ['username', 'password'],
      ErrorClass: TwilioError,
    });

    const callSid = context.opts?.callSid;
    const conferenceSid = context.opts?.conferenceSid;

    const transcriptions = await fetchLatestTranscriptions(username, password, {
      callSid,
      conferenceSid,
    });

    return transcriptions?.length ? transcriptions[0] : null;
  },
  event_info: {
    desc: 'Twilio New Transcription Trigger Event Info',
    type: TwilioTranscriptionResponseType,
  },
});

const fetchLatestTranscriptions = async (
  username: string,
  password: string,
  options: {
    callSid?: string;
    conferenceSid?: string;
    dateCreatedAfter?: string;
  }
) => {
  try {
    const client = createTwilioClient(username, password);

    const recordingListOptions: RecordingListInstanceEachOptions = {
      ...(options.callSid && { callSid: options.callSid }),
      ...(options.conferenceSid && { conferenceSid: options.conferenceSid }),
      ...(options.dateCreatedAfter && { dateCreatedAfter: new Date(options.dateCreatedAfter) }),
      limit: DEFAULT_TRIGGER_POLL_ITEM_LIMIT,
    };

    const recordings = await client.recordings.list(recordingListOptions);

    const transcriptions: any[] = [];

    for (const recording of recordings) {
      try {
        const recordingTranscriptions = await client
          .recordings(recording.sid)
          .transcriptions.list();

        const filteredTranscriptions = options.dateCreatedAfter
          ? recordingTranscriptions.filter(
              (t) => new Date(t.dateCreated).toISOString() >= options.dateCreatedAfter!
            )
          : recordingTranscriptions;

        transcriptions.push(...filteredTranscriptions);
      } catch (error) {
        continue;
      }
    }

    return transcriptions;
  } catch (error) {
    throw new TwilioError(`Failed to fetch latest transcriptions: ${error.message || error}`);
  }
};

export default TwilioNewTranscriptionTrigger;
