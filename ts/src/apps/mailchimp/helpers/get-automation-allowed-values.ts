import {
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
  IQoreAllowedValue,
} from '@qoretechnologies/ts-toolkit';
import { MailchimpError } from '../constants';
import { fetchMailchimpData } from './constants';

// Types for Mailchimp automation data
type TMailchimpAutomation = {
  id: string;
  create_time: string;
  start_time: string;
  status: string;
  emails_sent: number;
  settings: {
    title: string;
    from_name: string;
    reply_to: string;
  };
  tracking: {
    opens: boolean;
    html_clicks: boolean;
    text_clicks: boolean;
  };
  report_summary: {
    opens: number;
    clicks: number;
    unique_opens: number;
    subscriber_clicks: number;
  };
  recipients: {
    list_id: string;
    list_name: string;
    segment_opts?: {
      saved_segment_id: number;
      match: string;
    };
  };
};

type TMailchimpAutomationEmail = {
  id: string;
  workflow_id: string;
  position: number;
  status: string;
  emails_sent: number;
  send_time: string;
  create_time: string;
  start_time: string;
  archive_url: string;
  content_type: string;
  settings: {
    subject_line: string;
    title: string;
    from_name: string;
    reply_to: string;
  };
  delay: {
    amount: number;
    type: string;
    direction: string;
    action: string;
  };
};

export const getMailchimpAutomationAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;
  const datacenter = context?.conn_opts?.datacenter;

  const missingValues: string[] = [];
  if (!token) missingValues.push('token');
  if (!datacenter) missingValues.push('datacenter');

  if (missingValues.length) {
    throw new MailchimpError(
      `All of the following [${missingValues.join(', ')}] are required to get Mailchimp automation workflows`
    );
  }

  try {
    const data = await fetchMailchimpData<{ automations: TMailchimpAutomation[] }>({
      token: token!,
      datacenter: datacenter!,
      path: 'automations',
      params: {
        count: '100',
      },
    });

    const formatStatus = (status: string): string => {
      switch (status) {
        case 'sending':
          return 'Sending';
        case 'paused':
          return 'Paused';
        case 'stopped':
          return 'Stopped';
        case 'draft':
          return 'Draft';
        default:
          return status.charAt(0).toUpperCase() + status.slice(1);
      }
    };

    const allowedValues: IQoreAllowedValue<string>[] = (data.automations || []).map(
      (automation) => ({
        display_name: automation.settings.title,
        value: automation.id,
        desc:
          `Status: ${formatStatus(automation.status)}\n` +
          `List: ${automation.recipients.list_name}\n` +
          `Created: ${new Date(automation.create_time).toLocaleString()}\n` +
          `Emails Sent: ${automation.emails_sent || 0}\n` +
          `From: ${automation.settings.from_name} (${automation.settings.reply_to})`,
      })
    );

    return allowedValues;
  } catch (error) {
    throw new MailchimpError(
      `Failed to get Mailchimp automation workflows: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

export const getMailchimpAutomationEmailAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;
  const datacenter = context?.conn_opts?.datacenter;
  const workflow_id = context?.opts?.workflow_id;

  const missingValues: string[] = [];
  if (!token) missingValues.push('token');
  if (!datacenter) missingValues.push('datacenter');
  if (!workflow_id) missingValues.push('workflow_id');

  if (missingValues.length) {
    throw new MailchimpError(
      `All of the following [${missingValues.join(', ')}] are required to get Mailchimp automation emails`
    );
  }

  try {
    const data = await fetchMailchimpData<{ emails: TMailchimpAutomationEmail[] }>({
      token: token!,
      datacenter: datacenter!,
      path: `automations/${workflow_id}/emails`,
      params: {
        count: '100',
      },
    });

    const formatDelay = (delay: TMailchimpAutomationEmail['delay']): string => {
      if (!delay) return 'No delay';

      let delayText = '';
      if (delay.action === 'signup') {
        delayText = 'After signup: ';
      } else if (delay.action) {
        delayText = `After ${delay.action}: `;
      }

      if (delay.amount === 0) {
        return `${delayText}Immediately`;
      }

      const unit = delay.amount === 1 ? delay.type.slice(0, -1) : delay.type;

      return `${delayText}${delay.amount} ${unit} ${delay.direction || ''}`;
    };

    const formatStatus = (status: string): string => {
      switch (status) {
        case 'sending':
          return 'Sending';
        case 'paused':
          return 'Paused';
        case 'stopped':
          return 'Stopped';
        case 'draft':
          return 'Draft';
        default:
          return status.charAt(0).toUpperCase() + status.slice(1);
      }
    };

    // Map automation emails to allowed values
    const allowedValues: IQoreAllowedValue<string>[] = (data.emails || []).map((email) => ({
      display_name: email.settings.title || email.settings.subject_line,
      value: email.id,
      desc:
        `Subject: ${email.settings.subject_line}\n` +
        `Status: ${formatStatus(email.status)}\n` +
        `Position: ${email.position}\n` +
        `Delay: ${formatDelay(email.delay)}\n` +
        `Emails Sent: ${email.emails_sent || 0}\n` +
        `From: ${email.settings.from_name} (${email.settings.reply_to})`,
    }));

    return allowedValues;
  } catch (error) {
    throw new MailchimpError(
      `Failed to get Mailchimp automation emails: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};
