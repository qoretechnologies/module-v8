import { TQoreAppActionOverrideOption } from '../../../global/models/qore';

export const getAsanaWorkspaceIdAllowedValuesRest = {
  method: 'GET',
  path: '/api/1.0/workspaces',
  values: 'body.data.gid',
  display_names: 'body.data.name',
} satisfies TQoreAppActionOverrideOption['rest_get_allowed_values'];
