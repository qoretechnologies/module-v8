import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';
import { OwnerType } from './common';

const ContactAutomationLinksType = {
  type: 'hash',
  fields: {
    automation: { type: 'string' },
    contact: { type: 'string' },
    contactGoals: { type: 'string' },
  },
} satisfies TQoreResponseType;

export const ContactAutomationResponseType = {
  type: 'hash',
  fields: {
    contact: { type: 'string' },
    seriesid: { type: 'string' },
    startid: { type: 'string' },
    status: { type: 'string' },
    adddate: { type: 'string' },
    remdate: { type: 'string' },
    timespan: { type: 'string' },
    lastblock: { type: 'string' },
    lastdate: { type: 'string' },
    completedElements: { type: 'string' },
    totalElements: { type: 'string' },
    completed: { type: 'number' },
    completeValue: { type: 'number' },
    links: { type: ContactAutomationLinksType },
    id: { type: 'string' },
    automation: { type: 'string' },
  },
} satisfies TQoreResponseType;

const ContactListLinksType = {
  type: 'hash',
  fields: {
    automation: { type: 'string' },
    list: { type: 'string' },
    contact: { type: 'string' },
    form: { type: 'string' },
    autosyncLog: { type: 'string' },
    campaign: { type: 'string' },
    unsubscribeAutomation: { type: 'string' },
    message: { type: 'string' },
  },
} satisfies TQoreResponseType;

export const ContactListResponseType = {
  type: 'hash',
  fields: {
    contact: { type: 'string' },
    list: { type: 'string' },
    form: { type: 'string' },
    seriesid: { type: 'string' },
    sdate: { type: 'string' },
    udate: { type: 'string' },
    status: { type: 'string' },
    responder: { type: 'string' },
    sync: { type: 'string' },
    unsubreason: { type: 'string' },
    campaign: { type: 'string' },
    message: { type: 'string' },
    first_name: { type: 'string' },
    last_name: { type: 'string' },
    ip4Sub: { type: 'string' },
    sourceid: { type: 'string' },
    autosyncLog: { type: 'string' },
    ip4_last: { type: 'string' },
    ip4Unsub: { type: 'string' },
    unsubscribeAutomation: { type: 'string' },
    links: { type: ContactListLinksType },
    id: { type: 'string' },
    automation: { type: 'string' },
  },
} satisfies TQoreResponseType;

const DealLinksType = {
  type: 'hash',
  fields: {
    activities: { type: 'string' },
    contact: { type: 'string' },
    contactDeals: { type: 'string' },
    group: { type: 'string' },
    nextTask: { type: 'string' },
    notes: { type: 'string' },
    organization: { type: 'string' },
    owner: { type: 'string' },
    scoreValues: { type: 'string' },
    stage: { type: 'string' },
    tasks: { type: 'string' },
  },
} satisfies TQoreResponseType;

export const ContactDealResponseType = {
  type: 'hash',
  fields: {
    owner: { type: 'string' },
    contact: { type: 'string' },
    organization: { type: 'string' },
    group: { type: 'string' },
    title: { type: 'string' },
    nexttaskid: { type: 'string' },
    currency: { type: 'string' },
    status: { type: 'string' },
    links: { type: DealLinksType },
    id: { type: 'string' },
    nextTask: { type: 'string' },
  },
} satisfies TQoreResponseType;

const FieldValueLinksType = {
  type: 'hash',
  fields: {
    owner: { type: 'string' },
    field: { type: 'string' },
  },
} satisfies TQoreResponseType;

export const ContactFieldValueResponseType = {
  type: 'hash',
  fields: {
    contact: { type: 'string' },
    field: { type: 'string' },
    value: { type: 'string' },
    cdate: { type: 'string' },
    udate: { type: 'string' },
    links: { type: FieldValueLinksType },
    id: { type: 'string' },
    owner: { type: 'string' },
  },
} satisfies TQoreResponseType;

