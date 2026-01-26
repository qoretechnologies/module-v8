import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { XERO_APP_NAME } from '../constants';
import { fetchXeroData, getTenantIdRequired, getTokenRequired } from '../helpers/constants';
import { getXeroTenantIdAllowedValues } from '../helpers/get-tenant-id-allowed-values';
import { getXeroContactIdAllowedValues } from '../helpers/get-contact-id-allowed-values';

const getXeroPayments = async (
  token: string,
  tenantId: string,
  options?: {
    contactId?: string;
    status?: string;
    bankAccountId?: string;
    limit?: number;
  }
) => {
  try {
    let whereClause = '';
    const whereConditions = [];

    if (options?.contactId) {
      whereConditions.push(`Invoice.Contact.ContactID=guid("${options.contactId}")`);
    }

    if (options?.status) {
      whereConditions.push(`Status=="${options.status}"`);
    }

    if (options?.bankAccountId) {
      whereConditions.push(`Account.AccountID=guid("${options.bankAccountId}")`);
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

    const response = await fetchXeroData<{ Payments: Record<string, any>[] }>({
      token,
      tenantId,
      path: 'Payments',
      params,
    });

    return response.Payments || [];
  } catch (error) {
    console.error('Error fetching Xero payments:', error);

    return [];
  }
};

const xeroNewPaymentTrigger = QoreAppCreator.createLocalizedTrigger({
  app: XERO_APP_NAME,
  action: 'new_payment',
  action_code: EQoreAppActionCode.EVENT,
  options: {
    'xero-tenant-id': {
      type: 'string',
      get_allowed_values: getXeroTenantIdAllowedValues,
      required: true,
    },
    contactId: {
      type: 'string',
      get_allowed_values: getXeroContactIdAllowedValues,
      required: false,
    },
    status: {
      type: 'string',
      required: false,
      allowed_values: [
        { display_name: 'Authorised', value: 'AUTHORISED' },
        { display_name: 'Deleted', value: 'DELETED' },
      ],
    },
    bankAccountId: {
      type: 'string',
      required: false,
    },
  },
  event_function: async (context, update, should_stop) => {
    const token = getTokenRequired(context);
    const tenantId = getTenantIdRequired(context);
    const contactId = context.opts?.contactId;
    const status = context.opts?.status;
    const bankAccountId = context.opts?.bankAccountId;

    const getItems = () => {
      return getXeroPayments(token, tenantId, {
        contactId,
        status,
        bankAccountId,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'xero_new_payment',
      uniqueField: 'PaymentID',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const token = getTokenRequired(context);
    const tenantId = getTenantIdRequired(context);
    const contactId = context.opts?.contactId;
    const status = context.opts?.status;
    const bankAccountId = context.opts?.bankAccountId;

    try {
      const payments = await getXeroPayments(token, tenantId, {
        contactId,
        status,
        bankAccountId,
        limit: 1,
      });

      if (payments.length > 0) {
        return payments[0];
      }

      return null;
    } catch (error) {
      console.error('Error fetching Xero payment example:', error);

      return null;
    }
  },
  event_info: {
    desc: 'Triggered when a new payment is created in Xero',
    type: {
      type: 'hash',
      fields: {
        PaymentID: { type: 'string' },
        Date: { type: 'string' },
        BankAmount: { type: 'number' },
        Amount: { type: 'number' },
        Account: {
          type: {
            type: 'hash',
            fields: {
              AccountID: { type: 'string' },
              Code: { type: 'string' },
              Name: { type: 'string' },
            },
          },
        },
        Reference: { type: 'string' },
        CurrencyRate: { type: 'number' },
        PaymentType: { type: 'string' },
        Status: { type: 'string' },
        UpdatedDateUTC: { type: 'string' },
        Invoice: {
          type: {
            type: 'hash',
            fields: {
              Type: { type: 'string' },
              InvoiceID: { type: 'string' },
              InvoiceNumber: { type: 'string' },
              Payments: {
                type: {
                  type: 'list',
                  element_type: { type: 'hash' },
                },
              },
              CreditNotes: {
                type: {
                  type: 'list',
                  element_type: { type: 'hash' },
                },
              },
              Prepayments: {
                type: {
                  type: 'list',
                  element_type: { type: 'hash' },
                },
              },
              Overpayments: {
                type: {
                  type: 'list',
                  element_type: { type: 'hash' },
                },
              },
              IsDiscounted: { type: 'bool' },
              InvoiceAddresses: {
                type: {
                  type: 'list',
                  element_type: { type: 'hash' },
                },
              },
              HasErrors: { type: 'bool' },
              InvoicePaymentServices: {
                type: {
                  type: 'list',
                  element_type: { type: 'hash' },
                },
              },
              Contact: {
                type: {
                  type: 'hash',
                  fields: {
                    ContactID: { type: 'string' },
                    Name: { type: 'string' },
                    Addresses: {
                      type: {
                        type: 'list',
                        element_type: { type: 'hash' },
                      },
                    },
                    Phones: {
                      type: {
                        type: 'list',
                        element_type: { type: 'hash' },
                      },
                    },
                    ContactGroups: {
                      type: {
                        type: 'list',
                        element_type: { type: 'hash' },
                      },
                    },
                    ContactPersons: {
                      type: {
                        type: 'list',
                        element_type: { type: 'hash' },
                      },
                    },
                    HasValidationErrors: { type: 'bool' },
                  },
                },
              },
              LineItems: {
                type: {
                  type: 'list',
                  element_type: { type: 'hash' },
                },
              },
              CurrencyCode: { type: 'string' },
            },
          },
        },
        CreditNote: {
          type: {
            type: 'hash',
            fields: {
              CreditNoteID: { type: 'string' },
              CreditNoteNumber: { type: 'string' },
              Contact: {
                type: {
                  type: 'hash',
                  fields: {
                    ContactID: { type: 'string' },
                    Name: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        IsReconciled: { type: 'bool' },
        HasAccount: { type: 'bool' },
        HasValidationErrors: { type: 'bool' },
      },
    },
  },
});

export default xeroNewPaymentTrigger;
