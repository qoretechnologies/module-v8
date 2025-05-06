import { EQoreAppActionCode, QoreAppCreator, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ATTIO_APP_NAME, AttioEndpointData, AttioError } from '../constants';
import { deregisterAttioWebhook } from './constants';
import {
  AttioTaskCreatedEventInfo,
  getAttioTaskCreatedEventDataExample,
} from './event-info/task.event-info';

const attioTaskCreatedTrigger = QoreAppCreator.createLocalizedTrigger({
  app: ATTIO_APP_NAME,
  action: 'task_created',
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',

  webhook_register: async (context, url) => {
    const { token } = getQoreContextRequiredValues({
      context,
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
            target_url: url,
            subscriptions: [
              {
                event_type: 'task.created',
                filter: null,
              },
            ],
          },
          path: '/v2/webhooks',
        },
        AttioEndpointData
      );

      const responseData = response?.data;

      if (!responseData) throw new Error('No data returned from webhook registration');

      return { webhook: { id: responseData.data.id.webhook_id } };
    } catch (error) {
      throw new AttioError(`Failed to register webhook for task created event ${error}`);
    }
  },
  webhook_deregister: deregisterAttioWebhook,
  get_example_event_data: getAttioTaskCreatedEventDataExample,
  event_info: AttioTaskCreatedEventInfo,
});

export default attioTaskCreatedTrigger;
