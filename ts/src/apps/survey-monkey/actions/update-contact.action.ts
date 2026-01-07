import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SURVEY_MONKEY_APP_NAME, SurveyMonkeyError } from '../constants';
import { surveyMonkeyClient } from '../helpers/constants';
import { getSurveyMonkeyContactAllowedValues } from '../helpers/get-contact-allowed-values';
import { SurveyMonkeyContactResponseType } from '../response-types';

const action = 'update_contact';

const options = {
  contact_id: {
    type: 'string',
    required: true,
    preselected: true,
    get_allowed_values: getSurveyMonkeyContactAllowedValues,
  },
  first_name: {
    type: 'string',
    required: false,
  },
  last_name: {
    type: 'string',
    required: false,
  },
  email: {
    type: 'string',
    required: false,
  },
  phone_number: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const updateSurveyMonkeyContact = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SURVEY_MONKEY_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: SurveyMonkeyContactResponseType,
  api_function: async (obj, _opts, context) => {
    const { token, contact_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['contact_id'],
      ErrorClass: SurveyMonkeyError,
    });

    const { first_name, last_name, email, phone_number } = obj || {};

    try {
      const body: Record<string, any> = {
        ...(first_name && { first_name }),
        ...(last_name && { last_name }),
        ...(email && { email }),
        ...(phone_number && { phone_number }),
      };

      const contact = await surveyMonkeyClient.patch(`contacts/${contact_id}`, body, { token });

      return contact;
    } catch (error: any) {
      throw new SurveyMonkeyError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default updateSurveyMonkeyContact;
