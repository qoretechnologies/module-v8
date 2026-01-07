import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { dropboxClient } from '../client';
import { DROPBOX_APP_NAME, DropboxError } from '../constants';
import { getDropboxFileAllowedValues } from '../helpers/get-file-allowed-values';
import { DropboxFileMetadataResponseType } from '../response-types';

const action = 'copy_file';

const options = {
  fromPath: {
    type: 'string',
    required: true,
    get_allowed_values: getDropboxFileAllowedValues,
  },
  toPath: {
    type: 'string',
    required: true,
  },
  autorename: {
    type: 'bool',
    required: false,
    default_value: false,
  },
  allowOwnershipTransfer: {
    type: 'bool',
    required: false,
    default_value: false,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'hash',
  fields: {
    metadata: { type: DropboxFileMetadataResponseType },
  },
} as const;

const CopyFile = QoreAppCreator.createLocalizedAction<typeof options>({
  app: DROPBOX_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token, fromPath, toPath } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['fromPath', 'toPath'],
      connectionFields: ['token'],
      ErrorClass: DropboxError,
    });

    const autorename = obj?.autorename ?? false;
    const allowOwnershipTransfer = obj?.allowOwnershipTransfer ?? false;

    try {
      const result = await dropboxClient.post<Record<string, any>>(
        'files/copy_v2',
        {
          from_path: fromPath,
          to_path: toPath,
          autorename,
          allow_ownership_transfer: allowOwnershipTransfer,
        },
        { token }
      );

      return result;
    } catch (error) {
      throw new DropboxError(`Failed to copy file: ${error.message || error}`);
    }
  },
});

export default CopyFile;
