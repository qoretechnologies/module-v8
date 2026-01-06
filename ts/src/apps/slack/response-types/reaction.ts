import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

/**
 * Add reaction response type
 */
export const SlackAddReactionResponseType = {
  type: 'hash',
  fields: {
    ok: {
      type: 'bool',
      short_desc: 'Indicates if the reaction was added successfully',
    },
  },
} satisfies TQoreResponseType;

/**
 * TypeScript type for reaction
 */
export type TSlackReaction = {
  name: string;
  count: number;
  users: string[];
};
