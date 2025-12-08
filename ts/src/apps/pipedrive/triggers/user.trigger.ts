import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreAppActionOption,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { PIPEDRIVE_APP_NAME } from '../constants';
import {
  createGetPipedriveExampleEventDataFunction,
  createPipedriveGetDynamicTypeFunction,
  createPipedriveWebhookRegisterFunction,
  deregisterPipedriveWebhook,
  getPipedriveEventInfoType,
  pipedriveActionAllowedValues,
  TPipedriveWebhookEventAction,
} from './constants';

const options = {
  action: {
    type: 'string',
    required: true,
    default_value: 'create',
    allowed_values: pipedriveActionAllowedValues,
  },
} satisfies TQoreOptions;

const pipedriveUserDataType = {
  type: {
    type: 'hash',
    fields: {
      id: {
        type: 'string',
      },
      default_currency: {
        type: 'string',
      },
      name: {
        type: 'string',
      },
      email: {
        type: 'string',
      },
      phone: {
        type: 'string',
      },
      locale: {
        type: 'string',
      },
      lang: {
        type: 'string',
      },
      active_flag: {
        type: 'bool',
      },
      last_login: {
        type: 'string',
      },
      timezone_name: {
        type: 'string',
      },
      icon_url: {
        type: 'string',
      },
      created: {
        type: 'string',
      },
      modified: {
        type: 'string',
      },
      access: {
        type: 'string',
      },
    },
  },
} satisfies TQoreAppActionOption;

const event_info = getPipedriveEventInfoType(pipedriveUserDataType, null);

const pipedriveUserTrigger = QoreAppCreator.createLocalizedTrigger({
  app: PIPEDRIVE_APP_NAME,
  action: 'pipedrive_user_trigger',
  action_code: EQoreAppActionCode.EVENT,
  event_info,
  options,
  webhook_method: 'POST',
  webhook_register: (context, url) => {
    const action = context?.opts?.action as TPipedriveWebhookEventAction;

    if (!action) {
      throw new Error('Action is required to register pipedrive webhook');
    }

    return createPipedriveWebhookRegisterFunction('user', action)(context, url);
  },
  webhook_deregister: deregisterPipedriveWebhook,
  get_dynamic_type: createPipedriveGetDynamicTypeFunction(pipedriveUserDataType),
  get_example_event_data: createGetPipedriveExampleEventDataFunction(
    'users',
    pipedriveUserDataType
  ),
});

export default pipedriveUserTrigger;
