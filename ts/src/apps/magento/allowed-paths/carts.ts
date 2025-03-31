import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { MAGENTO_CONN_OPTIONS } from '../constants';
import { getMagentoSearchCriteriaOptions } from './constants';
import { getMagentoCartFieldsAllowedValues } from '../helpers/get-object-fields-allowed-values';

export const MAGENTO_CARTS_ALLOWED_PATHS = {
  '/V1/carts/search': {
    GET: {
      override_options: getMagentoSearchCriteriaOptions(getMagentoCartFieldsAllowedValues),
    },
  },
} satisfies TAllowedPaths<typeof MAGENTO_CONN_OPTIONS>;
