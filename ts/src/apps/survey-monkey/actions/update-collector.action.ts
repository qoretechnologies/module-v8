import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SURVEY_MONKEY_APP_NAME, SurveyMonkeyError } from '../constants';
import { surveyMonkeyClient } from '../helpers/constants';
import { getSurveyMonkeyCollectorAllowedValues } from '../helpers/get-collector-allowed-values';
import { getSurveyMonkeySurveyAllowedValues } from '../helpers/get-survey-allowed-values';
import { SurveyMonkeyCollectorResponseType } from '../response-types';

const action = 'update_collector';

const CollectorStatusAllowedValues = [
  { value: 'open', display_name: 'Open' },
  { value: 'closed', display_name: 'Closed' },
];

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
  name: {
    type: 'string',
    required: false,
  },
  status: {
    type: 'string',
    required: false,
    allowed_values: CollectorStatusAllowedValues,
  },
  close_date: {
    type: 'string',
    required: false,
  },
  redirect_url: {
    type: 'string',
    required: false,
  },
  response_limit: {
    type: 'integer',
    required: false,
  },
} satisfies TQoreOptions;

const updateSurveyMonkeyCollector = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SURVEY_MONKEY_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: SurveyMonkeyCollectorResponseType,
  api_function: async (obj, _opts, context) => {
    const { token, collector_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['collector_id'],
      ErrorClass: SurveyMonkeyError,
    });

    const { name, status, close_date, redirect_url, response_limit } = obj || {};

    try {
      const body: Record<string, any> = {
        ...(name && { name }),
        ...(status && { status }),
        ...(close_date && { close_date }),
        ...(redirect_url && { redirect_url }),
        ...(response_limit !== undefined && { response_limit }),
      };

      const collector = await surveyMonkeyClient.patch(
        `collectors/${collector_id}`,
        body,
        { token }
      );

      return collector;
    } catch (error: any) {
      throw new SurveyMonkeyError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default updateSurveyMonkeyCollector;
