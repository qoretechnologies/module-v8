import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SURVEY_MONKEY_APP_NAME, SurveyMonkeyError } from '../constants';
import { surveyMonkeyClient } from '../helpers/constants';
import { SurveyMonkeySurveyFolderResponseType } from '../response-types';

const action = 'create_survey_folder';

const options = {
  title: {
    type: 'string',
    required: true,
    preselected: true,
  },
} satisfies TQoreOptions;

const createSurveyMonkeySurveyFolder = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SURVEY_MONKEY_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: SurveyMonkeySurveyFolderResponseType,
  api_function: async (obj, _opts, context) => {
    const { token, title } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['title'],
      ErrorClass: SurveyMonkeyError,
    });

    try {
      const folder = await surveyMonkeyClient.post('survey_folders', { title }, { token });

      return folder;
    } catch (error: any) {
      throw new SurveyMonkeyError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default createSurveyMonkeySurveyFolder;
