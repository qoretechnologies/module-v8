import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { MESSENGER360_APP_NAME, Messenger360Error } from '../constants';
import { fetch360MessengerData, format360MessengerDelay } from '../helpers/constants';
import { getMessenger360GroupIdAllowedValues } from '../helpers/get-group-id-allowed-values';

const options = {
  groupId: {
    required: true,
    type: 'string',
    get_allowed_values: getMessenger360GroupIdAllowedValues,
    allowed_values_creatable: true,
  },
  text: {
    required: true,
    type: 'string',
  },
  url: {
    required: false,
    type: 'string',
  },
  delay: {
    required: false,
    type: 'date',
  },
} satisfies TQoreOptions;

const sendTextMessage = QoreAppCreator.createLocalizedAction<typeof options>({
  app: MESSENGER360_APP_NAME,
  action: 'send_group_text_message',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, groupId, text } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['groupId', 'text'],
      connectionFields: ['token'],
      ErrorClass: Messenger360Error,
    });

    const url = obj?.url;
    const delay = obj?.delay;
    const formattedDelay = delay ? format360MessengerDelay(new Date(delay)) : undefined;

    try {
      const data = await fetch360MessengerData({
        method: 'POST',
        token,
        path: '/sendGroup',
        body: {
          groupId,
          text,
          ...(url && { url }),
          ...(formattedDelay && { delay: formattedDelay }),
        },
      });

      return data;
    } catch (error) {
      throw new Messenger360Error(`Failed to send message to group: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      success: { type: 'bool' },
      statusCode: { type: 'string' },
      timestamp: { type: 'string' },
      data: {
        type: {
          type: 'hash',
          fields: {
            groupId: { type: 'string' },
            id: { type: 'string' },
          },
        },
      },
    },
  },
});

export default sendTextMessage;
