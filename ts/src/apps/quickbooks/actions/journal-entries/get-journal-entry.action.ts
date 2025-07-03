import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { QUICKBOOKS_APP_NAME, QuickbooksError } from '../../constants';
import { createQuickbooksClient } from '../../helpers/constants';
import { getQuickbooksJournalEntryIdAllowedValues } from '../../helpers/get-journal-entry-id-allowed-values';

const options = {
  id: {
    type: 'string',
    required: true,
    get_allowed_values: getQuickbooksJournalEntryIdAllowedValues,
  },
} satisfies TQoreOptions;

const getJournalEntry = QoreAppCreator.createLocalizedAction<typeof options>({
  app: QUICKBOOKS_APP_NAME,
  action: 'get_journal_entry',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, realm_id, instance_type, id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'realm_id', 'instance_type'],
      optionFields: ['id'],
      ErrorClass: QuickbooksError,
    });

    const client = createQuickbooksClient({
      token,
      realm_id,
      instance_type,
    });

    try {
      const response = await client.getJournalEntry(id);

      return response.JournalEntry;
    } catch (error) {
      throw new QuickbooksError(`Failed to get journal entry: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      Adjustment: { type: 'boolean' },
      TotalAmt: { type: 'number' },
      domain: { type: 'string' },
      sparse: { type: 'boolean' },
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
});

export default getJournalEntry;
