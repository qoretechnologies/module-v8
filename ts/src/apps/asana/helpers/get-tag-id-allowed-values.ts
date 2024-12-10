import { TQoreAppActionOverrideOption } from '../../../global/models/qore';

export const getAsanaTagIdAllowedValuesRest = {
  method: 'GET',
  path: '/api/1.0/tags',
  values: 'body.data.gid',
  display_names: 'body.data.name',
  short_descs: 'body.data.gid',
} satisfies TQoreAppActionOverrideOption['rest_get_allowed_values'];
