
import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const PushoverNotificationResponseType = {
  type: 'hash',
  fields: {
    success: { type: 'bool' },
    request_id: { type: 'string' },
    message: { type: 'string' },
    title: { type: 'string' },
    priority: { type: 'number' },
    sound: { type: 'string' },
    device: { type: 'string' },
  },
} satisfies TQoreResponseType;

export const PushoverEmergencyNotificationResponseType = {
  type: 'hash',
  fields: {
    success: { type: 'bool' },
    request_id: { type: 'string' },
    receipt: { type: 'string' },
    message: { type: 'string' },
    title: { type: 'string' },
    retry: { type: 'number' },
    expire: { type: 'number' },
    device: { type: 'string' },
  },
} satisfies TQoreResponseType;

export const PushoverValidateUserResponseType = {
  type: 'hash',
  fields: {
    valid: { type: 'bool' },
    request_id: { type: 'string' },
    devices: {
      type: {
        type: 'list',
        element_type: 'string',
      },
    },
    device_count: { type: 'number' },
    licenses: {
      type: {
        type: 'list',
        element_type: 'string',
      },
    },
    is_group: { type: 'bool' },
  },
} satisfies TQoreResponseType;
