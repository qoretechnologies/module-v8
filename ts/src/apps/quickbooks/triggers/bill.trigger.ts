import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import {
  pollCreatedItemsForTrigger,
  pollUpdatedItemsForTrigger,
} from '../../../global/helpers/event-triggers';
import { QUICKBOOKS_APP_NAME, QuickbooksError } from '../constants';
import { createQuickbooksClient, getQuickbooksErrorMessage } from '../helpers/constants';

const QuickbooksBillTrigger = QoreAppCreator.createLocalizedTrigger({
  app: QUICKBOOKS_APP_NAME,
  action: 'bill_trigger',
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
      return fetchBills({
        token,
        instance_type,
        realm_id,
        action,
      });
    };

    if (action === 'created') {
      await pollCreatedItemsForTrigger({
        trigger_name: 'quickbooks_bill',
        uniqueField: 'Id',
        getItems,
        update,
        should_stop,
      });
    } else if (action === 'updated') {
      await pollUpdatedItemsForTrigger({
        trigger_name: 'quickbooks_bill',
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

    const bills = await fetchBills({
      token,
      instance_type,
      realm_id,
      action,
    });

    return bills?.length > 0 ? bills[0] : null;
  },
  event_info: {
    desc: 'Quickbooks New Bill Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        DueDate: { type: 'string' },
        VendorAddr: {
          type: {
            type: 'hash',
            fields: {
              Id: { type: 'string' },
              Line1: { type: 'string' },
              City: { type: 'string' },
              CountrySubDivisionCode: { type: 'string' },
              PostalCode: { type: 'string' },
              Lat: { type: 'string' },
              Long: { type: 'string' },
            },
          },
        },
        Balance: { type: 'number' },
        domain: { type: 'string' },
        sparse: { type: 'boolean' },
        Id: { type: 'string' },
        SyncToken: { type: 'string' },
        MetaData: {
          type: {
            type: 'hash',
            fields: {
              CreateTime: { type: 'string' },
              LastModifiedByRef: {
                type: {
                  type: 'hash',
                  fields: {
                    value: { type: 'string' },
                  },
                },
              },
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
        LinkedTxn: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                TxnId: { type: 'string' },
                TxnType: { type: 'string' },
              },
            },
          },
        },
        Line: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                Id: { type: 'string' },
                LineNum: { type: 'integer' },
                Amount: { type: 'number' },
                LinkedTxn: {
                  type: {
                    type: 'list',
                  },
                },
                DetailType: { type: 'string' },
                AccountBasedExpenseLineDetail: {
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
                      BillableStatus: { type: 'string' },
                      TaxCodeRef: {
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
        VendorRef: {
          type: {
            type: 'hash',
            fields: {
              value: { type: 'string' },
              name: { type: 'string' },
            },
          },
        },
        APAccountRef: {
          type: {
            type: 'hash',
            fields: {
              value: { type: 'string' },
              name: { type: 'string' },
            },
          },
        },
        TotalAmt: { type: 'number' },
      },
    },
  },
});

export default QuickbooksBillTrigger;

const fetchBills = async (options: {
  token: string;
  instance_type: string;
  realm_id: string;
  action: string;
}) => {
  const limit = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;
  const { action } = options;

  try {
    const client = createQuickbooksClient(options);

    const response = await client.findBills({
      limit,
      ...(action === 'created' && { desc: 'MetaData.CreateTime' }),
      ...(action === 'updated' && { desc: 'MetaData.LastUpdatedTime' }),
    });

    return response.QueryResponse.Bill || [];
  } catch (error) {
    throw new QuickbooksError(`Failed to fetch latest bills: ${getQuickbooksErrorMessage(error)}`);
  }
};
