import { CatalogType } from '@paddle/paddle-node-sdk';
import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { PADDLE_APP_NAME, PaddleError } from '../../constants';
import { createPaddleClient } from '../../helpers/constants';
import { PaddleTaxCategoryAllowedValues } from '../../helpers/get-product-tax-category-allowed-values';
import { PaddleTypeAllowedValues } from '../../helpers/get-type-allowed-values';

const options = {
  name: {
    required: true,
    type: 'string',
  },
  tax_category: {
    type: 'string',
    required: true,
    allowed_values: PaddleTaxCategoryAllowedValues,
  },
  description: {
    required: false,
    type: 'string',
  },
  type: {
    type: 'string',
    required: false,
    allowed_values: PaddleTypeAllowedValues,
  },
  image_url: {
    type: 'string',
    required: false,
  },
  custom_data: {
    type: 'hash',
    required: false,
  },
} satisfies TQoreOptions;

const createProduct = QoreAppCreator.createLocalizedAction<typeof options>({
  app: PADDLE_APP_NAME,
  action: 'create_product',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, instance_type, name, tax_category } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['name', 'tax_category'],
      connectionFields: ['token', 'instance_type'],
      ErrorClass: PaddleError,
    });

    const { description, type, image_url, custom_data } = obj || {};

    try {
      const client = createPaddleClient(token, instance_type);

      const product = await client.products.create({
        name,
        taxCategory: tax_category,
        ...(description && { description }),
        ...(type && { type: type as CatalogType }),
        ...(image_url && { image_url }),
        ...(custom_data && { custom_data }),
      });

      return product;
    } catch (error) {
      throw new PaddleError(`Failed to create product: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
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

export default createProduct;
