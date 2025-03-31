import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { MAGENTO_CONN_OPTIONS } from '../constants';
import { getMagentoSearchCriteriaOptions } from './constants';
import { getMagentoTransactionFieldsAllowedValues } from '../helpers/get-object-fields-allowed-values';

export const MAGENTO_TRANSACTIONS_ALLOWED_PATHS = {
  '/V1/transactions': {
    GET: {
      override_options: getMagentoSearchCriteriaOptions(getMagentoTransactionFieldsAllowedValues),
    },
  },
} satisfies TAllowedPaths<typeof MAGENTO_CONN_OPTIONS>;
