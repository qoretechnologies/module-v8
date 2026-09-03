/**
 * Telegram file helpers
 *
 * Utilities for downloading files through the Telegram Bot API file endpoint.
 *
 * @see https://core.telegram.org/bots/api#getfile
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import * as mime from 'mime-types';
import { TELEGRAM_API_URL, TelegramError } from '../constants';

/** The Bot API refuses to serve files larger than this through getFile */
export const TELEGRAM_GET_FILE_SIZE_LIMIT = '20 MB';
export const TELEGRAM_DEFAULT_MIME_TYPE = 'application/octet-stream';

export interface ITelegramDownloadedFile {
  content: Buffer;
  contentType: string | null;
}

export const buildTelegramFileUrl = (token: string, filePath: string): string =>
  `${TELEGRAM_API_URL}/file/bot${token}/${filePath}`;

/**
 * Removes the bot token from a message so that errors mentioning the download URL never reveal it
 */
export const redactBotToken = (message: string, token: string): string =>
  token ? message.split(token).join('<bot token>') : message;

/**
 * Picks the MIME type from the Content-Type header when it is specific, otherwise derives it
 * from the file path extension, falling back to application/octet-stream
 */
export const resolveTelegramMimeType = (
  contentType: string | null | undefined,
  filePath: string
): string => {
  const headerMimeType = contentType?.split(';')[0].trim().toLowerCase();

  if (headerMimeType && headerMimeType !== TELEGRAM_DEFAULT_MIME_TYPE) {
    return headerMimeType;
  }

  return mime.lookup(filePath) || TELEGRAM_DEFAULT_MIME_TYPE;
};

/**
 * Turns a getFile / download error into a user facing message, explaining the Bot API size
 * limit when Telegram refuses to serve the file
 */
export const describeTelegramFileError = (error: unknown): string => {
  const message = error instanceof Error ? error.message : String(error);

  if (/file is too big/i.test(message)) {
    return `${message} (the Telegram Bot API can only serve files up to ${TELEGRAM_GET_FILE_SIZE_LIMIT})`;
  }

  return message;
};

export const downloadTelegramFile = async (
  token: string,
  filePath: string
): Promise<ITelegramDownloadedFile> => {
  let response: Response;

  try {
    response = await fetch(buildTelegramFileUrl(token, filePath));
  } catch (error) {
    // a network failure may quote the request URL, which contains the bot token
    const message = error instanceof Error ? error.message : String(error);

    throw new TelegramError(`Downloading "${filePath}" failed: ${redactBotToken(message, token)}`);
  }

  if (!response.ok) {
    // the download URL contains the bot token, so it must never be part of the error message
    throw new TelegramError(
      `Downloading "${filePath}" failed: HTTP ${response.status} ${response.statusText}`
    );
  }

  return {
    content: Buffer.from(await response.arrayBuffer()),
    contentType: response.headers.get('content-type'),
  };
};
