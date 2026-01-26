import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { RecordingListInstanceEachOptions } from 'twilio/lib/rest/api/v2010/account/recording';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { TWILIO_APP_NAME, TwilioError } from '../constants';
import { createTwilioClient } from '../helpers/constants';
import { TwilioRecordingResponseType } from '../response-types/recording';
import { getTwilioCallAllowedValues } from '../helpers/get-call-allowed-values';

const action = 'list_recordings';

const options = {
  callSid: {
    type: 'string',
    required: false,
    get_allowed_values: getTwilioCallAllowedValues,
  },
  conferenceSid: {
    type: 'string',
    required: false,
  },
  dateCreatedAfter: {
    type: 'date',
    required: false,
  },
  dateCreatedBefore: {
    type: 'date',
    required: false,
  },
  includeSoftDeleted: {
    type: 'bool',
    required: false,
  },
  limit: {
    type: 'integer',
    default_value: 50,
    required: false,
  },
  pageSize: {
    type: 'integer',
    default_value: 50,
    required: false,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'list',
  element_type: TwilioRecordingResponseType,
} satisfies TQoreResponseType;

type TListRecordingsRequest = RecordingListInstanceEachOptions;

const listTwilioRecordings = QoreAppCreator.createLocalizedAction<typeof options>({
  app: TWILIO_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { username, password } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['username', 'password'],
      ErrorClass: TwilioError,
    });

    const client = createTwilioClient(username, password);

    const {
      callSid,
      conferenceSid,
      dateCreatedAfter,
      dateCreatedBefore,
      includeSoftDeleted,
      limit,
      pageSize,
    } = obj || {};

    try {
      const listOptions: TListRecordingsRequest = {
        ...(callSid && { callSid }),
        ...(conferenceSid && { conferenceSid }),
        ...(dateCreatedAfter && { dateCreatedAfter: new Date(dateCreatedAfter) }),
        ...(dateCreatedBefore && { dateCreatedBefore: new Date(dateCreatedBefore) }),
        ...(includeSoftDeleted !== undefined && { includeSoftDeleted }),
        ...(limit !== undefined && { limit }),
        ...(pageSize !== undefined && { pageSize }),
      };

      return await client.recordings.list(listOptions);
    } catch (error) {
      throw new TwilioError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default listTwilioRecordings;
