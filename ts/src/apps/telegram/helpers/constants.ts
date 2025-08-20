import TelegramBot from 'node-telegram-bot-api';

export const createTelegramClient = (token: string): TelegramBot => {
  return new TelegramBot(token);
};
