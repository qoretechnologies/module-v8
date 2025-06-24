import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { MESSENGER360_APP_NAME, Messenger360Error } from '../constants';
import { fetch360MessengerData } from '../helpers/constants';

const getContacts = QoreAppCreator.createLocalizedAction({
  app: MESSENGER360_APP_NAME,
  action: 'get_contacts',
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: Messenger360Error,
    });

    try {
      const data = await fetch360MessengerData({
        token,
        path: '/client/getContacts',
        dataPath: 'data.contacts',
      });

      return data;
    } catch (error) {
      throw new Messenger360Error(`Failed to get contacts: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        id: {
          type: {
            type: 'hash',
            fields: {
              server: { type: 'string' },
              user: { type: 'string' },
              _serialized: { type: 'string' },
            },
          },
        },
        number: { type: 'string' },
        isBusiness: { type: 'boolean' },
        isEnterprise: { type: 'boolean' },
        pushname: { type: 'string' },
        type: { type: 'string' },
        isMe: { type: 'boolean' },
        isUser: { type: 'boolean' },
        isGroup: { type: 'boolean' },
        isWAContact: { type: 'boolean' },
        isMyContact: { type: 'boolean' },
        isBlocked: { type: 'boolean' },
      },
    },
  },
});

export default getContacts;
