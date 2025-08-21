import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { BREVO_APP_NAME, BrevoError, extractBrevoError } from '../constants';
import { createBrevoClient } from '../helpers/constants';
import { getBrevoContactAllowedValues } from '../helpers/get-contact-allowed-values';
import { getBrevoListAllowedValues } from '../helpers/get-list-allowed-values';

const action = 'remove_contacts_from_list';

const options = {
  listId: {
    type: 'number',
    required: true,
    get_allowed_values: getBrevoListAllowedValues,
  },
  emails: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    required: false,
  },
  ids: {
    type: {
      type: 'list',
      element_type: 'number',
    },
    required: false,
    get_element_allowed_values: getBrevoContactAllowedValues,
  },
  all: {
    type: 'boolean',
    required: false,
  },
} satisfies TQoreOptions;

const removeContactsFromList = QoreAppCreator.createLocalizedAction<typeof options>({
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

    const { emails, ids, all } = obj || {};

    if (!emails?.length && !ids?.length && !all) {
      throw new BrevoError('Either emails, contact IDs, or all flag must be provided');
    }

    const client = createBrevoClient(token);

    try {
      const response = await client.contactsClient.removeContactFromList(listId, {
        ...(emails?.length && { emails }),
        ...(ids?.length && { ids }),
        ...(all && { all }),
      });

      return response.body;
    } catch (error) {
      throw new BrevoError(`Failed to ${humanizeNameTitle(action)}: ${extractBrevoError(error)}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      contacts: {
        type: {
          type: 'hash',
          fields: {
            success: {
              type: {
                type: 'list',
                element_type: 'string',
              },
            },
            failure: {
              type: {
                type: 'list',
                element_type: 'string',
              },
            },
          },
        },
      },
    },
  },
});

export default removeContactsFromList;
