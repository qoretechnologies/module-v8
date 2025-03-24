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
export const pipedriveOrganizationDataType = {
  type: {
    type: 'hash',
    fields: {
      add_time: {
        type: 'string',
      },
      address: {
        type: 'string',
      },
      country_code: {
        type: 'string',
      },
      custom_fields: {
        type: 'hash',
      },
      id: {
        type: 'number',
      },
      label: {
        type: 'string',
      },
      name: {
        type: 'string',
      },
      owner_id: {
        type: 'number',
      },
      picture_id: {
        type: 'number',
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
const event_info = getPipedriveEventInfoType(pipedriveOrganizationDataType, null);

const pipedriveOrganizationTrigger = QoreAppCreator.createLocalizedTrigger({
  app: PIPEDRIVE_APP_NAME,
  action: 'pipedrive_organization_trigger',
  action_code: EQoreAppActionCode.EVENT,
  event_info,
  options,
  webhook_method: 'POST',
  webhook_register: (context, url) => {
    const action = context?.opts?.action as TPipedriveWebhookEventAction;

    if (!action) {
      throw new Error('Action is required to register pipedrive webhook');
    }

    return createPipedriveWebhookRegisterFunction('organization', action)(context, url);
  },
  webhook_deregister: deregisterPipedriveWebhook,
  get_dynamic_type: createPipedriveGetDynamicTypeFunction(pipedriveOrganizationDataType),
  get_example_event_data: createGetPipedriveExampleEventDataFunction(
    'organizations',
    pipedriveOrganizationDataType
  ),
});

export default pipedriveOrganizationTrigger;
