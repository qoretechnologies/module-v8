import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { XERO_APP_NAME } from '../constants';
import { fetchXeroData, getTenantIdRequired, getTokenRequired } from '../helpers/constants';
import { getXeroTenantIdAllowedValues } from '../helpers/get-tenant-id-allowed-values';

const getXeroContacts = async (
  token: string,
  tenantId: string,
  options?: {
    contactType?: 'CUSTOMER' | 'SUPPLIER' | 'ALL';
    limit?: number;
  }
) => {
  try {
    let whereClause = '';
    if (options?.contactType === 'CUSTOMER') {
      whereClause = 'IsCustomer==true';
    } else if (options?.contactType === 'SUPPLIER') {
      whereClause = 'IsSupplier==true';
    }

    const params: Record<string, string> = {
      order: 'UpdatedDateUTC DESC',
      page: '1',
      pageSize: options?.limit?.toString() || DEFAULT_TRIGGER_POLL_ITEM_LIMIT.toString(),
    };

    if (whereClause) {
      params.where = whereClause;
    }

    const response = await fetchXeroData<{ Contacts: Record<string, any>[] }>({
      token,
      tenantId,
      path: 'Contacts',
      params,
    });

    return response.Contacts || [];
  } catch (error) {
    console.error('Error fetching Xero contacts:', error);

    return [];
  }
};

const xeroNewContactTrigger = QoreAppCreator.createLocalizedTrigger({
  app: XERO_APP_NAME,
  action: 'new_contact',
  action_code: EQoreAppActionCode.EVENT,
  options: {
    'xero-tenant-id': {
      type: 'string',
      get_allowed_values: getXeroTenantIdAllowedValues,
      required: true,
    },
    contactType: {
      type: 'string',
      required: false,
      allowed_values: [
        { display_name: 'All Contacts', value: 'ALL' },
        { display_name: 'Customers Only', value: 'CUSTOMER' },
        { display_name: 'Suppliers Only', value: 'SUPPLIER' },
      ],
      default_value: 'ALL',
    },
  },
  event_function: async (context, update, should_stop) => {
    const token = getTokenRequired(context);
    const tenantId = getTenantIdRequired(context);
    const contactType = context.opts?.contactType || 'ALL';

    const getItems = () => {
      return getXeroContacts(token, tenantId, {
        contactType: contactType as 'CUSTOMER' | 'SUPPLIER' | 'ALL',
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'xero_new_contact',
      uniqueField: 'ContactID',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const token = getTokenRequired(context);
    const tenantId = getTenantIdRequired(context);
    const contactType = context.opts?.contactType || 'ALL';

    try {
      const contacts = await getXeroContacts(token, tenantId, {
        contactType: contactType as 'CUSTOMER' | 'SUPPLIER' | 'ALL',
        limit: 1,
      });

      if (contacts.length > 0) {
        return contacts[0];
      }

      return null;
    } catch (error) {
      console.error('Error fetching Xero contact example:', error);

      return null;
    }
  },
  event_info: {
    desc: 'Triggered when a new contact is created in Xero',
    type: {
      type: 'hash',
      fields: {
        ContactID: { type: 'string' },
        ContactStatus: { type: 'string' },
        Name: { type: 'string' },
        Addresses: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                AddressType: { type: 'string' },
                City: { type: 'string' },
                Region: { type: 'string' },
                PostalCode: { type: 'string' },
                Country: { type: 'string' },
                AddressLine1: { type: 'string' },
                AddressLine2: { type: 'string' },
                AddressLine3: { type: 'string' },
                AddressLine4: { type: 'string' },
              },
            },
          },
        },
        Phones: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                PhoneType: { type: 'string' },
                PhoneNumber: { type: 'string' },
                PhoneAreaCode: { type: 'string' },
                PhoneCountryCode: { type: 'string' },
              },
            },
          },
        },
        UpdatedDateUTC: { type: 'string' },
        ContactGroups: {
          type: {
            type: 'list',
            element_type: { type: 'string' },
          },
        },
        IsSupplier: { type: 'bool' },
        IsCustomer: { type: 'bool' },
        DefaultCurrency: { type: 'string' },
        Balances: {
          type: {
            type: 'hash',
            fields: {
              AccountsReceivable: {
                type: {
                  type: 'hash',
                  fields: {
                    Outstanding: { type: 'number' },
                    Overdue: { type: 'number' },
                  },
                },
              },
              AccountsPayable: {
                type: {
                  type: 'hash',
                  fields: {
                    Outstanding: { type: 'number' },
                    Overdue: { type: 'number' },
                  },
                },
              },
            },
          },
        },
        ContactPersons: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                FirstName: { type: 'string' },
                LastName: { type: 'string' },
                EmailAddress: { type: 'string' },
                IncludeInEmails: { type: 'bool' },
              },
            },
          },
        },
        HasAttachments: { type: 'bool' },
        HasValidationErrors: { type: 'bool' },
        FirstName: { type: 'string' },
        LastName: { type: 'string' },
        EmailAddress: { type: 'string' },
        Website: { type: 'string' },
        TaxNumber: { type: 'string' },
      },
    },
  },
});

export default xeroNewContactTrigger;
