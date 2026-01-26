import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { BREVO_APP_NAME, BrevoError, extractBrevoError } from '../constants';
import { createBrevoClient } from '../helpers/constants';
import { getBrevoContactAllowedValues } from '../helpers/get-contact-allowed-values';

const action = 'delete_contact';

const options = {
  identifier: {
    type: 'string',
    required: true,
    get_allowed_values: async (context) => {
      const allowedValues = await getBrevoContactAllowedValues(context);

      return allowedValues.map((contact) => {
        return { ...contact, value: contact.value.toString() };
      });
    },
  },
} satisfies TQoreOptions;

const deleteContact = QoreAppCreator.createLocalizedAction<typeof options>({
  app: BREVO_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, identifier } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['identifier'],
      connectionFields: ['token'],
      ErrorClass: BrevoError,
    });

    const client = createBrevoClient(token);

    try {
      await client.contactsClient.deleteContact(identifier);

      return { success: true };
    } catch (error) {
      throw new BrevoError(`Failed to ${humanizeNameTitle(action)}: ${extractBrevoError(error)}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      success: { type: 'bool' },
    },
  },
});

export default deleteContact;
