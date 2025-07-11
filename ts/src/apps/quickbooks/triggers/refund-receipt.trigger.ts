import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import {
  pollCreatedItemsForTrigger,
  pollUpdatedItemsForTrigger,
} from '../../../global/helpers/event-triggers';
import { QUICKBOOKS_APP_NAME, QuickbooksError } from '../constants';
import { createQuickbooksClient, getQuickbooksErrorMessage } from '../helpers/constants';

const QuickbooksRefundReceiptTrigger = QoreAppCreator.createLocalizedTrigger({
  app: QUICKBOOKS_APP_NAME,
  action: 'refund_receipt_trigger',
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
      return fetchRefundReceipts({
        token,
        instance_type,
        realm_id,
        action,
      });
    };

    if (action === 'created') {
      await pollCreatedItemsForTrigger({
        trigger_name: 'quickbooks_refund_receipt',
        uniqueField: 'Id',
        getItems,
        update,
        should_stop,
      });
    } else if (action === 'updated') {
      await pollUpdatedItemsForTrigger({
        trigger_name: 'quickbooks_refund_receipt',
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

    const refundReceipts = await fetchRefundReceipts({
      token,
      instance_type,
      realm_id,
      action,
    });

    return refundReceipts?.length > 0 ? refundReceipts[0] : null;
  },
  event_info: {
    desc: 'Quickbooks Refund Receipt Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
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
        CustomField: {
          type: {
            type: 'list',
          },
        },
        DocNumber: { type: 'string' },
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
                Id: { type: 'string' },
                LineNum: { type: 'integer' },
                Description: { type: 'string' },
                Amount: { type: 'number' },
                DetailType: { type: 'string' },
                SalesItemLineDetail: {
                  type: {
                    type: 'hash',
                    fields: {
                      ItemRef: {
                        type: {
                          type: 'hash',
                          fields: {
                            value: { type: 'string' },
                            name: { type: 'string' },
                          },
                        },
                      },
                      UnitPrice: { type: 'number' },
                      Qty: { type: 'number' },
                      ItemAccountRef: {
                        type: {
                          type: 'hash',
                          fields: {
                            value: { type: 'string' },
                            name: { type: 'string' },
                          },
                        },
                      },
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
                SubTotalLineDetail: {
                  type: {
                    type: 'hash',
                  },
                },
              },
            },
          },
        },
        TxnTaxDetail: {
          type: {
            type: 'hash',
            fields: {
              TotalTax: { type: 'number' },
            },
          },
        },
        CustomerRef: {
          type: {
            type: 'hash',
            fields: {
              value: { type: 'string' },
              name: { type: 'string' },
            },
          },
        },
        CustomerMemo: {
          type: {
            type: 'hash',
            fields: {
              value: { type: 'string' },
            },
          },
        },
        BillAddr: {
          type: {
            type: 'hash',
            fields: {
              Id: { type: 'string' },
              Line1: { type: 'string' },
              Line2: { type: 'string' },
              Line3: { type: 'string' },
              Line4: { type: 'string' },
              Lat: { type: 'string' },
              Long: { type: 'string' },
            },
          },
        },
        FreeFormAddress: { type: 'boolean' },
        TotalAmt: { type: 'number' },
        ApplyTaxAfterDiscount: { type: 'boolean' },
        PrintStatus: { type: 'string' },
        BillEmail: {
          type: {
            type: 'hash',
            fields: {
              Address: { type: 'string' },
            },
          },
        },
        Balance: { type: 'number' },
        PaymentMethodRef: {
          type: {
            type: 'hash',
            fields: {
              value: { type: 'string' },
              name: { type: 'string' },
            },
          },
        },
        DepositToAccountRef: {
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
});

export default QuickbooksRefundReceiptTrigger;

const fetchRefundReceipts = async (options: {
  token: string;
  instance_type: string;
  realm_id: string;
  action: string;
}) => {
  const limit = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;
  const { action } = options;

  try {
    const client = createQuickbooksClient(options);

    const response = await client.findRefundReceipts({
      limit,
      ...(action === 'created' && { desc: 'MetaData.CreateTime' }),
      ...(action === 'updated' && { desc: 'MetaData.LastUpdatedTime' }),
    });

    return response.QueryResponse.RefundReceipt || [];
  } catch (error) {
    throw new QuickbooksError(
      `Failed to fetch latest refund receipts: ${getQuickbooksErrorMessage(error)}`
    );
  }
};
