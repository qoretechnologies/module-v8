import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SURVEY_MONKEY_APP_NAME, SurveyMonkeyError } from '../constants';
import { surveyMonkeyClient } from '../helpers/constants';
import { getSurveyMonkeySurveyAllowedValues } from '../helpers/get-survey-allowed-values';
import { getSurveyMonkeyCollectorAllowedValues } from '../helpers/get-collector-allowed-values';
import { SurveyMessageResponseType } from '../response-types';

const action = 'send_survey';

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
  subject: {
    type: 'string',
    required: true,
    preselected: true,
  },
  body_text: {
    type: 'string',
    required: true,
    preselected: true,
  },
  recipient_emails: {
    type: { type: 'list', element_type: 'string' },
    required: true,
    preselected: true,
  },
} satisfies TQoreOptions;

const sendSurveyMonkeySurvey = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SURVEY_MONKEY_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: SurveyMessageResponseType,
  api_function: async (obj, _opts, context) => {
    const { token, survey_id, collector_id, subject, body_text, recipient_emails } =
      getQoreContextRequiredValues({
        context: { ...context, opts: obj },
        connectionFields: ['token'],
        optionFields: ['survey_id', 'collector_id', 'subject', 'body_text', 'recipient_emails'],
        ErrorClass: SurveyMonkeyError,
      });

    try {
      const message = await surveyMonkeyClient.post(
        `surveys/${survey_id}/collectors/${collector_id}/messages`,
        {
          subject,
          body_text,
          recipients: recipient_emails.map((email: string) => ({ email })),
        },
        { token }
      );

      return message;
    } catch (error: any) {
      throw new SurveyMonkeyError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default sendSurveyMonkeySurvey;
