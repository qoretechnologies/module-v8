import { TQoreAppActionOverrideOption } from '../../../global/models/qore';
import { JIRA_CONN_OPTIONS } from '../constants';

export const getJiraUserIdAllowedValuesRest = {
  method: 'GET',
  path: 'users',
  values: 'body.accountId',
  display_names: 'body.displayName',
} satisfies TQoreAppActionOverrideOption<typeof JIRA_CONN_OPTIONS>['rest_get_allowed_values'];
