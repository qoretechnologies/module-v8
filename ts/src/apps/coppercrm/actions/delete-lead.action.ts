import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { COPPER_CRM_APP_NAME, CopperCrmError } from '../constants';
import { copperCrmApiClient } from '../helpers/constants';
import { getCopperCrmLeadAllowedValues } from '../helpers/get-lead-allowed-values';

const action = 'delete_lead';

const options = {
  lead_id: {
    type: 'number',
    required: true,
    get_allowed_values: getCopperCrmLeadAllowedValues,
  },
} satisfies TQoreOptions;

type TDeleteLeadResponse = {
  id: string;
  is_deleted: boolean;
};

const DeleteLead = QoreAppCreator.createLocalizedAction<typeof options>({
  app: COPPER_CRM_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, lead_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['lead_id'],
      ErrorClass: CopperCrmError,
    });

    try {
      const response = await copperCrmApiClient<TDeleteLeadResponse>({
        path: `leads/${lead_id}`,
        method: 'DELETE',
        token,
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
        type: 'bool',
      },
    },
  },
});

export default DeleteLead;
