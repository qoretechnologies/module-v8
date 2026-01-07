import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SURVEY_MONKEY_APP_NAME, SurveyMonkeyError } from '../constants';
import { surveyMonkeyClient } from '../helpers/constants';
import { SurveyMonkeyContactResponseType } from '../response-types';

const action = 'create_contact';

const options = {
  first_name: {
    type: 'string',
    required: false,
    preselected: true,
  },
  last_name: {
    type: 'string',
    required: false,
    preselected: true,
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

const createSurveyMonkeyContact = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SURVEY_MONKEY_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: SurveyMonkeyContactResponseType,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: SurveyMonkeyError,
    });

    const { first_name, last_name, email, phone_number } = obj || {};

    // Validate: at least email or phone_number required
    if (!email && !phone_number) {
      throw new SurveyMonkeyError('Either email or phone_number is required');
    }

    try {
      const body: Record<string, any> = {
        ...(first_name && { first_name }),
        ...(last_name && { last_name }),
        ...(email && { email }),
        ...(phone_number && { phone_number }),
      };

      const contact = await surveyMonkeyClient.post('contacts', body, { token });

      return contact;
    } catch (error: any) {
      throw new SurveyMonkeyError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default createSurveyMonkeyContact;
