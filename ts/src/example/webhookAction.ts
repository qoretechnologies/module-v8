import {
  EQoreAppActionCode,
  EQoreAppActionWebhookAuthType,
  TQoreAppActionWithWebhook,
} from '../global/models/qore';

const testActionWithWebhook = {
  app: 'test',
  action: 'test',
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  webhook_register: (context, url) => {
    console.log('Registering webhook:', url, 'with', context);
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
} satisfies TQoreAppActionWithWebhook;
