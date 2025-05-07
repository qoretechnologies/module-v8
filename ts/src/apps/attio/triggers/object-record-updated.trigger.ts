import { EQoreAppActionCode, QoreAppCreator, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ATTIO_APP_NAME, AttioEndpointData, AttioError } from '../constants';
import { getAttioObjectIdAllowedValues } from '../helpers/get-object-allowed-values';
import { deregisterAttioWebhook } from './constants';
import {
  createAttioObjectRecordExampleEventData,
  getAttioObjectRecordEventEventInfo,
} from './event-info/object-record.event-info';

const attioObjectRecordUpdatedTrigger = QoreAppCreator.createLocalizedTrigger({
  app: ATTIO_APP_NAME,
  action: 'object_record_updated',
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  options: {
    object: {
      type: 'string',
      required: true,
      get_allowed_values: getAttioObjectIdAllowedValues,
    },
  },
  webhook_register: async (context, url) => {
    const { token, object } = getQoreContextRequiredValues({
      context,
      optionFields: ['object'],
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
                  event_type: 'record.updated',
                  filter: {
                    $and: [
                      {
                        field: 'object_id',
                        operator: 'equals',
                        value: object,
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
      throw new AttioError(`Failed to register webhook for object record updated event ${error}`);
    }
  },
  webhook_deregister: deregisterAttioWebhook,
  get_example_event_data: createAttioObjectRecordExampleEventData('updated'),
  event_info: getAttioObjectRecordEventEventInfo('updated'),
});

export default attioObjectRecordUpdatedTrigger;
