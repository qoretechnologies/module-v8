import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { PADDLE_APP_NAME, PaddleError } from '../../constants';
import { getPaddleProductIdAllowedValues } from '../../helpers/get-product-id-allowed-values';
import { createPaddleClient } from '../../helpers/constants';

const options = {
  product_id: {
    type: 'string',
    required: true,
    get_allowed_values: getPaddleProductIdAllowedValues,
  },
} satisfies TQoreOptions;

const archiveProduct = QoreAppCreator.createLocalizedAction<typeof options>({
  app: PADDLE_APP_NAME,
  action: 'archive_product',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, instance_type, product_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['product_id'],
      connectionFields: ['token', 'instance_type'],
      ErrorClass: PaddleError,
    });

    try {
      const client = createPaddleClient(token, instance_type);

      const product = await client.products.archive(product_id);

      return product;
    } catch (error) {
      throw new PaddleError(`Failed to archive product: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'integer' },
      name: { type: 'string' },
      taxCategory: { type: 'string' },
      type: { type: 'string' },
      description: { type: 'string' },
      status: { type: 'string' },
      imageUrl: { type: 'string' },
      customData: { type: 'hash' },
      createdAt: { type: 'string' },
      updatedAt: { type: 'string' },
    },
  } satisfies TQoreResponseType,
});

export default archiveProduct;
