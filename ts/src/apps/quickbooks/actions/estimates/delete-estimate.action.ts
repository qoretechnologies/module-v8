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
      const response = await client.deleteEstimate(id);

      return response.Estimate.Id;
    } catch (error) {
      throw new QuickbooksError(`Failed to delete estimate: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      Id: { type: 'string' },
    },
  },
});

export default deleteEstimate;
