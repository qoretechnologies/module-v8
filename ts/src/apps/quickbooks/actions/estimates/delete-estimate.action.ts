import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { QUICKBOOKS_APP_NAME, QuickbooksError } from '../../constants';
import { createQuickbooksClient } from '../../helpers/constants';
import { getQuickbooksEstimateIdAllowedValues } from '../../helpers/get-estimate-id-allowed-values';

const options = {
  id: {
    type: 'string',
    required: true,
    get_allowed_values: getQuickbooksEstimateIdAllowedValues,
  },
} satisfies TQoreOptions;

const deleteEstimate = QoreAppCreator.createLocalizedAction<typeof options>({
  app: QUICKBOOKS_APP_NAME,
  action: 'delete_estimate',
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
      const estimate = await client.getEstimate(id);
      const response = await client.deleteEstimate({
        Id: id,
        SyncToken: estimate.Estimate.SyncToken,
      });

      return response.Estimate;
    } catch (error) {
      throw new QuickbooksError(
        `Failed to delete estimate: ${error?.errorResponse?.Fault?.Error?.[0]?.Detail || error}`
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

export default deleteEstimate;
