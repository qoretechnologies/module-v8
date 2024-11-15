import { createAction, Property } from 'core/framework';
import { HttpRequest, HttpMethod, AuthenticationType, httpClient } from 'core/common';
import { dropboxAuth } from '../../';
import { IActionResponse } from '../../../../global/models/actions';

const createTextFileResponseType = {
  type: 'hash',
  fields: {
    name: {
      display_name: 'Name',
      desc: 'The name of the file',
      short_desc: 'The name of the file',
      type: 'string',
      example_value: 'test.txt',
    },
    path_lower: {
      display_name: 'Path Lower',
      desc: 'The path of the file',
      short_desc: 'The path of the file',
      type: 'string',
      example_value: '/test.txt',
    },
    path_display: {
      display_name: 'Path Display',
      desc: 'The path of the file',
      short_desc: 'The path of the file',
      type: 'string',
      example_value: '/test.txt',
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
      example_value: '2021-06-01T12:00:00Z',
    },
    server_modified: {
      display_name: 'Server Modified',
      desc: 'The date and time this file was last modified by the server',
      short_desc: 'The date and time this file was last modified by the server',
      type: 'string',
      example_value: '2021-06-01T12:00:00Z',
    },
    rev: {
      display_name: 'Rev',
      desc: 'A unique identifier for the current revision of a file',
      short_desc: 'A unique identifier for the current revision of a file',
      type: 'string',
      example_value: 'rev:123',
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
      desc: 'A hash of the file content',
      short_desc: 'A hash of the file content',
      type: 'string',
      example_value: 'hash:123',
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

export const dropboxCreateNewTextFile = createAction({
  auth: dropboxAuth,
  name: 'create_new_dropbox_text_file',
  description: 'Create a new text file from text input',
  displayName: 'Create New Text File',
  responseType: createTextFileResponseType,
  props: {
    path: Property.ShortText({
      displayName: 'Path',
      description: 'The path of the new folder e.g. /Homework/math',
      required: true,
    }),
    text: Property.LongText({
      displayName: 'Text',
      description: 'The text to write into the file.',
      required: true,
    }),
    autorename: Property.Checkbox({
      displayName: 'Autorename',
      description:
        "If there's a conflict, have the Dropbox server try to autorename the folder to avoid the conflict. The default for this field is False.",
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
    const params = {
      autorename: context.propsValue.autorename,
      path: context.propsValue.path,
      mode: 'add',
      mute: context.propsValue.mute,
      strict_conflict: context.propsValue.strict_conflict,
    };

    const request: HttpRequest = {
      method: HttpMethod.POST,
      url: `https://content.dropboxapi.com/2/files/upload`,
      body: Buffer.from(context.propsValue.text, 'utf-8'),
      authentication: {
        type: AuthenticationType.BEARER_TOKEN,
        token: context.auth.access_token,
      },
      headers: {
        'Dropbox-API-Arg': JSON.stringify(params),
        'Content-Type': 'application/octet-stream',
      },
    };

    const result = await httpClient.sendRequest(request);
    console.debug('Text file creation response', result);

    if (result.status == 200) {
      return result.body;
    } else {
      return result;
    }
  },
});
