import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import {
  pollCreatedItemsForTrigger,
  pollUpdatedItemsForTrigger,
} from '../../../global/helpers/event-triggers';
import { QUICKBOOKS_APP_NAME, QuickbooksError } from '../constants';
import { createQuickbooksClient, getQuickbooksErrorMessage } from '../helpers/constants';

const QuickbooksPurchaseOrderTrigger = QoreAppCreator.createLocalizedTrigger({
  app: QUICKBOOKS_APP_NAME,
  action: 'purchase_order_trigger',
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
      return fetchPurchaseOrders({
        token,
        instance_type,
        realm_id,
        action,
      });
    };

    if (action === 'created') {
      await pollCreatedItemsForTrigger({
        trigger_name: 'quickbooks_purchase_order',
        uniqueField: 'Id',
        getItems,
        update,
        should_stop,
      });
    } else if (action === 'updated') {
      await pollUpdatedItemsForTrigger({
        trigger_name: 'quickbooks_purchase_order',
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

    const purchaseOrders = await fetchPurchaseOrders({
      token,
      instance_type,
      realm_id,
      action,
    });

    return purchaseOrders?.length > 0 ? purchaseOrders[0] : null;
  },
  event_info: {
    desc: 'Quickbooks Purchase Order Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        VendorAddr: {
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
        ShipAddr: {
          type: {
            type: 'hash',
            fields: {
              Id: { type: 'string' },
              Line1: { type: 'string' },
              Line2: { type: 'string' },
              Line3: { type: 'string' },
              Lat: { type: 'string' },
              Long: { type: 'string' },
            },
          },
        },
        EmailStatus: { type: 'string' },
        POStatus: { type: 'string' },
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
        LinkedTxn: {
          type: {
            type: 'list',
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
                ItemBasedExpenseLineDetail: {
                  type: {
                    type: 'hash',
                    fields: {
                      BillableStatus: { type: 'string' },
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

export default QuickbooksPurchaseOrderTrigger;

const fetchPurchaseOrders = async (options: {
  token: string;
  instance_type: string;
  realm_id: string;
  action: string;
}) => {
  const limit = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;
  const { action } = options;

  try {
    const client = createQuickbooksClient(options);

    const response = await client.findPurchaseOrders({
      limit,
      ...(action === 'created' && { desc: 'MetaData.CreateTime' }),
      ...(action === 'updated' && { desc: 'MetaData.LastUpdatedTime' }),
    });

    return response.QueryResponse.PurchaseOrder || [];
  } catch (error) {
    throw new QuickbooksError(
      `Failed to fetch latest purchase orders: ${getQuickbooksErrorMessage(error)}`
    );
  }
};
