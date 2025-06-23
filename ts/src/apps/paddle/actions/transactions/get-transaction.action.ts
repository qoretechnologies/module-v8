import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { PADDLE_APP_NAME, PaddleError } from '../../constants';
import { createPaddleClient } from '../../helpers/constants';
import { getPaddleTransactionIdAllowedValues } from '../../helpers/get-transaction-id-allowed-values';
import { PaddleTransactionIncludeAllowedValues } from '../../helpers/get-transaction-include-fields-allowed-values';
import {
  getPaddleTransactionResponseTypeField,
  paddleTransactionResponseType,
} from './response-types/transaction.response-type';

const options = {
  transaction_id: {
    required: true,
    type: 'string',
    get_allowed_values: getPaddleTransactionIdAllowedValues,
  },
  include: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    element_allowed_values: PaddleTransactionIncludeAllowedValues,
  },
} satisfies TQoreOptions;

const getTransaction = QoreAppCreator.createLocalizedAction<typeof options>({
  app: PADDLE_APP_NAME,
  action: 'get_transaction',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, instance_type, transaction_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['transaction_id'],
      connectionFields: ['token', 'instance_type'],
      ErrorClass: PaddleError,
    });

    const include = obj?.include as Array<any>;

    try {
      const client = createPaddleClient(token, instance_type);

      const transaction = await client.transactions.get(transaction_id, {
        ...(include && { include }),
      });

      return transaction;
    } catch (error) {
      throw new PaddleError(`Failed to get transaction: ${error.message || error}`);
    }
  },
  response_type: paddleTransactionResponseType,
  get_dynamic_response_type: (context) => {
    const include = context?.opts?.include || [];

    let responseTypeFields = paddleTransactionResponseType.fields;

    for (const field of include) {
      responseTypeFields = {
        ...responseTypeFields,
        ...getPaddleTransactionResponseTypeField(field),
      };
    }

    return {
      type: 'hash',
      fields: responseTypeFields,
    };
  },
});

export default getTransaction;
