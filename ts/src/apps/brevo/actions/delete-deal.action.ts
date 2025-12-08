import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { BREVO_APP_NAME, BrevoError, extractBrevoError } from '../constants';
import { createBrevoClient } from '../helpers/constants';
import { getBrevoDealAllowedValues } from '../helpers/get-deal-allowed-values';

const action = 'delete_deal';

const options = {
  dealId: {
    type: 'string',
    required: true,
    get_allowed_values: getBrevoDealAllowedValues,
  },
} satisfies TQoreOptions;

const deleteDeal = QoreAppCreator.createLocalizedAction<typeof options>({
  app: BREVO_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, dealId } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['dealId'],
      connectionFields: ['token'],
      ErrorClass: BrevoError,
    });

    const client = createBrevoClient(token);

    try {
      await client.dealsClient.crmDealsIdDelete(dealId);

      return { success: true };
    } catch (error) {
      throw new BrevoError(`Failed to ${humanizeNameTitle(action)}: ${extractBrevoError(error)}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      success: { type: 'bool' },
    },
  },
});

export default deleteDeal;
