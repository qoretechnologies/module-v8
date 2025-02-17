import { AuthenticationType, httpClient, HttpMethod, HttpRequest } from 'core/common';
import { createAction, Property } from 'core/framework';
import { dropboxAuth } from '../../';
import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

const createFolderResponseTime = {
  type: 'hash',
  fields: {
    metadata: {
      display_name: 'Metadata',
      desc: 'The metadata of the folder',
      short_desc: 'The metadata of the folder',
      type: {
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
  },
} satisfies TQoreResponseType;

export const dropboxCreateNewFolder = createAction({
  auth: dropboxAuth,
  name: 'create_new_dropbox_folder',
  description: 'Create a new empty folder',
  displayName: 'Create New Folder',
  responseType: createFolderResponseTime,
  props: {
    path: Property.ShortText({
      displayName: 'Path',
      description: 'The path of the new folder e.g. /Homework/math',
      required: true,
    }),
    autorename: Property.Checkbox({
      displayName: 'Auto Rename',
      description:
        "If there's a conflict, have the Dropbox server try to autorename the folder to avoid the conflict. The default for this field is False.",
      required: false,
    }),
  },
  async run(context) {
    const body = {
      autorename: context.propsValue.autorename ? true : false,
      path: context.propsValue.path,
    };

    const request: HttpRequest = {
      method: HttpMethod.POST,
      url: `https://api.dropboxapi.com/2/files/create_folder_v2`,
      body,
      authentication: {
        type: AuthenticationType.BEARER_TOKEN,
        token: context.auth.access_token,
      },
    };

    const result = await httpClient.sendRequest(request);
    console.debug('Folder creation response', result);

    if (result.status == 200) {
      return result.body;
    } else {
      return result;
    }
  },
});
