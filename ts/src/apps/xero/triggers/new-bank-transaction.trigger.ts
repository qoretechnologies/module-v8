import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { XERO_APP_NAME } from '../constants';
import { fetchXeroData, getTenantIdRequired, getTokenRequired } from '../helpers/constants';
import { getXeroTenantIdAllowedValues } from '../helpers/get-tenant-id-allowed-values';
import { getXeroBankAccountIdAllowedValues } from '../helpers/get-bank-account-id-allowed-values';

const getXeroBankTransactions = async (
  token: string,
  tenantId: string,
  options?: {
    bankAccountId?: string;
    transactionType?: string;
    limit?: number;
  }
) => {
  try {
    let whereClause = '';
    const whereConditions = [];

    if (options?.bankAccountId) {
      whereConditions.push(`BankAccount.AccountID=guid("${options.bankAccountId}")`);
    }

    if (options?.transactionType) {
      whereConditions.push(`Type=="${options.transactionType}"`);
    }

    if (whereConditions.length > 0) {
      whereClause = whereConditions.join(' AND ');
    }

    const params: Record<string, string> = {
      order: 'UpdatedDateUTC DESC',
      page: '1',
      pageSize: options?.limit?.toString() || DEFAULT_TRIGGER_POLL_ITEM_LIMIT.toString(),
    };

    if (whereClause) {
      params.where = whereClause;
    }

    const response = await fetchXeroData<{ BankTransactions: Record<string, any>[] }>({
      token,
      tenantId,
      path: 'BankTransactions',
      params,
    });

    return response.BankTransactions || [];
  } catch (error) {
    console.error('Error fetching Xero bank transactions:', error);

    return [];
  }
};

const xeroNewBankTransactionTrigger = QoreAppCreator.createLocalizedTrigger({
  app: XERO_APP_NAME,
  action: 'new_bank_transaction',
  action_code: EQoreAppActionCode.EVENT,
  options: {
    'xero-tenant-id': {
      type: 'string',
      get_allowed_values: getXeroTenantIdAllowedValues,
      required: true,
    },
    bankAccountId: {
      type: 'string',
      get_allowed_values: getXeroBankAccountIdAllowedValues,
      required: false,
    },
    transactionType: {
      type: 'string',
      required: false,
      allowed_values: [
        { display_name: 'Receive (Money In)', value: 'RECEIVE' },
        { display_name: 'Spend (Money Out)', value: 'SPEND' },
      ],
    },
  },
  event_function: async (context, update, should_stop) => {
    const token = getTokenRequired(context);
    const tenantId = getTenantIdRequired(context);
    const bankAccountId = context.opts?.bankAccountId;
    const transactionType = context.opts?.transactionType;

    const getItems = () => {
      return getXeroBankTransactions(token, tenantId, {
        bankAccountId,
        transactionType,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'xero_new_bank_transaction',
      uniqueField: 'BankTransactionID',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const token = getTokenRequired(context);
    const tenantId = getTenantIdRequired(context);
    const bankAccountId = context.opts?.bankAccountId;
    const transactionType = context.opts?.transactionType;

    try {
      const transactions = await getXeroBankTransactions(token, tenantId, {
        bankAccountId,
        transactionType,
        limit: 1,
      });

      if (transactions.length > 0) {
        return transactions[0];
      }

      return null;
    } catch (error) {
      console.error('Error fetching Xero bank transaction example:', error);

      return null;
    }
  },
  event_info: {
    desc: 'Triggered when a new bank transaction is created in Xero',
    type: {
      type: 'hash',
      fields: {
        BankTransactionID: { type: 'string' },
        BankAccount: {
          type: {
            type: 'hash',
            fields: {
              AccountID: { type: 'string' },
              Code: { type: 'string' },
              Name: { type: 'string' },
            },
          },
        },
        Contact: {
          type: {
            type: 'hash',
            fields: {
              ContactID: { type: 'string' },
              Name: { type: 'string' },
            },
          },
        },
        Date: { type: 'string' },
        DateString: { type: 'string' },
        Status: { type: 'string' },
        LineAmountTypes: { type: 'string' },
        LineItems: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                LineItemID: { type: 'string' },
                Description: { type: 'string' },
                Quantity: { type: 'number' },
                UnitAmount: { type: 'number' },
                LineAmount: { type: 'number' },
                AccountCode: { type: 'string' },
                TaxType: { type: 'string' },
                TaxAmount: { type: 'number' },
              },
            },
          },
        },
        Type: { type: 'string' },
        HasAttachments: { type: 'bool' },
        TotalTax: { type: 'number' },
        IsReconciled: { type: 'bool' },
        SubTotal: { type: 'number' },
        Total: { type: 'number' },
        CurrencyCode: { type: 'string' },
        UpdatedDateUTC: { type: 'string' },
      },
    },
  },
});

export default xeroNewBankTransactionTrigger;
