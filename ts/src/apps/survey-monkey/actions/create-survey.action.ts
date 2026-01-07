import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SURVEY_MONKEY_APP_NAME, SurveyMonkeyError } from '../constants';
import { surveyMonkeyClient } from '../helpers/constants';
import { getSurveyMonkeySurveyFolderAllowedValues } from '../helpers/get-survey-folder-allowed-values';
import { SurveyMonkeyBasicSurveyResponseType } from '../response-types';

const action = 'create_survey';

const options = {
  title: {
    type: 'string',
    required: true,
    preselected: true,
  },
  nickname: {
    type: 'string',
    required: false,
  },
  language: {
    type: 'string',
    required: false,
    default_value: 'en',
  },
  folder_id: {
    type: 'string',
    required: false,
    get_allowed_values: getSurveyMonkeySurveyFolderAllowedValues,
  },
  from_template_id: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const createSurveyMonkeySurvey = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SURVEY_MONKEY_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: SurveyMonkeyBasicSurveyResponseType,
  api_function: async (obj, _opts, context) => {
    const { token, title } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['title'],
      ErrorClass: SurveyMonkeyError,
    });

    const { nickname, language, folder_id, from_template_id } = obj || {};

    try {
      const body: Record<string, any> = {
        title,
        ...(nickname && { nickname }),
        ...(language && { language }),
        ...(folder_id && { folder_id }),
        ...(from_template_id && { from_template_id }),
      };

      const survey = await surveyMonkeyClient.post('surveys', body, { token });

      return survey;
    } catch (error: any) {
      throw new SurveyMonkeyError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default createSurveyMonkeySurvey;
