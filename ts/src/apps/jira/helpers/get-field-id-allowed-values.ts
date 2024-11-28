import { TQoreAppActionOverrideOption } from '../../../global/models/qore';
import { JIRA_CONN_OPTIONS } from '../constants';

export const getJiraFieldIdAllowedValuesRest = {
  method: 'GET',
  path: 'field',
  values: 'body.id',
  display_names: 'body.name',
} satisfies TQoreAppActionOverrideOption<typeof JIRA_CONN_OPTIONS>['rest_get_allowed_values'];
