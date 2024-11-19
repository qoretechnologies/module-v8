import { WebClient } from '@slack/web-api';
import { createAction, Property } from 'core/framework';
import { slackAuth } from '../..';
import { TQoreResponseType } from '../../../../global/models/qore';

const searchMessagesResponseType = {
  type: 'hash',
  fields: {
    matches: {
      type: 'list',
      display_name: 'Matches',
      short_desc: 'The messages that matched the query',
      desc: 'The messages that matched the query',
      example_value: [
        {
          type: 'message',
          ts: '1234567890.123456',
          user: 'U1234567890',
          text: 'Hello, world!',
        },
      ],
    },
  },
} satisfies TQoreResponseType;

export const searchMessages = createAction({
  name: 'searchMessages',
  displayName: 'Search messages',
  description: 'Searches for messages matching a query',
  auth: slackAuth,
  props: {
    query: Property.ShortText({
      displayName: 'Search query',
      required: true,
    }),
  },
  responseType: searchMessagesResponseType,
  async run({ auth, propsValue }) {
    const userToken = auth.data['authed_user']?.access_token;
    if (userToken === undefined) {
      throw new Error(
        JSON.stringify({
          message: 'Missing user token, please re-authenticate',
        })
      );
    }
    const client = new WebClient(userToken);
    const matches = [];

    // We can't use the usual "for await ... of" syntax with client.paginate
    // Because search.messages uses a bastardized version of cursor-based pagination
    // Where you need to pass * as first cursor
    // https://api.slack.com/methods/search.messages#arg_cursor
    let cursor = '*';
    do {
      const page = await client.search.messages({
        query: propsValue.query,
        count: 100,
        // @ts-expect-error TS2353 - SDK is not aware cursor is actually supported
        cursor,
      });
      if (page.messages?.matches) {
        matches.push(...page.messages.matches);
      }
      // @ts-expect-error TS2353 - SDK is not aware next_cursor is actually returned
      cursor = page.messages?.pagination?.next_cursor;
    } while (cursor);

    return { matches };
  },
});
