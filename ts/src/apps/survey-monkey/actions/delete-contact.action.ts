import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SURVEY_MONKEY_APP_NAME, SurveyMonkeyError } from '../constants';
import { surveyMonkeyClient } from '../helpers/constants';
import { getSurveyMonkeyContactAllowedValues } from '../helpers/get-contact-allowed-values';
import { SurveyMonkeyDeleteResponseType } from '../response-types';

const action = 'delete_contact';

const options = {
  contact_id: {
    type: 'string',
    required: true,
    preselected: true,
    get_allowed_values: getSurveyMonkeyContactAllowedValues,
  },
} satisfies TQoreOptions;

const deleteSurveyMonkeyContact = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SURVEY_MONKEY_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: SurveyMonkeyDeleteResponseType,
  api_function: async (obj, _opts, context) => {
    const { token, contact_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['contact_id'],
      ErrorClass: SurveyMonkeyError,
    });

    try {
      await surveyMonkeyClient.delete(`contacts/${contact_id}`, { token });

      return { success: true, deleted_id: contact_id };
    } catch (error: any) {
      throw new SurveyMonkeyError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default deleteSurveyMonkeyContact;
