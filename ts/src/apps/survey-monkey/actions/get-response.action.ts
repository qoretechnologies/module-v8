import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SURVEY_MONKEY_APP_NAME, SurveyMonkeyError } from '../constants';
import { surveyMonkeyClient } from '../helpers/constants';
import { getSurveyMonkeySurveyAllowedValues } from '../helpers/get-survey-allowed-values';
import { SurveyMonkeyDetailedResponseResponseType } from '../response-types';

const action = 'get_response';

const options = {
  survey_id: {
    type: 'string',
    required: true,
    preselected: true,
    get_allowed_values: getSurveyMonkeySurveyAllowedValues,
  },
  response_id: {
    type: 'string',
    required: true,
    preselected: true,
  },
  include_answers: {
    type: 'bool',
    required: false,
    default_value: true,
  },
} satisfies TQoreOptions;

const getSurveyMonkeyResponse = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SURVEY_MONKEY_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: SurveyMonkeyDetailedResponseResponseType,
  api_function: async (obj, _opts, context) => {
    const { token, survey_id, response_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['survey_id', 'response_id'],
      ErrorClass: SurveyMonkeyError,
    });

    const { include_answers } = obj || {};

    try {
      // If include_answers is true, use /details endpoint
      const endpoint = include_answers
        ? `surveys/${survey_id}/responses/${response_id}/details`
        : `surveys/${survey_id}/responses/${response_id}`;

      const response = await surveyMonkeyClient.get(endpoint, { token });

      return response;
    } catch (error: any) {
      throw new SurveyMonkeyError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default getSurveyMonkeyResponse;
