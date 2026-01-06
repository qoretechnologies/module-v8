import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SURVEY_MONKEY_APP_NAME, SurveyMonkeyError } from '../constants';
import { surveyMonkeyClient } from '../helpers/constants';
import { getSurveyMonkeySurveyAllowedValues } from '../helpers/get-survey-allowed-values';
import { SurveyMonkeyCollectorResponseType } from '../response-types';

const action = 'create_collector';

const CollectorTypeAllowedValues = [
  { value: 'email', display_name: 'Email' },
  { value: 'weblink', display_name: 'Web Link' },
  { value: 'facebook', display_name: 'Facebook' },
  { value: 'embed', display_name: 'Embedded Survey' },
];

const options = {
  survey_id: {
    type: 'string',
    required: true,
    preselected: true,
    get_allowed_values: getSurveyMonkeySurveyAllowedValues,
  },
  type: {
    type: 'string',
    required: true,
    preselected: true,
    allowed_values: CollectorTypeAllowedValues,
  },
  name: {
    type: 'string',
    required: true,
    preselected: true,
  },
} satisfies TQoreOptions;

const createSurveyMonkeyCollector = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SURVEY_MONKEY_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: SurveyMonkeyCollectorResponseType,
  api_function: async (obj, _opts, context) => {
    const { token, survey_id, type, name } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['survey_id', 'type', 'name'],
      ErrorClass: SurveyMonkeyError,
    });

    try {
      const collector = await surveyMonkeyClient.post(
        `surveys/${survey_id}/collectors`,
        { type, name },
        { token }
      );

      return collector;
    } catch (error: any) {
      throw new SurveyMonkeyError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default createSurveyMonkeyCollector;
