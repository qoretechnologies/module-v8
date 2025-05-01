import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreGetDependentOptionsFunction,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { MAILCHIMP_APP_NAME, MailchimpError } from '../constants';
import {
  getMailchimpAutomationAllowedValues,
  getMailchimpAutomationEmailAllowedValues,
} from '../helpers/get-automation-allowed-values';
import { getMailchimpCampaignIdAllowedValues } from '../helpers/get-campaign-id-allowed-values';
import { getMailchimpListIdAllowedValues } from '../helpers/get-list-id-allowed-values';
import { pollMailchimpEmailOpensForTrigger } from './helpers/poll-opened-emails';
import { Debugger } from '../../../utils/Debugger';
import { fetchMailchimpData } from '../helpers/constants';
import { omit } from 'lodash';

const campaignOptions = {
  campaign: {
    type: 'string',
    required: true,
    get_allowed_values: getMailchimpCampaignIdAllowedValues,
  },
} satisfies TQoreOptions;

const automationOptions = {
  workflow_id: {
    type: 'string',
    required: true,
    get_allowed_values: getMailchimpAutomationAllowedValues,
  },
  automation_email: {
    type: 'string',
    required: true,
    depends_on: ['workflow_id'],
    get_allowed_values: getMailchimpAutomationEmailAllowedValues,
  },
} satisfies TQoreOptions;

const getDependentOptions: TQoreGetDependentOptionsFunction = (context) => {
  const campaignType = context?.opts?.campaign_type;

  if (campaignType === 'campaign') {
    return campaignOptions;
  } else if (campaignType === 'automation') {
    return automationOptions;
  } else {
    return {};
  }
};

const options = {
  audience: {
    type: 'string',
    required: true,
    get_allowed_values: getMailchimpListIdAllowedValues,
  },
  campaign_type: {
    type: 'string',
    required: true,
    get_dependent_options: getDependentOptions,
    on_change: ['refetch'],
    allowed_values: [
      {
        display_name: 'Campaign',
        value: 'campaign',
      },
      {
        display_name: 'Automation',
        value: 'automation',
      },
    ],
  },
  trigger_on_subscriber: {
    type: 'boolean',
    required: false,
    default_value: true,
  },
} satisfies TQoreOptions;

const mailchimpEmailOpenedTrigger = QoreAppCreator.createLocalizedTrigger<
  typeof options & Partial<typeof campaignOptions> & Partial<typeof automationOptions>
>({
  app: MAILCHIMP_APP_NAME,
  action: 'email_opened',
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const token = context?.conn_opts?.token;
    const datacenter = context?.conn_opts?.datacenter;
    const audienceId = context?.opts?.audience;
    const campaignType = context?.opts?.campaign_type;
    const campaign = context?.opts?.campaign;
    const workflowId = context?.opts?.workflow_id;
    const automationEmail = context?.opts?.automation_email;
    const triggerOnSubscriber = context?.opts?.trigger_on_subscriber !== false;

    const missingValues: string[] = [];
    if (!token) missingValues.push('token');
    if (!datacenter) missingValues.push('datacenter');
    if (!audienceId) missingValues.push('audienceId');
    if (!campaignType) missingValues.push('campaignType');

    if (campaignType === 'campaign' && !campaign) {
      missingValues.push('campaign');
    } else if (campaignType === 'automation' && (!workflowId || !automationEmail)) {
      if (!workflowId) missingValues.push('workflow_id');
      if (!automationEmail) missingValues.push('automation_email');
    }

    if (missingValues.length) {
      throw new MailchimpError(
        `All of the following [${missingValues.join(', ')}] are required to start the Email Opened trigger`
      );
    }

    const emailId = campaignType === 'campaign' ? campaign : automationEmail;

    await pollMailchimpEmailOpensForTrigger({
      trigger_name: 'mailchimp_email_opened',
      token: token!,
      datacenter: datacenter!,
      audienceId: audienceId!,
      emailType: campaignType as 'campaign' | 'automation',
      emailId: emailId!,
      workflowId: workflowId,
      triggerOnSubscriber,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const token = context?.conn_opts?.token;
    const datacenter = context?.conn_opts?.datacenter;
    const audienceId = context?.opts?.audience;
    const campaignType = context?.opts?.campaign_type || 'campaign';
    const campaignId = context?.opts?.campaign;
    const workflowId = context?.opts?.workflow_id;
    const automationEmail = context?.opts?.automation_email;

    const exampleData = {
      campaign_id: campaignId || 'example-campaign-id',
      email_id: automationEmail || 'example-email-id',
      workflow_id: workflowId || 'example-workflow-id',
      list_id: audienceId || 'example-list-id',
      type: campaignType,
      total_opens: 1,
      member: {
        email_id: 'example-contact-email-id',
        email_address: 'example@example.com',
        list_id: audienceId || 'example-list-id',
        contact_status: 'subscribed',
        merge_fields: {
          FNAME: 'John',
          LNAME: 'Doe',
        },
        opens_count: 1,
        vip: false,
        opens: [
          {
            timestamp: new Date().toISOString(),
            is_proxy_open: false,
          },
        ],
      },
      timestamp: new Date().toISOString(),
    };

    try {
      if (campaignType === 'campaign') {
        const data = await fetchMailchimpData<{ members: any[]; total_opens: number }>({
          datacenter: datacenter!,
          token: token!,
          path: `reports/${campaignId}/open-details`,
          params: {
            count: '1',
          },
        });

        if (data && data.members && data.members.length > 0) {
          const member = data.members[0];
          exampleData.member = {
            ...exampleData.member,
            ...member,
          };
          exampleData.total_opens = data.total_opens || 1;
        }
      } else if (campaignType === 'automation') {
        const data = await fetchMailchimpData<{ members: any[]; total_opens: number }>({
          path: `automations/${workflowId}/emails/${automationEmail}/queue`,
          token: token!,
          datacenter: datacenter!,
          params: {
            count: '1',
          },
        });

        if (data && data.members && data.members.length > 0) {
          const member = data.members[0];
          exampleData.member = {
            ...exampleData.member,
            ...member,
          };
          exampleData.total_opens = data.total_opens || 1;
        }
      }
    } catch (error) {
      Debugger.log('Error fetching example data:', error);
    }

    if (campaignType === 'automation') {
      return omit(exampleData, ['campaign_id', 'list_id']);
    } else if (campaignType === 'campaign') {
      return omit(exampleData, ['workflow_id', 'email_id']);
    }

    return exampleData;
  },
  event_info: {
    desc: 'Email opened event data from Mailchimp',
    type: {
      type: 'hash',
      fields: {
        campaign_id: { type: 'string' },
        email_id: { type: 'string' },
        workflow_id: { type: 'string' },
        list_id: { type: 'string' },
        type: { type: 'string' },
        total_opens: { type: 'number' },
        member: {
          type: {
            type: 'hash',
            fields: {
              email_id: { type: 'string' },
              email_address: { type: 'string' },
              list_id: { type: 'string' },
              contact_status: { type: 'string' },
              merge_fields: { type: 'auto' },
              opens_count: { type: 'number' },
              vip: { type: 'boolean' },
              opens: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      timestamp: { type: 'string' },
                      is_proxy_open: { type: 'boolean' },
                    },
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

export default mailchimpEmailOpenedTrigger;
