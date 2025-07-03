import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreAppActionOption,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { QUICKBOOKS_APP_NAME, QuickbooksError } from '../../constants';
import { createQuickbooksClient } from '../../helpers/constants';
import { getQuickbooksAccountIdAllowedValues } from '../../helpers/get-account-id-allowed-values';

const invenotyItemOptions = {
  account_id: {
    type: 'string',
    required: true,
    get_allowed_values: getQuickbooksAccountIdAllowedValues,
  },
  quantity_on_hand: {
    type: 'number',
    required: true,
  },
  track_quantity_on_hand: {
    type: 'boolean',
    required: false,
  },
  inventory_start_date: {
    type: 'date',
    required: false,
  },
} satisfies TQoreOptions;

const options = {
  name: {
    type: 'string',
    required: true,
  },
  type: {
    type: 'string',
    required: true,
    allowed_values: [
      { value: 'Service', display_name: 'Service' },
      { value: 'NonInventory', display_name: 'NonInventory' },
      { value: 'Inventory', display_name: 'Inventory' },
    ],
    get_dependent_options: (context) => {
      const type = context?.opts?.type;

      if (type === 'Inventory') {
        return {
          account_id: {
            type: 'string',
            required: true,
            get_allowed_values: getQuickbooksAccountIdAllowedValues,
          },
          quantity_on_hand: {
            type: 'number',
            required: true,
          },
          track_quantity_on_hand: {
            type: 'boolean',
            required: false,
          },
          inventory_start_date: {
            type: 'date',
            required: false,
          },
        };
      }

      return {} as Record<string, TQoreAppActionOption>;
    },
  },
  income_account_id: {
    type: 'string',
    required: false,
    get_allowed_values: getQuickbooksAccountIdAllowedValues,
  },
  expense_account_id: {
    type: 'string',
    required: false,
    get_allowed_values: getQuickbooksAccountIdAllowedValues,
  },
} satisfies TQoreOptions;

const createItem = QoreAppCreator.createLocalizedAction<
  typeof options & Partial<typeof invenotyItemOptions>
>({
  app: QUICKBOOKS_APP_NAME,
  action: 'create_item',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, realm_id, instance_type, name, type } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'realm_id', 'instance_type'],
      optionFields: ['name', 'type'],
      ErrorClass: QuickbooksError,
    });

    const incomeAccountId = obj?.income_account_id;
    const expenseAccountId = obj?.expense_account_id;
    const accountId = obj?.account_id;
    const quantityOnHand = obj?.quantity_on_hand;
    const trackQuantityOnHand = obj?.track_quantity_on_hand;

    if (type === 'Inventory' && !accountId) {
      throw new QuickbooksError('Account ID is required for Inventory items.');
    }

    const client = createQuickbooksClient({
      token,
      realm_id,
      instance_type,
    });

    try {
      const response = await client.createItem({
        Name: name,
        Type: type,
        ...(incomeAccountId && {
          IncomeAccountRef: { value: incomeAccountId! },
        }),
        ...(expenseAccountId && {
          ExpenseAccountRef: { value: expenseAccountId! },
        }),
        ...(type === 'Inventory' && {
          AssetAccountRef: { value: accountId! },
          TrackQtyOnHand: trackQuantityOnHand,
          QtyOnHand: quantityOnHand,
          InventoryStartDate: obj?.inventory_start_date,
        }),
      });

      return response.Item;
    } catch (error) {
      throw new QuickbooksError(`Failed to create item: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      Name: { type: 'string' },
      Active: { type: 'boolean' },
      FullyQualifiedName: { type: 'string' },
      Taxable: { type: 'boolean' },
      UnitPrice: { type: 'number' },
      Type: { type: 'string' },
      IncomeAccountRef: {
        type: {
          type: 'hash',
          fields: {
            value: { type: 'string' },
            name: { type: 'string' },
          },
        },
      },
      PurchaseCost: { type: 'number' },
      TrackQtyOnHand: { type: 'boolean' },
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
    },
  },
});

export default createItem;
