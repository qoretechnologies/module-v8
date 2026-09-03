// Copyright 2026 Qore Technologies, s.r.o.
import {
  EQoreAppActionCode,
  IQoreAppActionWithFunction,
  TQoreAppActionFunctionContext,
  TQoreAppActionOption,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { configDotenv } from 'dotenv';
import {
  DeleteTelegramMessage,
  GetTelegramFile,
  SendTelegramPhoto,
  SendTelegramVoice,
} from '../apps/telegram/actions';
import { TELEGRAM_API_URL, TELEGRAM_APP_NAME, TelegramError } from '../apps/telegram/constants';
import { trimToDeclaredFields } from '../apps/telegram/helpers/event-fields';
import {
  buildTelegramFileUrl,
  describeTelegramFileError,
  redactBotToken,
  resolveTelegramMimeType,
  TELEGRAM_DEFAULT_MIME_TYPE,
  TELEGRAM_GET_FILE_SIZE_LIMIT,
} from '../apps/telegram/helpers/file';
import {
  TelegramAudioType,
  TelegramDocumentType,
  TelegramFileBaseFields,
  TelegramMessageMediaFields,
  TelegramPhotoListType,
  TelegramPhotoSizeType,
  TelegramVideoNoteType,
  TelegramVideoType,
  TelegramVoiceType,
} from '../apps/telegram/response-types';
import { NewTelegramMessage } from '../apps/telegram/triggers';
import TelegramAppEn from '../i18n/en/apps/Telegram';
import { Debugger, DebugLevels } from '../utils/Debugger';
import { skipOnTransientError } from './utils';

Debugger.level = DebugLevels.Verbose;
configDotenv({ path: '.env' });

// 20x20 transparent PNG, the same fixture the Typeform tests upload
const TEST_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAIAAAAC64paAAAAG0lEQVR42mOccuMbA7mAcVTzqOZRzaOaB1YzABKjL70rq/b4AAAAAElFTkSuQmCC';

const FILE_BASE_FIELD_NAMES = ['file_id', 'file_unique_id', 'file_size'];
const MEDIA_FIELD_NAMES = ['caption', 'photo', 'voice', 'audio', 'document', 'video', 'video_note'];
const BASE_EVENT_FIELD_NAMES = ['message_id', 'from', 'chat', 'date', 'text', 'entities'];

const getFileAction = GetTelegramFile as IQoreAppActionWithFunction;
const sendPhotoAction = SendTelegramPhoto as IQoreAppActionWithFunction;
const sendVoiceAction = SendTelegramVoice as IQoreAppActionWithFunction;
const deleteMessageAction = DeleteTelegramMessage as IQoreAppActionWithFunction;

type TNewMessageContext = Parameters<
  NonNullable<typeof NewTelegramMessage.get_example_event_data>
>[0];

const getEventInfoFields = (): Record<string, TQoreAppActionOption> => {
  const eventType = NewTelegramMessage.event_info.type;

  if (!('fields' in eventType) || !eventType.fields) {
    throw new Error('The new_message event_info does not declare hash fields');
  }

  return eventType.fields;
};

const getExampleEventData = (context: TNewMessageContext): Promise<Record<string, unknown>> => {
  if (!NewTelegramMessage.get_example_event_data) {
    throw new Error('The new_message trigger does not have get_example_event_data');
  }

  return Promise.resolve(NewTelegramMessage.get_example_event_data(context));
};

const expectExactKeys = (
  actual: Record<string, unknown>,
  declared: Record<string, unknown>,
  path: string
): void => {
  const actualKeys = Object.keys(actual);
  const declaredKeys = Object.keys(declared);

  const missingFields = declaredKeys.filter((field) => !actualKeys.includes(field));
  const extraFields = actualKeys.filter((field) => !declaredKeys.includes(field));

  expect({ path, missingFields }).toEqual({ path, missingFields: [] });
  expect({ path, extraFields }).toEqual({ path, extraFields: [] });
};

const expectMediaObjectsMatchDeclaredTypes = (exampleData: Record<string, unknown>): void => {
  const photo = exampleData.photo as Record<string, unknown>[];

  expect(Array.isArray(photo)).toBe(true);
  expect(photo.length).toBeGreaterThan(0);
  photo.forEach((size, index) =>
    expectExactKeys(size, TelegramPhotoSizeType.fields, `photo[${index}]`)
  );

  expectExactKeys(exampleData.voice as Record<string, unknown>, TelegramVoiceType.fields, 'voice');
  expectExactKeys(exampleData.audio as Record<string, unknown>, TelegramAudioType.fields, 'audio');
  expectExactKeys(
    exampleData.document as Record<string, unknown>,
    TelegramDocumentType.fields,
    'document'
  );
  expectExactKeys(exampleData.video as Record<string, unknown>, TelegramVideoType.fields, 'video');
  expectExactKeys(
    exampleData.video_note as Record<string, unknown>,
    TelegramVideoNoteType.fields,
    'video_note'
  );
};

describe('Telegram', () => {
  const baseContext: TQoreAppActionFunctionContext = {
    conn_opts: {
      token: '',
    },
  };

  let hasCredentials = false;
  let chatId = 0;
  const createdMessageIds: number[] = [];

  beforeAll(() => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chat = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chat) {
      console.warn(
        'Skipping Telegram live tests: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID environment ' +
          'variables are required.'
      );

      return;
    }

    const parsedChatId = Number(chat);

    if (!Number.isFinite(parsedChatId)) {
      console.warn(`Skipping Telegram live tests: TELEGRAM_CHAT_ID "${chat}" is not a number.`);

      return;
    }

    baseContext.conn_opts = { token };
    chatId = parsedChatId;
    hasCredentials = true;
  });

  afterAll(async () => {
    if (!hasCredentials) return;

    for (const message_id of createdMessageIds) {
      try {
        await deleteMessageAction.api_function(
          { chat: chatId, message_id },
          undefined,
          baseContext
        );
      } catch (error) {
        console.warn(`Failed to delete Telegram test message ${message_id}: ${error}`);
      }
    }
  });

  // ─── Offline: get_file action shape ───────────────────────────────────

  describe('get_file action definition', () => {
    it('Should be registered as a Telegram action', () => {
      expect(GetTelegramFile.app).toBe(TELEGRAM_APP_NAME);
      expect(GetTelegramFile.action).toBe('get_file');
      expect(GetTelegramFile.action_code).toBe(EQoreAppActionCode.ACTION);
      expect(typeof getFileAction.api_function).toBe('function');
    });

    it('Should require the file_id option', () => {
      const options: TQoreOptions = getFileAction.options ?? {};

      expect(Object.keys(options)).toEqual(['file_id']);
      expect(options.file_id.type).toBe('string');
      expect(options.file_id.required).toBe(true);
    });

    it('Should declare a platform file response with Telegram file metadata', () => {
      const responseType = getFileAction.response_type;

      if (typeof responseType !== 'object' || !('fields' in responseType) || !responseType.fields) {
        throw new Error('get_file response_type does not declare hash fields');
      }

      expect(responseType.type).toBe('hash');
      expect(Object.keys(responseType.fields)).toEqual([
        'name',
        'mime_type',
        'content',
        'file_id',
        'file_unique_id',
        'file_size',
        'file_path',
      ]);
      expect(responseType.fields.name.type).toBe('string');
      expect(responseType.fields.mime_type.type).toBe('string');
      expect(responseType.fields.content.type).toBe('base64binary');
      expect(responseType.fields.file_size.type).toBe('integer');
    });

    it('Should fail without a bot token before contacting Telegram', async () => {
      await expect(
        getFileAction.api_function({ file_id: 'some-file-id' }, undefined, {
          conn_opts: { token: '' },
        })
      ).rejects.toThrow(TelegramError);

      await expect(
        getFileAction.api_function({ file_id: 'some-file-id' }, undefined, {
          conn_opts: { token: '' },
        })
      ).rejects.toThrow(/token/);
    });

    it('Should fail without a file_id before contacting Telegram', async () => {
      const contextWithToken: TQoreAppActionFunctionContext = { conn_opts: { token: '123:ABC' } };

      await expect(getFileAction.api_function({}, undefined, contextWithToken)).rejects.toThrow(
        TelegramError
      );
      await expect(
        getFileAction.api_function({ file_id: '' }, undefined, contextWithToken)
      ).rejects.toThrow(/file_id/);
    });
  });

  // ─── Offline: send_voice action shape ─────────────────────────────────

  describe('send_voice action definition', () => {
    it('Should be registered as a Telegram action', () => {
      expect(SendTelegramVoice.app).toBe(TELEGRAM_APP_NAME);
      expect(SendTelegramVoice.action).toBe('send_voice');
      expect(SendTelegramVoice.action_code).toBe(EQoreAppActionCode.ACTION);
      expect(typeof sendVoiceAction.api_function).toBe('function');
    });

    it('Should require the chat and a voice file', () => {
      const options: TQoreOptions = sendVoiceAction.options ?? {};

      expect(Object.keys(options)).toEqual([
        'chat',
        'voice',
        'caption_format',
        'caption',
        'duration',
        'protect_content',
        'disable_notification',
      ]);
      expect(options.chat.required).toBe(true);
      expect(options.voice.type).toBe('file');
      expect(options.voice.required).toBe(true);
      expect(options.duration.type).toBe('integer');
      expect(options.duration.required).toBe(false);
    });

    it('Should declare the sent voice message in the response', () => {
      const responseType = sendVoiceAction.response_type;

      if (typeof responseType !== 'object' || !('fields' in responseType) || !responseType.fields) {
        throw new Error('send_voice response_type does not declare hash fields');
      }

      expect(responseType.type).toBe('hash');
      expect(Object.keys(responseType.fields)).toEqual([
        'message_id',
        'from',
        'chat',
        'date',
        'voice',
        'caption',
      ]);
      expect(responseType.fields.voice.type).toBe(TelegramVoiceType);
    });

    it('Should fail without a bot token before contacting Telegram', async () => {
      await expect(
        sendVoiceAction.api_function(
          { chat: 1, voice: { name: 'a.ogg', mime_type: 'audio/ogg', content: '' } },
          undefined,
          { conn_opts: { token: '' } }
        )
      ).rejects.toThrow(/token/);
    });

    it('Should fail without a voice file before contacting Telegram', async () => {
      const contextWithToken: TQoreAppActionFunctionContext = { conn_opts: { token: '123:ABC' } };

      await expect(
        sendVoiceAction.api_function({ chat: 1 }, undefined, contextWithToken)
      ).rejects.toThrow(/voice/);
    });

    it('Should localize the send_voice action and all of its options', () => {
      const locale = TelegramAppEn.actions.send_voice;
      const options: TQoreOptions = sendVoiceAction.options ?? {};

      expect(locale.displayName).toBeTruthy();
      expect(locale.shortDesc).toBeTruthy();
      expect(locale.longDesc).toBeTruthy();
      expect(locale.groups).toEqual(['Messaging']);
      expect(Object.keys(locale.options).sort()).toEqual(Object.keys(options).sort());
    });
  });

  // ─── Offline: file helpers ────────────────────────────────────────────

  describe('file helpers', () => {
    it('Should build the download URL from the token and file path', () => {
      expect(buildTelegramFileUrl('123:ABC', 'photos/file_1.jpg')).toBe(
        `${TELEGRAM_API_URL}/file/bot123:ABC/photos/file_1.jpg`
      );
    });

    it('Should prefer a specific Content-Type header', () => {
      expect(resolveTelegramMimeType('image/jpeg', 'photos/file_1.jpg')).toBe('image/jpeg');
      expect(resolveTelegramMimeType('Audio/OGG; codecs=opus', 'voice/file_2.oga')).toBe(
        'audio/ogg'
      );
    });

    it('Should fall back to the file path extension for generic or missing headers', () => {
      expect(resolveTelegramMimeType(TELEGRAM_DEFAULT_MIME_TYPE, 'documents/file_3.pdf')).toBe(
        'application/pdf'
      );
      expect(resolveTelegramMimeType(null, 'voice/file_2.oga')).toBe('audio/ogg');
      expect(resolveTelegramMimeType(undefined, 'videos/file_4.mp4')).toBe('video/mp4');
      expect(resolveTelegramMimeType('', 'photos/file_1.jpg')).toBe('image/jpeg');
    });

    it('Should fall back to application/octet-stream when nothing is known', () => {
      expect(resolveTelegramMimeType(null, 'documents/file_5')).toBe(TELEGRAM_DEFAULT_MIME_TYPE);
      expect(
        resolveTelegramMimeType(TELEGRAM_DEFAULT_MIME_TYPE, 'documents/file_5.unknownext')
      ).toBe(TELEGRAM_DEFAULT_MIME_TYPE);
    });

    it('Should explain the Bot API size limit for "file is too big" errors', () => {
      const description = describeTelegramFileError(
        new Error('ETELEGRAM: 400 Bad Request: file is too big')
      );

      expect(description).toContain('file is too big');
      expect(description).toContain(TELEGRAM_GET_FILE_SIZE_LIMIT);
    });

    it('Should redact the bot token from messages', () => {
      const token = '123456789:ABCdefGHIjklMNOpqrsTUVwxyz';
      const message = `fetch failed for ${buildTelegramFileUrl(token, 'voice/file_1.oga')}`;

      expect(redactBotToken(message, token)).not.toContain(token);
      expect(redactBotToken(message, token)).toContain('/file/bot<bot token>/voice/file_1.oga');
      expect(redactBotToken('no token here', token)).toBe('no token here');
      expect(redactBotToken(message, '')).toBe(message);
    });

    it('Should pass other errors through unchanged', () => {
      expect(
        describeTelegramFileError(new Error('ETELEGRAM: 400 Bad Request: invalid file_id'))
      ).toBe('ETELEGRAM: 400 Bad Request: invalid file_id');
      expect(describeTelegramFileError('plain string failure')).toBe('plain string failure');
      expect(describeTelegramFileError('plain string failure')).not.toContain(
        TELEGRAM_GET_FILE_SIZE_LIMIT
      );
    });
  });

  // ─── Offline: shared media response types ─────────────────────────────

  describe('example event trimming', () => {
    const fields = getEventInfoFields();

    it('Should drop undeclared keys at every level', () => {
      const trimmed = trimToDeclaredFields(
        {
          message_id: 7,
          text: 'hi',
          undeclared_top_level: true,
          document: { file_id: 'd', file_unique_id: 'du', file_size: 3, thumb: { file_id: 't' } },
          entities: [{ offset: 0, length: 2, type: 'bold', url: 'https://example.com' }],
          photo: [{ file_id: 'p', file_unique_id: 'pu', width: 1, height: 1, extra: 'x' }],
        },
        fields
      );

      expect(trimmed).toEqual({
        message_id: 7,
        text: 'hi',
        document: { file_id: 'd', file_unique_id: 'du', file_size: 3 },
        entities: [{ offset: 0, length: 2, type: 'bold' }],
        photo: [{ file_id: 'p', file_unique_id: 'pu', width: 1, height: 1 }],
      });
    });

    it('Should keep absent declared fields absent and reject non-objects', () => {
      expect(trimToDeclaredFields({ message_id: 1 }, fields)).toEqual({ message_id: 1 });
      expect(trimToDeclaredFields(null, fields)).toEqual({});
      expect(trimToDeclaredFields([1, 2], fields)).toEqual({});
    });
  });

  describe('media response types', () => {
    it('Should share the Telegram file base fields', () => {
      expect(Object.keys(TelegramFileBaseFields)).toEqual(FILE_BASE_FIELD_NAMES);

      [
        TelegramPhotoSizeType,
        TelegramVoiceType,
        TelegramAudioType,
        TelegramDocumentType,
        TelegramVideoType,
        TelegramVideoNoteType,
      ].forEach((mediaType) => {
        expect(mediaType.type).toBe('hash');
        FILE_BASE_FIELD_NAMES.forEach((field) => expect(mediaType.fields).toHaveProperty(field));
      });
    });

    it('Should declare the Bot API specific fields of each media type', () => {
      expect(Object.keys(TelegramPhotoSizeType.fields)).toEqual([
        ...FILE_BASE_FIELD_NAMES,
        'width',
        'height',
      ]);
      expect(Object.keys(TelegramVoiceType.fields)).toEqual([
        ...FILE_BASE_FIELD_NAMES,
        'duration',
        'mime_type',
      ]);
      expect(Object.keys(TelegramAudioType.fields)).toEqual([
        ...FILE_BASE_FIELD_NAMES,
        'duration',
        'performer',
        'title',
        'file_name',
        'mime_type',
      ]);
      expect(Object.keys(TelegramDocumentType.fields)).toEqual([
        ...FILE_BASE_FIELD_NAMES,
        'file_name',
        'mime_type',
      ]);
      expect(Object.keys(TelegramVideoType.fields)).toEqual([
        ...FILE_BASE_FIELD_NAMES,
        'width',
        'height',
        'duration',
        'file_name',
        'mime_type',
      ]);
      expect(Object.keys(TelegramVideoNoteType.fields)).toEqual([
        ...FILE_BASE_FIELD_NAMES,
        'length',
        'duration',
      ]);
      expect(TelegramPhotoListType.type).toBe('list');
      expect(TelegramPhotoListType.element_type).toEqual(TelegramPhotoSizeType);
    });

    it('Should not mark media fields as required, so the loader makes them or-nothing types', () => {
      expect(Object.keys(TelegramMessageMediaFields)).toEqual(MEDIA_FIELD_NAMES);

      Object.values(TelegramMessageMediaFields).forEach((field) => {
        expect('required' in field).toBe(false);
      });
    });

    it('Should reuse the photo size list in the send_photo response type', () => {
      const responseType = sendPhotoAction.response_type;

      if (typeof responseType !== 'object' || !('fields' in responseType) || !responseType.fields) {
        throw new Error('send_photo response_type does not declare hash fields');
      }

      expect(responseType.fields.photo.type).toEqual(TelegramPhotoListType);
    });
  });

  // ─── Offline: new_message trigger ─────────────────────────────────────

  describe('new_message trigger definition', () => {
    it('Should be registered as a Telegram event', () => {
      expect(NewTelegramMessage.app).toBe(TELEGRAM_APP_NAME);
      expect(NewTelegramMessage.action).toBe('new_message');
      expect(NewTelegramMessage.action_code).toBe(EQoreAppActionCode.EVENT);
      expect(NewTelegramMessage.event_info.desc).toBeTruthy();
      expect(NewTelegramMessage.event_info.type.type).toBe('hash');
    });

    it('Should declare the base message fields and the media fields', () => {
      const fields = getEventInfoFields();

      expect(Object.keys(fields)).toEqual([...BASE_EVENT_FIELD_NAMES, ...MEDIA_FIELD_NAMES]);
      expect(fields.caption.type).toBe('string');
      expect(fields.photo.type).toEqual(TelegramPhotoListType);
      expect(fields.voice.type).toEqual(TelegramVoiceType);
      expect(fields.audio.type).toEqual(TelegramAudioType);
      expect(fields.document.type).toEqual(TelegramDocumentType);
      expect(fields.video.type).toEqual(TelegramVideoType);
      expect(fields.video_note.type).toEqual(TelegramVideoNoteType);
    });

    it('Should return example data matching event_info schema without credentials', async () => {
      const exampleData = await getExampleEventData({ conn_opts: {} });

      expectExactKeys(exampleData, getEventInfoFields(), 'event');
      expectMediaObjectsMatchDeclaredTypes(exampleData);
    });

    it('Should return a full-shape example with realistic media values', async () => {
      const exampleData = await getExampleEventData({});
      const photo = exampleData.photo as { width: number; height: number; file_id: string }[];
      const largestPhoto = photo.at(-1);

      expect(typeof exampleData.message_id).toBe('number');
      expect(typeof exampleData.date).toBe('number');
      expect(typeof exampleData.caption).toBe('string');
      expect(largestPhoto?.file_id).toBeTruthy();
      expect(largestPhoto?.width).toBeGreaterThan(photo[0].width);
      expect((exampleData.voice as { mime_type: string }).mime_type).toMatch(/^audio\//);
      expect((exampleData.document as { file_name: string }).file_name).toBeTruthy();
      expect((exampleData.video as { duration: number }).duration).toBeGreaterThan(0);
      expect((exampleData.video_note as { length: number }).length).toBeGreaterThan(0);
    });
  });

  // ─── Offline: locale ──────────────────────────────────────────────────

  describe('locale', () => {
    it('Should localize the get_file action and all of its options', () => {
      const actionLocale = TelegramAppEn.actions.get_file;

      expect(actionLocale.displayName).toBe('Get File');
      expect(actionLocale.shortDesc).toBeTruthy();
      expect(actionLocale.longDesc).toBeTruthy();
      expect(actionLocale.groups).toEqual(['Message Management']);

      Object.keys(getFileAction.options ?? {}).forEach((optionName) => {
        const optionLocale = actionLocale.options[optionName as keyof typeof actionLocale.options];

        expect(optionLocale).toBeDefined();
        expect(optionLocale.displayName).toBeTruthy();
        expect(optionLocale.shortDesc).toBeTruthy();
        expect(optionLocale.longDesc).toBeTruthy();
      });
    });

    it('Should explain where the file_id comes from', () => {
      const { longDesc } = TelegramAppEn.actions.get_file.options.file_id;

      [
        'voice.file_id',
        'audio.file_id',
        'document.file_id',
        'video.file_id',
        'video_note.file_id',
      ].forEach((source) => expect(longDesc).toContain(source));
      expect(longDesc).toContain('photo');
      expect(longDesc).toContain('20 MB');
    });
  });

  // ─── Live: requires TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID ───────────

  describe('live Bot API', () => {
    let largestPhotoFileId: string | undefined;

    it(
      'Should send a photo and receive its available sizes',
      skipOnTransientError(async () => {
        if (!hasCredentials) return;

        const result = await sendPhotoAction.api_function(
          {
            chat: chatId,
            photo: { name: 'get-file-test.png', mime_type: 'image/png', content: TEST_PNG_BASE64 },
            caption: 'Telegram get_file integration test',
          },
          undefined,
          baseContext
        );

        expect(result.message_id).toBeDefined();
        expect(Array.isArray(result.photo)).toBe(true);
        expect(result.photo.length).toBeGreaterThan(0);

        createdMessageIds.push(result.message_id);
        largestPhotoFileId = result.photo.at(-1).file_id;

        expect(largestPhotoFileId).toBeTruthy();
      })
    );

    it(
      'Should download the largest photo size with get_file',
      skipOnTransientError(async () => {
        if (!hasCredentials) return;

        expect(largestPhotoFileId).toBeDefined();

        const result = await getFileAction.api_function(
          { file_id: largestPhotoFileId },
          undefined,
          baseContext
        );

        expect(result.file_id).toBe(largestPhotoFileId);
        expect(result.file_unique_id).toBeTruthy();
        expect(result.file_path).toBeTruthy();
        expect(result.name).toBeTruthy();
        expect(result.mime_type.startsWith('image/')).toBe(true);

        const decodedContent = Buffer.from(result.content, 'base64');

        expect(decodedContent.byteLength).toBeGreaterThan(0);
        expect(result.file_size).toBe(decodedContent.byteLength);
      })
    );

    it(
      'Should fail to download a file with an invalid file_id',
      skipOnTransientError(async () => {
        if (!hasCredentials) return;

        await expect(
          getFileAction.api_function(
            { file_id: 'definitely-not-a-file-id' },
            undefined,
            baseContext
          )
        ).rejects.toThrow(TelegramError);
      })
    );

    it(
      'Should send a voice message and download it again with get_file',
      skipOnTransientError(async () => {
        if (!hasCredentials) return;

        // Telegram needs a real OGG/OPUS, MP3, or M4A file; point TELEGRAM_VOICE_FILE at one to run this
        const voicePath = process.env.TELEGRAM_VOICE_FILE;

        if (!voicePath) {
          console.warn('Skipping send_voice live test: TELEGRAM_VOICE_FILE is not set');

          return;
        }

        const { readFileSync } = await import('node:fs');
        const { basename } = await import('node:path');
        const voiceBytes = readFileSync(voicePath);

        const result = await sendVoiceAction.api_function(
          {
            chat: chatId,
            voice: {
              name: basename(voicePath),
              mime_type: resolveTelegramMimeType(null, voicePath),
              content: voiceBytes.toString('base64'),
            },
            caption: 'Telegram send_voice integration test',
          },
          undefined,
          baseContext
        );

        expect(result.message_id).toBeDefined();
        expect(result.voice?.file_id).toBeTruthy();

        createdMessageIds.push(result.message_id);

        const downloaded = await getFileAction.api_function(
          { file_id: result.voice.file_id },
          undefined,
          baseContext
        );

        expect(Buffer.from(downloaded.content, 'base64').byteLength).toBe(voiceBytes.byteLength);
      })
    );

    it(
      'Should return live example event data matching event_info schema',
      skipOnTransientError(async () => {
        if (!hasCredentials) return;

        const exampleData = await getExampleEventData({ ...baseContext, opts: { chat: chatId } });

        expectExactKeys(exampleData, getEventInfoFields(), 'event');
        expectMediaObjectsMatchDeclaredTypes(exampleData);
      })
    );
  });
});
