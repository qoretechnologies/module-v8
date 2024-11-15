import { createAction, Property } from 'core/framework';
import { httpClient, HttpMethod, AuthenticationType } from 'core/common';
import { dropboxAuth } from '../../';
import { IActionResponse } from '../../../../global/models/actions';

const dropboxDeleteFileResponseType = {
  type: 'hash',
  fields: {
    metadata: {
      display_name: 'Metadata',
      desc: 'The metadata of the file',
      short_desc: 'The metadata of the file',
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
          type: 'number',
          example_value: 123,
        },
        is_downloadable: {
          display_name: 'Is Downloadable',
          desc: 'Whether the file can be downloaded',
          short_desc: 'Whether the file can be downloaded',
          type: 'boolean',
          example_value: true,
        },
        content_hash: {
          display_name: 'Content Hash',
          desc: 'A hash of the file content',
          short_desc: 'A hash of the file content',
          type: 'string',
          example_value: 'hash:123',
        },
      },
    },
  },
} satisfies IActionResponse;

export const dropboxDeleteFile = createAction({
  auth: dropboxAuth,
  name: 'delete_dropbox_file',
  description: 'Delete a file',
  displayName: 'Delete file',
  responseType: dropboxDeleteFileResponseType,
  props: {
    path: Property.ShortText({
      displayName: 'Path',
      description: 'The path of the file to be deleted (e.g. /folder1/file.txt)',
      required: true,
    }),
  },
  async run(context) {
    // const params = {
    //   path: context.propsValue.path,
    // };

    const result = await httpClient.sendRequest({
      method: HttpMethod.POST,
      url: `https://api.dropboxapi.com/2/files/delete_v2`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: { path: context.propsValue.path },
      authentication: {
        type: AuthenticationType.BEARER_TOKEN,
        token: context.auth.access_token,
      },
    });

    return result.body;
  },
});
