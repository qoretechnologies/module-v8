import { AuthenticationType, httpClient, HttpMethod } from 'core/common';
import { createAction, Property } from 'core/framework';
import { dropboxAuth } from '../../';
import { TQoreResponseType } from '../../../../global/models/qore';

const copyFileResponseType = {
  type: 'hash',
  fields: {
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
        },
      },
    },
  },
} satisfies TQoreResponseType;

export const dropboxCopyFolder = createAction({
  auth: dropboxAuth,
  name: 'copy_dropbox_folder',
  description: 'Copy a folder',
  displayName: 'Copy folder',
  responseType: copyFileResponseType,
  props: {
    from_path: Property.ShortText({
      displayName: 'From Path',
      description: 'The source path of the folder (e.g. /folder1/sourceFolder)',
      required: true,
    }),
    to_path: Property.ShortText({
      displayName: 'To Path',
      description: 'The destination path for the copied folder (e.g. /folder2/destinationFolder)',
      required: true,
    }),
    autorename: Property.Checkbox({
      displayName: 'Auto Rename',
      description:
        "If there's a conflict, have the Dropbox server try to autorename the folder to avoid conflict.",
      defaultValue: false,
      required: false,
    }),
    allow_ownership_transfer: Property.Checkbox({
      displayName: 'Allow Ownership Transfer',
      description: 'Allows copy by owner even if it would result in an ownership transfer.',
      defaultValue: false,
      required: false,
    }),
  },
  async run(context) {
    const params = {
      from_path: context.propsValue.from_path,
      to_path: context.propsValue.to_path,
      autorename: context.propsValue.autorename,
      allow_ownership_transfer: context.propsValue.allow_ownership_transfer,
    };

    const result = await httpClient.sendRequest({
      method: HttpMethod.POST,
      url: `https://api.dropboxapi.com/2/files/copy_v2`,
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
