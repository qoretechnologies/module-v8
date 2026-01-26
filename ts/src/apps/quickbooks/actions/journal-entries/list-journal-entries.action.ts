import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { QUICKBOOKS_APP_NAME, QuickbooksError } from '../../constants';
import { createQuickbooksClient, getQuickbooksErrorMessage } from '../../helpers/constants';
import { QuickBooksOperatorsAllowedValues } from '../../helpers/get-filter-operator-allowed-values';
import { QuickBooksJournalEntryFieldsAllowedValues } from '../../helpers/get-journal-entry-fields-allowed-values';

const options = {
  fetchAll: {
    type: 'bool',
    required: false,
    default_value: false,
  },
  limit: {
    type: 'integer',
    required: false,
    default_value: 50,
  },
  offset: {
    type: 'integer',
    required: false,
    default_value: 0,
  },
  filter: {
    type: {
      type: 'hash',
      fields: {
        field: {
          type: 'string',
          required: true,
          allowed_values_creatable: true,
          allowed_values: QuickBooksJournalEntryFieldsAllowedValues,
        },
        operator: {
          type: 'string',
          required: false,
          allowed_values: QuickBooksOperatorsAllowedValues,
        },
        value: { type: 'softstring', required: true },
      },
    },
  },
  sort: {
    type: {
      type: 'hash',
      fields: {
        field: {
          type: 'string',
          required: true,
          allowed_values_creatable: true,
          allowed_values: QuickBooksJournalEntryFieldsAllowedValues,
        },
        direction: {
          type: 'string',
          required: false,
          default_value: 'asc',
          allowed_values: [
            { value: 'asc', display_name: 'Ascending' },
            { value: 'desc', display_name: 'Descending' },
          ],
        },
      },
    },
  },
} satisfies TQoreOptions;

const listJournalEntries = QoreAppCreator.createLocalizedAction<typeof options>({
  app: QUICKBOOKS_APP_NAME,
  action: 'list_journal_entries',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, realm_id, instance_type } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'realm_id', 'instance_type'],
      ErrorClass: QuickbooksError,
    });

    const limit = obj?.limit || 50;
    const offset = obj?.offset || 0;
    const filter = obj?.filter;
    const sort = obj?.sort;
    const fetchAll = obj?.fetchAll || false;

    const client = createQuickbooksClient({
      token,
      realm_id,
      instance_type,
    });

    try {
      const response = await client.findJournalEntries({
        limit,
        offset,
        fetchAll,
        ...(filter && {
          field: filter.field,
          operator: filter.operator || '=',
          value: filter.value,
        }),
        ...(sort && {
          [sort.direction]: sort.field,
        }),
      });

      return {
        total_count: response.QueryResponse.maxResults,
        journal_entries: response.QueryResponse.JournalEntry || [],
      };
    } catch (error) {
      throw new QuickbooksError(
        `Failed to list journal entries: ${getQuickbooksErrorMessage(error)}`
      );
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      journal_entries: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              Adjustment: { type: 'bool' },
              TotalAmt: { type: 'number' },
              domain: { type: 'string' },
              sparse: { type: 'bool' },
              Id: { type: 'string' },
              SyncToken: { type: 'string' },
              MetaData: {
                type: {
                  type: 'hash',
                  fields: {
                    CreateTime: { type: 'string' },
                    LastUpdatedTime: { type: 'string' },
                  },
                },
              },
              TxnDate: { type: 'string' },
              CurrencyRef: {
                type: {
                  type: 'hash',
                  fields: {
                    value: { type: 'string' },
                    name: { type: 'string' },
                  },
                },
              },
              PrivateNote: { type: 'string' },
              Line: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      Id: { type: 'string' },
                      Description: { type: 'string' },
                      Amount: { type: 'number' },
                      DetailType: { type: 'string' },
                      JournalEntryLineDetail: {
                        type: {
                          type: 'hash',
                          fields: {
                            PostingType: { type: 'string' },
                            AccountRef: {
                              type: {
                                type: 'hash',
                                fields: {
                                  value: { type: 'string' },
                                  name: { type: 'string' },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              TxnTaxDetail: {
                type: {
                  type: 'hash',
                },
              },
            },
          },
        },
      },
      total_count: { type: 'integer' },
    },
  },
});

export default listJournalEntries;
