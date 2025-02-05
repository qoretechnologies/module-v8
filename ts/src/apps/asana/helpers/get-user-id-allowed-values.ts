import { TQoreAppActionOverrideOption } from '@qoretechnologies/ts-toolkit';

export const getAsanaUserIdAllowedValuesRest = {
  method: 'GET',
  path: '/api/1.0/users',
  values: 'body.data.gid',
  display_names: 'body.data.name',
  short_descs: 'body.data.gid',
} satisfies TQoreAppActionOverrideOption['rest_get_allowed_values'];
