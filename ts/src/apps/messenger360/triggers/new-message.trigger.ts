import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { MESSENGER360_APP_NAME, Messenger360Error } from '../constants';
import { fetch360MessengerData } from '../helpers/constants';

const newMessage = QoreAppCreator.createLocalizedTrigger({
  action: 'new_message',
  app: MESSENGER360_APP_NAME,
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  webhook_register: async (context, url) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: Messenger360Error,
    });

    const data = await fetch360MessengerData({
      token,
      method: 'POST',
      path: '/settings/webhook/set',
      body: {
        url,
      },
    });

    return { webhook: data };
  },
  webhook_deregister: async (context) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: Messenger360Error,
    });

    await fetch360MessengerData({
      token,
      method: 'POST',
      path: '/settings/webhook/remove',
    });
  },
  get_example_event_data: () => ({
    webhookUrl: 'https://webhook.site/',
    webhook_type: 'webhooks',
    webhook_group: 'sessionWebhooks',
    dataType: 'message',
    ID: '7959fdfd-17b7-4a55-85a2-16fe80715c1',
    Type: 'chat',
    Hash: 'gt64qqh7UzqHvALpizT',
    From: '447499999999',
    To: '447488888888',
    createdAt: '2025-02-15 07:22:30',
    GroupId: '',
    Chat: 'Hello World!',
  }),
  event_info: {
    desc: 'New message event data',
    type: {
      type: 'hash',
      fields: {
        webhookUrl: { type: 'string' },
        webhook_type: { type: 'string' },
        webhook_group: { type: 'string' },
        dataType: { type: 'string' },
        ID: { type: 'string' },
        Type: { type: 'string' },
        Hash: { type: 'string' },
        From: { type: 'string' },
        To: { type: 'string' },
        createdAt: { type: 'string' },
        GroupId: { type: 'string' },
        Chat: { type: 'string' },
        Caption: { type: 'string' },
        DownloadLink: { type: 'string' },
        Lat: { type: 'string' },
        Long: { type: 'string' },
      },
    },
  },
});

export default newMessage;
