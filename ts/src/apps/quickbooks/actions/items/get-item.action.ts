import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { QUICKBOOKS_APP_NAME, QuickbooksError } from '../../constants';
import { createQuickbooksClient } from '../../helpers/constants';
import { getQuickbooksItemIdAllowedValues } from '../../helpers/get-item-id-allowed-values';

const options = {
  id: {
    type: 'string',
    required: true,
    get_allowed_values: getQuickbooksItemIdAllowedValues,
  },
} satisfies TQoreOptions;

const getItem = QoreAppCreator.createLocalizedAction<typeof options>({
  app: QUICKBOOKS_APP_NAME,
  action: 'get_item',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, realm_id, instance_type, id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'realm_id', 'instance_type'],
      optionFields: ['id'],
      ErrorClass: QuickbooksError,
    });

    const client = createQuickbooksClient({
      token,
      realm_id,
      instance_type,
    });

    try {
      const response = await client.getItem(id);

      return response.Item;
    } catch (error) {
      throw new QuickbooksError(`Failed to get item: ${error.message || error}`);
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

export default getItem;