export const ContactGeoAddressResponseType = {
  type: 'hash',
  fields: {
    ip4: { type: 'string' },
    country2: { type: 'string' },
    country: { type: 'string' },
    state: { type: 'string' },
    city: { type: 'string' },
    zip: { type: 'string' },
    area: { type: 'string' },
    lat: { type: 'string' },
    lon: { type: 'string' },
    tz: { type: 'string' },
    tstamp: { type: 'string' },
    links: {
      type: {
        type: 'list',
        element_type: { type: 'hash' },
      },
    },
    id: { type: 'string' },
  },
} satisfies TQoreResponseType;

const GeoIpLinksType = {
  type: 'hash',
  fields: {
    geoAddress: { type: 'string' },
  },
} satisfies TQoreResponseType;

export const ContactGeoIpResponseType = {
  type: 'hash',
  fields: {
    contact: { type: 'string' },
    campaignid: { type: 'string' },
    messageid: { type: 'string' },
    geoaddrid: { type: 'string' },
    ip4: { type: 'string' },
    tstamp: { type: 'string' },
    geoAddress: { type: 'string' },
    links: { type: GeoIpLinksType },
    id: { type: 'string' },
  },
} satisfies TQoreResponseType;

const ContactLinksType = {
  type: 'hash',
  fields: {
    bounceLogs: { type: 'string' },
    contactAutomations: { type: 'string' },
    contactData: { type: 'string' },
    contactGoals: { type: 'string' },
    contactLists: { type: 'string' },
    contactLogs: { type: 'string' },
    contactTags: { type: 'string' },
    contactDeals: { type: 'string' },
    deals: { type: 'string' },
    fieldValues: { type: 'string' },
    geoIps: { type: 'string' },
    notes: { type: 'string' },
    organization: { type: 'string' },
    plusAppend: { type: 'string' },
    trackingLogs: { type: 'string' },
    scoreValues: { type: 'string' },
  },
} satisfies TQoreResponseType;

export const ContactResponseType = {
  type: 'hash',
  fields: {
    contactAutomations: {
      type: {
        type: 'list',
        element_type: ContactAutomationResponseType,
      },
    },
    contactLists: {
      type: {
        type: 'list',
        element_type: ContactListResponseType,
      },
    },
    deals: {
      type: {
        type: 'list',
        element_type: ContactDealResponseType,
      },
    },
    fieldValues: {
      type: {
        type: 'list',
        element_type: ContactFieldValueResponseType,
      },
    },
    geoAddresses: {
      type: {
        type: 'list',
        element_type: ContactGeoAddressResponseType,
      },
    },
    geoIps: {
      type: {
        type: 'list',
        element_type: ContactGeoIpResponseType,
      },
    },
    contact: {
      type: {
        type: 'hash',
        fields: {
          cdate: { type: 'string' },
          email: { type: 'string' },
          phone: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          orgid: { type: 'string' },
          segmentio_id: { type: 'string' },
          bounced_hard: { type: 'string' },
          bounced_soft: { type: 'string' },
          bounced_date: { type: 'string' },
          ip: { type: 'string' },
          ua: { type: 'string' },
          hash: { type: 'string' },
          socialdata_lastcheck: { type: 'string' },
          email_local: { type: 'string' },
          email_domain: { type: 'string' },
          sentcnt: { type: 'string' },
          rating_tstamp: { type: 'string' },
          gravatar: { type: 'string' },
          deleted: { type: 'string' },
          adate: { type: 'string' },
          udate: { type: 'string' },
          edate: { type: 'string' },
          contactAutomations: {
            type: {
              type: 'list',
              element_type: 'string',
            },
          },
          contactLists: {
            type: {
              type: 'list',
              element_type: 'string',
            },
          },
          fieldValues: {
            type: {
              type: 'list',
              element_type: 'string',
            },
          },
          geoIps: {
            type: {
              type: 'list',
              element_type: 'string',
            },
          },
          deals: {
            type: {
              type: 'list',
              element_type: 'string',
            },
          },
          accountContacts: {
            type: {
              type: 'list',
              element_type: 'string',
            },
          },
          links: { type: ContactLinksType },
          id: { type: 'string' },
          organization: { type: 'string' },
        },
      },
    },
  },
} satisfies TQoreResponseType;

