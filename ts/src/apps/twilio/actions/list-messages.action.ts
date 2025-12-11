import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { MessageListInstanceEachOptions } from 'twilio/lib/rest/api/v2010/account/message';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { TWILIO_APP_NAME, TwilioError } from '../constants';
import { createTwilioClient } from '../helpers/constants';
import { TwilioMessageResponseType } from '../response-types/message';
import { getTwilioPhoneNumberAllowedValues } from '../helpers/get-phone-number-allowed-values';

const action = 'list_messages';

const options = {
  to: {
    type: 'string',
    required: false,
  },
  from: {
    type: 'string',
    required: false,
    get_allowed_values: getTwilioPhoneNumberAllowedValues,
    allowed_values_creatable: true,
  },
  dateSentAfter: {
    type: 'date',
    required: false,
  },
  dateSentBefore: {
    type: 'date',
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
  element_type: TwilioMessageResponseType,
} satisfies TQoreResponseType;

type TListMessagesRequest = MessageListInstanceEachOptions;

const listTwilioMessages = QoreAppCreator.createLocalizedAction<typeof options>({
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

    const { dateSentAfter, dateSentBefore, from, limit, pageSize, to } = obj || {};

    try {
      const listOptions: TListMessagesRequest = {
        ...(to && { to }),
        ...(from && { from }),
        ...(dateSentAfter && { dateSentAfter: new Date(dateSentAfter) }),
        ...(dateSentBefore && { dateSentBefore: new Date(dateSentBefore) }),
        ...(limit !== undefined && { limit }),
        ...(pageSize !== undefined && { pageSize }),
      };

      return await client.messages.list(listOptions);
    } catch (error) {
      throw new TwilioError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default listTwilioMessages;
