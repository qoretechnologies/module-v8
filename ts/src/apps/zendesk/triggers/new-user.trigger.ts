import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { ZENDESK_APP_NAME } from '../app-constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ZendeskError } from '../constants';
import { zendeskApiClient } from '../helpers/constants';
import { createZendeskWebhookDeRegistrar, createZendeskWebhookRegistrar } from './helpers';

const zendeskNewUserTrigger = QoreAppCreator.createLocalizedTrigger({
  app: ZENDESK_APP_NAME,
  action: 'new_user',
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  webhook_register: createZendeskWebhookRegistrar('New User', ['zen:event-type:user.created']),
  webhook_deregister: createZendeskWebhookDeRegistrar(),
  webhook_event_loc: 'detail',
  get_example_event_data: async (context) => {
    const { token, url } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'url'],
      ErrorClass: ZendeskError,
    });

    try {
      const response = await zendeskApiClient<{
        users: Array<{
          id: number;
          email: string;
          external_id: string | null;
          default_group_id: number | null;
          organization_id: number | null;
          role: string;
          created_at: string;
          updated_at: string;
        }>;
      }>({
        path: 'users.json',
        method: 'GET',
        token,
        url,
        params: {
          per_page: '1',
          sort_by: 'created_at',
          sort_order: 'desc',
        },
      });

      const user = response?.users?.[0];
      if (!user) {
        return null;
      }

      return {
        id: String(user.id),
        email: user.email || '',
        external_id: user.external_id || '',
        default_group_id: user.default_group_id ? String(user.default_group_id) : '',
        organization_id: user.organization_id ? String(user.organization_id) : '',
        role: user.role || '',
        created_at: user.created_at || '',
        updated_at: user.updated_at || '',
      };
    } catch (error) {
      throw new ZendeskError(`Failed to fetch example user data: ${error}`);
    }
  },
  event_info: {
    desc: 'Zendesk User Event Data',
    type: {
      type: 'hash',
      fields: {
        created_at: {
          type: 'softdate',
        },
        default_group_id: {
          type: 'softstring',
        },
        email: {
          type: 'softstring',
        },
        external_id: {
          type: 'softstring',
        },
        id: {
          type: 'softstring',
        },
        organization_id: {
          type: 'softstring',
        },
        role: {
          type: 'softstring',
        },
        updated_at: {
          type: 'softdate',
        },
      },
    },
  },
});

export default zendeskNewUserTrigger;
