import { createAction, Property } from 'core/framework';
import { httpClient, HttpMethod, AuthenticationType } from 'core/common';
import { dropboxAuth } from '../../';
import { IActionResponse } from 'global/models/actions';

const deleteFolderResponseTime = {
  type: 'hash',
  fields: {
    metadata: {
      display_name: 'Metadata',
      desc: 'The metadata of the folder',
      short_desc: 'The metadata of the folder',
      type: 'hash',
      fields: {
        name: {
          display_name: 'Name',
          desc: 'The name of the folder',
          short_desc: 'The name of the folder',
          type: 'string',
          example_value: 'test',
        },
        path_lower: {
          display_name: 'Path Lower',
          desc: 'The path of the folder',
          short_desc: 'The path of the folder',
          type: 'string',
          example_value: '/test',
        },
        path_display: {
          display_name: 'Path Display',
          desc: 'The path of the folder',
          short_desc: 'The path of the folder',
          type: 'string',
          example_value: '/test',
        },
        id: {
          display_name: 'Id',
          desc: 'The id of the folder',
          short_desc: 'The id of the folder',
          type: 'string',
          example_value: 'id:123',
        },
      },
    },
  },
} satisfies IActionResponse;

export const dropboxDeleteFolder = createAction({
  auth: dropboxAuth,
  name: 'delete_dropbox_folder',
  description: 'Delete a folder',
  displayName: 'Delete folder',
  responseType: deleteFolderResponseTime,
  props: {
    path: Property.ShortText({
      displayName: 'Path',
      description: 'The path of the folder to be deleted (e.g. /folder1)',
      required: true,
    }),
  },
  async run(context) {
    const params = {
      path: context.propsValue.path,
    };
    const result = await httpClient.sendRequest({
      method: HttpMethod.POST,
      url: `https://api.dropboxapi.com/2/files/delete_v2`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: params,
      authentication: {
        type: AuthenticationType.BEARER_TOKEN,
        token: context.auth.access_token,
      },
    });

    return result.body;
  },
});
