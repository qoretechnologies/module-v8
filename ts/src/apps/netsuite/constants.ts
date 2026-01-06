import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { buildActionsFromSwaggerSchema } from '../../global/helpers';
import netsuite from '../../schemas/netsuite.swagger.json';
import { NETSUITE_ACCOUNT_ALLOWED_PATHS } from './allowed-paths/account';
import { NETSUITE_CONTACT_ALLOWED_PATHS } from './allowed-paths/contact';
import { NETSUITE_CUSTOMER_ALLOWED_PATHS } from './allowed-paths/customer';
import { NETSUITE_SIMPLIFIED_CUSTOMER_ALLOWED_PATHS } from './allowed-paths/customer-simplified';
import { NETSUITE_INVOICE_ALLOWED_PATHS } from './allowed-paths/invoice';
import { NETSUITE_JOURNAL_ENTRY_ALLOWED_PATHS } from './allowed-paths/journal-entry';
import { NETSUITE_OPPORTUNITY_ALLOWED_PATHS } from './allowed-paths/opportunity';
import { NETSUITE_PURCHASE_ORDER_ALLOWED_PATHS } from './allowed-paths/purchase-order';
import { NETSUITE_SALES_ORDER_ALLOWED_PATHS } from './allowed-paths/sales-order';
import { NETSUITE_SIMPLIFIED_SALES_ORDER_ALLOWED_PATHS } from './allowed-paths/sales-order-simplified';
import { NETSUITE_VENDOR_ALLOWED_PATHS } from './allowed-paths/vendor';

export const NETSUITE_APP_NAME = 'NetSuite';

export { NETSUITE_CONN_OPTIONS } from './conn-options';

export const NETSUITE_ALLOWED_PATHS = {
  ...NETSUITE_ACCOUNT_ALLOWED_PATHS,
  ...NETSUITE_CONTACT_ALLOWED_PATHS,
  ...NETSUITE_CUSTOMER_ALLOWED_PATHS,
  ...NETSUITE_INVOICE_ALLOWED_PATHS,
  ...NETSUITE_JOURNAL_ENTRY_ALLOWED_PATHS,
  ...NETSUITE_OPPORTUNITY_ALLOWED_PATHS,
  ...NETSUITE_PURCHASE_ORDER_ALLOWED_PATHS,
  ...NETSUITE_SALES_ORDER_ALLOWED_PATHS,
  ...NETSUITE_VENDOR_ALLOWED_PATHS,
} satisfies TAllowedPaths;

export const NETSUITE_ACTIONS = buildActionsFromSwaggerSchema({
  schema: netsuite as any,
  allowedPaths: NETSUITE_ALLOWED_PATHS,
  app: NETSUITE_APP_NAME,
});

export const NETSUITE_SIMPLIFIED_ALLOWED_PATHS = {
  ...NETSUITE_SIMPLIFIED_SALES_ORDER_ALLOWED_PATHS,
  ...NETSUITE_SIMPLIFIED_CUSTOMER_ALLOWED_PATHS,
} satisfies TAllowedPaths;

export const NETSUITE_SIMPLIFIED_ACTIONS = buildActionsFromSwaggerSchema({
  schema: netsuite as any,
  actionNameModifier: 'simplified',
  allowedPaths: NETSUITE_SIMPLIFIED_ALLOWED_PATHS,
  app: NETSUITE_APP_NAME,
});
