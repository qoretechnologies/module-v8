import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import {
  MessageListInstanceCreateOptions,
  MessageScheduleType,
} from 'twilio/lib/rest/api/v2010/account/message';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { TWILIO_APP_NAME, TwilioError } from '../constants';
import { createTwilioClient } from '../helpers/constants';
import { TwilioMessageResponseType } from '../response-types/message';
import { getTwilioMessagingServiceAllowedValues } from '../helpers/get-messaging-service-allowed-values';
import { getTwilioPhoneNumberAllowedValues } from '../helpers/get-phone-number-allowed-values';

const action = 'create_message';

const options = {
  to: {
    type: 'string',
    required: true,
  },
  from: {
    type: 'string',
    required: true,
    get_allowed_values: getTwilioPhoneNumberAllowedValues,
    allowed_values_creatable: true,
  },
  body: {
    type: 'string',
    required: false,
    required_groups: ['messageContent'],
  },
  mediaUrl: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    required_groups: ['messageContent'],
    required: false,
  },
  messagingServiceSid: {
    type: 'string',
    required: false,
    get_allowed_values: getTwilioMessagingServiceAllowedValues,
  },
  statusCallback: {
    type: 'string',
    required: false,
  },
  maxPrice: {
    type: 'number',
    required: false,
  },
  validityPeriod: {
    type: 'integer',
    required: false,
  },
  scheduleType: {
    type: 'string',
    required: false,
    allowed_values: [{ display_name: 'Fixed', value: 'fixed' }],
  },
  sendAt: {
    type: 'date',
    required: false,
    depends_on: ['scheduleType'],
  },
} satisfies TQoreOptions;

const responseType = TwilioMessageResponseType;

type TCreateMessageRequest = MessageListInstanceCreateOptions;

const createTwilioMessage = QoreAppCreator.createLocalizedAction<typeof options>({
  app: TWILIO_APP_NAME,
  action: 'create_message',
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { username, password, ...requiredActionOptions } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['to', 'from'],
      connectionFields: ['username', 'password'],
      ErrorClass: TwilioError,
    });

    const client = createTwilioClient(username, password);

    const {
      body,
      maxPrice,
      mediaUrl,
      messagingServiceSid,
      sendAt,
      statusCallback,
      validityPeriod,
    } = obj || {};
    const scheduleType = obj?.scheduleType as MessageScheduleType | undefined;
    try {
      const messageData: TCreateMessageRequest = {
        ...requiredActionOptions,
        ...(scheduleType && { scheduleType }),
        ...(body && { body }),
        ...(maxPrice !== undefined && { maxPrice }),
        ...(mediaUrl && { mediaUrl }),
        ...(messagingServiceSid && { messagingServiceSid }),
        ...(statusCallback && { statusCallback }),
        ...(validityPeriod !== undefined && { validityPeriod }),
        ...(sendAt && { sendAt: new Date(sendAt) }),
      };

      const message = await client.messages.create(messageData);

      return message;
    } catch (error) {
      throw new TwilioError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default createTwilioMessage;
