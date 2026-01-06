import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SURVEY_MONKEY_APP_NAME, SurveyMonkeyError } from '../constants';
import { surveyMonkeyClient } from '../helpers/constants';
import { SurveyMonkeyContactListResponseType } from '../response-types';

const action = 'list_contact_lists';

const options = {
  limit: {
    type: 'integer',
    required: false,
    default_value: 500,
  },
} satisfies TQoreOptions;

const listSurveyMonkeyContactLists = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SURVEY_MONKEY_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: { type: 'list', element_type: SurveyMonkeyContactListResponseType },
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: SurveyMonkeyError,
    });

    const { limit = 500 } = obj || {};

    try {
      const contactLists = await surveyMonkeyClient.fetchPaginated({
        token,
        path: 'contact_lists',
        itemsPath: 'data',
        maxResults: limit,
      });

      return contactLists;
    } catch (error: any) {
      throw new SurveyMonkeyError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default listSurveyMonkeyContactLists;
