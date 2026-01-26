import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { XERO_APP_NAME } from '../constants';
import { fetchXeroData, getTenantIdRequired, getTokenRequired } from '../helpers/constants';
import { getXeroTenantIdAllowedValues } from '../helpers/get-tenant-id-allowed-values';
import { getXeroContactIdAllowedValues } from '../helpers/get-contact-id-allowed-values';

const getXeroBills = async (
  token: string,
  tenantId: string,
  options?: {
    contactId?: string;
    status?: string;
    limit?: number;
  }
) => {
  try {
    let whereClause = 'Type=="ACCPAY"';

    if (options?.contactId) {
      whereClause += ` AND Contact.ContactID=guid("${options.contactId}")`;
    }

    if (options?.status) {
      whereClause += ` AND Status=="${options.status}"`;
    }

    const params: Record<string, string> = {
      where: whereClause,
      order: 'UpdatedDateUTC DESC',
      page: '1',
      pageSize: options?.limit?.toString() || DEFAULT_TRIGGER_POLL_ITEM_LIMIT.toString(),
    };

    const response = await fetchXeroData<{ Invoices: Record<string, any>[] }>({
      token,
      tenantId,
      path: 'Invoices',
      params,
    });

    return response.Invoices || [];
  } catch (error) {
    console.error('Error fetching Xero bills:', error);

    return [];
  }
};

const xeroNewBillTrigger = QoreAppCreator.createLocalizedTrigger({
  app: XERO_APP_NAME,
  action: 'new_bill',
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
        { display_name: 'Draft', value: 'DRAFT' },
        { display_name: 'Submitted', value: 'SUBMITTED' },
        { display_name: 'Authorised', value: 'AUTHORISED' },
        { display_name: 'Paid', value: 'PAID' },
        { display_name: 'Deleted', value: 'DELETED' },
        { display_name: 'Voided', value: 'VOIDED' },
      ],
    },
  },
  event_function: async (context, update, should_stop) => {
    const token = getTokenRequired(context);
    const tenantId = getTenantIdRequired(context);
    const contactId = context.opts?.contactId;
    const status = context.opts?.status;

    const getItems = () => {
      return getXeroBills(token, tenantId, {
        contactId,
        status,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'xero_new_bill',
      uniqueField: 'InvoiceID',
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

    try {
      const bills = await getXeroBills(token, tenantId, {
        contactId,
        status,
        limit: 1,
      });

      if (bills.length > 0) {
        return bills[0];
      }

      return null;
    } catch (error) {
      console.error('Error fetching Xero bill example:', error);

      return null;
    }
  },
  event_info: {
    desc: 'Triggered when a new bill is created in Xero',
    type: {
      type: 'hash',
      fields: {
        Type: { type: 'string' },
        InvoiceID: { type: 'string' },
        InvoiceNumber: { type: 'string' },
        Reference: { type: 'string' },
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
        AmountDue: { type: 'number' },
        AmountPaid: { type: 'number' },
        AmountCredited: { type: 'number' },
        CurrencyRate: { type: 'number' },
        IsDiscounted: { type: 'bool' },
        HasAttachments: { type: 'bool' },
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
        DateString: { type: 'string' },
        Date: { type: 'string' },
        DueDateString: { type: 'string' },
        DueDate: { type: 'string' },
        Status: { type: 'string' },
        LineAmountTypes: { type: 'string' },
        LineItems: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                ItemCode: { type: 'string' },
                Description: { type: 'string' },
                UnitAmount: { type: 'number' },
                TaxType: { type: 'string' },
                TaxAmount: { type: 'number' },
                LineAmount: { type: 'number' },
                AccountCode: { type: 'string' },
                Item: {
                  type: {
                    type: 'hash',
                    fields: {
                      ItemID: { type: 'string' },
                      Name: { type: 'string' },
                      Code: { type: 'string' },
                    },
                  },
                },
                Tracking: {
                  type: {
                    type: 'list',
                    element_type: { type: 'hash' },
                  },
                },
                Quantity: { type: 'number' },
                LineItemID: { type: 'string' },
                AccountID: { type: 'string' },
              },
            },
          },
        },
        SubTotal: { type: 'number' },
        TotalTax: { type: 'number' },
        Total: { type: 'number' },
        UpdatedDateUTC: { type: 'string' },
        CurrencyCode: { type: 'string' },
      },
    },
  },
});

export default xeroNewBillTrigger;
