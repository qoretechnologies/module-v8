import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { NETSUITE_CONN_OPTIONS } from '../conn-options';
import { netsuiteObjectCreationResponseDataConverter } from '../helpers/object-creation-response-data-converter';
import { getNetsuiteJournalEntryIdAllowedValues } from '../helpers/get-journal-entry-id-allowed-values';

export const NETSUITE_JOURNAL_ENTRY_ALLOWED_PATHS = {
  '/journalEntry': {
    POST: {
      response_data_converter: netsuiteObjectCreationResponseDataConverter,
    },
  },
  '/journalEntry/{id}': {
    GET: {
      override_options: {
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getNetsuiteJournalEntryIdAllowedValues,
        },
      },
    },
    PATCH: {
      override_options: {
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getNetsuiteJournalEntryIdAllowedValues,
        },
      },
    },
    DELETE: {
      override_options: {
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getNetsuiteJournalEntryIdAllowedValues,
        },
      },
    },
  },
} satisfies TAllowedPaths<typeof NETSUITE_CONN_OPTIONS>;
