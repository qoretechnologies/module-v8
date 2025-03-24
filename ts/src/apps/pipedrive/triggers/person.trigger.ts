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

export const pipedrivePersonDataType = {
  type: {
    type: 'hash',
    fields: {
      add_time: {
        type: 'string',
      },
      custom_fields: {
        type: 'hash',
      },
      emails: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              label: {
                type: 'string',
              },
              value: {
                type: 'string',
              },
              primary: {
                type: 'boolean',
              },
            },
          },
        },
      },
      first_name: {
        type: 'string',
      },
      id: {
        type: 'number',
      },
      label: {
        type: 'string',
      },
      last_name: {
        type: 'string',
      },
      name: {
        type: 'string',
      },
      org_id: {
        type: 'number',
      },
      owner_id: {
        type: 'number',
      },
      phones: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              label: {
                type: 'string',
              },
              value: {
                type: 'string',
              },
              primary: {
                type: 'boolean',
              },
            },
          },
        },
      },
      update_time: {
        type: 'string',
      },
      visible_to: {
        type: 'string',
      },
    },
  },
} satisfies TQoreAppActionOption;
const event_info = getPipedriveEventInfoType(pipedrivePersonDataType, null);

const pipedrivePersonTrigger = QoreAppCreator.createLocalizedTrigger({
  app: PIPEDRIVE_APP_NAME,
  action: 'pipedrive_person_trigger',
  action_code: EQoreAppActionCode.EVENT,
  event_info,
  options,
  webhook_method: 'POST',
  webhook_register: (context, url) => {
    const action = context?.opts?.action as TPipedriveWebhookEventAction;

    if (!action) {
      throw new Error('Action is required to register pipedrive webhook');
    }

    return createPipedriveWebhookRegisterFunction('person', action)(context, url);
  },
  webhook_deregister: deregisterPipedriveWebhook,
  get_dynamic_type: createPipedriveGetDynamicTypeFunction(pipedrivePersonDataType),
  get_example_event_data: createGetPipedriveExampleEventDataFunction(
    'persons',
    pipedrivePersonDataType
  ),
});

export default pipedrivePersonTrigger;
