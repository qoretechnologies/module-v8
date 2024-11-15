import { createAction, Property } from 'core/framework';
import { httpClient, HttpMethod, AuthenticationType } from 'core/common';
import { dropboxAuth } from '../../';
import { IActionResponse } from '../../../../global/models/actions';

const dropBoxUploadFileResponseType = {
  type: 'hash',
  fields: {
    name: {
      display_name: 'Name',
      desc: 'Name of the file',
      short_desc: 'Name of the file',
      type: 'string',
      example_value: 'file.txt',
    },
    path_lower: {
      display_name: 'Path Lower',
      desc: 'The path of the file',
      short_desc: 'The path of the file',
      type: 'string',
      example_value: '/file.txt',
    },
    path_display: {
      display_name: 'Path Display',
      desc: 'The path of the file',
      short_desc: 'The path of the file',
      type: 'string',
      example_value: '/file.txt',
    },
    id: {
      display_name: 'Id',
      desc: 'The id of the file',
      short_desc: 'The id of the file',
      type: 'string',
      example_value: 'id:123',
    },
    client_modified: {
      display_name: 'Client Modified',
      desc: 'The date and time this file was last modified by the client',
      short_desc: 'The date and time this file was last modified by the client',
      type: 'string',
      example_value: '2015-05-12T15:50:38Z',
    },
    server_modified: {
      display_name: 'Server Modified',
      desc: 'The date and time this file was last modified by the server',
      short_desc: 'The date and time this file was last modified by the server',
      type: 'string',
      example_value: '2015-05-12T15:50:38Z',
    },
    rev: {
      display_name: 'Rev',
      desc: 'A unique identifier for the current revision of a file',
      short_desc: 'A unique identifier for the current revision of a file',
      type: 'string',
      example_value: '38af1b183490',
    },
    size: {
      display_name: 'Size',
      desc: 'The file size in bytes',
      short_desc: 'The file size in bytes',
      type: 'integer',
      example_value: 123,
    },
    content_hash: {
      display_name: 'Content Hash',
      desc: 'A hash of the contents of the file',
      short_desc: 'A hash of the contents of the file',
      type: 'string',
      example_value: '599d710b1e323',
    },
    is_downloadable: {
      display_name: 'Is Downloadable',
      desc: 'Whether the file can be downloaded',
      short_desc: 'Whether the file can be downloaded',
      type: 'boolean',
      example_value: true,
    },
  },
} satisfies IActionResponse;

export const dropboxUploadFile = createAction({
  auth: dropboxAuth,
  name: 'upload_dropbox_file',
  description: 'Upload a file',
  displayName: 'Upload file',
  responseType: dropBoxUploadFileResponseType,
  props: {
    path: Property.ShortText({
      displayName: 'Path',
      description: 'The path where the file should be saved (e.g. /folder1/file.txt)',
      required: true,
    }),
    file: Property.File({
      displayName: 'File',
      description: `The file URL or base64 to upload (e.g 'data:text/plain;base64,SGVsbG8gV29ybGQh')`,
      required: true,
    }),
    autorename: Property.Checkbox({
      displayName: 'Auto Rename',
      description:
        "If there's a conflict, as determined by mode, have the Dropbox server try to autorename the file to avoid conflict.",
      defaultValue: false,
      required: false,
    }),
    mute: Property.Checkbox({
      displayName: 'Mute',
      description:
        "Normally, users are made aware of any file modifications in their Dropbox account via notifications in the client software. If true, this tells the clients that this modification shouldn't result in a user notification.",
      required: false,
    }),
    strict_conflict: Property.Checkbox({
      displayName: 'Strict conflict',
      description:
        'Be more strict about how each WriteMode detects conflict. For example, always return a conflict error when mode = WriteMode.update and the given "rev" doesn\'t match the existing file\'s "rev", even if the existing file has been deleted.',
      required: false,
    }),
  },
  async run(context) {
    const fileData = context.propsValue.file;

    const params = {
      autorename: context.propsValue.autorename,
      path: context.propsValue.path,
      mode: 'add',
      mute: context.propsValue.mute,
      strict_conflict: context.propsValue.strict_conflict,
    };

    const fileBuffer = Buffer.from(fileData.base64, 'base64');

    const result = await httpClient.sendRequest({
      method: HttpMethod.POST,
      url: `https://content.dropboxapi.com/2/files/upload`,
      body: fileBuffer,
      headers: {
        'Dropbox-API-Arg': JSON.stringify(params),
        'Content-Type': 'application/octet-stream',
      },
      authentication: {
        type: AuthenticationType.BEARER_TOKEN,
        token: context.auth.access_token,
      },
    });

    return result.body;
  },
});
