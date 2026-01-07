import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SURVEY_MONKEY_APP_NAME, SurveyMonkeyError } from '../constants';
import { surveyMonkeyClient } from '../helpers/constants';
import { getSurveyMonkeySurveyAllowedValues } from '../helpers/get-survey-allowed-values';
import { ResponseDisqualifiedWebhookEventResponseType } from '../response-types';

const trigger = 'response_disqualified';

const options = {
  survey_id: {
    type: 'string',
    required: true,
    preselected: true,
    get_allowed_values: getSurveyMonkeySurveyAllowedValues,
  },
} satisfies TQoreOptions;

const SurveyMonkeyResponseDisqualified = QoreAppCreator.createLocalizedTrigger<typeof options>({
  action: trigger,
  app: SURVEY_MONKEY_APP_NAME,
  action_code: EQoreAppActionCode.EVENT,
  options,
  webhook_method: 'POST',
  webhook_register: async (context, url) => {
    const { token, survey_id } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['survey_id'],
      ErrorClass: SurveyMonkeyError,
    });

    const response = await surveyMonkeyClient.post<{ id: string }>(
      'webhooks',
      {
        name: `Qorus ${humanizeNameTitle(trigger)} Webhook ${new Date().getTime()}`,
        event_type: 'response_disqualified',
        object_type: 'survey',
        object_ids: [survey_id],
        subscription_url: url,
      },
      { token }
    );

    return response;
  },
  webhook_deregister: async (context, _url, regInfo) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: SurveyMonkeyError,
    });

    const webhookId = regInfo.id;

    if (!webhookId) {
      throw new SurveyMonkeyError('Webhook ID is required for deregistration.');
    }

    await surveyMonkeyClient.delete(`webhooks/${webhookId}`, { token });
  },
  event_info: {
    desc: 'Response Disqualified Webhook Event Info',
    type: ResponseDisqualifiedWebhookEventResponseType,
  },
  get_example_event_data: async (context) => {
    const { survey_id } = getQoreContextRequiredValues({
      context,
      optionFields: ['survey_id'],
      ErrorClass: SurveyMonkeyError,
    });

    return {
      event_type: 'response_disqualified',
      object_type: 'survey',
      object_id: survey_id,
      event_datetime: new Date().toISOString(),
      resources: {
        survey_id,
        response_id: 'example_response_id',
        collector_id: 'example_collector_id',
        recipient_id: 'example_recipient_id',
      },
    };
  },
});

export default SurveyMonkeyResponseDisqualified;
