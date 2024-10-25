import { WebClient } from '@slack/web-api';
import { createAction, Property } from 'core/framework';
import { IActionResponse } from 'global/models/actions';
import { slackAuth } from '../../index';
import { slackChannel } from '../common/props';

const uploadFileResponseType: IActionResponse = {
  ok: {
    type: 'boolean',
    name: 'ok',
    display_name: 'Success',
    short_desc: 'Indicates if the file was uploaded successfully',
    desc: 'Indicates if the file was uploaded successfully',
    example_value: true,
  },
  files: {
    name: 'files',
    display_name: 'files',
    short_desc: 'The uploaded files',
    desc: 'The uploaded files',
    type: 'list',
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
};

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
