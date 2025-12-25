import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const FrontInboxResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'string' },
    name: { type: 'string' },
    is_private: { type: 'bool' },
    is_public: { type: 'bool' },
    send_as: { type: 'string' },
    address: { type: 'string' },
  },
} satisfies TQoreResponseType;
