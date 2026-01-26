import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SURVEY_MONKEY_APP_NAME, SurveyMonkeyError } from '../constants';
import { surveyMonkeyClient } from '../helpers/constants';
import { getSurveyMonkeySurveyAllowedValues } from '../helpers/get-survey-allowed-values';
import { getSurveyMonkeyCollectorAllowedValues } from '../helpers/get-collector-allowed-values';
import { SurveyMonkeyCollectorResponseType } from '../response-types';

const action = 'get_collector';

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

const getSurveyMonkeyCollector = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SURVEY_MONKEY_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: SurveyMonkeyCollectorResponseType,
  api_function: async (obj, _opts, context) => {
    const { token, survey_id, collector_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['survey_id', 'collector_id'],
      ErrorClass: SurveyMonkeyError,
    });

    try {
      const collector = await surveyMonkeyClient.get(
        `surveys/${survey_id}/collectors/${collector_id}`,
        { token }
      );

      return collector;
    } catch (error: any) {
      throw new SurveyMonkeyError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default getSurveyMonkeyCollector;
