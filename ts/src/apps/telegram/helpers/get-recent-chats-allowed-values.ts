import { TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { Chat, Update } from 'node-telegram-bot-api';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { TELEGRAM_CONN_OPTIONS, TelegramError } from '../constants';
import { createTelegramClient } from './constants';

export const GetTelegramRecentChatsAllowedValues: TQoreGetAllowedValuesFunction<
  typeof TELEGRAM_CONN_OPTIONS,
  number
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: TelegramError,
  });

  const client = createTelegramClient(token);
  const maxIterations = 10;
  const limit = 100;
  let offset = 0;
  const updates: Update[] = [];

  for (let i = 0; i < maxIterations; i++) {
    const newUpdates = await client.getUpdates({
      allowed_updates: ['message'],
      limit,
      offset,
    });

    updates.push(...newUpdates);

    if (newUpdates.length === 0) break;

    offset = newUpdates[newUpdates.length - 1].update_id + 1;
  }

  const recentChats = updates.map((update) => update.message?.chat).filter(Boolean) as Chat[];

  const uniqueChats = Array.from(new Map(recentChats.map((chat) => [chat.id, chat])).values());

  return uniqueChats.map((chat) => {
    const nameParts = [chat.title, chat.first_name, chat.last_name].filter(Boolean).join(' ');
    const usernamePart = chat.username ? `[${chat.username}]` : '';
    const display_name = [nameParts, usernamePart].filter(Boolean).join(' ').trim();

    return {
      value: chat.id,
      display_name,
    };
  });
};
