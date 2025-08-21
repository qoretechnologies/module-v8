import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { BREVO_APP_NAME, BrevoError, extractBrevoError } from '../constants';
import { createBrevoClient } from '../helpers/constants';
import { getBrevoContactAllowedValues } from '../helpers/get-contact-allowed-values';
import { getBrevoContactAttributeOptionsTypeWithAllowedValues } from '../helpers/get-contact-attributes-allowed-values';
import { getBrevoListAllowedValues } from '../helpers/get-list-allowed-values';

const action = 'update_contact';

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
  email: {
    type: 'string',
    required: false,
  },
  extId: {
    type: 'string',
    required: false,
  },
  listIds: {
    type: {
      type: 'list',
      element_type: 'number',
    },
    get_element_allowed_values: getBrevoListAllowedValues,
    required: false,
  },
  unlinkListIds: {
    type: {
      type: 'list',
      element_type: 'number',
    },
    get_element_allowed_values: getBrevoListAllowedValues,
    required: false,
  },
  emailBlacklisted: {
    type: 'boolean',
    required: false,
  },
  smsBlacklisted: {
    type: 'boolean',
    required: false,
  },
  attributes: {
    type: 'hash',
    required: false,
    preselected: true,
    get_dynamic_type: getBrevoContactAttributeOptionsTypeWithAllowedValues,
  },
} satisfies TQoreOptions;

const updateContact = QoreAppCreator.createLocalizedAction<typeof options>({
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

    const { email, attributes, emailBlacklisted, extId, listIds, unlinkListIds, smsBlacklisted } =
      obj || {};

    const client = createBrevoClient(token);

    try {
      await client.contactsClient.updateContact(identifier, {
        ...(attributes && { attributes }),
        ...(email && { email }),
        ...(typeof smsBlacklisted !== 'undefined' && { smsBlacklisted }),
        ...(typeof emailBlacklisted !== 'undefined' && { emailBlacklisted }),
        ...(extId && { extId }),
        ...(listIds?.length && { listIds }),
        ...(unlinkListIds?.length && { unlinkListIds }),
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

export default updateContact;
