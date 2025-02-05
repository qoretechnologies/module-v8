import {
  QorusRequest,
  TQoreAppActionWithEventOrWebhookEventInfo,
} from '@qoretechnologies/ts-toolkit';

export const FreshdeskContactEventInfo = {
  desc: 'Contact event data',
  type: {
    type: 'hash',
    fields: {
      active: {
        type: 'boolean',
      },
      address: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      email: {
        type: 'string',
      },
      id: {
        type: 'number',
      },
      job_title: {
        type: 'string',
      },
      language: {
        type: 'string',
      },
      mobile: {
        type: 'string',
      },
      name: {
        type: 'string',
      },
      phone: {
        type: 'string',
      },
      time_zone: {
        type: 'string',
      },
      twitter_id: {
        type: 'string',
      },
      custom_fields: {
        type: 'hash',
      },
      facebook_id: {
        type: 'string',
      },
      created_at: {
        type: 'string',
      },
      updated_at: {
        type: 'string',
      },
      csat_rating: {
        type: 'softstring',
      },
      preferred_source: {
        type: 'string',
      },
      company_id: {
        type: 'number',
      },
      unique_external_id: {
        type: 'string',
      },
      first_name: {
        type: 'string',
      },
      last_name: {
        type: 'string',
      },
      visitor_id: {
        type: 'string',
      },
      org_contact_id: {
        type: 'number',
      },
      other_phone_numbers: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
    },
  },
} satisfies TQoreAppActionWithEventOrWebhookEventInfo;

export const FreshdeskTicketEventInfo = {
  desc: 'Ticket event data',
  type: {
    type: 'hash',
    fields: {
      cc_emails: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
      fwd_emails: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
      reply_cc_emails: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
      ticket_cc_emails: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
      ticket_bcc_emails: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
      fr_escalated: {
        type: 'boolean',
      },
      spam: {
        type: 'boolean',
      },
      email_config_id: {
        type: 'number',
      },
      group_id: {
        type: 'number',
      },
      priority: {
        type: 'number',
      },
      requester_id: {
        type: 'number',
      },
      responder_id: {
        type: 'number',
      },
      source: {
        type: 'number',
      },
      company_id: {
        type: 'number',
      },
      status: {
        type: 'number',
      },
      subject: {
        type: 'string',
      },
      association_type: {
        type: 'string',
      },
      support_email: {
        type: 'string',
      },
      to_emails: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
      product_id: {
        type: 'number',
      },
      id: {
        type: 'number',
      },
      type: {
        type: 'string',
      },
      due_by: {
        type: 'string',
      },
      fr_due_by: {
        type: 'string',
      },
      is_escalated: {
        type: 'boolean',
      },
      custom_fields: {
        type: 'hash',
      },
      created_at: {
        type: 'string',
      },
      updated_at: {
        type: 'string',
      },
      associated_tickets_count: {
        type: 'number',
      },
      tags: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
      form_id: {
        type: 'number',
      },
      sentiment_score: {
        type: 'number',
      },
      initial_sentiment_score: {
        type: 'number',
      },
      nr_due_by: {
        type: 'string',
      },
      nr_escalated: {
        type: 'boolean',
      },
    },
  },
} satisfies TQoreAppActionWithEventOrWebhookEventInfo;

export const fetchFreshdeskEventItem = async (options: {
  token: string;
  subdomain: string;
  path: string;
  order_by: 'created_at' | 'updated_at';
}) => {
  const { token, subdomain, path, order_by } = options;

  const response = await QorusRequest.get<{
    data: unknown[];
  }>(
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      path,
      params: {
        per_page: '1',
        order_by,
        order_type: 'desc',
      },
    },
    { url: `https://${subdomain}.freshdesk.com`, endpointId: 'Freshdesk' }
  );

  const responseData = response?.data;

  if (!responseData?.length) {
    return;
  }

  return responseData[0];
};
