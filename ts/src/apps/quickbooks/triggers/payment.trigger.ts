import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import {
  pollCreatedItemsForTrigger,
  pollUpdatedItemsForTrigger,
} from '../../../global/helpers/event-triggers';
import { QUICKBOOKS_APP_NAME, QuickbooksError } from '../constants';
import { createQuickbooksClient, getQuickbooksErrorMessage } from '../helpers/constants';

const QuickbooksPaymentTrigger = QoreAppCreator.createLocalizedTrigger({
  app: QUICKBOOKS_APP_NAME,
  action: 'payment_trigger',
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
      return fetchPayments({
        token,
        instance_type,
        realm_id,
        action,
      });
    };

    if (action === 'created') {
      await pollCreatedItemsForTrigger({
        trigger_name: 'quickbooks_payment',
        uniqueField: 'Id',
        getItems,
        update,
        should_stop,
      });
    } else if (action === 'updated') {
      await pollUpdatedItemsForTrigger({
        trigger_name: 'quickbooks_payment',
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

    const payments = await fetchPayments({
      token,
      instance_type,
      realm_id,
      action,
    });

    return payments?.length > 0 ? payments[0] : null;
  },
  event_info: {
    desc: 'Quickbooks Payment Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        CustomerRef: {
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
            },
          },
        },
        PaymentMethodRef: {
          type: {
            type: 'hash',
            fields: {
              value: { type: 'string' },
            },
          },
        },
        PaymentRefNum: { type: 'string' },
        TotalAmt: { type: 'number' },
        UnappliedAmt: { type: 'number' },
        ProcessPayment: { type: 'bool' },
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
                      },
                    },
                  },
                },
                LineEx: {
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
              },
            },
          },
        },
      },
    },
  },
});

export default QuickbooksPaymentTrigger;

const fetchPayments = async (options: {
  token: string;
  instance_type: string;
  realm_id: string;
  action: string;
}) => {
  const limit = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;
  const { action } = options;

  try {
    const client = createQuickbooksClient(options);

    const response = await client.findPayments({
      limit,
      ...(action === 'created' && { desc: 'MetaData.CreateTime' }),
      ...(action === 'updated' && { desc: 'MetaData.LastUpdatedTime' }),
    });

    return response.QueryResponse.Payment || [];
  } catch (error) {
    throw new QuickbooksError(
      `Failed to fetch latest payments: ${getQuickbooksErrorMessage(error)}`
    );
  }
};
