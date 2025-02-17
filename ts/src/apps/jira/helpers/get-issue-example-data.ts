import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { IQoreAppActionWithWebhookBase } from '@qoretechnologies/ts-toolkit';
import { Debugger } from '../../../utils/Debugger';

export const getJiraIssueExampleData: IQoreAppActionWithWebhookBase['get_example_event_data'] =
  async (context) => {
    const token = context?.conn_opts?.token;
    const cloud_id = context?.conn_opts?.cloud_id;
    const project = context?.opts?.project;

    if (!token || !cloud_id || !project) {
      throw new Error(
        'The token, cloud_id and project are required to get Jira issue example data'
      );
    }

    try {
      const {
        data: { issues },
      } = await QorusRequest.get<any>(
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          path: `/ex/jira/${cloud_id}/rest/api/3/search`,
          params: {
            jql: `project=${project}`,
          },
        },
        {
          url: 'https://api.atlassian.com',
          endpointId: 'Jira',
        }
      );

      if (!issues.length) {
        return;
      }

      const issueId = issues[0].id;

      const { data: issue } = await QorusRequest.get<any>(
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          path: `/ex/jira/${cloud_id}/rest/api/3/issue/${issueId}`,
        },
        {
          url: 'https://api.atlassian.com',
          endpointId: 'Jira',
        }
      );

      return {
        timestamp: Date.now(),
        webhookEvent: 'jira:issue',
        issue_event_type_name: 'issue_created',
        ...mapIssueToEventIssue(issue),
      };
    } catch (error) {
      Debugger.log('Jira project_updated trigger get_example_event_data error:', error);
    }
  };

const mapIssueToEventIssue = (original: {
  expand: string;
  id: string;
  self: string;
  key: string;
  changelog: any;
  fields: any;
}) => {
  return {
    issue: {
      id: original.id,
      self: original.self,
      key: original.key,
      fields: {
        ...original.fields,
        self: original.fields.project?.self,
        project: {
          ...original.fields.project,
          self: original.fields.project?.self,
          avatarUrls: original.fields.project?.avatarUrls,
        },
        issuetype: {
          ...original.fields.issuetype,
          self: original.fields.issuetype?.self,
          iconUrl: original.fields.issuetype?.iconUrl,
        },
        priority: {
          ...original.fields.priority,
          self: original.fields.priority?.self,
          iconUrl: original.fields.priority?.iconUrl,
        },
        status: {
          ...original.fields.status,
          self: original.fields.status?.self,
          statusCategory: {
            ...original.fields.status?.statusCategory,
            self: original.fields.status?.statusCategory?.self,
          },
        },
        creator: {
          ...original.fields.creator,
          self: original.fields.creator?.self,
          avatarUrls: original.fields.creator?.avatarUrls,
        },
        reporter: {
          ...original.fields.reporter,
          self: original.fields.reporter?.self,
          avatarUrls: original.fields.reporter?.avatarUrls,
        },
        watches: {
          ...original.fields.watches,
          self: original.fields.watches?.self,
        },
      },
    },
    changelog: original.changelog,
  };
};
