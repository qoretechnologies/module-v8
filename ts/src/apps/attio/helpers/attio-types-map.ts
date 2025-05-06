import { TQoreType, TQoreTypeObject } from '@qoretechnologies/ts-toolkit';

export const ATTIO_TO_QORUS_TYPE_MAP: Record<string, TQoreTypeObject | TQoreType> = {
  text: 'string',
  'personal-name': 'string',
  'phone-number': 'string',
  'email-address': 'string',
  domain: 'string',
  select: 'string',
  status: 'string',
  date: 'date',
  timestamp: 'date',
  number: 'number',
  currency: 'number',
  checkbox: 'boolean',
  'multi-select': 'list',
  'record-reference': 'hash',
  'actor-reference': 'hash',
  location: {
    type: 'hash',
    fields: {
      line_1: {
        display_name: 'Address Line 1',
        type: 'string',
      },
      line_2: {
        display_name: 'Address Line 2',
        type: 'string',
      },
      line_3: {
        display_name: 'Address Line 3',
        type: 'string',
      },
      line_4: {
        display_name: 'Address Line 4',
        type: 'string',
      },
      locality: {
        display_name: 'City',
        type: 'string',
      },
      region: {
        display_name: 'State/Region',
        type: 'string',
      },
      postcode: {
        display_name: 'Postal Code',
        type: 'string',
      },
      country_code: {
        display_name: 'Country Code',
        type: 'string',
      },
      latitude: {
        display_name: 'Latitude',
        type: 'string',
      },
      longitude: {
        display_name: 'Longitude',
        type: 'string',
      },
    },
  },
  interaction: 'hash',
};

export const ATTIO_TO_QORUS_RESPONSE_TYPE_MAP: Record<string, TQoreTypeObject | TQoreType> = {
  date: 'string',
  status: {
    type: 'hash',
    fields: {
      status_id: { type: 'string' },
      title: { type: 'string' },
      celebration_enabled: { type: 'boolean' },
    },
  },
  timestamp: { type: 'string' },
  'personal-name': {
    type: 'hash',
    fields: {
      first_name: { type: 'string' },
      last_name: { type: 'string' },
      full_name: { type: 'string' },
    },
  },
  'email-address': {
    type: 'hash',
    fields: {
      original_email_address: { type: 'string' },
      email_address: { type: 'string' },
      email_domain: { type: 'string' },
      email_root_domain: { type: 'string' },
      email_local_specifier: { type: 'string' },
    },
  },
  'record-reference': {
    type: 'hash',
    fields: {
      target_object: { type: 'string' },
      target_object_id: { type: 'string' },
    },
  },
  'actor-reference': {
    type: 'hash',
    fields: {
      referenced_actor_type: { type: 'string' },
      referenced_actor_id: { type: 'string' },
    },
  },
  'phone-number': {
    type: 'hash',
    fields: {
      phone_number: { type: 'string' },
      country_code: { type: 'string' },
      original_phone_number: { type: 'string' },
    },
  },
  domain: {
    type: 'hash',
    fields: {
      domain: { type: 'string' },
      root_domain: { type: 'string' },
    },
  },
  select: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      title: { type: 'string' },
    },
  },
  interaction: {
    type: 'hash',
    fields: {
      interaction_type: { type: 'string' },
      interacted_at: { type: 'string' },
      owner_actor: {
        type: {
          type: 'hash',
          fields: {
            id: { type: 'string' },
            type: { type: 'string' },
          },
        },
      },
    },
  },
};
