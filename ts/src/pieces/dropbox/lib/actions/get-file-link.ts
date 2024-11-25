import { AuthenticationType, httpClient, HttpMethod } from 'core/common';
import { createAction, Property } from 'core/framework';
import { dropboxAuth } from '../..';
import { TQoreResponseType } from '../../../../global/models/qore';

const dropboxGetFileLinkResponseType = {
  type: 'hash',
  fields: {
    link: {
      display_name: 'Link',
      desc: 'The temporary link of the file',
      short_desc: 'The temporary link of the file',
      type: 'string',
      example_value: 'https://www.dropbox.com/s/123/test.txt?dl=0',
    },
    metadata: {
      display_name: 'Metadata',
      desc: 'The metadata of the file',
      short_desc: 'The metadata of the file',
      type: {
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
            desc: 'The size of the file in bytes',
            short_desc: 'The size of the file in bytes',
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
        },
      },
    },
  },
} satisfies TQoreResponseType;

export const dropboxGetFileLink = createAction({
  auth: dropboxAuth,
  name: 'get_dropbox_file_link',
  description: 'Get a temporary file link',
  displayName: 'Get temporary file link',
  responseType: dropboxGetFileLinkResponseType,
  props: {
    path: Property.ShortText({
      displayName: 'Path',
      description: 'The path of the file (e.g. /folder1/file.txt)',
      required: true,
    }),
  },
  async run(context) {
    // const params = {
    //   path: context.propsValue.path,
    // };

    const result = await httpClient.sendRequest({
      method: HttpMethod.POST,
      url: `https://api.dropboxapi.com/2/files/get_temporary_link`,
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
