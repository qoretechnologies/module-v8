import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLLING_INTERVAL } from '../../../global/constants';
import { delayOrCancel } from '../../../global/helpers/event-triggers';
import { Debugger } from '../../../utils/Debugger';
import { MAILCHIMP_APP_NAME, MailchimpError } from '../constants';
import { getMailchimpListIdAllowedValues } from '../helpers/get-list-id-allowed-values';
import {
  getMailchimpListMembers,
  MailchimpMemberEventMockExampleData,
} from './helpers/poll-members';

const pollMailchimpNewSubscribers = async (options: {
  trigger_name: string;
  token: string;
  datacenter: string;
  audienceId: string;
  update: (data: any) => void;
  should_stop: () => boolean;
}) => {
  const { trigger_name, token, datacenter, audienceId, update, should_stop } = options;

  try {
    let lastPollTime = new Date().toISOString();

    const processedSubscribers = new Set<string>();

    const initialMembers = await getMailchimpListMembers(
      token,
      datacenter,
      audienceId,
      'subscribed'
    );

    initialMembers.members.forEach((member) => {
      processedSubscribers.add(member.email_address.toLowerCase());
    });

    Debugger.log(
      `[${trigger_name}] Initialized with ${processedSubscribers.size} existing subscribers`
    );

    while (!should_stop()) {
      try {
        const currentPollTime = new Date().toISOString();

        const currentMembers = await getMailchimpListMembers(
          token,
          datacenter,
          audienceId,
          'subscribed',
          lastPollTime
        );

        for (const member of currentMembers.members) {
          const emailAddress = member.email_address.toLowerCase();

          if (!processedSubscribers.has(emailAddress)) {
            const eventData = {
              type: 'new_subscriber',
              list_id: audienceId,
              member: {
                id: member.id,
                email_address: member.email_address,
                status: member.status,
                merge_fields: member.merge_fields,
                timestamp_signup: member.timestamp_signup,
                timestamp_opt: member.timestamp_opt,
                last_changed: member.last_changed,
                tags: member.tags,
                member_rating: member.member_rating,
                vip: member.vip,
                location: member.location,
              },
              timestamp: member.last_changed || new Date().toISOString(),
            };

            update(eventData);

            processedSubscribers.add(emailAddress);

            Debugger.log(`[${trigger_name}] New subscriber detected: ${member.email_address}`);
          }
        }

        lastPollTime = currentPollTime;
      } catch (error) {
        Debugger.log(
          `[${trigger_name}] Error during polling: ${error instanceof Error ? error.message : error}`
        );
      }

      await delayOrCancel(DEFAULT_TRIGGER_POLLING_INTERVAL, should_stop);
    }

    Debugger.log(`[${trigger_name}] Polling stopped`);
  } catch (error) {
    Debugger.log(
      `[${trigger_name}] Fatal error during polling: ${error instanceof Error ? error.message : error}`
    );
  }
};

const options = {
  audience: {
    type: 'string',
    required: true,
    get_allowed_values: getMailchimpListIdAllowedValues,
  },
} satisfies TQoreOptions;

const mailchimpNewSubscriberTrigger = QoreAppCreator.createLocalizedTrigger({
  app: MAILCHIMP_APP_NAME,
  action: 'new_subscriber',
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const token = context?.conn_opts?.token;
    const datacenter = context?.conn_opts?.datacenter;
    const audienceId = context?.opts?.audience;

    const missingValues: string[] = [];
    if (!token) missingValues.push('token');
    if (!datacenter) missingValues.push('datacenter');
    if (!audienceId) missingValues.push('audienceId');

    if (missingValues.length) {
      throw new MailchimpError(
        `All of the following [${missingValues.join(', ')}] are required to start the New Subscriber trigger`
      );
    }

    await pollMailchimpNewSubscribers({
      trigger_name: 'mailchimp_new_subscriber',
      token: token!,
      datacenter: datacenter!,
      audienceId: audienceId!,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const token = context?.conn_opts?.token;
    const datacenter = context?.conn_opts?.datacenter;
    const audienceId = context?.opts?.audience;

    const exampleData = {
      ...MailchimpMemberEventMockExampleData,
      type: 'new_subscriber',
      list_id: audienceId || 'example-list-id',
    };

    if (token && datacenter && audienceId) {
      try {
        const members = await getMailchimpListMembers(token, datacenter, audienceId, 'subscribed');
        if (members.members.length > 0) {
          const member = members.members[0];
          exampleData.member = {
            ...exampleData.member,
            ...member,
          };
        }
      } catch (error) {
        Debugger.log(
          `Error fetching example data: ${error instanceof Error ? error.message : error}`
        );
      }
    }

    return exampleData;
  },
  event_info: {
    desc: 'New subscriber event data from Mailchimp',
    type: {
      type: 'hash',
      fields: {
        type: { type: 'string' },
        list_id: { type: 'string' },
        member: {
          type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              email_address: { type: 'string' },
              status: { type: 'string' },
              merge_fields: { type: 'auto' },
              timestamp_signup: { type: 'string' },
              timestamp_opt: { type: 'string' },
              last_changed: { type: 'string' },
              tags: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      id: { type: 'number' },
                      name: { type: 'string' },
                    },
                  },
                },
              },
              member_rating: { type: 'number' },
              vip: { type: 'bool' },
              location: {
                type: {
                  type: 'hash',
                  fields: {
                    latitude: { type: 'number' },
                    longitude: { type: 'number' },
                    country_code: { type: 'string' },
                    timezone: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        timestamp: { type: 'string' },
      },
    },
  },
});

export default mailchimpNewSubscriberTrigger;
