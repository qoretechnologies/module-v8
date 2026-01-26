import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { BREVO_APP_NAME, BrevoError, extractBrevoError } from '../constants';
import { createBrevoClient } from '../helpers/constants';
import { getBrevoFolderAllowedValues } from '../helpers/get-folder-allowed-values';

const action = 'create_list';

const options = {
  name: {
    type: 'string',
    required: true,
  },
  folderId: {
    type: 'number',
    get_allowed_values: getBrevoFolderAllowedValues,
    required: true,
  },
} satisfies TQoreOptions;

const createList = QoreAppCreator.createLocalizedAction<typeof options>({
  app: BREVO_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, name, folderId } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['name', 'folderId'],
      connectionFields: ['token'],
      ErrorClass: BrevoError,
    });

    const client = createBrevoClient(token);

    try {
      const response = await client.contactsClient.createList({
        name,
        folderId,
      });

      return response.body;
    } catch (error) {
      throw new BrevoError(`Failed to ${humanizeNameTitle(action)}: ${extractBrevoError(error)}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'number' },
    },
  },
});

export default createList;
