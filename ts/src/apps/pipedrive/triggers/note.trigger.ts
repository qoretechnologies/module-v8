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
export const pipedriveNoteDataType = {
  type: {
    type: 'hash',
    fields: {
      id: {
        type: 'number',
      },
      user_id: {
        type: 'number',
      },
      deal_id: {
        type: 'number',
      },
      person_id: {
        type: 'number',
      },
      org_id: {
        type: 'number',
      },
      lead_id: {
        type: 'number',
      },
      project_id: {
        type: 'number',
      },
      active_flag: {
        type: 'boolean',
      },
      content: {
        type: 'string',
      },
      add_time: {
        type: 'string',
      },
      update_time: {
        type: 'string',
      },
      pinned_to_deal_flag: {
        type: 'boolean',
      },
      pinned_to_person_flag: {
        type: 'boolean',
      },
      pinned_to_organization_flag: {
        type: 'boolean',
      },
    },
  },
} satisfies TQoreAppActionOption;
const event_info = getPipedriveEventInfoType(pipedriveNoteDataType, null);

const pipedriveNoteTrigger = QoreAppCreator.createLocalizedTrigger({
  app: PIPEDRIVE_APP_NAME,
  action: 'pipedrive_note_trigger',
  action_code: EQoreAppActionCode.EVENT,
  event_info,
  options,
  webhook_method: 'POST',
  webhook_register: (context, url) => {
    const action = context?.opts?.action as TPipedriveWebhookEventAction;

    if (!action) {
      throw new Error('Action is required to register pipedrive webhook');
    }

    return createPipedriveWebhookRegisterFunction('note', action)(context, url);
  },
  webhook_deregister: deregisterPipedriveWebhook,
  get_dynamic_type: createPipedriveGetDynamicTypeFunction(pipedriveNoteDataType),
  get_example_event_data: createGetPipedriveExampleEventDataFunction(
    'notes',
    pipedriveNoteDataType
  ),
});

export default pipedriveNoteTrigger;
