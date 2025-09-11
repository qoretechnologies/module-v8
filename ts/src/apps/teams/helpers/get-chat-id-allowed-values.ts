import { Client, PageCollection } from '@microsoft/microsoft-graph-client';
import { Chat, ConversationMember } from '@microsoft/microsoft-graph-types';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { Debugger } from '../../../utils/Debugger';

export const getTeamsChatIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('Token is required to get Teams chat allowed values');
  }

  const client = Client.initWithMiddleware({
    authProvider: {
      getAccessToken: () => Promise.resolve(token!),
    },
  });

  const allowedValues: IQoreAllowedValue<string>[] = [];

  try {
    const me = await client.api('/me').get();
    const myId = me.id;

    let response: PageCollection = await client.api('/me/chats').expand('members').get();

    while (response.value.length > 0) {
      for (const chat of response.value as Chat[]) {
        const members = chat.members || [];
        let memberNames = '';

        if (members.length > 0) {
          const visibleMembers = members
            .filter((member: ConversationMember & { userId: string }) => member.userId !== myId)
            .slice(0, 3)
            .map((m) => m.displayName || 'Unknown');
          memberNames = visibleMembers.join(', ');

          if (members.length > 3) {
            memberNames += ` and ${members.length - 3} more`;
          }
        }

        let displayName = 'Unnamed chat';
        if (chat.chatType === 'oneOnOne' && memberNames) {
          displayName = `Chat with ${memberNames}`;
        } else if (chat.chatType === 'group' && chat.topic) {
          displayName = `Group: ${chat.topic}`;
        } else if (chat.chatType === 'meeting') {
          displayName = `Meeting: ${chat.topic || 'Untitled'}`;
        } else if (chat.chatType === 'group') {
          displayName = `Group chat (${members.length} members)`;
        }

        const membersDesc =
          members.length > 0
            ? `Members:\n${members.map((member) => `- ${member.displayName}` || 'Unknown').join('\n')}`
            : 'Members: None';

        allowedValues.push({
          display_name: displayName,
          value: chat.id!,
          short_desc: `Type: ${chat.chatType || 'Unknown'}\n\n` + membersDesc,
        });
      }

      if (response['@odata.nextLink']) {
        response = await client.api(response['@odata.nextLink']).get();
      } else {
        break;
      }
    }

    return allowedValues;
  } catch (error) {
    Debugger.log('Failed to get Teams chat allowed values', error);

    return [];
  }
};
