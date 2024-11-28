import { TQoreAppActionOverrideOption } from '../../../global/models/qore';
import { JIRA_CONN_OPTIONS } from '../constants';

export const getJiraIssueTypeIdAllowedValuesRest = {
  method: 'GET',
  path: 'issuetype',
  values: 'body.id',
  display_names: 'body.name',
} satisfies TQoreAppActionOverrideOption<typeof JIRA_CONN_OPTIONS>['rest_get_allowed_values'];

export const getJiraIssueTypeNameAllowedValuesRest = {
  method: 'GET',
  path: 'issuetype',
  values: 'body.name',
  display_names: 'body.description',
} satisfies TQoreAppActionOverrideOption<typeof JIRA_CONN_OPTIONS>['rest_get_allowed_values'];
