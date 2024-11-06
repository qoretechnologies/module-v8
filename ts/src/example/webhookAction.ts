import {
  EQoreAppActionCode,
  EQoreAppActionWebhookAuthType,
  TQoreAppAction,
} from '../global/models/qore';

export const testActionWithWebhook = {
  app: 'test',
  action: 'test',
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  webhook_register: async (context, url) => {
    console.log('Registering webhook:', url, 'with', context);
  },
  webhook_deregister: async (context, url, regInfo) => {
    console.log('De-Registering webhook:', url, 'with', context, 'and', regInfo);
  },
  webhook_auth: EQoreAppActionWebhookAuthType.AUTH_REQUIRE_AUTH,
  event_info: {
    desc: 'Test',
    type: {
      id: {
        name: 'id',
        display_name: 'ID',
        short_desc: 'ID',
        desc: 'ID',
        type: 'int',
      },
    },
  },
  webhook_perms: ['test'],
} satisfies TQoreAppAction;
