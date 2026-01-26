import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SURVEY_MONKEY_APP_NAME, SurveyMonkeyError } from '../constants';
import { surveyMonkeyClient } from '../helpers/constants';
import { getSurveyMonkeySurveyAllowedValues } from '../helpers/get-survey-allowed-values';
import { CollectorUpdatedWebhookEventResponseType } from '../response-types';

const trigger = 'collector_updated';

const options = {
  survey_id: {
    type: 'string',
    required: true,
    preselected: true,
    get_allowed_values: getSurveyMonkeySurveyAllowedValues,
  },
} satisfies TQoreOptions;

const SurveyMonkeyCollectorUpdated = QoreAppCreator.createLocalizedTrigger<typeof options>({
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
        event_type: 'collector_updated',
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
    desc: 'Collector Updated Webhook Event Info',
    type: CollectorUpdatedWebhookEventResponseType,
  },
  get_example_event_data: async (context) => {
    const { token, survey_id } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['survey_id'],
      ErrorClass: SurveyMonkeyError,
    });

    const collectors = await surveyMonkeyClient.fetchPaginated<{
      id: string;
    }>({
      token,
      path: `surveys/${survey_id}/collectors`,
      itemsPath: 'data',
      maxResults: 1,
    });

    if (collectors.length === 0) {
      return null;
    }

    return {
      event_type: 'collector_updated',
      object_type: 'survey',
      object_id: survey_id,
      event_datetime: new Date().toISOString(),
      resources: {
        survey_id,
        collector_id: collectors[0].id,
      },
    };
  },
});

export default SurveyMonkeyCollectorUpdated;
