import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { OpenAPIV2 } from 'openapi-types';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import workdayPayments from '../../../schemas/workday/payments.swagger.json';
import { WORKDAY_APP_NAME } from '../constants';

export const WORKDAY_PAYMENTS_ALLOWED_PATHS = {} satisfies TAllowedPaths;

export const WORKDAY_PAYMENTS_ACTIONS = buildActionsFromSwaggerSchema({
  schema: workdayPayments as unknown as OpenAPIV2.Document,
  schemaPath: 'payments',
  app: WORKDAY_APP_NAME,
});
