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

export const pipedriveActivityDataType = {
  type: {
    type: 'hash',
    fields: {
      active_flag: {
        type: 'bool',
      },
      deal_id: {
        type: 'number',
      },
      done: {
        type: 'bool',
      },
      due_date: {
        type: 'string',
      },
      due_time: {
        type: 'string',
      },
      duration: {
        type: 'number',
      },
      id: {
        type: 'number',
      },
      type: {
        type: 'string',
      },
      lead_id: {
        type: 'number',
      },
      location: {
        type: 'string',
      },
      org_id: {
        type: 'number',
      },
      owner_id: {
        type: 'number',
      },
      person_id: {
        type: 'number',
      },
      public_description: {
        type: 'string',
      },
      subject: {
        type: 'string',
      },
      update_time: {
        type: 'string',
      },
      update_user_id: {
        type: 'number',
      },
    },
  },
} satisfies TQoreAppActionOption;

const event_info = getPipedriveEventInfoType(pipedriveActivityDataType, null);

const pipedriveActivityTrigger = QoreAppCreator.createLocalizedTrigger({
  app: PIPEDRIVE_APP_NAME,
  action: 'pipedrive_activity_trigger',
  action_code: EQoreAppActionCode.EVENT,
  event_info,
  options,
  webhook_method: 'POST',
  webhook_register: (context, url) => {
    const action = context?.opts?.action as TPipedriveWebhookEventAction;

    if (!action) {
      throw new Error('Action is required to register pipedrive webhook');
    }

    return createPipedriveWebhookRegisterFunction('activity', action)(context, url);
  },
  webhook_deregister: deregisterPipedriveWebhook,
  get_dynamic_type: createPipedriveGetDynamicTypeFunction(pipedriveActivityDataType),
  get_example_event_data: createGetPipedriveExampleEventDataFunction(
    'activities',
    pipedriveActivityDataType
  ),
});

export default pipedriveActivityTrigger;
