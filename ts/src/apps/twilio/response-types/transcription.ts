import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const TwilioTranscriptionResponseType = {
  type: 'hash',
  fields: {
    sid: { type: 'string' },
    accountSid: { type: 'string' },
    recordingSid: { type: 'string' },
    transcriptionText: { type: 'string' },
    status: { type: 'string' },
    type: { type: 'string' },
    dateCreated: { type: 'string' },
    dateUpdated: { type: 'string' },
    duration: { type: 'string' },
    price: { type: 'number' },
    priceUnit: { type: 'string' },
    apiVersion: { type: 'string' },
    uri: { type: 'string' },
  },
} satisfies TQoreResponseType;
