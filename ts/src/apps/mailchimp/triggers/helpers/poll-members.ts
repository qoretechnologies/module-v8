import { MailchimpError } from '../../constants';
import { fetchMailchimpData } from '../../helpers/constants';

export type TMailchimpMember = {
  id: string;
  email_address: string;
  unique_email_id: string;
  web_id: number;
  email_type: string;
  status: string;
  merge_fields: Record<string, any>;
  stats: {
    avg_open_rate: number;
    avg_click_rate: number;
  };
  ip_signup: string;
  timestamp_signup: string;
  ip_opt: string;
  timestamp_opt: string;
  member_rating: number;
  last_changed: string;
  language: string;
  vip: boolean;
  email_client: string;
  location: {
    latitude: number;
    longitude: number;
    gmtoff: number;
    dstoff: number;
    country_code: string;
    timezone: string;
  };
  tags_count: number;
  tags: {
    id: number;
    name: string;
  }[];
  list_id: string;
};

export type TMailchimpMembersResponse = {
  members: TMailchimpMember[];
  list_id: string;
  total_items: number;
};

export const getMailchimpListMembers = async (
  token: string,
  datacenter: string,
  listId: string,
  status:
    | 'subscribed'
    | 'unsubscribed'
    | 'pending'
    | 'cleaned'
    | 'transactional'
    | 'archived' = 'subscribed',
  since?: string
): Promise<TMailchimpMembersResponse> => {
  try {
    const params: Record<string, string> = {
      count: '1000',
      status,
    };

    if (since) {
      params.since_last_changed = since;
    }

    const data = await fetchMailchimpData<TMailchimpMembersResponse>({
      token,
      datacenter,
      path: `/lists/${listId}/members`,
      params,
      dataPath: 'members',
    });

    if (!data?.members) {
      throw new MailchimpError(`No members found for list ${listId}`);
    }

    return data;
  } catch (error) {
    throw new MailchimpError(
      `Failed to fetch members for list ${listId}: ${
        error instanceof Error ? error.message : error
      }`
    );
  }
};

export const MailchimpMemberEventMockExampleData = {
  type: 'new_subscriber',
  list_id: 'example-list-id',
  member: {
    id: 'example-member-id',
    unique_email_id: 'example-unique-email-id',
    web_id: 123456,
    stats: {
      avg_click_rate: 0.5,
      avg_open_rate: 0.7,
    },
    ip_signup: '',
    email_type: 'html',
    email_client: 'Example',
    language: 'en',
    ip_opt: 'example-ip-opt',
    list_id: 'example-list-id',
    tags_count: 1,
    email_address: 'new-subscriber@example.com',
    status: 'subscribed',
    merge_fields: {
      FNAME: 'John',
      LNAME: 'Doe',
    },
    timestamp_signup: new Date().toISOString(),
    timestamp_opt: new Date().toISOString(),
    last_changed: new Date().toISOString(),
    tags: [
      {
        id: 123,
        name: 'example-tag',
      },
    ],
    member_rating: 3,
    vip: false,
    location: {
      latitude: 37.7749,
      longitude: -122.4194,
      country_code: 'US',
      timezone: 'America/Los_Angeles',
      dstoff: -7,
      gmtoff: -8,
    },
  },
  timestamp: new Date().toISOString(),
} as {
  type: 'new_subscriber' | 'unsubscribed' | 'cleaned' | 'upemail' | 'upemail_unsubscribed';
  list_id: string;
  member: TMailchimpMember;
  timestamp: string;
};
