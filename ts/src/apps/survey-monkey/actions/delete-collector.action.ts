import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SURVEY_MONKEY_APP_NAME, SurveyMonkeyError } from '../constants';
import { surveyMonkeyClient } from '../helpers/constants';
import { getSurveyMonkeyCollectorAllowedValues } from '../helpers/get-collector-allowed-values';
import { getSurveyMonkeySurveyAllowedValues } from '../helpers/get-survey-allowed-values';
import { SurveyMonkeyDeleteResponseType } from '../response-types';

const action = 'delete_collector';

const options = {
  survey_id: {
    type: 'string',
    required: true,
    preselected: true,
    get_allowed_values: getSurveyMonkeySurveyAllowedValues,
  },
  collector_id: {
    type: 'string',
    required: true,
    preselected: true,
    get_allowed_values: getSurveyMonkeyCollectorAllowedValues,
  },
} satisfies TQoreOptions;

const deleteSurveyMonkeyCollector = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SURVEY_MONKEY_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: SurveyMonkeyDeleteResponseType,
  api_function: async (obj, _opts, context) => {
    const { token, collector_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['collector_id'],
      ErrorClass: SurveyMonkeyError,
    });

    try {
      await surveyMonkeyClient.delete(`collectors/${collector_id}`, { token });

      return { success: true, deleted_id: collector_id };
    } catch (error: any) {
      throw new SurveyMonkeyError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default deleteSurveyMonkeyCollector;
