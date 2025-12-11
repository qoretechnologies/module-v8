import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { MediaListInstanceEachOptions } from 'twilio/lib/rest/api/v2010/account/message/media';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { TWILIO_APP_NAME, TwilioError } from '../constants';
import { createTwilioClient } from '../helpers/constants';
import { getTwilioMessageAllowedValues } from '../helpers/get-message-allowed-values';

const action = 'list_message_media';

const options = {
  messageSid: {
    type: 'string',
    required: true,
    get_allowed_values: getTwilioMessageAllowedValues,
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
  element_type: {
    type: 'hash',
    fields: {
      accountSid: { type: 'string' },
      contentType: { type: 'string' },
      dateCreated: { type: 'string' },
      dateUpdated: { type: 'string' },
      parentSid: { type: 'string' },
      sid: { type: 'string' },
      uri: { type: 'string' },
    },
  },
} satisfies TQoreResponseType;

type TListMessageMediaRequest = MediaListInstanceEachOptions;

const listTwilioMessageMedia = QoreAppCreator.createLocalizedAction<typeof options>({
  app: TWILIO_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { username, password, messageSid } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['messageSid'],
      connectionFields: ['username', 'password'],
      ErrorClass: TwilioError,
    });

    const client = createTwilioClient(username, password);

    const { limit = 50, pageSize = 50 } = obj || {};

    try {
      const listOptions: TListMessageMediaRequest = {
        limit,
        pageSize,
      };

      return await client.messages(messageSid).media.list(listOptions);
    } catch (error) {
      throw new TwilioError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default listTwilioMessageMedia;
