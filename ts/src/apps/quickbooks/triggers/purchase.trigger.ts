import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import {
  pollCreatedItemsForTrigger,
  pollUpdatedItemsForTrigger,
} from '../../../global/helpers/event-triggers';
import { QUICKBOOKS_APP_NAME, QuickbooksError } from '../constants';
import { createQuickbooksClient, getQuickbooksErrorMessage } from '../helpers/constants';

const QuickbooksPurchaseTrigger = QoreAppCreator.createLocalizedTrigger({
  app: QUICKBOOKS_APP_NAME,
  action: 'purchase_trigger',
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
      return fetchPurchases({
        token,
        instance_type,
        realm_id,
        action,
      });
    };

    if (action === 'created') {
      await pollCreatedItemsForTrigger({
        trigger_name: 'quickbooks_purchase',
        uniqueField: 'Id',
        getItems,
        update,
        should_stop,
      });
    } else if (action === 'updated') {
      await pollUpdatedItemsForTrigger({
        trigger_name: 'quickbooks_purchase',
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

    const purchases = await fetchPurchases({
      token,
      instance_type,
      realm_id,
      action,
    });

    return purchases?.length > 0 ? purchases[0] : null;
  },
  event_info: {
    desc: 'Quickbooks Purchase Trigger Event Info',
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
        PaymentType: { type: 'string' },
        EntityRef: {
          type: {
            type: 'hash',
            fields: {
              value: { type: 'string' },
              name: { type: 'string' },
              type: { type: 'string' },
            },
          },
        },
        TotalAmt: { type: 'number' },
        PrintStatus: { type: 'string' },
        PurchaseEx: {
          type: {
            type: 'hash',
            fields: {
              any: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      name: { type: 'string' },
                      declaredType: { type: 'string' },
                      scope: { type: 'string' },
                      value: {
                        type: {
                          type: 'hash',
                          fields: {
                            Name: { type: 'string' },
                            Value: { type: 'string' },
                          },
                        },
                      },
                      nil: { type: 'bool' },
                      globalScope: { type: 'bool' },
                      typeSubstituted: { type: 'bool' },
                    },
                  },
                },
              },
            },
          },
        },
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
                Description: { type: 'string' },
                Amount: { type: 'number' },
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
      },
    },
  },
});

export default QuickbooksPurchaseTrigger;

const fetchPurchases = async (options: {
  token: string;
  instance_type: string;
  realm_id: string;
  action: string;
}) => {
  const limit = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;
  const { action } = options;

  try {
    const client = createQuickbooksClient(options);

    const response = await client.findPurchases({
      limit,
      ...(action === 'created' && { desc: 'MetaData.CreateTime' }),
      ...(action === 'updated' && { desc: 'MetaData.LastUpdatedTime' }),
    });

    return response.QueryResponse.Purchase || [];
  } catch (error) {
    throw new QuickbooksError(
      `Failed to fetch latest purchases: ${getQuickbooksErrorMessage(error)}`
    );
  }
};
