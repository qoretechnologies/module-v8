import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { DROPBOX_API_URL, DROPBOX_APP_NAME, DropboxError } from '../constants';

const action = 'revoke_shared_link';

const options = {
  url: {
    type: 'string',
    required: true,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'hash',
  fields: {
    success: {
      type: 'bool',
      short_desc: 'Whether the link was successfully revoked',
    },
  },
} satisfies TQoreResponseType;

const RevokeSharedLink = QoreAppCreator.createLocalizedAction<typeof options>({
  app: DROPBOX_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token, url } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['url'],
      connectionFields: ['token'],
      ErrorClass: DropboxError,
    });

    try {
      // This endpoint returns an empty response on success
      const response = await fetch(`${DROPBOX_API_URL}/2/sharing/revoke_shared_link`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      return { success: true };
    } catch (error) {
      throw new DropboxError(`Failed to revoke shared link: ${error.message || error}`);
    }
  },
});

export default RevokeSharedLink;
