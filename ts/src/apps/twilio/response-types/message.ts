import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const TwilioMessageResponseType = {
  type: 'hash',
  fields: {
    sid: { type: 'string' },
    body: { type: 'string' },
    numSegments: { type: 'string' },
    direction: { type: 'string' },
    from: { type: 'string' },
    to: { type: 'string' },
    dateUpdated: { type: 'string' },
    price: { type: 'string' },
    errorMessage: { type: 'string' },
    uri: { type: 'string' },
    accountSid: { type: 'string' },
    numMedia: { type: 'string' },
    status: { type: 'string' },
    messagingServiceSid: { type: 'string' },
    dateSent: { type: 'string' },
    dateCreated: { type: 'string' },
    errorCode: { type: 'integer' },
    priceUnit: { type: 'string' },
    apiVersion: { type: 'string' },
    subresourceUris: {
      type: {
        type: 'list',
        element_type: 'string',
      },
    },
  },
} satisfies TQoreResponseType;
