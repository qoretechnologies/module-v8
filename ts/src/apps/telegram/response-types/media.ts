/**
 * Telegram media response types
 *
 * Shared type fragments for the media objects of the Telegram Bot API (PhotoSize, Voice,
 * Audio, Document, Video, VideoNote) so that the `new_message` trigger payload and the
 * `send_photo` / `get_file` responses describe the same structures.
 *
 * @see https://core.telegram.org/bots/api#available-types
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreAppActionOption, TQoreResponseType } from '@qoretechnologies/ts-toolkit';

/**
 * Fields shared by every Telegram file object
 */
export const TelegramFileBaseFields = {
  file_id: {
    type: 'string',
    short_desc: 'Identifier for this file, which can be used to download or reuse the file',
  },
  file_unique_id: {
    type: 'string',
    short_desc:
      'Unique identifier for this file, which is the same over time and for different bots; ' +
      'it cannot be used to download or reuse the file',
  },
  file_size: {
    type: 'integer',
    short_desc: 'File size in bytes; absent when Telegram does not report it',
  },
} satisfies Record<string, TQoreAppActionOption>;

const durationField = {
  type: 'integer',
  short_desc: 'Duration of the media in seconds',
} satisfies TQoreAppActionOption;

const mimeTypeField = {
  type: 'string',
  short_desc: 'MIME type of the file as defined by the sender; absent when not provided',
} satisfies TQoreAppActionOption;

const fileNameField = {
  type: 'string',
  short_desc: 'Original file name as defined by the sender; absent when not provided',
} satisfies TQoreAppActionOption;

/**
 * One size of a photo or a file / sticker thumbnail
 */
export const TelegramPhotoSizeType = {
  type: 'hash',
  fields: {
    ...TelegramFileBaseFields,
    width: {
      type: 'integer',
      short_desc: 'Photo width in pixels',
    },
    height: {
      type: 'integer',
      short_desc: 'Photo height in pixels',
    },
  },
} satisfies TQoreResponseType;

/**
 * Available sizes of a photo, smallest first
 */
export const TelegramPhotoListType = {
  type: 'list',
  element_type: TelegramPhotoSizeType,
} satisfies TQoreResponseType;

export const TelegramVoiceType = {
  type: 'hash',
  fields: {
    ...TelegramFileBaseFields,
    duration: durationField,
    mime_type: mimeTypeField,
  },
} satisfies TQoreResponseType;

export const TelegramAudioType = {
  type: 'hash',
  fields: {
    ...TelegramFileBaseFields,
    duration: durationField,
    performer: {
      type: 'string',
      short_desc: 'Performer of the audio as defined by the sender or by audio tags',
    },
    title: {
      type: 'string',
      short_desc: 'Title of the audio as defined by the sender or by audio tags',
    },
    file_name: fileNameField,
    mime_type: mimeTypeField,
  },
} satisfies TQoreResponseType;

export const TelegramDocumentType = {
  type: 'hash',
  fields: {
    ...TelegramFileBaseFields,
    file_name: fileNameField,
    mime_type: mimeTypeField,
  },
} satisfies TQoreResponseType;

export const TelegramVideoType = {
  type: 'hash',
  fields: {
    ...TelegramFileBaseFields,
    width: {
      type: 'integer',
      short_desc: 'Video width in pixels',
    },
    height: {
      type: 'integer',
      short_desc: 'Video height in pixels',
    },
    duration: durationField,
    file_name: fileNameField,
    mime_type: mimeTypeField,
  },
} satisfies TQoreResponseType;

export const TelegramVideoNoteType = {
  type: 'hash',
  fields: {
    ...TelegramFileBaseFields,
    length: {
      type: 'integer',
      short_desc: 'Video width and height (diameter of the video message) in pixels',
    },
    duration: durationField,
  },
} satisfies TQoreResponseType;

/**
 * Optional media fields of a Telegram message; each one is only present when the message
 * carries that kind of media, so none of them is declared as required
 */
export const TelegramMessageMediaFields = {
  caption: {
    type: 'string',
    short_desc: 'Caption of the media; only present for media messages with a caption',
  },
  photo: {
    type: TelegramPhotoListType,
    short_desc:
      'Available sizes of the photo, smallest first; only present for photo messages. ' +
      'Use the file_id of the last element with the get_file action to download the largest size',
  },
  voice: {
    type: TelegramVoiceType,
    short_desc: 'Voice message; only present for voice messages',
  },
  audio: {
    type: TelegramAudioType,
    short_desc: 'Audio file; only present for audio messages',
  },
  document: {
    type: TelegramDocumentType,
    short_desc: 'General file; only present for document messages',
  },
  video: {
    type: TelegramVideoType,
    short_desc: 'Video; only present for video messages',
  },
  video_note: {
    type: TelegramVideoNoteType,
    short_desc: 'Video note (round video message); only present for video note messages',
  },
} satisfies Record<string, TQoreAppActionOption>;
