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

export const pipedriveDealDataType = {
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
      close_time: {
        type: 'string',
      },
      creator_user_id: {
        type: 'number',
      },
      currency: {
        type: 'string',
      },
      custom_fields: {
        type: 'hash',
      },
      expected_close_date: {
        type: 'string',
      },
      first_won_time: {
        type: 'string',
      },
      id: {
        type: 'number',
      },
      label_ids: {
        type: {
          type: 'list',
          element_type: {
            type: 'number',
          },
        },
      },
      lost_reason: {
        type: 'string',
      },
      lost_time: {
        type: 'string',
      },
      org_id: {
        type: 'number',
      },
      origin: {
        type: 'string',
      },
      origin_id: {
        type: 'number',
      },
      owner_id: {
        type: 'number',
      },
      person_id: {
        type: 'number',
      },
      pipeline_id: {
        type: 'number',
      },
      probability: {
        type: 'number',
      },
      stage_change_time: {
        type: 'string',
      },
      stage_id: {
        type: 'number',
      },
      status: {
        type: 'string',
      },
      title: {
        type: 'string',
      },
      update_time: {
        type: 'string',
      },
      value: {
        type: 'number',
      },
      visible_to: {
        type: 'string',
      },
      won_time: {
        type: 'string',
      },
      is_archived: {
        type: 'boolean',
      },
      archive_time: {
        type: 'string',
      },
    },
  },
} satisfies TQoreAppActionOption;

const event_info = getPipedriveEventInfoType(pipedriveDealDataType, null);

const pipedriveDealTrigger = QoreAppCreator.createLocalizedTrigger({
  app: PIPEDRIVE_APP_NAME,
  action: 'pipedrive_deal_trigger',
  action_code: EQoreAppActionCode.EVENT,
  event_info,
  options,
  webhook_method: 'POST',
  webhook_register: (context, url) => {
    const action = context?.opts?.action as TPipedriveWebhookEventAction;

    if (!action) {
      throw new Error('Action is required to register pipedrive webhook');
    }

    return createPipedriveWebhookRegisterFunction('deal', action)(context, url);
  },
  webhook_deregister: deregisterPipedriveWebhook,
  get_dynamic_type: createPipedriveGetDynamicTypeFunction(pipedriveDealDataType),
  get_example_event_data: createGetPipedriveExampleEventDataFunction(
    'deals',
    pipedriveDealDataType
  ),
});

export default pipedriveDealTrigger;
