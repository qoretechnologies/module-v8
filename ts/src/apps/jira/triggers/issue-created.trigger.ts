import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { EQoreAppActionCode, TQorePartialEventAction } from '../../../global/models/qore';
import { getJiraIssueExampleData } from '../helpers/get-issue-example-data';
import { getJiraProjectIdAllowedValues } from '../helpers/get-project-id-allowed-values';
import { issueEventInfoType } from './event-info/issue.event-info';
import { deregisterJiraWebhook } from './helpers';
import { Debugger } from '../../../utils/Debugger';

export default {
  action: 'issue_created',
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
    const {
      conn_opts: { token, cloud_id },
      opts: { project },
    } = context;

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
              events: ['jira:issue_created'],
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
    desc: 'Issue created event data',
    type: issueEventInfoType,
  },
} satisfies TQorePartialEventAction;
