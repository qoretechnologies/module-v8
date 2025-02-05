import {
  EQoreAppActionCode,
  QorusRequest,
  TQorePartialEventAction,
} from '@qoretechnologies/ts-toolkit';
import { Debugger } from '../../../utils/Debugger';
import { getJiraIssueExampleData } from '../helpers/get-issue-example-data';
import { getJiraProjectIdAllowedValues } from '../helpers/get-project-id-allowed-values';
import { issueEventInfoType } from './event-info/issue.event-info';
import { deregisterJiraWebhook } from './helpers';

export default {
  action: 'issue_updated',
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  options: {
    project: {
      type: 'string',
      get_allowed_values: getJiraProjectIdAllowedValues,
      required: true,
    },
  },
  webhook_register: async (context, url) => {
    const token = context?.conn_opts?.token;
    const cloud_id = context?.conn_opts?.cloud_id;
    const project = context?.opts?.project;

    if (!token || !cloud_id || !project) {
      throw new Error('The token, cloud_id, and project are required to register Jira webhook');
    }

    const { data } = await QorusRequest.post<any>(
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          url,
          webhooks: [
            {
              name: 'Webhook on issue creation by Qorus',
              events: ['jira:issue_updated'],
              jqlFilter: `project = ${project}`,
            },
          ],
        },
        path: `/ex/jira/${cloud_id}/rest/api/3/webhook`,
      },
      {
        url: 'https://api.atlassian.com',
        endpointId: 'Jira',
      }
    );

    const registrationResults = data?.webhookRegistrationResult;
    const errors = registrationResults?.[0]?.errors;
    if (errors) {
      Debugger.log('error', 'Error registering jira webhook', errors);
    }

    return {
      webhook: {
        id: registrationResults?.[0]?.createdWebhookId,
      },
    };
  },
  get_example_event_data: getJiraIssueExampleData,
  webhook_deregister: deregisterJiraWebhook,
  event_info: {
    desc: 'Issue updated event data',
    type: issueEventInfoType,
  },
} satisfies TQorePartialEventAction;
