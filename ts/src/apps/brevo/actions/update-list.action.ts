import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { BREVO_APP_NAME, BrevoError, extractBrevoError } from '../constants';
import { createBrevoClient } from '../helpers/constants';
import { getBrevoListAllowedValues } from '../helpers/get-list-allowed-values';

const action = 'update_list';

const options = {
  listId: {
    type: 'number',
    required: true,
    get_allowed_values: getBrevoListAllowedValues,
  },
  name: {
    type: 'string',
    required: false,
  },
  folderId: {
    type: 'number',
    required: false,
  },
} satisfies TQoreOptions;

const updateList = QoreAppCreator.createLocalizedAction<typeof options>({
  app: BREVO_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, listId } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['listId'],
      connectionFields: ['token'],
      ErrorClass: BrevoError,
    });

    const { name, folderId } = obj || {};

    const client = createBrevoClient(token);

    try {
      await client.contactsClient.updateList(listId, {
        ...(name && { name }),
        ...(folderId && { folderId }),
      });

      return { success: true };
    } catch (error) {
      throw new BrevoError(`Failed to ${humanizeNameTitle(action)}: ${extractBrevoError(error)}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      success: { type: 'boolean' },
    },
  },
});

export default updateList;
