import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SURVEY_MONKEY_APP_NAME, SurveyMonkeyError } from '../constants';
import { surveyMonkeyClient } from '../helpers/constants';
import { getSurveyMonkeySurveyAllowedValues } from '../helpers/get-survey-allowed-values';
import { SurveyMonkeyBasicSurveyResponseType } from '../response-types';

const action = 'copy_survey';

const options = {
  survey_id: {
    type: 'string',
    required: true,
    preselected: true,
    get_allowed_values: getSurveyMonkeySurveyAllowedValues,
  },
  title: {
    type: 'string',
    required: true,
    preselected: true,
  },
} satisfies TQoreOptions;

const copySurveyMonkeySurvey = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SURVEY_MONKEY_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: SurveyMonkeyBasicSurveyResponseType,
  api_function: async (obj, _opts, context) => {
    const { token, survey_id, title } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['survey_id', 'title'],
      ErrorClass: SurveyMonkeyError,
    });

    try {
      const survey = await surveyMonkeyClient.post(
        `surveys/${survey_id}/copy`,
        { title },
        { token }
      );

      return survey;
    } catch (error: any) {
      throw new SurveyMonkeyError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default copySurveyMonkeySurvey;
