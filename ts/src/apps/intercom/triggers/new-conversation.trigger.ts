import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_SAVED_ITEMS_LIMIT_MAX } from '../../../global/constants';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { INTERCOM_APP_NAME } from '../constants';
import { fetchIntercomData } from '../helpers';

interface IntercomConversation {
  type: string;
  id: string;
  created_at: number;
  updated_at: number;
  title: string;
  admin_assignee_id?: string;
  team_assignee_id?: string;
  source: {
    type: string;
    id?: string;
    delivered_as?: string;
    subject?: string;
    body?: string;
    author: {
      type: string;
      id: string;
      name: string;
      email?: string;
    };
    url?: string;
    redacted: boolean;
  };
  contacts: {
    type: string;
    contacts: Array<{
      type: string;
      id: string;
      name?: string;
    }>;
  };
  state: string;
  read: boolean;
  priority: string;
  waiting_since?: number;
  snoozed_until?: number;
  tags?: {
    type: string;
    tags: Array<{
      id: string;
      type: string;
      name: string;
    }>;
  };
  first_contact_reply?: {
    created_at: number;
    url: string;
    type: string;
  };
  sla_applied?: {
    type: string;
    sla_name: string;
    sla_status: string;
  };
  statistics: {
    type: string;
    time_to_assignment?: number;
    time_to_first_response?: number;
    time_to_admin_response?: number;
    time_to_resolve?: number;
    median_time_to_respond?: number;
    first_response_time_exceeded?: boolean;
    first_contact_reply_time_exceeded?: boolean;
  };
}

const IntercomNewConversationTrigger = QoreAppCreator.createLocalizedTrigger({
  app: INTERCOM_APP_NAME,
  action: 'new-conversation',
  action_code: EQoreAppActionCode.EVENT,
  event_function: async (context, update, should_stop) => {
    const token = context.conn_opts?.token;

    if (!token) {
      throw new Error('Token is required to start the new conversation Intercom trigger');
    }

    const getItems = async () => {
      return await getIntercomConversations({ token, withTimestamp: true });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'intercom_new_conversation',
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const token = context?.conn_opts?.token;

    if (!token) {
      throw new Error(
        'Token is required to fetch example event data for Intercom new conversation trigger'
      );
    }

    try {
      const conversations = await getIntercomConversations({ token, limit: 1 });

      return conversations.length > 0 ? conversations[0] : null;
    } catch (error) {
      console.error('Error fetching example event data:', error);

      return null;
    }
  },
  event_info: {
    desc: 'Triggered when a new conversation is created in Intercom',
    type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        type: { type: 'string' },
        created_at: { type: 'number' },
        updated_at: { type: 'number' },
        title: { type: 'string' },
        admin_assignee_id: { type: 'string' },
        team_assignee_id: { type: 'string' },
        source: {
          type: {
            type: 'hash',
            fields: {
              type: { type: 'string' },
              id: { type: 'string' },
              delivered_as: { type: 'string' },
              subject: { type: 'string' },
              body: { type: 'string' },
              author: {
                type: {
                  type: 'hash',
                  fields: {
                    type: { type: 'string' },
                    id: { type: 'string' },
                    name: { type: 'string' },
                    email: { type: 'string' },
                  },
                },
              },
              url: { type: 'string' },
              redacted: { type: 'bool' },
            },
          },
        },
        contacts: {
          type: {
            type: 'hash',
            fields: {
              type: { type: 'string' },
              contacts: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      type: { type: 'string' },
                      id: { type: 'string' },
                      name: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
        state: { type: 'string' },
        read: { type: 'bool' },
        priority: { type: 'string' },
        waiting_since: { type: 'number' },
        snoozed_until: { type: 'number' },
        tags: {
          type: {
            type: 'hash',
            fields: {
              type: { type: 'string' },
              tags: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      id: { type: 'string' },
                      type: { type: 'string' },
                      name: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
        first_contact_reply: {
          type: {
            type: 'hash',
            fields: {
              created_at: { type: 'number' },
              url: { type: 'string' },
              type: { type: 'string' },
            },
          },
        },
        sla_applied: {
          type: {
            type: 'hash',
            fields: {
              type: { type: 'string' },
              sla_name: { type: 'string' },
              sla_status: { type: 'string' },
            },
          },
        },
        statistics: {
          type: {
            type: 'hash',
            fields: {
              type: { type: 'string' },
              time_to_assignment: { type: 'number' },
              time_to_first_response: { type: 'number' },
              time_to_admin_response: { type: 'number' },
              time_to_resolve: { type: 'number' },
              median_time_to_respond: { type: 'number' },
              first_response_time_exceeded: { type: 'bool' },
              first_contact_reply_time_exceeded: { type: 'bool' },
            },
          },
        },
      },
    },
  },
});

const getIntercomConversations = async ({
  token,
  withTimestamp,
  limit,
}: {
  token: string;
  withTimestamp?: boolean;
  limit?: number;
}): Promise<IntercomConversation[]> => {
  let body: any = {
    query: {
      field: 'created_at',
      operator: '>',
      value: '0',
    },
  };

  if (withTimestamp) {
    body = {
      query: {
        field: 'created_at',
        operator: '>=',
        value: Math.floor(Date.now() / 1000) - 60 * 30,
      },
    };
  }

  const data = await fetchIntercomData<IntercomConversation>({
    token,
    path: '/conversations/search',
    method: 'POST',
    dataPath: 'conversations',
    params: {
      page: '1',
      per_page: limit ? limit.toString() : DEFAULT_TRIGGER_SAVED_ITEMS_LIMIT_MAX.toString(),
    },
    body,
  });

  return data;
};

export default IntercomNewConversationTrigger;
