import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { MAUTIC_APP_NAME, MauticError } from '../constants';
import { mauticClient } from '../client';
import { getMauticContactsAllowedValues } from '../helpers';
import { MauticContactResponseType } from '../response-types';

const action = 'get_contact';

const options = {
  contact: {
    type: 'number',
    required: true,
    get_allowed_values: getMauticContactsAllowedValues,
  },
} satisfies TQoreOptions;

const getContact = QoreAppCreator.createLocalizedAction<typeof options>({
  app: MAUTIC_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { instance_url, username, password, contact } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['instance_url', 'username', 'password'],
      optionFields: ['contact'],
      ErrorClass: MauticError,
    });

    try {
      const response = await mauticClient.get(`contacts/${contact}`, {
        connectionOptions: { instance_url, username, password },
      });

      return response;
    } catch (error) {
      throw new MauticError(`Failed to ${humanizeNameTitle(action)}: ${error?.message || error}`);
    }
  },
  response_type: MauticContactResponseType,
});

export default getContact;
