import { TAllowedPaths, TCustomConnOptions } from '@qoretechnologies/ts-toolkit';
import { getMagentoCartFieldsAllowedValues } from '../helpers/get-object-fields-allowed-values';
import { getMagentoSearchCriteriaOptions } from './constants';

export const MAGENTO_CARTS_ALLOWED_PATHS = {
  '/V1/carts/search': {
    GET: {
      override_options: getMagentoSearchCriteriaOptions(getMagentoCartFieldsAllowedValues),
    },
  },
} satisfies TAllowedPaths<TCustomConnOptions>;
