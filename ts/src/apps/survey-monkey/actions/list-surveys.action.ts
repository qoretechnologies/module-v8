import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SURVEY_MONKEY_APP_NAME, SurveyMonkeyError } from '../constants';
import { surveyMonkeyClient } from '../helpers/constants';
import { SurveyMonkeyBasicSurveyResponseType } from '../response-types';

const action = 'list_surveys';

const options = {
  limit: {
    type: 'integer',
    required: false,
    default_value: 500,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'list',
  element_type: SurveyMonkeyBasicSurveyResponseType,
} satisfies TQoreResponseType;

const listSurveyMonkeySurveys = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SURVEY_MONKEY_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: SurveyMonkeyError,
    });

    const { limit } = obj || {};

    try {
      const surveys = await surveyMonkeyClient.fetchPaginated({
        token,
        path: 'surveys',
        itemsPath: 'data',
        maxResults: limit || 500,
      });

      return surveys;
    } catch (error: any) {
      throw new SurveyMonkeyError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default listSurveyMonkeySurveys;