const ContactNoteLinksType = {
  type: 'hash',
  fields: {
    activities: { type: 'string' },
    user: { type: 'string' },
    notes: { type: 'string' },
  },
} satisfies TQoreResponseType;

export const ContactNoteResponseType = {
  type: 'hash',
  fields: {
    note: { type: 'string' },
    relid: { type: 'string' },
    reltype: { type: 'string' },
    userid: { type: 'string' },
    cdate: { type: 'string' },
    mdate: { type: 'string' },
    links: { type: ContactNoteLinksType },
    id: { type: 'string' },
    owner: { type: OwnerType },
  },
} satisfies TQoreResponseType;

const ContactListItemLinksType = {
  type: 'hash',
  fields: {
    bounceLogs: { type: 'string' },
    contactAutomations: { type: 'string' },
    contactData: { type: 'string' },
    contactGoals: { type: 'string' },
    contactLists: { type: 'string' },
    contactLogs: { type: 'string' },
    contactTags: { type: 'string' },
    contactDeals: { type: 'string' },
    deals: { type: 'string' },
    fieldValues: { type: 'string' },
    geoIps: { type: 'string' },
    notes: { type: 'string' },
    organization: { type: 'string' },
    plusAppend: { type: 'string' },
    trackingLogs: { type: 'string' },
    scoreValues: { type: 'string' },
    accountContacts: { type: 'string' },
  },
} satisfies TQoreResponseType;

export const ContactListItemResponseType = {
  type: 'hash',
  fields: {
    cdate: { type: 'string' },
    email: { type: 'string' },
    phone: { type: 'string' },
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    orgid: { type: 'string' },
    orgname: { type: 'string' },
    segmentio_id: { type: 'string' },
    bounced_hard: { type: 'string' },
    bounced_soft: { type: 'string' },
    bounced_date: { type: 'string' },
    ip: { type: 'string' },
    ua: { type: 'string' },
    hash: { type: 'string' },
    socialdata_lastcheck: { type: 'string' },
    email_local: { type: 'string' },
    email_domain: { type: 'string' },
    sentcnt: { type: 'string' },
    rating_tstamp: { type: 'string' },
    gravatar: { type: 'string' },
    deleted: { type: 'string' },
    anonymized: { type: 'string' },
    adate: { type: 'string' },
    udate: { type: 'string' },
    edate: { type: 'string' },
    deleted_at: { type: 'string' },
    created_utc_timestamp: { type: 'string' },
    updated_utc_timestamp: { type: 'string' },
    created_timestamp: { type: 'string' },
    updated_timestamp: { type: 'string' },
    created_by: { type: 'string' },
    updated_by: { type: 'string' },
    email_empty: { type: 'bool' },
    links: { type: ContactListItemLinksType },
    id: { type: 'string' },
    organization: { type: 'string' },
  },
} satisfies TQoreResponseType;

export const CreateUpdateContactResponseType = {
  type: 'hash',
  fields: {
    fieldValues: {
      type: {
        type: 'list',
        element_type: ContactFieldValueResponseType,
      },
    },
    contact: {
      type: {
        type: 'hash',
        fields: {
          email: { type: 'string' },
          cdate: { type: 'string' },
          udate: { type: 'string' },
          orgid: { type: 'string' },
          id: { type: 'string' },
          organization: { type: 'string' },
        },
      },
    },
  },
} satisfies TQoreResponseType;

const ContactTagLinksType = {
  type: 'hash',
  fields: {
    contact: { type: 'string' },
    tag: { type: 'string' },
  },
} satisfies TQoreResponseType;

export const ContactTagResponseType = {
  type: 'hash',
  fields: {
    cdate: { type: 'string' },
    contact: { type: 'string' },
    id: { type: 'string' },
    links: { type: ContactTagLinksType },
    tag: { type: 'string' },
  },
} satisfies TQoreResponseType;
