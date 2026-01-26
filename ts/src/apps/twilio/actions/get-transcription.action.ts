import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { TWILIO_APP_NAME, TwilioError } from '../constants';
import { createTwilioClient } from '../helpers/constants';
import { getTwilioRecordingAllowedValues } from '../helpers/get-recording-allowed-values';
import { getTwilioTranscriptionAllowedValues } from '../helpers/get-transcription-allowed-values';
import { TwilioTranscriptionResponseType } from '../response-types/transcription';

const action = 'get_transcription';

const options = {
  recordingSid: {
    type: 'string',
    required: true,
    get_allowed_values: getTwilioRecordingAllowedValues,
    on_change: ['refetch'],
  },
  transcriptionSid: {
    type: 'string',
    required: true,
    get_allowed_values: getTwilioTranscriptionAllowedValues,
    depends_on: ['recordingSid'],
  },
} satisfies TQoreOptions;

const responseType = TwilioTranscriptionResponseType;

const getTwilioTranscription = QoreAppCreator.createLocalizedAction<typeof options>({
  app: TWILIO_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { username, password, recordingSid, transcriptionSid } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['recordingSid', 'transcriptionSid'],
      connectionFields: ['username', 'password'],
      ErrorClass: TwilioError,
    });

    const client = createTwilioClient(username, password);

    try {
      return await client.recordings(recordingSid).transcriptions(transcriptionSid).fetch();
    } catch (error) {
      throw new TwilioError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default getTwilioTranscription;
