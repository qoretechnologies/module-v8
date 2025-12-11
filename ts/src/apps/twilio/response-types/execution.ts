import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const TwilioExecutionResponseType = {
  type: 'hash',
  fields: {
    sid: { type: 'string' },
    accountSid: { type: 'string' },
    flowSid: { type: 'string' },
    contactChannelAddress: { type: 'string' },
    context: { type: 'auto' },
    status: { type: 'string' },
    dateCreated: { type: 'string' },
    dateUpdated: { type: 'string' },
    url: { type: 'string' },
    links: { type: 'auto' },
  },
} satisfies TQoreResponseType;
