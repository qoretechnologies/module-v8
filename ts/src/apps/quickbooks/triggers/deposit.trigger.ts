import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import {
  pollCreatedItemsForTrigger,
  pollUpdatedItemsForTrigger,
} from '../../../global/helpers/event-triggers';
import { QUICKBOOKS_APP_NAME, QuickbooksError } from '../constants';
import { createQuickbooksClient, getQuickbooksErrorMessage } from '../helpers/constants';

const QuickbooksDepositTrigger = QoreAppCreator.createLocalizedTrigger({
  app: QUICKBOOKS_APP_NAME,
  action: 'deposit_trigger',
  action_code: EQoreAppActionCode.EVENT,
  options: {
    action: {
      type: 'string',
      required: true,
      default_value: 'created',
      allowed_values: [
        { value: 'created', display_name: 'Created' },
        { value: 'updated', display_name: 'Updated' },
      ],
    },
  },
  event_function: async (context, update, should_stop) => {
    const { token, instance_type, realm_id, action } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'instance_type', 'realm_id'],
      optionFields: ['action'],
      ErrorClass: QuickbooksError,
    });

    const getItems = () => {
      return fetchDeposits({
        token,
        instance_type,
        realm_id,
        action,
      });
    };

    if (action === 'created') {
      await pollCreatedItemsForTrigger({
        trigger_name: 'quickbooks_deposit',
        uniqueField: 'Id',
        getItems,
        update,
        should_stop,
      });
    } else if (action === 'updated') {
      await pollUpdatedItemsForTrigger({
        trigger_name: 'quickbooks_deposit',
        uniqueField: 'Id',
        getItems,
        update,
        should_stop,
        updatedDateField: 'MetaData.LastUpdatedTime',
      });
    }
  },
  get_example_event_data: async (context) => {
    const { token, instance_type, realm_id, action } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'instance_type', 'realm_id'],
      optionFields: ['action'],
      ErrorClass: QuickbooksError,
    });

    const deposits = await fetchDeposits({
      token,
      instance_type,
      realm_id,
      action,
    });

    return deposits?.length > 0 ? deposits[0] : null;
  },
  event_info: {
    desc: 'Quickbooks Deposit Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        DepositToAccountRef: {
          type: {
            type: 'hash',
            fields: {
              value: { type: 'string' },
              name: { type: 'string' },
            },
          },
        },
        CashBack: {
          type: {
            type: 'hash',
            fields: {
              AccountRef: {
                type: {
                  type: 'hash',
                  fields: {
                    value: { type: 'string' },
                    name: { type: 'string' },
                  },
                },
              },
              Amount: { type: 'number' },
              Memo: { type: 'string' },
            },
          },
        },
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
        Line: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                Amount: { type: 'number' },
                LinkedTxn: {
                  type: {
                    type: 'list',
                    element_type: {
                      type: 'hash',
                      fields: {
                        TxnId: { type: 'string' },
                        TxnType: { type: 'string' },
                        TxnLineId: { type: 'string' },
                      },
                    },
                  },
                },
                DepositLineDetail: {
                  type: {
                    type: 'hash',
                    fields: {
                      PaymentMethodRef: {
                        type: {
                          type: 'hash',
                          fields: {
                            value: { type: 'string' },
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
      },
    },
  },
});

export default QuickbooksDepositTrigger;

const fetchDeposits = async (options: {
  token: string;
  instance_type: string;
  realm_id: string;
  action: string;
}) => {
  const limit = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;
  const { action } = options;

  try {
    const client = createQuickbooksClient(options);

    const response = await client.findDeposits({
      limit,
      ...(action === 'created' && { desc: 'MetaData.CreateTime' }),
      ...(action === 'updated' && { desc: 'MetaData.LastUpdatedTime' }),
    });

    return response.QueryResponse.Deposit || [];
  } catch (error) {
    throw new QuickbooksError(
      `Failed to fetch latest deposits: ${getQuickbooksErrorMessage(error)}`
    );
  }
};
