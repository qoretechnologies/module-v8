import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { QUICKBOOKS_APP_NAME, QuickbooksError } from '../../constants';
import { createQuickbooksClient } from '../../helpers/constants';
import { getQuickbooksBillIdAllowedValues } from '../../helpers/get-bill-id-allowed-values';

const options = {
  id: {
    type: 'string',
    required: true,
    get_allowed_values: getQuickbooksBillIdAllowedValues,
  },
} satisfies TQoreOptions;

const deleteBill = QoreAppCreator.createLocalizedAction<typeof options>({
  app: QUICKBOOKS_APP_NAME,
  action: 'delete_bill',
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
      const bill = await client.getBill(id);

      const response = await client.deleteBill({
        Id: id,
        SyncToken: bill.Bill.SyncToken,
      });

      return response.Bill;
    } catch (error) {
      throw new QuickbooksError(
        `Failed to delete bill: ${error?.errorResponse?.Fault?.Error?.[0]?.Detail || error}`
      );
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      Id: { type: 'string' },
      domain: { type: 'string' },
      status: { type: 'string' },
    },
  },
});

export default deleteBill;
