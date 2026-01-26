import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getIntercomAllowedValues } from '.';

interface IntercomConversation {
  type: string;
  id: string;
  created_at: number;
  updated_at: number;
  title?: string;
  source?: {
    type: string;
    id?: string;
    subject?: string;
    delivered_as?: string;
    author: {
      type: string;
      id: string;
      name: string;
      email: string;
    };
  };
  state: string;
  read: boolean;
  waiting_since?: number;
  snoozed_until?: number;
}

const mapIntercomConversationToAllowedValue = (
  conversation: IntercomConversation
): IQoreAllowedValue<string> => {
  const displayName =
    conversation.title || conversation.source?.subject || `Conversation ${conversation.id}`;

  const subject = conversation.source?.subject;
  const authorName = conversation.source?.author?.name;
  const authorEmail = conversation.source?.author?.email;

  return {
    display_name: displayName,
    value: conversation.id,
    desc:
      `ID: ${conversation.id}\n\n` +
      `State: ${conversation.state}\n\n` +
      `Source: ${conversation.source?.delivered_as}\n\n` +
      `Subject: ${subject}\n\n` +
      `Author: ${authorName} (${authorEmail})\n\n` +
      `Read: ${conversation.read ? 'Yes' : 'No'}`,
  };
};

export const getIntercomConversationIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('Token is required to fetch Intercom conversation IDs');
  }

  return await getIntercomAllowedValues<IntercomConversation>({
    token,
    path: '/conversations',
    dataPath: 'conversations',
    mapFn: mapIntercomConversationToAllowedValue,
  });
};
