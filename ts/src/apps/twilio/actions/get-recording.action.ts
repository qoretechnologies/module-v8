import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { TWILIO_APP_NAME, TwilioError } from '../constants';
import { createTwilioClient } from '../helpers/constants';
import { getTwilioRecordingAllowedValues } from '../helpers/get-recording-allowed-values';
import { TwilioRecordingResponseType } from '../response-types/recording';

const action = 'get_recording';

const options = {
  recordingSid: {
    type: 'string',
    required: true,
    get_allowed_values: getTwilioRecordingAllowedValues,
  },
} satisfies TQoreOptions;

const responseType = TwilioRecordingResponseType;

const getTwilioRecording = QoreAppCreator.createLocalizedAction<typeof options>({
  app: TWILIO_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { username, password, recordingSid } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['recordingSid'],
      connectionFields: ['username', 'password'],
      ErrorClass: TwilioError,
    });

    const client = createTwilioClient(username, password);

    try {
      return await client.recordings(recordingSid).fetch();
    } catch (error) {
      throw new TwilioError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default getTwilioRecording;
