import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_SAVED_ITEMS_LIMIT_MAX } from '../../../global/constants';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { INTERCOM_APP_NAME } from '../constants';
import { fetchIntercomData } from '../helpers';

interface IntercomContact {
  type: string;
  id: string;
  workspace_id: string;
  external_id?: string;
  role: string;
  email: string;
  phone?: string;
  name: string;
  avatar?: string;
  created_at: number;
  updated_at: number;
  signed_up_at?: number;
  last_seen_at?: number;
  last_replied_at?: number;
  companies?: {
    type: string;
    data: Array<{
      id: string;
      name: string;
      type: string;
    }>;
  };
}

const IntercomNewContactTrigger = QoreAppCreator.createLocalizedTrigger({
  app: INTERCOM_APP_NAME,
  action: 'new-contact',
  action_code: EQoreAppActionCode.EVENT,
  options: {
    role: {
      type: 'string',
      required: false,
      allowed_values: [
        { value: 'user', display_name: 'User' },
        { value: 'lead', display_name: 'Lead' },
        { value: 'contact', display_name: 'Contact (User or Lead)' },
      ],
      desc: 'Filter contacts by role',
      default_value: 'contact',
    },
  },
  event_function: async (context, update, should_stop) => {
    const token = context.conn_opts?.token;
    const role = context.opts?.role || 'contact';

    if (!token) {
      throw new Error('Token is required to start the new contact Intercom trigger');
    }

    const getItems = async () => {
      return await getIntercomContacts({ token, role, withTimestamp: true });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'intercom_new_contact',
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const token = context?.conn_opts?.token;
    const role = context?.opts?.role || 'contact';

    if (!token) {
      throw new Error(
        'Token is required to fetch example event data for Intercom new contact trigger'
      );
    }

    try {
      const contacts = await getIntercomContacts({ token, role, limit: 1 });

      return contacts.length > 0 ? contacts[0] : null;
    } catch (error) {
      console.error('Error fetching example event data:', error);

      return null;
    }
  },
  event_info: {
    desc: 'Triggered when a new contact is created in Intercom',
    type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        type: { type: 'string' },
        workspace_id: { type: 'string' },
        external_id: { type: 'string' },
        role: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        name: { type: 'string' },
        avatar: { type: 'string' },
        owner_id: { type: 'string' },
        social_profiles: {
          type: {
            type: 'hash',
            fields: {
              type: { type: 'string' },
              data: { type: { type: 'list', element_type: 'hash' } },
            },
          },
        },
        has_hard_bounced: { type: 'bool' },
        marked_email_as_spam: { type: 'bool' },
        unsubscribed_from_emails: { type: 'bool' },
        created_at: { type: 'number' },
        updated_at: { type: 'number' },
        signed_up_at: { type: 'number' },
        last_seen_at: { type: 'number' },
        last_replied_at: { type: 'number' },
        last_contacted_at: { type: 'number' },
        last_email_opened_at: { type: 'number' },
        last_email_clicked_at: { type: 'number' },
        language_override: { type: 'string' },
        browser: { type: 'string' },
        browser_version: { type: 'string' },
        browser_language: { type: 'string' },
        os: { type: 'string' },
        location: {
          type: {
            type: 'hash',
            fields: {
              type: { type: 'string' },
              country: { type: 'string' },
              region: { type: 'string' },
              city: { type: 'string' },
              country_code: { type: 'string' },
              continent_code: { type: 'string' },
            },
          },
        },
        android_app_name: { type: 'string' },
        android_app_version: { type: 'string' },
        android_device: { type: 'string' },
        android_os_version: { type: 'string' },
        android_sdk_version: { type: 'string' },
        android_last_seen_at: { type: 'number' },
        ios_app_name: { type: 'string' },
        ios_app_version: { type: 'string' },
        ios_device: { type: 'string' },
        ios_os_version: { type: 'string' },
        ios_sdk_version: { type: 'string' },
        ios_last_seen_at: { type: 'number' },
        custom_attributes: { type: 'hash' },
        tags: {
          type: {
            type: 'hash',
            fields: {
              type: { type: 'string' },
              data: { type: { type: 'list', element_type: 'hash' } },
              url: { type: 'string' },
              total_count: { type: 'number' },
              has_more: { type: 'bool' },
            },
          },
        },
        notes: {
          type: {
            type: 'hash',
            fields: {
              type: { type: 'string' },
              data: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      id: { type: 'string' },
                      type: { type: 'string' },
                      url: { type: 'string' },
                    },
                  },
                },
              },
              url: { type: 'string' },
              total_count: { type: 'number' },
              has_more: { type: 'bool' },
            },
          },
        },
        companies: {
          type: {
            type: 'hash',
            fields: {
              type: { type: 'string' },
              data: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      id: { type: 'string' },
                      type: { type: 'string' },
                      url: { type: 'string' },
                    },
                  },
                },
              },
              url: { type: 'string' },
              total_count: { type: 'number' },
              has_more: { type: 'bool' },
            },
          },
        },
        opted_out_subscription_types: {
          type: {
            type: 'hash',
            fields: {
              type: { type: 'string' },
              data: { type: { type: 'list', element_type: 'hash' } },
              url: { type: 'string' },
              total_count: { type: 'number' },
              has_more: { type: 'bool' },
            },
          },
        },
        opted_in_subscription_types: {
          type: {
            type: 'hash',
            fields: {
              type: { type: 'string' },
              data: { type: { type: 'list', element_type: 'hash' } },
              url: { type: 'string' },
              total_count: { type: 'number' },
              has_more: { type: 'bool' },
            },
          },
        },
        utm_campaign: { type: 'string' },
        utm_content: { type: 'string' },
        utm_medium: { type: 'string' },
        utm_source: { type: 'string' },
        utm_term: { type: 'string' },
        referrer: { type: 'string' },
        sms_consent: { type: 'bool' },
        unsubscribed_from_sms: { type: 'bool' },
      },
    },
  },
});

const getIntercomContacts = async ({
  token,
  role,
  withTimestamp,
  limit,
}: {
  token: string;
  role: string;
  withTimestamp?: boolean;
  limit?: number;
}): Promise<IntercomContact[]> => {
  let body: any = {
    query: {
      field: 'role',
      operator: role === 'contact' ? '~' : '=',
      value: role === 'contact' ? '' : role,
    },
  };

  if (withTimestamp) {
    body = {
      query: {
        operator: 'AND',
        value: [
          {
            field: 'role',
            operator: role === 'contact' ? '~' : '=',
            value: role === 'contact' ? '' : role,
          },
          {
            field: 'created_at',
            operator: '>=',
            value: Math.floor(Date.now() / 1000) - 60 * 30,
          },
        ],
      },
    };
  }

  const data = await fetchIntercomData<IntercomContact>({
    token,
    path: '/contacts/search',
    method: 'POST',
    dataPath: 'data',
    params: {
      page: '1',
      per_page: limit ? limit.toString() : DEFAULT_TRIGGER_SAVED_ITEMS_LIMIT_MAX.toString(),
    },
    body,
  });

  return data;
};

export default IntercomNewContactTrigger;
