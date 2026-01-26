import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { XERO_APP_NAME } from '../constants';
import { fetchXeroData, getTenantIdRequired, getTokenRequired } from '../helpers/constants';
import { getXeroTenantIdAllowedValues } from '../helpers/get-tenant-id-allowed-values';
import { getXeroContactIdAllowedValues } from '../helpers/get-contact-id-allowed-values';

const getXeroCreditNotes = async (
  token: string,
  tenantId: string,
  options?: {
    contactId?: string;
    status?: string;
    limit?: number;
  }
) => {
  try {
    let whereClause = '';
    const whereConditions = [];

    if (options?.contactId) {
      whereConditions.push(`Contact.ContactID=guid("${options.contactId}")`);
    }

    if (options?.status) {
      whereConditions.push(`Status=="${options.status}"`);
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

    const response = await fetchXeroData<{ CreditNotes: Record<string, any>[] }>({
      token,
      tenantId,
      path: 'CreditNotes',
      params,
    });

    return response.CreditNotes || [];
  } catch (error) {
    console.error('Error fetching Xero credit notes:', error);

    return [];
  }
};

const xeroNewCreditNoteTrigger = QoreAppCreator.createLocalizedTrigger({
  app: XERO_APP_NAME,
  action: 'new_credit_note',
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
      return getXeroCreditNotes(token, tenantId, {
        contactId,
        status,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'xero_new_credit_note',
      uniqueField: 'CreditNoteID',
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
      const creditNotes = await getXeroCreditNotes(token, tenantId, {
        contactId,
        status,
        limit: 1,
      });

      if (creditNotes.length > 0) {
        return creditNotes[0];
      }

      return null;
    } catch (error) {
      console.error('Error fetching Xero credit note example:', error);

      return null;
    }
  },
  event_info: {
    desc: 'Triggered when a new credit note is created in Xero',
    type: {
      type: 'hash',
      fields: {
        CreditNoteID: { type: 'string' },
        CreditNoteNumber: { type: 'string' },
        Payments: {
          type: {
            type: 'list',
            element_type: { type: 'hash' },
          },
        },
        ID: { type: 'string' },
        HasErrors: { type: 'bool' },
        InvoiceAddresses: {
          type: {
            type: 'list',
            element_type: { type: 'hash' },
          },
        },
        CurrencyRate: { type: 'number' },
        Type: { type: 'string' },
        Reference: { type: 'string' },
        RemainingCredit: { type: 'number' },
        Allocations: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                AllocationID: { type: 'string' },
                Amount: { type: 'number' },
                Date: { type: 'string' },
                Invoice: {
                  type: {
                    type: 'hash',
                    fields: {
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
                      LineItems: {
                        type: {
                          type: 'list',
                          element_type: { type: 'hash' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        HasAttachments: { type: 'bool' },
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
        BrandingThemeID: { type: 'string' },
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
        FullyPaidOnDate: { type: 'string' },
        SentToContact: { type: 'bool' },
        AppliedAmount: { type: 'number' },
      },
    },
  },
});

export default xeroNewCreditNoteTrigger;
