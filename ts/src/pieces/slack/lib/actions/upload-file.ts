import { WebClient } from '@slack/web-api';
import { createAction, Property } from 'core/framework';
import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';
import { slackAuth } from '../../index';
import { slackChannel } from '../common/props';

const uploadFileResponseType = {
  type: 'hash',
  fields: {
    ok: {
      type: 'boolean',
      display_name: 'Success',
      short_desc: 'Indicates if the file was uploaded successfully',
      desc: 'Indicates if the file was uploaded successfully',
      example_value: true,
    },
    files: {
      display_name: 'files',
      short_desc: 'The uploaded files',
      desc: 'The uploaded files',
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            ok: {
              type: 'boolean',
            },
            files: {
              type: {
                type: 'list',
                element_type: {
                  type: 'hash',
                  fields: {
                    id: {
                      type: 'string',
                      example_value: 'F1234567890',
                    },
                    created: {
                      type: 'integer',
                      example_value: 1234567890,
                    },
                    timestamp: {
                      type: 'integer',
                      example_value: 1234567890,
                    },
                    name: {
                      type: 'string',
                      example_value: 'example.txt',
                    },
                    title: {
                      type: 'string',
                      example_value: 'Example',
                    },
                    mimetype: {
                      type: 'string',
                      example_value: 'text/plain',
                    },
                    filetype: {
                      type: 'string',
                      example_value: 'text',
                    },
                    pretty_type: {
                      type: 'string',
                      example_value: 'Text',
                    },
                    user: {
                      type: 'string',
                      example_value: 'U1234567890',
                    },
                    editable: {
                      type: 'boolean',
                    },
                    size: {
                      type: 'integer',
                      example_value: 12345,
                    },
                    mode: {
                      type: 'string',
                      example_value: 'snippet',
                    },
                    is_external: {
                      type: 'boolean',
                    },
                    external_type: {
                      type: 'string',
                    },
                    is_public: {
                      type: 'boolean',
                    },
                    public_url_shared: {
                      type: 'boolean',
                    },
                    display_as_bot: {
                      type: 'boolean',
                    },
                    username: {
                      type: 'string',
                    },
                    url_private: {
                      type: 'string',
                      example_value:
                        'https://files.slack.com/files-pri/T12345678-F12345678/example.txt',
                    },
                    url_private_download: {
                      type: 'string',
                      example_value:
                        'https://files.slack.com/files-pri/T12345678-F12345678/download/example.txt',
                    },
                    permalink: {
                      type: 'string',
                      example_value:
                        'https://your-workspace.slack.com/files/U12345678/F12345678/example.txt',
                    },
                    permalink_public: {
                      type: 'string',
                      example_value:
                        'https://your-workspace.slack.com/files-pri/T12345678-F12345678/example.txt',
                    },
                    is_starred: {
                      type: 'boolean',
                    },
                  },
                },
              },
            },
          },
        },
      },
      example_value: [
        {
          ok: true,
          files: [
            {
              id: 'F1234567890',
              created: 1234567890,
              timestamp: 1234567890,
              name: 'example.txt',
              title: 'Example',
              mimetype: 'text/plain',
              filetype: 'text',
              pretty_type: 'Text',
              user: 'U1234567890',
              editable: true,
              size: 12345,
              mode: 'snippet',
              is_external: false,
              external_type: '',
              is_public: true,
              public_url_shared: true,
              display_as_bot: false,
              username: '',
              url_private: 'https://files.slack.com/files-pri/T12345678-F12345678/example.txt',
              url_private_download:
                'https://files.slack.com/files-pri/T12345678-F12345678/download/example.txt',
              permalink: 'https://your-workspace.slack.com/files/U12345678/F12345678/example.txt',
              permalink_public:
                'https://your-workspace.slack.com/files-pri/T12345678-F12345678/example.txt',
              is_starred: false,
            },
          ],
        },
      ],
    },
  },
} satisfies TQoreResponseType;

export const uploadFile = createAction({
  auth: slackAuth,
  name: 'uploadFile',
  displayName: 'Upload file',
  description: 'Upload file without sharing it to a channel or user',
  props: {
    file: Property.File({
      displayName: `Attachment - file url or base64 string (e.g 'data:text/plain;base64,SGVsbG8gV29ybGQh')`,
      required: true,
    }),
    filename: Property.ShortText({
      displayName: 'Filename',
      required: false,
    }),
    comment: Property.LongText({
      displayName: 'Comment',
      required: false,
    }),
    channel: slackChannel(true),
  },
  responseType: uploadFileResponseType,
  async run(context) {
    const token = context.auth.access_token;
    const { file, comment, filename, channel } = context.propsValue;
    const client = new WebClient(token);

    return await client.files.uploadV2({
      file: file.data,
      filename: filename || file.filename,
      channel_id: channel,
      initial_comment: comment,
    });
  },
});
