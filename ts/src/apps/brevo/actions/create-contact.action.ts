import { CreateContact } from '@getbrevo/brevo';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { BREVO_APP_NAME, BrevoError, extractBrevoError } from '../constants';
import { createBrevoClient } from '../helpers/constants';
import { getBrevoContactAttributeOptionsTypeWithAllowedValues } from '../helpers/get-contact-attributes-allowed-values';
import { getBrevoListAllowedValues } from '../helpers/get-list-allowed-values';

const action = 'create_contact';

const options = {
  email: {
    type: 'string',
    required: true,
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

const createContact = QoreAppCreator.createLocalizedAction<typeof options>({
  app: BREVO_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, email } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['email'],
      ErrorClass: BrevoError,
    });

    const {
      attributes,
      emailBlacklisted = false,
      extId,
      listIds,
      smsBlacklisted = false,
    } = obj || {};

    const client = createBrevoClient(token);

    const data: CreateContact = {
      email,
      smsBlacklisted,
      emailBlacklisted,
      ...(attributes && Object.keys(attributes).length && { attributes }),
      ...(extId && { extId }),
      ...(listIds?.length && { listIds }),
    };

    try {
      const response = await client.contactsClient.createContact(data);

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

export default createContact;
