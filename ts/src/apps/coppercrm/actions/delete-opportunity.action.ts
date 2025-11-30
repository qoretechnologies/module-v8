import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { COPPER_CRM_APP_NAME, CopperCrmError } from '../constants';
import { copperCrmApiClient } from '../helpers/constants';
import { getCopperCrmOpportunityAllowedValues } from '../helpers/get-opportunity-allowed-values';

const action = 'delete_opportunity';

const options = {
  opportunity_id: {
    type: 'number',
    required: true,
    get_allowed_values: getCopperCrmOpportunityAllowedValues,
  },
} satisfies TQoreOptions;

type TDeleteOpportunityResponse = {
  id: string;
  is_deleted: boolean;
};

const DeleteOpportunity = QoreAppCreator.createLocalizedAction<typeof options>({
  app: COPPER_CRM_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, email, opportunity_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['email', 'token'],
      optionFields: ['opportunity_id'],
      ErrorClass: CopperCrmError,
    });

    try {
      const response = await copperCrmApiClient<TDeleteOpportunityResponse>({
        path: `opportunities/${opportunity_id}`,
        method: 'DELETE',
        token,
        email,
      });

      return response;
    } catch (error) {
      if (error instanceof CopperCrmError) {
        throw error;
      }

      throw new CopperCrmError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: {
        type: 'string',
      },
      is_deleted: {
        type: 'boolean',
      },
    },
  },
});

export default DeleteOpportunity;
