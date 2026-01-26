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
export const pipedriveLeadDataType = {
  type: {
    type: 'hash',
    fields: {
      add_time: {
        type: 'string',
      },
      channel: {
        type: 'number',
      },
      channel_id: {
        type: 'number',
      },
      creator_id: {
        type: 'number',
      },
      custom_fields: {
        type: 'hash',
      },
      expected_close_date: {
        type: 'string',
      },
      id: {
        type: 'string',
      },
      is_archived: {
        type: 'bool',
      },
      label_ids: {
        type: {
          type: 'list',
          element_type: {
            type: 'string',
          },
        },
      },
      next_activity_id: {
        type: 'string',
      },
      organization_id: {
        type: 'number',
      },
      origin: {
        type: 'string',
      },
      origin_id: {
        type: 'string',
      },
      owner_id: {
        type: 'number',
      },
      person_id: {
        type: 'number',
      },
      source_name: {
        type: 'string',
      },
      title: {
        type: 'string',
      },
      update_time: {
        type: 'string',
      },
      was_seen: {
        type: 'bool',
      },
      value: {
        type: {
          type: 'hash',
          fields: {
            amount: {
              type: 'number',
            },
            currency: {
              type: 'string',
            },
          },
        },
      },
    },
  },
} satisfies TQoreAppActionOption;

const event_info = getPipedriveEventInfoType(pipedriveLeadDataType, null);
const pipedriveLeadTrigger = QoreAppCreator.createLocalizedTrigger({
  app: PIPEDRIVE_APP_NAME,
  action: 'pipedrive_lead_trigger',
  action_code: EQoreAppActionCode.EVENT,
  event_info,
  options,
  webhook_method: 'POST',
  webhook_register: (context, url) => {
    const action = context?.opts?.action as TPipedriveWebhookEventAction;

    if (!action) {
      throw new Error('Action is required to register pipedrive webhook');
    }

    return createPipedriveWebhookRegisterFunction('lead', action)(context, url);
  },
  webhook_deregister: deregisterPipedriveWebhook,
  get_dynamic_type: createPipedriveGetDynamicTypeFunction(pipedriveLeadDataType),
  get_example_event_data: createGetPipedriveExampleEventDataFunction(
    'leads',
    pipedriveLeadDataType
  ),
});

export default pipedriveLeadTrigger;
