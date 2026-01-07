import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { ZENDESK_APP_NAME } from '../app-constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ZendeskError } from '../constants';
import { zendeskApiClient } from '../helpers/constants';
import { createZendeskWebhookDeRegistrar, createZendeskWebhookRegistrar } from './helpers';

const zendeskNewOrganizationTrigger = QoreAppCreator.createLocalizedTrigger({
  app: ZENDESK_APP_NAME,
  action: 'new_organization',
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  webhook_register: createZendeskWebhookRegistrar('New Organization', [
    'zen:event-type:organization.created',
  ]),
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
        organizations: Array<{
          id: number;
          name: string;
          shared_comments: boolean;
          shared_tickets: boolean;
          group_id: number | null;
          external_id: string | null;
          created_at: string;
          updated_at: string;
        }>;
      }>({
        path: 'organizations.json',
        method: 'GET',
        token,
        url,
        params: {
          per_page: '1',
          sort_by: 'created_at',
          sort_order: 'desc',
        },
      });

      const organization = response?.organizations?.[0];
      if (!organization) {
        return null;
      }

      return {
        id: String(organization.id),
        name: organization.name || '',
        shared_comments: organization.shared_comments ?? false,
        shared_tickets: organization.shared_tickets ?? false,
        group_id: organization.group_id ? String(organization.group_id) : null,
        external_id: organization.external_id || null,
        created_at: organization.created_at || '',
        updated_at: organization.updated_at || '',
      };
    } catch (error) {
      throw new ZendeskError(`Failed to fetch example organization data: ${error}`);
    }
  },
  event_info: {
    desc: 'Zendesk Organization Event Data',
    type: {
      type: 'hash',
      fields: {
        created_at: {
          type: 'softdate',
        },
        external_id: {
          type: 'softstring',
        },
        group_id: {
          type: 'softstring',
        },
        id: {
          type: 'softstring',
        },
        name: {
          type: 'softstring',
        },
        shared_comments: {
          type: 'bool',
        },
        shared_tickets: {
          type: 'bool',
        },
        updated_at: {
          type: 'softdate',
        },
      },
    },
  },
});

export default zendeskNewOrganizationTrigger;
