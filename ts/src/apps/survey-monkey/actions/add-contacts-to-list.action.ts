import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SURVEY_MONKEY_APP_NAME, SurveyMonkeyError } from '../constants';
import { surveyMonkeyClient } from '../helpers/constants';
import { getSurveyMonkeyContactAllowedValues } from '../helpers/get-contact-allowed-values';
import { getSurveyMonkeyContactListAllowedValues } from '../helpers/get-contact-list-allowed-values';
import { SurveyMonkeyBulkContactResponseType } from '../response-types';

const action = 'add_contacts_to_list';

const options = {
  contact_list_id: {
    type: 'string',
    required: true,
    preselected: true,
    get_allowed_values: getSurveyMonkeyContactListAllowedValues,
  },
  contact_ids: {
    type: { type: 'list', element_type: 'string' },
    required: true,
    preselected: true,
    get_element_allowed_values: getSurveyMonkeyContactAllowedValues,
  },
} satisfies TQoreOptions;

const addContactsToSurveyMonkeyList = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SURVEY_MONKEY_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: SurveyMonkeyBulkContactResponseType,
  api_function: async (obj, _opts, context) => {
    const { token, contact_list_id, contact_ids } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['contact_list_id', 'contact_ids'],
      ErrorClass: SurveyMonkeyError,
    });

    try {
      const result = await surveyMonkeyClient.post(
        `contact_lists/${contact_list_id}/contacts/bulk`,
        { contact_ids },
        { token }
      );

      return result;
    } catch (error: any) {
      throw new SurveyMonkeyError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default addContactsToSurveyMonkeyList;
