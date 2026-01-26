import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { Debugger } from '../../../../utils/Debugger';
import { MailchimpError } from '../../constants';
import { DEFAULT_TRIGGER_POLLING_INTERVAL } from '../../../../global/constants';
import { delayOrCancel } from '../../../../global/helpers/event-triggers';

type MailchimpOpenEvent = {
  timestamp: string;
  is_proxy_open: boolean;
};

type MailchimpOpenMember = {
  campaign_id: string;
  list_id: string;
  list_is_active: boolean;
  contact_status: string;
  email_id: string;
  email_address: string;
  merge_fields: Record<string, any>;
  vip: boolean;
  opens_count: number;
  proxy_excluded_opens_count: number;
  opens: MailchimpOpenEvent[];
};

type MailchimpOpenDetails = {
  members: MailchimpOpenMember[];
  campaign_id: string;
  total_opens: number;
  total_proxy_excluded_opens: number;
  total_items: number;
};

type MailchimpAutomationOpenDetails = {
  members: MailchimpOpenMember[];
  workflow_id: string;
  email_id: string;
  total_opens: number;
  total_items: number;
};

const getCampaignOpenDetails = async (
  token: string,
  datacenter: string,
  campaignId: string,
  since?: string
): Promise<MailchimpOpenDetails> => {
  try {
    const params: Record<string, string> = {
      count: '1000',
    };

    if (since) {
      params.since = since;
    }

    const response = await QorusRequest.get<{ data: MailchimpOpenDetails }>(
      {
        path: `/reports/${campaignId}/open-details`,
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      {
        url: `https://${datacenter}.api.mailchimp.com/3.0`,
        endpointId: 'mailchimp',
      }
    );

    if (!response?.data) {
      throw new MailchimpError(`No open details found for campaign ${campaignId}`);
    }

    return response.data;
  } catch (error) {
    throw new MailchimpError(
      `Failed to fetch open details for campaign ${campaignId}: ${
        error instanceof Error ? error.message : error
      }`
    );
  }
};

const getAutomationOpenDetails = async (
  token: string,
  datacenter: string,
  workflowId: string,
  emailId: string,
  since?: string
): Promise<MailchimpAutomationOpenDetails> => {
  try {
    const params: Record<string, string> = {
      count: '1000',
    };

    if (since) {
      params.since = since;
    }

    const response = await QorusRequest.get<{ data: MailchimpAutomationOpenDetails }>(
      {
        path: `/automations/${workflowId}/emails/${emailId}/queue`,
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      {
        url: `https://${datacenter}.api.mailchimp.com/3.0`,
        endpointId: 'mailchimp',
      }
    );

    if (!response?.data) {
      throw new MailchimpError(`No open details found for automation email ${emailId}`);
    }

    return {
      ...response.data,
      workflow_id: workflowId,
      email_id: emailId,
    };
  } catch (error) {
    throw new MailchimpError(
      `Failed to fetch open details for automation email ${emailId}: ${
        error instanceof Error ? error.message : error
      }`
    );
  }
};

export const pollMailchimpEmailOpensForTrigger = async (options: {
  trigger_name: string;
  token: string;
  datacenter: string;
  audienceId: string;
  emailType: 'campaign' | 'automation';
  emailId: string;
  workflowId?: string;
  triggerOnSubscriber: boolean;
  update: (data: any) => void;
  should_stop: () => boolean;
}) => {
  const {
    trigger_name,
    token,
    datacenter,
    audienceId,
    emailType,
    emailId,
    workflowId,
    triggerOnSubscriber,
    update,
    should_stop,
  } = options;

  try {
    let lastPollTime = new Date().toISOString();

    let lastTotalOpens = 0;

    const processedOpensBySubscriber = new Map<string, Set<string>>();

    let initialData;

    if (emailType === 'campaign') {
      initialData = await getCampaignOpenDetails(token, datacenter, emailId);
      lastTotalOpens = initialData.total_opens;

      initialData.members.forEach((member) => {
        const openTimestamps = new Set(member.opens.map((open) => open.timestamp));
        processedOpensBySubscriber.set(member.email_id, openTimestamps);
      });
    } else if (emailType === 'automation') {
      if (!workflowId) {
        throw new MailchimpError('Workflow ID is required for automation emails');
      }
      initialData = await getAutomationOpenDetails(token, datacenter, workflowId, emailId);
      lastTotalOpens = initialData.total_opens;

      initialData.members.forEach((member) => {
        const openTimestamps = new Set(member.opens.map((open) => open.timestamp));
        processedOpensBySubscriber.set(member.email_id, openTimestamps);
      });
    }

    Debugger.log(`[${trigger_name}] Initialized with ${lastTotalOpens} total opens`);

    while (!should_stop()) {
      try {
        const currentPollTime = new Date().toISOString();
        let currentData;

        if (emailType === 'campaign') {
          currentData = await getCampaignOpenDetails(token, datacenter, emailId, lastPollTime);
        } else if (emailType === 'automation') {
          if (!workflowId) {
            throw new MailchimpError('Workflow ID is required for automation emails');
          }
          currentData = await getAutomationOpenDetails(
            token,
            datacenter,
            workflowId,
            emailId,
            lastPollTime
          );
        } else {
          throw new MailchimpError(`Invalid email type: ${emailType}`);
        }

        const totalOpensBefore = lastTotalOpens;
        const totalOpensNow = currentData.total_opens;
        const newTotalOpens = totalOpensNow - totalOpensBefore;

        if (newTotalOpens > 0) {
          if (!triggerOnSubscriber) {
            const eventData = {
              campaign_id: emailType === 'campaign' ? emailId : undefined,
              email_id: emailId,
              workflow_id: emailType === 'automation' ? workflowId : undefined,
              list_id: audienceId,
              type: emailType,
              total_opens: totalOpensNow,
              previous_total_opens: totalOpensBefore,
              new_opens: newTotalOpens,
              timestamp: new Date().toISOString(),
            };

            update(eventData);
            Debugger.log(
              `[${trigger_name}] Triggered for total opens increase: ${totalOpensBefore} -> ${totalOpensNow}`
            );
          }

          lastTotalOpens = totalOpensNow;
        }

        if (triggerOnSubscriber) {
          for (const member of currentData.members) {
            const subscriberEmail = member.email_id;
            const processedOpens =
              processedOpensBySubscriber.get(subscriberEmail) || new Set<string>();

            for (const open of member.opens) {
              if (!processedOpens.has(open.timestamp)) {
                const eventData = {
                  campaign_id: emailType === 'campaign' ? emailId : undefined,
                  email_id: emailId,
                  workflow_id: emailType === 'automation' ? workflowId : undefined,
                  list_id: audienceId,
                  type: emailType,
                  total_opens: currentData.total_opens,
                  member: {
                    ...member,
                    opens: [open],
                  },
                  timestamp: open.timestamp,
                };

                update(eventData);
                processedOpens.add(open.timestamp);
                Debugger.log(
                  `[${trigger_name}] Triggered for subscriber ${member.email_address} open at ${open.timestamp}`
                );
              }
            }

            processedOpensBySubscriber.set(subscriberEmail, processedOpens);
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
