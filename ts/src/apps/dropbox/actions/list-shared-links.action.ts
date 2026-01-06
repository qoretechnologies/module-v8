import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { dropboxClient } from '../client';
import { DROPBOX_APP_NAME, DropboxError } from '../constants';
import { getDropboxFileAllowedValues } from '../helpers/get-file-allowed-values';
import { DropboxListSharedLinksResponseType } from '../response-types';

const action = 'list_shared_links';

const options = {
  path: {
    type: 'string',
    required: false,
    get_allowed_values: getDropboxFileAllowedValues,
  },
  direct_only: {
    type: 'bool',
    required: false,
    default_value: false,
  },
} satisfies TQoreOptions;

const ListSharedLinks = QoreAppCreator.createLocalizedAction<typeof options>({
  app: DROPBOX_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: DropboxListSharedLinksResponseType,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: DropboxError,
    });

    const path = obj?.path || undefined;
    const direct_only = obj?.direct_only ?? false;

    try {
      const result = await dropboxClient.post<Record<string, any>>(
        'sharing/list_shared_links',
        {
          path,
          direct_only,
        },
        { token }
      );

      return result;
    } catch (error) {
      throw new DropboxError(`Failed to list shared links: ${error.message || error}`);
    }
  },
});

export default ListSharedLinks;
