import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SURVEY_MONKEY_APP_NAME, SurveyMonkeyError } from '../constants';
import { surveyMonkeyClient } from '../helpers/constants';
import { getSurveyMonkeySurveyAllowedValues } from '../helpers/get-survey-allowed-values';
import { SurveyMonkeySurveyRollupResponseType } from '../response-types';

const action = 'get_survey_rollup';

const options = {
  survey_id: {
    type: 'string',
    required: true,
    preselected: true,
    get_allowed_values: getSurveyMonkeySurveyAllowedValues,
  },
} satisfies TQoreOptions;

const getSurveyMonkeySurveyRollup = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SURVEY_MONKEY_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: SurveyMonkeySurveyRollupResponseType,
  api_function: async (obj, _opts, context) => {
    const { token, survey_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['survey_id'],
      ErrorClass: SurveyMonkeyError,
    });

    try {
      const rollup = await surveyMonkeyClient.get<Record<string, any>>(`surveys/${survey_id}/rollups`, { token });

      return {
        survey_id,
        ...rollup,
      };
    } catch (error: any) {
      throw new SurveyMonkeyError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default getSurveyMonkeySurveyRollup;
