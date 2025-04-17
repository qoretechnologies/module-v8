import {
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
  IQoreAllowedValue,
} from '@qoretechnologies/ts-toolkit';
import { MailchimpError } from '../constants';
import { getMailchimpAllowedValues } from './constants';

type TMailchimpCampaign = {
  id: string;
  web_id: number;
  type: string;
  create_time: string;
  status: string;
  emails_sent: number;
  settings: {
    title: string;
    subject_line: string;
    from_name: string;
    reply_to: string;
  };
  report_summary?: {
    opens: number;
    clicks: number;
    subscriber_clicks: number;
    unique_opens: number;
    open_rate: number;
    click_rate: number;
  };
};

const mapMailchimpCampaignToAllowedValue = (
  item: TMailchimpCampaign
): IQoreAllowedValue<string> => ({
  display_name: item.settings.title || `Campaign ${item.id}`,
  value: item.id,
  desc:
    `ID: ${item.id}\n\n` +
    `Subject: ${item.settings.subject_line}\n\n` +
    `Status: ${item.status}\n\n` +
    `Created: ${item.create_time}\n\n` +
    `Emails Sent: ${item.emails_sent}\n\n` +
    `From: ${item.settings.from_name} (${item.settings.reply_to})\n\n` +
    (item.report_summary
      ? `Open Rate: ${item.report_summary.open_rate}\n\n` +
        `Click Rate: ${item.report_summary.click_rate}`
      : ''),
});

export const getMailchimpCampaignIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const token = context?.conn_opts?.token;
  const datacenter = context?.conn_opts?.datacenter;

  const missingValues: string[] = [];
  if (!token) missingValues.push('token');
  if (!datacenter) missingValues.push('datacenter');

  if (missingValues.length) {
    throw new MailchimpError(
      `All of the following [${missingValues.join(', ')}] are required to get Mailchimp campaign id allowed values`
    );
  }

  const path = 'campaigns';

  return await getMailchimpAllowedValues({
    token: token!,
    datacenter: datacenter!,
    path,
    mapItemToAllowedValue: mapMailchimpCampaignToAllowedValue,
    dataPath: 'campaigns',
  });
};
