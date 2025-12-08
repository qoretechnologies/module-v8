import {
  EQoreAppActionCode,
  QoreAppCreator,
  QorusRequest,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { last } from 'lodash';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { CALENDLY_APP_NAME, CalendlyError } from '../constants';
import { fetchCalendlyData } from '../helpers/constants';
import { getCalendlyGroupAllowedValues } from '../helpers/get-group-allowed-values';
import { Debugger } from '../../../utils/Debugger';

const groupRelatedOptions = {
  group: {
    type: 'string',
    required: true,
    get_allowed_values: getCalendlyGroupAllowedValues,
  },
} satisfies TQoreOptions;

const options = {
  scope: {
    type: 'string',
    required: true,
    get_dependent_options: (context) => {
      const scope = context?.opts?.scope;

      if (scope === 'group') return groupRelatedOptions;

      return {};
    },
    allowed_values: [
      { value: 'organization', display_name: 'Organization' },
      { value: 'user', display_name: 'User' },
      { value: 'group', display_name: 'Group' },
    ],
    default_value: 'organization',
    on_change: ['refetch'],
  },
} satisfies TQoreOptions;

const CalendlyInviteeCanceled = QoreAppCreator.createLocalizedTrigger<
  typeof options & Partial<typeof groupRelatedOptions>
>({
  action: 'invitee_canceled',
  app: CALENDLY_APP_NAME,
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  options,
  webhook_register: async (context, url) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: CalendlyError,
    });

    const scope = context?.opts?.scope || 'organization';
    const group = context?.opts?.group;
    const userData = await fetchCalendlyData<{ current_organization: string; uri: string }>({
      token,
      object: 'resource',
      path: `users/me`,
    });
    const user = userData.uri;
    const organization = userData.current_organization;

    const data = await fetchCalendlyData<{ resource: { uri: string } }>({
      token,
      method: 'POST',
      path: 'webhook_subscriptions',
      body: {
        url,
        events: ['invitee.canceled'],
        scope,
        ...(scope === 'organization' && { organization }),
        ...(scope === 'user' && { user, organization }),
        ...(scope === 'group' && { group, organization }),
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

    const scope = context?.opts?.scope || 'organization';
    const group = context?.opts?.group;
    const userData = await fetchCalendlyData<{ current_organization: string; uri: string }>({
      token,
      object: 'resource',
      path: `users/me`,
    });
    const user = userData.uri;
    const organization = userData.current_organization;

    const requestData = {
      token,
      path: 'sample_webhook_data',
      params: {
        event: 'invitee.canceled',
        scope,
        ...(scope === 'organization' && { organization }),
        ...(scope === 'user' && { user, organization }),
        ...(scope === 'group' && { group, organization }),
      },
    };

    try {
      return await fetchCalendlyData<{ resource: { uri: string } }>(requestData);
    } catch (error) {
      Debugger.log(`Failed to fetch example event data for invitee canceled trigger:`, error);

      return await fetchCalendlyData<{ resource: { uri: string } }>({
        ...requestData,
        useMockServer: true,
      });
    }
  },
  event_info: {
    desc: 'Invitee canceled event data',
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
              cancel_url: { type: 'string' },
              created_at: { type: 'string' },
              email: { type: 'string' },
              event: { type: 'string' },
              first_name: { type: 'string' },
              invitee_scheduled_by: { type: 'string' },
              last_name: { type: 'string' },
              name: { type: 'string' },
              new_invitee: { type: 'string' },
              no_show: { type: 'string' },
              old_invitee: { type: 'string' },
              payment: { type: 'string' },
              questions_and_answers: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      answer: { type: 'string' },
                      position: { type: 'number' },
                      question: { type: 'string' },
                    },
                  },
                },
              },
              reconfirmation: { type: 'string' },
              reschedule_url: { type: 'string' },
              rescheduled: { type: 'bool' },
              routing_form_submission: { type: 'string' },
              scheduled_event: {
                type: {
                  type: 'hash',
                  fields: {
                    created_at: { type: 'string' },
                    end_time: { type: 'string' },
                    event_guests: {
                      type: {
                        type: 'list',
                        element_type: {
                          type: 'hash',
                          fields: {
                            email: { type: 'string' },
                            created_at: { type: 'string' },
                            updated_at: { type: 'string' },
                          },
                        },
                      },
                    },
                    event_memberships: {
                      type: {
                        type: 'list',
                        element_type: {
                          type: 'hash',
                          fields: {
                            user: { type: 'string' },
                            user_email: { type: 'string' },
                            user_name: { type: 'string' },
                          },
                        },
                      },
                    },
                    event_type: { type: 'string' },
                    invitees_counter: {
                      type: {
                        type: 'hash',
                        fields: {
                          total: { type: 'number' },
                          active: { type: 'number' },
                          limit: { type: 'number' },
                        },
                      },
                    },
                    location: {
                      type: {
                        type: 'hash',
                        fields: {
                          location: { type: 'string' },
                          type: { type: 'string' },
                        },
                      },
                    },
                    meeting_notes_html: { type: 'string' },
                    meeting_notes_plain: { type: 'string' },
                    name: { type: 'string' },
                    start_time: { type: 'string' },
                    status: { type: 'string' },
                    updated_at: { type: 'string' },
                    uri: { type: 'string' },
                  },
                },
              },
              scheduling_method: { type: 'string' },
              status: { type: 'string' },
              text_reminder_number: { type: 'string' },
              timezone: { type: 'string' },
              tracking: {
                type: {
                  type: 'hash',
                  fields: {
                    utm_campaign: { type: 'string' },
                    utm_source: { type: 'string' },
                    utm_medium: { type: 'string' },
                    utm_content: { type: 'string' },
                    utm_term: { type: 'string' },
                    salesforce_uuid: { type: 'string' },
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

export default CalendlyInviteeCanceled;
