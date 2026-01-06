import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { frontClient } from '../client';
import { FRONT_APP_NAME, FrontError } from '../constants';
import { formatFrontResponse } from '../helpers/format-response';
import { getFrontContactAllowedValues } from '../helpers/get-contact-allowed-values';
import { FrontContactResponseType } from '../response-types/contact';

const action = 'get_contact';

const options = {
  contactId: {
    type: 'string',
    required: true,
    get_allowed_values: getFrontContactAllowedValues,
  },
} satisfies TQoreOptions;

const responseType = FrontContactResponseType;

const getFrontContact = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FRONT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token, contactId } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['contactId'],
      connectionFields: ['token'],
      ErrorClass: FrontError,
    });

    try {
      const contact = await frontClient.get<Record<string, any>>(`contacts/${contactId}`, { token });

      return formatFrontResponse(contact);
    } catch (error) {
      throw new FrontError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default getFrontContact;
