import { TAllowedPaths, TCustomConnOptions } from '@qoretechnologies/ts-toolkit';
import { getMagentoSearchCriteriaOptions } from './constants';
import { getMagentoTransactionFieldsAllowedValues } from '../helpers/get-object-fields-allowed-values';

export const MAGENTO_TRANSACTIONS_ALLOWED_PATHS = {
  '/V1/transactions': {
    GET: {
      override_options: getMagentoSearchCriteriaOptions(getMagentoTransactionFieldsAllowedValues),
    },
  },
} satisfies TAllowedPaths<TCustomConnOptions>;
