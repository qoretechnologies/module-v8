import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { XERO_APP_NAME } from '../constants';
import { fetchXeroData, getTenantIdRequired, getTokenRequired } from '../helpers/constants';
import { getXeroTenantIdAllowedValues } from '../helpers/get-tenant-id-allowed-values';
import { getXeroContactIdAllowedValues } from '../helpers/get-contact-id-allowed-values';

const getXeroPurchaseOrders = async (
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

    const response = await fetchXeroData<{ PurchaseOrders: Record<string, any>[] }>({
      token,
      tenantId,
      path: 'PurchaseOrders',
      params,
    });

    return response.PurchaseOrders || [];
  } catch (error) {
    console.error('Error fetching Xero purchase orders:', error);

    return [];
  }
};

const xeroNewPurchaseOrderTrigger = QoreAppCreator.createLocalizedTrigger({
  app: XERO_APP_NAME,
  action: 'new_purchase_order',
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
        { display_name: 'Billed', value: 'BILLED' },
        { display_name: 'Deleted', value: 'DELETED' },
      ],
    },
  },
  event_function: async (context, update, should_stop) => {
    const token = getTokenRequired(context);
    const tenantId = getTenantIdRequired(context);
    const contactId = context.opts?.contactId;
    const status = context.opts?.status;

    const getItems = () => {
      return getXeroPurchaseOrders(token, tenantId, {
        contactId,
        status,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'xero_new_purchase_order',
      uniqueField: 'PurchaseOrderID',
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
      const purchaseOrders = await getXeroPurchaseOrders(token, tenantId, {
        contactId,
        status,
        limit: 1,
      });

      if (purchaseOrders.length > 0) {
        return purchaseOrders[0];
      }

      return null;
    } catch (error) {
      console.error('Error fetching Xero purchase order example:', error);

      return null;
    }
  },
  event_info: {
    desc: 'Triggered when a new purchase order is created in Xero',
    type: {
      type: 'hash',
      fields: {
        PurchaseOrderID: { type: 'string' },
        PurchaseOrderNumber: { type: 'string' },
        DateString: { type: 'string' },
        Date: { type: 'string' },
        DeliveryDate: { type: 'string' },
        DeliveryAddress: { type: 'string' },
        AttentionTo: { type: 'string' },
        Telephone: { type: 'string' },
        DeliveryInstructions: { type: 'string' },
        HasErrors: { type: 'boolean' },
        IsDiscounted: { type: 'boolean' },
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
                ItemCode: { type: 'string' },
                Tracking: {
                  type: {
                    type: 'list',
                    element_type: { type: 'hash' },
                  },
                },
              },
            },
          },
        },
        SubTotal: { type: 'number' },
        TotalTax: { type: 'number' },
        Total: { type: 'number' },
        UpdatedDateUTC: { type: 'string' },
        CurrencyCode: { type: 'string' },
        Contact: {
          type: {
            type: 'hash',
            fields: {
              ContactID: { type: 'string' },
              ContactStatus: { type: 'string' },
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
              UpdatedDateUTC: { type: 'string' },
              ContactGroups: {
                type: {
                  type: 'list',
                  element_type: { type: 'hash' },
                },
              },
              DefaultCurrency: { type: 'string' },
              ContactPersons: {
                type: {
                  type: 'list',
                  element_type: { type: 'hash' },
                },
              },
              HasValidationErrors: { type: 'boolean' },
            },
          },
        },
        Reference: { type: 'string' },
        Type: { type: 'string' },
        BrandingThemeID: { type: 'string' },
        SentToContact: { type: 'boolean' },
        CurrencyRate: { type: 'number' },
        HasAttachments: { type: 'boolean' },
      },
    },
  },
});

export default xeroNewPurchaseOrderTrigger;
