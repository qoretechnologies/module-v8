import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import workdayAttachments from '../../../schemas/workday/attachments.swagger.json';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import { OpenAPIV2 } from 'openapi-types';
import { WORKDAY_APP_NAME } from '../constants';

export const WORKDAY_ATTACHMENTS_ALLOWED_PATHS = {} satisfies TAllowedPaths;

export const WORKDAY_ATTACHMENTS_ACTIONS = buildActionsFromSwaggerSchema({
  schema: workdayAttachments as OpenAPIV2.Document,
  schemaPath: 'attachments',
  app: WORKDAY_APP_NAME,
});
