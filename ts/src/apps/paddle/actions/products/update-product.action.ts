import { CatalogType, Status, TaxCategory } from '@paddle/paddle-node-sdk';
import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { PADDLE_APP_NAME, PaddleError } from '../../constants';
import { createPaddleClient } from '../../helpers/constants';
import { PaddleStatusAllowedValues } from '../../helpers/get-status-allowed-values';
import { PaddleTaxCategoryAllowedValues } from '../../helpers/get-product-tax-category-allowed-values';
import { PaddleTypeAllowedValues } from '../../helpers/get-type-allowed-values';
import { getPaddleProductIdAllowedValues } from '../../helpers/get-product-id-allowed-values';

const options = {
  product_id: {
    type: 'string',
    required: true,
    get_allowed_values: getPaddleProductIdAllowedValues,
  },
  name: {
    required: false,
    preselected: true,
    type: 'string',
  },
  tax_category: {
    type: 'string',
    required: false,
    allowed_values: PaddleTaxCategoryAllowedValues,
  },
  description: {
    required: false,
    preselected: true,
    type: 'string',
  },
  status: {
    type: 'string',
    required: false,
    preselected: true,
    allowed_values: PaddleStatusAllowedValues,
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

const updateProduct = QoreAppCreator.createLocalizedAction<typeof options>({
  app: PADDLE_APP_NAME,
  action: 'update_product',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, instance_type, product_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'instance_type'],
      optionFields: ['product_id'],
      ErrorClass: PaddleError,
    });

    const { description, type, image_url, custom_data, name, status, tax_category } = obj || {};

    try {
      const client = createPaddleClient(token, instance_type);

      const product = await client.products.update(product_id, {
        ...(status && { status: status as Status }),
        ...(name && { name }),
        ...(tax_category && { taxCategory: tax_category as TaxCategory }),
        ...(description && { description }),
        ...(type && { type: type as CatalogType }),
        ...(image_url && { imageUrl: image_url }),
        ...(custom_data && { custom_data }),
      });

      return product;
    } catch (error) {
      throw new PaddleError(`Failed to update product: ${error.message || error}`);
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

export default updateProduct;
