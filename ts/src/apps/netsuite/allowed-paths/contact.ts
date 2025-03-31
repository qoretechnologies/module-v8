import {
  TAllowedPaths,
  TCustomConnOptions,
  TQoreAppActionOverrideOption,
} from '@qoretechnologies/ts-toolkit';
import { NETSUITE_CONN_OPTIONS } from '../constants';
import { getNetsuiteContactIdAllowedValues } from '../helpers/get-contact-id-allowed-values';
import { getNetsuiteSubsidiaryObjectAllowedValues } from '../helpers/get-subsidiary-id-allowed-values';
import { netsuiteObjectCreationResponseDataConverter } from '../helpers/object-creation-response-data-converter';

const contactOptions = {
  subsidiary: {
    allowed_values_creatable: true,
    get_allowed_values: getNetsuiteSubsidiaryObjectAllowedValues,
  },
} satisfies Record<string, TQoreAppActionOverrideOption<TCustomConnOptions>>;

export const NETSUITE_CONTACT_ALLOWED_PATHS = {
  '/contact': {
    POST: {
      override_options: contactOptions,
      response_data_converter: netsuiteObjectCreationResponseDataConverter,
    },
  },
  '/contact/{id}': {
    GET: {
      override_options: {
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getNetsuiteContactIdAllowedValues,
        },
      },
    },
    PATCH: {
      override_options: {
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getNetsuiteContactIdAllowedValues,
        },
        ...contactOptions,
      },
    },
    DELETE: {
      override_options: {
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getNetsuiteContactIdAllowedValues,
        },
      },
    },
  },
} satisfies TAllowedPaths<typeof NETSUITE_CONN_OPTIONS>;
