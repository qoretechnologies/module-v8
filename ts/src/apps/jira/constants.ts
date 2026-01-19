import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { getJiraCommentIdAllowedValues } from './helpers/get-comment-id-allowed-values';
import { getJiraIssueDescriptionDefaultValue } from './helpers/get-default-description-value';
import { getJiraFieldIdAllowedValues } from './helpers/get-field-id-allowed-values';
import { getJiraIssueIdAllowedValues } from './helpers/get-issue-id-allowed-values';
import {
  getJiraIssueTypeIdAllowedValues,
  getJiraIssueTypeNameAllowedValues,
} from './helpers/get-issue-type-allowed-values';
import { getJiraProjectCategoryIdAllowedValues } from './helpers/get-project-category-id-allowed-values';
import { getJiraProjectIdAllowedValues } from './helpers/get-project-id-allowed-values';
import { getJiraProjectTemplateKeyAllowedValues } from './helpers/get-project-template-key-allowed-values';
import { getJiraUserIdAllowedValues } from './helpers/get-user-id-allowed-values';
import { getJiraWorklogIdAllowedValues } from './helpers/get-worklog-id-allowed-values';
import { jiraDocumentFormatOption } from './options/jira-document.option';

export const JIRA_APP_NAME = 'Jira';
export const JIRA_ALLOWED_PATHS: TAllowedPaths = {
  '/rest/api/3/announcementBanner': {
    GET: {},
    PUT: {
      override_options: {
        isDismissible: {
          required: true,
        },
        isEnabled: {
          required: true,
        },
        message: {
          required: true,
        },
        visibility: {
          required: true,
          allowed_values: [
            { value: 'private', display_name: 'Private' },
            { value: 'public', display_name: 'Public' },
          ],
        },
      },
    },
  },
  '/rest/api/3/search/jql': {
    POST: {
      override_options: {
        jql: {
          required: true,
        },
      },
    },
  },
  '/rest/api/3/issue': {
    POST: {
      override_options: {
        fields: {
          required: true,
          type: {
            type: 'hash',
            fields: {
              summary: {
                type: 'string',
                required: true,
              },
              description: {
                type: {
                  type: 'hash',
                  fields: jiraDocumentFormatOption.type.fields,
                },
                required: false,
              },
              issuetype: {
                required: true,
                type: {
                  type: 'hash',
                  fields: {
                    id: {
                      type: 'softstring',
                      required_groups: ['issue_type_group'],
                      get_allowed_values: getJiraIssueTypeIdAllowedValues,
                    },
                    name: {
                      type: 'string',
                      required_groups: ['issue_type_group'],
                      get_allowed_values: getJiraIssueTypeNameAllowedValues,
                    },
                  },
                },
              },
              project: {
                required: true,
                type: {
                  type: 'hash',
                  fields: {
                    id: {
                      type: 'softstring',
                      required: true,
                      get_allowed_values: getJiraProjectIdAllowedValues,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  '/rest/api/3/project': {
    GET: {},
    POST: {
      override_options: {
        categoryId: {
          type: 'softstring',
          required: false,
          get_allowed_values: getJiraProjectCategoryIdAllowedValues,
        },
        key: {
          required: true,
        },
        name: {
          required: true,
        },
        description: {
          required: true,
        },
        projectTypeKey: {
          required: true,
          allowed_values: [
            { value: 'software', display_name: 'Software' },
            { value: 'service_desk', display_name: 'Service Desk' },
            { value: 'business', display_name: 'Business' },
          ],
        },
        projectTemplateKey: {
          required: true,
          depends_on: ['projectTypeKey'],
          get_allowed_values: getJiraProjectTemplateKeyAllowedValues,
        },
        leadAccountId: {
          required: true,
          get_allowed_values: getJiraUserIdAllowedValues,
        },
      },
    },
  },
  '/rest/api/3/project/{projectIdOrKey}': {
    DELETE: {
      override_options: {
        projectIdOrKey: {
          allowed_values_creatable: true,
          get_allowed_values: getJiraProjectIdAllowedValues,
        },
      },
    },
    GET: {
      override_options: {
        projectIdOrKey: {
          allowed_values_creatable: true,
          get_allowed_values: getJiraProjectIdAllowedValues,
        },
      },
    },
    PUT: {
      override_options: {
        projectIdOrKey: {
          allowed_values_creatable: true,
          get_allowed_values: getJiraProjectIdAllowedValues,
        },
        leadAccountId: {
          get_allowed_values: getJiraUserIdAllowedValues,
        },
        categoryId: {
          type: 'softstring',
          required: false,
          get_allowed_values: getJiraProjectCategoryIdAllowedValues,
        },
      },
    },
  },
  '/rest/api/3/issue/{issueIdOrKey}': {
    GET: {
      override_options: {
        issueIdOrKey: {
          allowed_values_creatable: true,
          get_allowed_values: getJiraIssueIdAllowedValues,
        },
      },
    },
    PUT: {
      override_options: {
        issueIdOrKey: {
          allowed_values_creatable: true,
          on_change: ['refetch'],
          get_allowed_values: getJiraIssueIdAllowedValues,
        },
        update: {
          required_groups: ['issue_update_group'],
        },
        fields: {
          required: false,
          required_groups: ['issue_update_group'],
          type: {
            type: 'hash',
            fields: {
              summary: {
                type: 'string',
                required: false,
              },
              description: {
                type: {
                  type: 'hash',
                  fields: jiraDocumentFormatOption.type.fields,
                },
                get_default_value: getJiraIssueDescriptionDefaultValue,
                required: false,
              },
              issuetype: {
                required: false,
                type: {
                  type: 'hash',
                  fields: {
                    id: {
                      type: 'softstring',
                      required_groups: ['issue_type_group'],
                      get_allowed_values: getJiraIssueTypeIdAllowedValues,
                    },
                    name: {
                      type: 'string',
                      required_groups: ['issue_type_group'],
                      get_allowed_values: getJiraIssueTypeNameAllowedValues,
                    },
                  },
                },
              },
              project: {
                required: false,
                type: {
                  type: 'hash',
                  fields: {
                    id: {
                      type: 'softstring',
                      required: true,
                      get_allowed_values: getJiraProjectIdAllowedValues,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    DELETE: {
      override_options: {
        issueIdOrKey: {
          allowed_values_creatable: true,
          get_allowed_values: getJiraIssueIdAllowedValues,
        },
      },
    },
  },
  '/rest/api/3/issue/{issueIdOrKey}/comment': {
    GET: {
      override_options: {
        issueIdOrKey: {
          allowed_values_creatable: true,
          get_allowed_values: getJiraIssueIdAllowedValues,
        },
      },
    },
    POST: {
      override_options: {
        issueIdOrKey: {
          allowed_values_creatable: true,
          get_allowed_values: getJiraIssueIdAllowedValues,
        },
        body: jiraDocumentFormatOption,
      },
    },
  },
  '/rest/api/3/issue/{issueIdOrKey}/comment/{id}': {
    GET: {
      override_options: {
        issueIdOrKey: {
          allowed_values_creatable: true,
          get_allowed_values: getJiraIssueIdAllowedValues,
        },
        id: {
          required: true,
          depends_on: ['issueIdOrKey'],
          allowed_values_creatable: true,
          get_allowed_values: getJiraCommentIdAllowedValues,
        },
      },
    },
    DELETE: {
      override_options: {
        issueIdOrKey: {
          allowed_values_creatable: true,
          get_allowed_values: getJiraIssueIdAllowedValues,
        },
        id: {
          required: true,
          depends_on: ['issueIdOrKey'],
          allowed_values_creatable: true,
          get_allowed_values: getJiraCommentIdAllowedValues,
        },
      },
    },
    PUT: {
      override_options: {
        issueIdOrKey: {
          allowed_values_creatable: true,
          get_allowed_values: getJiraIssueIdAllowedValues,
        },
        id: {
          required: true,
          depends_on: ['issueIdOrKey'],
          allowed_values_creatable: true,
          get_allowed_values: getJiraCommentIdAllowedValues,
        },
        body: { ...jiraDocumentFormatOption, required: false },
      },
    },
  },
  '/rest/api/3/issue/{issueIdOrKey}/worklog': {
    POST: {
      override_options: {
        issueIdOrKey: {
          allowed_values_creatable: true,
          get_allowed_values: getJiraIssueIdAllowedValues,
        },
        comment: jiraDocumentFormatOption,
        timeSpent: {
          required_groups: ['worklog_group'],
        },
        timeSpentSeconds: {
          required_groups: ['worklog_group'],
        },
      },
    },
    GET: {
      override_options: {
        issueIdOrKey: {
          allowed_values_creatable: true,
          get_allowed_values: getJiraIssueIdAllowedValues,
        },
        startedAfter: {
          required: false,
          type: 'unixtsms',
        },
        startedBefore: {
          required: false,
          type: 'unixtsms',
        },
      },
    },
  },
  '/rest/api/3/issue/{issueIdOrKey}/worklog/{id}': {
    DELETE: {
      override_options: {
        issueIdOrKey: {
          allowed_values_creatable: true,
          get_allowed_values: getJiraIssueIdAllowedValues,
        },
        id: {
          depends_on: ['issueIdOrKey'],
          allowed_values_creatable: true,
          get_allowed_values: getJiraWorklogIdAllowedValues,
        },
      },
    },
    GET: {
      override_options: {
        issueIdOrKey: {
          allowed_values_creatable: true,
          get_allowed_values: getJiraIssueIdAllowedValues,
        },
        id: {
          depends_on: ['issueIdOrKey'],
          allowed_values_creatable: true,
          get_allowed_values: getJiraWorklogIdAllowedValues,
        },
      },
    },
    PUT: {
      override_options: {
        issueIdOrKey: {
          allowed_values_creatable: true,
          get_allowed_values: getJiraIssueIdAllowedValues,
        },
        id: {
          depends_on: ['issueIdOrKey'],
          allowed_values_creatable: true,
          get_allowed_values: getJiraWorklogIdAllowedValues,
        },
      },
    },
  },
  '/rest/api/3/field': {
    POST: {
      override_options: {
        name: {
          required: true,
        },
        type: {
          required: true,
        },
        description: {
          required: true,
        },
        searcherKey: {
          required: true,
        },
      },
    },
    GET: {},
  },
  '/rest/api/3/field/{fieldId}': {
    PUT: {
      override_options: {
        fieldId: {
          allowed_values_creatable: true,
          get_allowed_values: getJiraFieldIdAllowedValues,
        },
      },
    },
  },
  '/rest/api/3/field/{id}/trash': {
    POST: {
      override_options: {
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getJiraFieldIdAllowedValues,
        },
      },
    },
  },
};

export const JIRA_SWAGGER_API_PATH = '/rest/api/3/';

export { JIRA_CONN_OPTIONS } from './conn-options';
