import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SURVEY_MONKEY_APP_NAME, SurveyMonkeyError } from '../constants';
import { surveyMonkeyClient } from '../helpers/constants';
import { getSurveyMonkeySurveyAllowedValues } from '../helpers/get-survey-allowed-values';
import { SurveyMonkeyResponseCountsResponseType } from '../response-types';

const action = 'get_response_counts';

const options = {
  survey_id: {
    type: 'string',
    required: true,
    preselected: true,
    get_allowed_values: getSurveyMonkeySurveyAllowedValues,
  },
} satisfies TQoreOptions;

const getSurveyMonkeyResponseCounts = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SURVEY_MONKEY_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: SurveyMonkeyResponseCountsResponseType,
  api_function: async (obj, _opts, context) => {
    const { token, survey_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['survey_id'],
      ErrorClass: SurveyMonkeyError,
    });

    try {
      const response = await surveyMonkeyClient.get<{
        total: number;
        per_page: number;
        page: number;
        data: any[];
      }>(`surveys/${survey_id}/responses`, { token, params: { per_page: 1 } });

      return {
        survey_id,
        total_responses: response.total || 0,
      };
    } catch (error: any) {
      throw new SurveyMonkeyError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default getSurveyMonkeyResponseCounts;
