import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import {
  pollCreatedItemsForTrigger,
  pollUpdatedItemsForTrigger,
} from '../../../global/helpers/event-triggers';
import { QUICKBOOKS_APP_NAME, QuickbooksError } from '../constants';
import { createQuickbooksClient, getQuickbooksErrorMessage } from '../helpers/constants';

const QuickbooksVendorTrigger = QoreAppCreator.createLocalizedTrigger({
  app: QUICKBOOKS_APP_NAME,
  action: 'vendor_trigger',
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
      return fetchVendors({
        token,
        instance_type,
        realm_id,
        action,
      });
    };

    if (action === 'created') {
      await pollCreatedItemsForTrigger({
        trigger_name: 'quickbooks_vendor',
        uniqueField: 'Id',
        getItems,
        update,
        should_stop,
      });
    } else if (action === 'updated') {
      await pollUpdatedItemsForTrigger({
        trigger_name: 'quickbooks_vendor',
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

    const vendors = await fetchVendors({
      token,
      instance_type,
      realm_id,
      action,
    });

    return vendors?.length > 0 ? vendors[0] : null;
  },
  event_info: {
    desc: 'Quickbooks Vendor Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        BillAddr: {
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
        AcctNum: { type: 'string' },
        Vendor1099: { type: 'boolean' },
        CurrencyRef: {
          type: {
            type: 'hash',
            fields: {
              value: { type: 'string' },
              name: { type: 'string' },
            },
          },
        },
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
        GivenName: { type: 'string' },
        FamilyName: { type: 'string' },
        CompanyName: { type: 'string' },
        DisplayName: { type: 'string' },
        PrintOnCheckName: { type: 'string' },
        Active: { type: 'boolean' },
        V4IDPseudonym: { type: 'string' },
        PrimaryPhone: {
          type: {
            type: 'hash',
            fields: {
              FreeFormNumber: { type: 'string' },
            },
          },
        },
        PrimaryEmailAddr: {
          type: {
            type: 'hash',
            fields: {
              Address: { type: 'string' },
            },
          },
        },
        WebAddr: {
          type: {
            type: 'hash',
            fields: {
              URI: { type: 'string' },
            },
          },
        },
      },
    },
  },
});

export default QuickbooksVendorTrigger;

const fetchVendors = async (options: {
  token: string;
  instance_type: string;
  realm_id: string;
  action: string;
}) => {
  const limit = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;
  const { action } = options;

  try {
    const client = createQuickbooksClient(options);

    const response = await client.findVendors({
      limit,
      ...(action === 'created' && { desc: 'MetaData.CreateTime' }),
      ...(action === 'updated' && { desc: 'MetaData.LastUpdatedTime' }),
    });

    return response.QueryResponse.Vendor || [];
  } catch (error) {
    throw new QuickbooksError(
      `Failed to fetch latest vendors: ${getQuickbooksErrorMessage(error)}`
    );
  }
};
