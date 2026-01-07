import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SURVEY_MONKEY_APP_NAME, SurveyMonkeyError } from '../constants';
import { surveyMonkeyClient } from '../helpers/constants';
import { getSurveyMonkeySurveyAllowedValues } from '../helpers/get-survey-allowed-values';
import { SurveyMonkeyBasicResponseResponseType } from '../response-types';

const action = 'list_responses';

const options = {
  survey_id: {
    type: 'string',
    required: true,
    preselected: true,
    get_allowed_values: getSurveyMonkeySurveyAllowedValues,
  },
  limit: {
    type: 'integer',
    required: false,
    default_value: 500,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'list',
  element_type: SurveyMonkeyBasicResponseResponseType,
} satisfies TQoreResponseType;

const listSurveyMonkeyResponses = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SURVEY_MONKEY_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token, survey_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['survey_id'],
      ErrorClass: SurveyMonkeyError,
    });

    const { limit } = obj || {};

    try {
      const responses = await surveyMonkeyClient.fetchPaginated({
        token,
        path: `surveys/${survey_id}/responses/bulk`,
        itemsPath: 'data',
        maxResults: limit || 500,
      });

      return responses;
    } catch (error: any) {
      throw new SurveyMonkeyError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default listSurveyMonkeyResponses;
