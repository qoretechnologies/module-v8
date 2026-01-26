import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const TwilioRecordingResponseType = {
  type: 'hash',
  fields: {
    sid: { type: 'string' },
    accountSid: { type: 'string' },
    callSid: { type: 'string' },
    conferenceSid: { type: 'string' },
    dateCreated: { type: 'string' },
    dateUpdated: { type: 'string' },
    startTime: { type: 'string' },
    duration: { type: 'string' },
    status: { type: 'string' },
    channels: { type: 'integer' },
    source: { type: 'string' },
    price: { type: 'string' },
    priceUnit: { type: 'string' },
    errorCode: { type: 'integer' },
    uri: { type: 'string' },
    encryptionDetails: { type: 'auto' },
    subresourceUris: { type: 'auto' },
    mediaUrl: { type: 'string' },
    apiVersion: { type: 'string' },
  },
} satisfies TQoreResponseType;
