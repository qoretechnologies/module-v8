import { TAllowedPaths, TCustomConnOptions } from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { OpenAPIV2 } from 'openapi-types';
import { buildActionsFromSwaggerSchema } from '../../global/helpers';
import mailchimp from '../../schemas/mailchimp.swagger.json';
import { getMailchimpCampaignIdAllowedValues } from './helpers/get-campaign-id-allowed-values';
import { getMailchimpCustomerIdAllowedValues } from './helpers/get-customer-id-allowed-values';
import { getMailchimpCampaignFolderIdAllowedValues } from './helpers/get-folder-id-allowed-values';
import { getMailchimpInterestCategoryIdAllowedValues } from './helpers/get-interest-id-allowed-values';
import { getMailchimpListIdAllowedValues } from './helpers/get-list-id-allowed-values';
import { getMailchimpNoteIdAllowedValues } from './helpers/get-note-id-allowed-values';
import { getMailchimpSegmentIdAllowedValues } from './helpers/get-segment-id-allowed-values';
import { getMailchimpSubscriberHashAllowedValues } from './helpers/get-subscriber-allowed-values';
import { getMailchimpAllTagsAllowedValues } from './helpers/get-tag-allowed-values';
import { getMailchimpListUniqueEmailIdAllowedValues } from './helpers/get-unique-email-id-allowed-values';

export const MAILCHIMP_APP_NAME = 'Mailchimp';
export const MAILCHIMP_APP_LOGO =
  'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IS0tIFVwbG9hZGVkIHRvOiBTVkcgUmVwbywgd3d3LnN2Z3JlcG8uY29tLCBHZW5lcmF0b3I6IFNWRyBSZXBvIE1peGVyIFRvb2xzIC0tPgo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKYXJpYS1sYWJlbD0iTWFpbGNoaW1wIiByb2xlPSJpbWciCnZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cmVjdApyeD0iMTUlIiB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIKZmlsbD0iI2ZkMiIvPjxwYXRoIGZpbGw9IiMyMjIiIGQ9Ik00MTggMzA2bC02LTE3czI1LTM4LTM3LTUxYzAgMCA0LTQ3LTE4LTY5IDQ4LTQ3IDM3LTExOC03Mi03Mi01Ni0xMDctMjcyIDE0NC0xODIgMTg0LTkgMTItOSA3MiA1MyA3OCA0MiA5MCAxNDQgOTYgMjAzIDY5czkzLTExMyA1OS0xMjJ6bS0yNjMgNDBjLTUxLTUtNTYtNzUtMTItODJzNTUgODYgMTIgODJ6bS0xNS05NWMtMTQgMC0zMSAxOS0zMSAxOS02OC0zMyAxMjMtMjUyIDE2NC0xNjcgMCAwLTEwMCA0OC0xMzMgMTQ4em0yMDAgODVjMC00LTIxIDYtNTktNyAzLTIxIDQ4IDE4IDEyMy0zM2w2IDIxYzI4LTUgMCA5MC05MCA4OS03My0xLTk2LTc2LTU2LTExNyA4LTgtMjktMjQtMjItNTkgMy0xNSAxNi0zNyA0OS0zMXM0MC0yNCA2Mi0xMyA5IDUzIDEyIDU5IDM1IDcgNDEgMjQtNDEgNTQtMTE0IDQ0Yy0xNy0yLTI3IDIwLTE2IDM0IDIyIDMyIDExMiAxMSAxMjctMjAtMzggMjktMTE2IDQwLTEyMiA5IDIyIDEwIDU5IDQgNTkgMHptLTEzMS0xNThjMjItMjcgNTEtNDMgNTEtNDNsLTYgMTVzMjEtMTYgNDQtMTZsLTggOGMyNiAxIDM3IDExIDM3IDExcy02MS0xOC0xMTggMjV6bTEzNSAzOWMxMy0xIDkgMjkgOSAyOWgtOHMtMTQtMjgtMS0yOXptLTU5IDMzYy05IDEtMTkgNi0xOCAyIDQtMTYgNDEtMTIgNDAgMnMtOS02LTIyLTR6bTIxIDEyYzEgMi03IDAtMTMgMXMtMTIgNC0xMiAyIDIzLTExIDI1LTN6bTIwIDNjMy02IDE1IDAgMTIgNnMtMTUgMC0xMi02em0yNSAyYy02IDAtNi0xMyAwLTEzczYgMTQgMCAxNHptLTE4MCA1M2MzIDMtNiA5LTEzIDRzOC0yOS0xMC0zNS0xMyAxNy0xOCAxNCA3LTM1IDI4LTIyLTYgMzMgNiAzOSA1LTIgNyAweiIvPjwvc3ZnPg==';

