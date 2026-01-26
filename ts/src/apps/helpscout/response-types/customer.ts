import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const HelpScoutAddressResponseType = {
  type: 'hash',
  fields: {
    city: { type: 'string' },
    lines: { type: { type: 'list', element_type: 'string' } },
    state: { type: 'string' },
    postalCode: { type: 'string' },
    country: { type: 'string' },
  },
} satisfies TQoreResponseType;

const HelpScoutCustomerContactResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'integer' },
    type: { type: 'string' },
    value: { type: 'string' },
  },
} satisfies TQoreResponseType;

const HelpScoutCustomerPropertyResponseType = {
  type: 'hash',
  fields: {
    type: { type: 'string' },
    name: { type: 'string' },
    value: { type: 'string' },
  },
} satisfies TQoreResponseType;

/**
 * Response type for customer actions (get, list, create, update, search).
 * The formatHelpScoutResponse helper spreads _embedded fields to the top level,
 * so emails, phones, etc. are at the root of the response.
 */
export const HelpScoutCustomerResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'integer' },
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    gender: { type: 'string' },
    jobTitle: { type: 'string' },
    location: { type: 'string' },
    organization: { type: 'string' },
    photoUrl: { type: 'string' },
    photoType: { type: 'string' },
    background: { type: 'string' },
    age: { type: 'string' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
    emails: { type: { type: 'list', element_type: HelpScoutCustomerContactResponseType } },
    phones: { type: { type: 'list', element_type: HelpScoutCustomerContactResponseType } },
    chats: { type: { type: 'list', element_type: HelpScoutCustomerContactResponseType } },
    socialProfiles: { type: { type: 'list', element_type: HelpScoutCustomerContactResponseType } },
    websites: { type: { type: 'list', element_type: HelpScoutCustomerContactResponseType } },
    properties: { type: { type: 'list', element_type: HelpScoutCustomerPropertyResponseType } },
    address: { type: HelpScoutAddressResponseType },
  },
} satisfies TQoreResponseType;

/**
 * Response type for customer webhook events (triggers).
 * Webhook payloads come directly from HelpScout with the _embedded structure intact.
 */
export const HelpScoutCustomerWebhookResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'integer' },
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    gender: { type: 'string' },
    jobTitle: { type: 'string' },
    location: { type: 'string' },
    organization: { type: 'string' },
    photoUrl: { type: 'string' },
    photoType: { type: 'string' },
    background: { type: 'string' },
    age: { type: 'string' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
    _embedded: {
      type: {
        type: 'hash',
        fields: {
          emails: { type: { type: 'list', element_type: HelpScoutCustomerContactResponseType } },
          phones: { type: { type: 'list', element_type: HelpScoutCustomerContactResponseType } },
          chats: { type: { type: 'list', element_type: HelpScoutCustomerContactResponseType } },
          socialProfiles: {
            type: { type: 'list', element_type: HelpScoutCustomerContactResponseType },
          },
          websites: { type: { type: 'list', element_type: HelpScoutCustomerContactResponseType } },
          properties: {
            type: { type: 'list', element_type: HelpScoutCustomerPropertyResponseType },
          },
          address: { type: HelpScoutAddressResponseType },
        },
      },
    },
  },
} satisfies TQoreResponseType;
