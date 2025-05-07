import { EQoreAppActionCode, QoreAppCreator, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ATTIO_APP_NAME, AttioEndpointData, AttioError } from '../constants';
import { getAttioListIdAllowedValues } from '../helpers/get-list-allowed-values';
import { deregisterAttioWebhook } from './constants';
import {
  createAttioListEntryExampleEventData,
  getAttioListEntryEventEventInfo,
} from './event-info/list-entry.event-info';

const attioListEntryUpdatedTrigger = QoreAppCreator.createLocalizedTrigger({
  app: ATTIO_APP_NAME,
  action: 'list_entry_updated',
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
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
                  event_type: 'list-entry.updated',
                  filter: {
                    $and: [
                      {
                        field: 'list_id',
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
      throw new AttioError(`Failed to register webhook for list entry updated event ${error}`);
    }
  },
  webhook_deregister: deregisterAttioWebhook,
  get_example_event_data: createAttioListEntryExampleEventData('updated'),
  event_info: getAttioListEntryEventEventInfo('updated'),
});

export default attioListEntryUpdatedTrigger;
