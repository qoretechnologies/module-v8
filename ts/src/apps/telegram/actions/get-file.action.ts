/**
 * Get File Action
 *
 * Downloads a file (photo, voice message, audio, document, video or video note) by its
 * Telegram file ID and returns it as a platform file (name, MIME type, base64 content)
 * together with the Telegram file metadata.
 *
 * @see https://core.telegram.org/bots/api#getfile
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { basename } from 'node:path';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { TELEGRAM_APP_NAME, TelegramError } from '../constants';
import { createTelegramClient } from '../helpers/constants';
import {
  describeTelegramFileError,
  downloadTelegramFile,
  resolveTelegramMimeType,
} from '../helpers/file';
import { TelegramFileBaseFields } from '../response-types';

const action = 'get_file';

const options = {
  file_id: {
    type: 'string',
    required: true,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'hash',
  fields: {
    name: {
      type: 'string',
      short_desc: 'File name taken from the Telegram file path',
    },
    mime_type: {
      type: 'string',
      short_desc: 'MIME type of the file',
    },
    content: {
      type: 'base64binary',
      short_desc: 'File content as base64 encoded binary',
    },
    ...TelegramFileBaseFields,
    file_path: {
      type: 'string',
      short_desc:
        'Path of the file on the Telegram servers; download links built from it are valid for at least 1 hour',
    },
  },
} satisfies TQoreResponseType;

const getFile = QoreAppCreator.createLocalizedAction<typeof options>({
  app: TELEGRAM_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, file_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['file_id'],
      ErrorClass: TelegramError,
    });

    const client = createTelegramClient(token);

    try {
      const file = await client.getFile(file_id);

      if (!file.file_path) {
        throw new TelegramError(
          `Telegram did not return a file path for file "${file_id}", so it cannot be downloaded`
        );
      }

      const { content, contentType } = await downloadTelegramFile(token, file.file_path);

      return {
        name: basename(file.file_path),
        mime_type: resolveTelegramMimeType(contentType, file.file_path),
        content: content.toString('base64'),
        file_id: file.file_id,
        file_unique_id: file.file_unique_id,
        file_size: file.file_size ?? content.byteLength,
        file_path: file.file_path,
      };
    } catch (error) {
      throw new TelegramError(
        `Failed to ${humanizeNameTitle(action)}: ${describeTelegramFileError(error)}`
      );
    }
  },
  response_type: responseType,
});

export default getFile;
