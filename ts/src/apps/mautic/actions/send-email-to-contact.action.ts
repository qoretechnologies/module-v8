import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { MAUTIC_APP_NAME, MauticError } from '../constants';
import { mauticClient } from '../client';
import { getMauticContactsAllowedValues, getMauticEmailsAllowedValues } from '../helpers';

const action = 'send_email_to_contact';

const options = {
  email: {
    type: 'number',
    required: true,
    get_allowed_values: getMauticEmailsAllowedValues,
  },
  contact: {
    type: 'number',
    required: true,
    get_allowed_values: getMauticContactsAllowedValues,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'hash',
  fields: {
    success: { type: 'bool' },
    emailId: { type: 'number' },
    contactId: { type: 'number' },
  },
} satisfies TQoreResponseType;

const sendEmailToContact = QoreAppCreator.createLocalizedAction<typeof options>({
  app: MAUTIC_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { instance_url, username, password, email, contact } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['instance_url', 'username', 'password'],
      optionFields: ['email', 'contact'],
      ErrorClass: MauticError,
    });

    try {
      await mauticClient.post(
        `emails/${email}/contact/${contact}/send`,
        {},
        {
          connectionOptions: { instance_url, username, password },
        }
      );

      return {
        success: true,
        emailId: email,
        contactId: contact,
      };
    } catch (error) {
      throw new MauticError(`Failed to ${humanizeNameTitle(action)}: ${error?.message || error}`);
    }
  },
});

export default sendEmailToContact;
