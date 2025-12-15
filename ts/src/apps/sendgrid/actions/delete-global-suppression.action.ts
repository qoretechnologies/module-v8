import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SENDGRID_APP_NAME, SendGridError } from '../constants';
import { createSendGridClient } from '../helpers/constants';
import { getSendGridGlobalSuppressionAllowedValues } from '../helpers/get-global-suppression-allowed-values';

const action = 'delete_global_suppression';

const options = {
  email: {
    type: 'string',
    required: true,
    get_allowed_values: getSendGridGlobalSuppressionAllowedValues,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'hash',
  fields: {
    success: { type: 'bool' },
    email: { type: 'string' },
  },
} satisfies TQoreResponseType;

const deleteSendGridGlobalSuppression = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SENDGRID_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token, email } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['email'],
      connectionFields: ['token'],
      ErrorClass: SendGridError,
    });

    const client = createSendGridClient(token);

    try {
      await client.request({
        url: `/v3/asm/suppressions/global/${email}`,
        method: 'DELETE',
      });

      return {
        success: true,
        email,
      };
    } catch (error: any) {
      throw new SendGridError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default deleteSendGridGlobalSuppression;
