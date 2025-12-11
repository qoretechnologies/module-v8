import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { MessageListInstanceEachOptions } from 'twilio/lib/rest/api/v2010/account/message';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { TWILIO_APP_NAME, TwilioError } from '../constants';
import { createTwilioClient } from '../helpers/constants';
import { TwilioMessageResponseType } from '../response-types/message';
import { getTwilioPhoneNumberAllowedValues } from '../helpers/get-phone-number-allowed-values';

const TwilioNewMessageTrigger = QoreAppCreator.createLocalizedTrigger({
  app: TWILIO_APP_NAME,
  action: 'new_message',
  action_code: EQoreAppActionCode.EVENT,
  options: {
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
  },
  event_function: async (context, update, should_stop) => {
    const { username, password } = getQoreContextRequiredValues({
      context,
      connectionFields: ['username', 'password'],
      ErrorClass: TwilioError,
    });

    const to = context.opts?.to;
    const from = context.opts?.from;

    let lastPollTime = new Date().toISOString();

    const updateLastPollTime = (lastPoll: Date) => {
      lastPollTime = lastPoll.toISOString();
    };

    const getItems = () => {
      return fetchLatestMessages(username, password, {
        to,
        from,
        dateSentAfter: lastPollTime,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'twilio_new_message',
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

    const to = context.opts?.to;
    const from = context.opts?.from;

    const messages = await fetchLatestMessages(username, password, {
      to,
      from,
    });

    return messages?.length ? messages[0] : null;
  },
  event_info: {
    desc: 'Twilio New Message Trigger Event Info',
    type: TwilioMessageResponseType,
  },
});

const fetchLatestMessages = async (
  username: string,
  password: string,
  options: {
    to?: string;
    from?: string;
    dateSentAfter?: string;
  }
) => {
  try {
    const client = createTwilioClient(username, password);

    const listOptions: MessageListInstanceEachOptions = {
      ...(options.to && { to: options.to }),
      ...(options.from && { from: options.from }),
      ...(options.dateSentAfter && { dateSentAfter: new Date(options.dateSentAfter) }),
      limit: DEFAULT_TRIGGER_POLL_ITEM_LIMIT,
    };

    return await client.messages.list(listOptions);
  } catch (error) {
    throw new TwilioError(`Failed to fetch latest messages: ${error.message || error}`);
  }
};

export default TwilioNewMessageTrigger;
