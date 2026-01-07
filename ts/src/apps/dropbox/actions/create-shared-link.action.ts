import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { dropboxClient } from '../client';
import { DROPBOX_APP_NAME, DropboxError } from '../constants';
import { getDropboxFileAllowedValues } from '../helpers/get-file-allowed-values';
import { DropboxSharedLinkResponseType } from '../response-types';

const action = 'create_shared_link';

const options = {
  path: {
    type: 'string',
    required: true,
    get_allowed_values: getDropboxFileAllowedValues,
  },
  requested_visibility: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: 'public', display_name: 'Public' },
      { value: 'team_only', display_name: 'Team Only' },
      { value: 'password', display_name: 'Password Protected' },
    ],
  },
  expires: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const CreateSharedLink = QoreAppCreator.createLocalizedAction<typeof options>({
  app: DROPBOX_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: DropboxSharedLinkResponseType,
  api_function: async (obj, _opts, context) => {
    const { token, path } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['path'],
      connectionFields: ['token'],
      ErrorClass: DropboxError,
    });

    const settings: Record<string, any> = {};

    if (obj?.requested_visibility) {
      settings.requested_visibility = obj.requested_visibility;
    }

    if (obj?.expires) {
      settings.expires = obj.expires;
    }

    try {
      const result = await dropboxClient.post<Record<string, any>>(
        'sharing/create_shared_link_with_settings',
        {
          path,
          settings: Object.keys(settings).length > 0 ? settings : undefined,
        },
        { token }
      );

      return result;
    } catch (error) {
      throw new DropboxError(`Failed to create shared link: ${error.message || error}`);
    }
  },
});

export default CreateSharedLink;
