import { EQoreAppActionCode, QoreAppCreator, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ATTIO_APP_NAME, AttioEndpointData, AttioError } from '../constants';
import { getAttioListIdAllowedValues } from '../helpers/get-list-allowed-values';
import { attioWebhookInfoLocation, deregisterAttioWebhook } from './constants';
import {
  createAttioListEntryExampleEventData,
  getAttioListEntryEventEventInfo,
} from './event-info/list-entry.event-info';

const attioListEntryCreatedTrigger = QoreAppCreator.createLocalizedTrigger({
  app: ATTIO_APP_NAME,
  action: 'list_entry_created',
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  webhook_event_loc: attioWebhookInfoLocation,
  options: {
    list: {
      type: 'string',
      required: true,
      get_allowed_values: getAttioListIdAllowedValues,
    },
  },
  webhook_register: async (context, url) => {
    const { token, list } = getQoreContextRequiredValues({
      context,
      optionFields: ['list'],
      connectionFields: ['token'],
      ErrorClass: AttioError,
    });

    try {
      const response = await QorusRequest.post<{ data: { data: { id: { webhook_id: string } } } }>(
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          data: {
            data: {
              target_url: url,
              subscriptions: [
                {
                  event_type: 'list-entry.created',
                  filter: {
                    $and: [
                      {
                        field: 'id.list_id',
                        operator: 'equals',
                        value: list,
                      },
                    ],
                  },
                },
              ],
            },
          },
          path: '/v2/webhooks',
        },
        AttioEndpointData
      );

      const responseData = response?.data;

      if (!responseData) throw new Error('No data returned from webhook registration');

      return { webhook: { id: responseData.data.id.webhook_id } };
    } catch (error) {
      throw new AttioError(`Failed to register webhook for list entry created event ${error}`);
    }
  },
  webhook_deregister: deregisterAttioWebhook,
  get_example_event_data: createAttioListEntryExampleEventData('created'),
  event_info: getAttioListEntryEventEventInfo('created'),
});

export default attioListEntryCreatedTrigger;
