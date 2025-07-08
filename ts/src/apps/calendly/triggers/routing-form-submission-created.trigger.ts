import { EQoreAppActionCode, QoreAppCreator, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { CALENDLY_APP_NAME, CalendlyError } from '../constants';
import { getCalendlyOrganizationDefaultValue } from '../helpers/get-organization-default-value';
import { fetchCalendlyData } from '../helpers/constants';
import { last } from 'lodash';

const CalendlyNewFormSubmissionCreated = QoreAppCreator.createLocalizedTrigger({
  action: 'new_form_submission_created',
  app: CALENDLY_APP_NAME,
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  webhook_register: async (context, url) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: CalendlyError,
    });

    const organization = await getCalendlyOrganizationDefaultValue(context);

    const data = await fetchCalendlyData<{ resource: { uri: string } }>({
      token,
      method: 'POST',
      path: 'webhook_subscriptions',
      body: {
        url,
        organization,
        events: ['routing_form_submission.created'],
        scope: 'organization',
      },
    });

    return { webhook: data.resource };
  },
  webhook_deregister: async (context, _url, regInfo) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: CalendlyError,
    });

    const webhookUUID = last(regInfo?.webhook?.uri?.split('/')) || '';

    if (!webhookUUID) {
      throw new CalendlyError(
        'Webhook UUID not found in registration info while trying to deregister webhook.'
      );
    }

    await QorusRequest.deleteReq(
      {
        path: `/webhook_subscriptions/${webhookUUID}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      {
        url: 'https://api.calendly.com',
        endpointId: CALENDLY_APP_NAME,
      }
    );
  },
  get_example_event_data: async (context) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: CalendlyError,
    });

    const organization = await getCalendlyOrganizationDefaultValue(context);

    return await fetchCalendlyData({
      token,
      path: 'sample_webhook_data',
      params: {
        organization,
        event: 'routing_form_submission.created',
        scope: 'organization',
      },
    });
  },
  event_info: {
    desc: 'New message event data',
    type: {
      type: 'hash',
      fields: {
        created_at: { type: 'string' },
        created_by: { type: 'string' },
        event: { type: 'string' },
        payload: {
          type: {
            type: 'hash',
            fields: {
              created_at: { type: 'string' },
              questions_and_answers: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      answer: { type: 'string' },
                      question: { type: 'string' },
                      question_uuid: { type: 'string' },
                    },
                  },
                },
              },
              result: {
                type: {
                  type: 'hash',
                  fields: {
                    type: { type: 'string' },
                    value: {
                      type: {
                        type: 'hash',
                        fields: {
                          headline: { type: 'string' },
                          body: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
              routing_form: { type: 'string' },
              submitter: { type: 'string' },
              submitter_type: { type: 'string' },
              tracking: {
                type: {
                  type: 'hash',
                  fields: {
                    salesforce_uuid: { type: 'string' },
                    utm_campaign: { type: 'string' },
                    utm_content: { type: 'string' },
                    utm_medium: { type: 'string' },
                    utm_source: { type: 'string' },
                    utm_term: { type: 'string' },
                  },
                },
              },
              updated_at: { type: 'string' },
              uri: { type: 'string' },
            },
          },
        },
      },
    },
  },
});

export default CalendlyNewFormSubmissionCreated;
