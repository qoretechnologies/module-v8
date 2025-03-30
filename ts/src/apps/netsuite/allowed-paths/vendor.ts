import {
  TAllowedPaths,
  TCustomConnOptions,
  TQoreAppActionOverrideOption,
} from '@qoretechnologies/ts-toolkit';
import { NETSUITE_CONN_OPTIONS } from '../constants';
import { netsuiteObjectCreationResponseDataConverter } from '../helpers/object-creation-response-data-converter';
import { getNetsuiteVendorIdAllowedValues } from '../helpers/get-vendor-id-allowed-values';
import { getNetsuiteSubsidiaryIdAllowedValues } from '../helpers/get-subsidiary-id-allowed-values';

const vendorOptions = {
  subsidiary: {
    allowed_values_creatable: true,
    get_allowed_values: getNetsuiteSubsidiaryIdAllowedValues,
  },
} satisfies Record<string, TQoreAppActionOverrideOption<TCustomConnOptions>>;

export const NETSUITE_VENDOR_ALLOWED_PATHS = {
  '/vendor': {
    POST: {
      override_options: vendorOptions,
      response_data_converter: netsuiteObjectCreationResponseDataConverter,
    },
  },
  '/vendor/{id}': {
    GET: {
      override_options: {
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getNetsuiteVendorIdAllowedValues,
        },
      },
    },
    PATCH: {
      override_options: {
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getNetsuiteVendorIdAllowedValues,
        },
        ...vendorOptions,
      },
    },
    DELETE: {
      override_options: {
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getNetsuiteVendorIdAllowedValues,
        },
      },
    },
  },
} satisfies TAllowedPaths<typeof NETSUITE_CONN_OPTIONS>;