export class MailchimpError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MailchimpError';
  }
}

export const MAILCHIMP_CONN_OPTIONS = {
  datacenter: {
    type: 'string',
    display_name: 'Datacenter',
    short_desc: 'Datacenter',
    desc: 'Datacenter',
  },
} satisfies TCustomConnOptions;

export const MAILCHIMP_ALLOWED_PATHS = {
  '/lists/{list_id}/members/{subscriber_hash}/notes': {
    POST: {
      override_options: {
        list_id: {
          get_allowed_values: getMailchimpListIdAllowedValues,
          on_change: ['refetch'],
        },
        subscriber_hash: {
          depends_on: ['list_id'],
          get_allowed_values: getMailchimpSubscriberHashAllowedValues,
        },
        note: {
          required: true,
        },
      },
    },
  },
  '/lists/{list_id}/members/{subscriber_hash}/notes/{note_id}': {
    PATCH: {
      override_options: {
        list_id: {
          get_allowed_values: getMailchimpListIdAllowedValues,
          on_change: ['refetch'],
        },
        subscriber_hash: {
          depends_on: ['list_id'],
          on_change: ['refetch'],
          get_allowed_values: getMailchimpSubscriberHashAllowedValues,
        },
        note_id: {
          type: 'softnumber',
          depends_on: ['list_id', 'subscriber_hash'],
          get_allowed_values: getMailchimpNoteIdAllowedValues,
        },
        note: {
          required: true,
        },
      },
    },
    DELETE: {
      override_options: {
        list_id: {
          get_allowed_values: getMailchimpListIdAllowedValues,
          on_change: ['refetch'],
        },
        subscriber_hash: {
          depends_on: ['list_id'],
          on_change: ['refetch'],
          get_allowed_values: getMailchimpSubscriberHashAllowedValues,
        },
        note_id: {
          depends_on: ['list_id', 'subscriber_hash'],
          get_allowed_values: getMailchimpNoteIdAllowedValues,
        },
      },
    },
  },
  '/lists/{list_id}/members': {
    POST: {
      override_options: {
        list_id: {
          get_allowed_values: getMailchimpListIdAllowedValues,
        },
      },
    },
    GET: {
      override_options: {
        list_id: {
          get_allowed_values: getMailchimpListIdAllowedValues,
          on_change: ['refetch'],
        },
        unique_email_id: {
          get_allowed_values: getMailchimpListUniqueEmailIdAllowedValues,
          on_change: ['refetch'],
        },
        interest_category_id: {
          get_allowed_values: getMailchimpInterestCategoryIdAllowedValues,
        },
        // TODO: add interest items check if it is an array
      },
    },
  },
  '/lists/{list_id}/members/{subscriber_hash}/tags': {
    POST: {
      override_options: {
        list_id: {
          get_allowed_values: getMailchimpListIdAllowedValues,
          on_change: ['refetch'],
        },
        subscriber_hash: {
          depends_on: ['list_id'],
          on_change: ['refetch'],
          get_allowed_values: getMailchimpSubscriberHashAllowedValues,
        },
        'tags.name': {
          get_allowed_values: getMailchimpAllTagsAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
  },
  '/lists/{list_id}/members/{subscriber_hash}': {
    GET: {
      override_options: {
        list_id: {
          get_allowed_values: getMailchimpListIdAllowedValues,
          on_change: ['refetch'],
        },
        subscriber_hash: {
          depends_on: ['list_id'],
          get_allowed_values: getMailchimpSubscriberHashAllowedValues,
        },
      },
    },
    PUT: {
      override_options: {
        list_id: {
          get_allowed_values: getMailchimpListIdAllowedValues,
          on_change: ['refetch'],
        },
        subscriber_hash: {
          depends_on: ['list_id'],
          get_allowed_values: getMailchimpSubscriberHashAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
    DELETE: {
      override_options: {
        list_id: {
          get_allowed_values: getMailchimpListIdAllowedValues,
          on_change: ['refetch'],
        },
        subscriber_hash: {
          depends_on: ['list_id'],
          get_allowed_values: getMailchimpSubscriberHashAllowedValues,
        },
      },
    },
  },
  '/lists/{list_id}/members/{subscriber_hash}/actions/delete-permanent': {
    POST: {
      override_options: {
        list_id: {
          get_allowed_values: getMailchimpListIdAllowedValues,
          on_change: ['refetch'],
        },
        subscriber_hash: {
          depends_on: ['list_id'],
          get_allowed_values: getMailchimpSubscriberHashAllowedValues,
        },
      },
    },
  },
  // TODO: Fix the schema somehow
  // '/lists': {
  //   POST: {},
  // },
  '/reports': {
    GET: {},
  },
  '/reports/{campaign_id}': {
    GET: {
      override_options: {
        campaign_id: {
          get_allowed_values: getMailchimpCampaignIdAllowedValues,
        },
      },
    },
  },
  '/reports/{campaign_id}/click-details': {
    GET: {
      override_options: {
        campaign_id: {
          get_allowed_values: getMailchimpCampaignIdAllowedValues,
        },
      },
    },
  },
  '/campaigns': {
    GET: {
      override_options: {
        list_id: {
          get_allowed_values: getMailchimpListIdAllowedValues,
          on_change: ['refetch'],
        },
        folder_id: {
          get_allowed_values: getMailchimpCampaignFolderIdAllowedValues,
          on_change: ['refetch'],
        },
        member_id: {
          allowed_values_creatable: true,
          get_allowed_values: getMailchimpSubscriberHashAllowedValues,
        },
      },
    },
    POST: {
      override_options: {
        'recipients.list_id': {
          get_allowed_values: getMailchimpListIdAllowedValues,
          on_change: ['refetch'],
        },
        'recipients.segment_opts.saved_segment_id': {
          get_allowed_values: getMailchimpSegmentIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
  },

  '/lists/{list_id}/members/{subscriber_hash}/events': {
    POST: {
      override_options: {
        list_id: {
          get_allowed_values: getMailchimpListIdAllowedValues,
          on_change: ['refetch'],
        },
        subscriber_hash: {
          depends_on: ['list_id'],
          get_allowed_values: getMailchimpSubscriberHashAllowedValues,
        },
      },
    },
  },
  '/lists/{list_id}/tag-search': {
    GET: {
      override_options: {
        list_id: {
          get_allowed_values: getMailchimpListIdAllowedValues,
        },
        name: {
          preselected: true,
        },
      },
    },
  },
  '/campaigns/{campaign_id}/actions/send': {
    POST: {
      override_options: {
        campaign_id: {
          get_allowed_values: getMailchimpCampaignIdAllowedValues,
        },
      },
    },
  },
  '/ecommerce/stores/{store_id}/customers/{customer_id}': {
    GET: {
      override_options: {
        store_id: {
          get_allowed_values: getMailchimpCustomerIdAllowedValues,
          on_change: ['refetch'],
        },
        customer_id: {
          depends_on: ['store_id'],
          get_allowed_values: getMailchimpCustomerIdAllowedValues,
        },
      },
    },
  },
  '/search-members': {
    GET: {
      override_options: {
        list_id: {
          get_allowed_values: getMailchimpListIdAllowedValues,
        },
      },
    },
  },
  '/search-campaigns': {
    GET: {},
  },
} satisfies TAllowedPaths;

export const MAILCHIMP_ACTIONS = buildActionsFromSwaggerSchema({
  schema: mailchimp as unknown as OpenAPIV2.Document,
  allowedPaths: MAILCHIMP_ALLOWED_PATHS,
  app: MAILCHIMP_APP_NAME,
  globalResponseDataConverter: (response) => {
    return omit(response, ['body._links']);
  },
});
