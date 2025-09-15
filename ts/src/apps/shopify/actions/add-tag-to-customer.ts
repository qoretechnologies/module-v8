import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { SHOPIFY_APP_NAME, TShopifyContextWithConn } from '../constants';
import {
  executeShopifyGraphQL,
  ShopifyError,
  transformShopifyResponse,
} from '../helpers/constants';
import { getShopifyCustomerIdAllowedValues } from '../helpers/get-customer-id-allowed-values';
import { getShopifyCustomerTagsAllowedValues } from '../helpers/get-customer-tags-allowed-values';
import { ShopifyAddTagToCustomerResponseType } from './response-types/add-tag-to-customer.response';

const options = {
  customerId: {
    type: 'string',
    required: true,
    get_allowed_values: getShopifyCustomerIdAllowedValues,
  },
  tags: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    element_allowed_values_creatable: true,
    get_element_allowed_values: getShopifyCustomerTagsAllowedValues,
    required: true,
  },
  append: {
    type: 'bool',
    required: false,
    default_value: true,
  },
} satisfies TQoreOptions;

interface ICustomerData {
  tags?: string;
  [key: string]: any;
}

const AddTagToShopifyCustomer = QoreAppCreator.createLocalizedAction<typeof options>({
  action: 'add-tag-to-customer',
  app: SHOPIFY_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (data, _opts, context) => {
    const customerId = data?.customerId;
    const newTags: string[] = data?.tags || [];
    const append = data?.append !== false;

    if (!customerId || !newTags.length) {
      throw new ShopifyError('Customer ID and at least one tag are required');
    }

    try {
      let finalTags = newTags;

      if (append) {
        const customerQuery = `
          query GetCustomer($id: ID!) {
            customer(id: $id) {
              tags
            }
          }
        `;

        const globalId = `gid://shopify/Customer/${customerId}`;

        const response = await executeShopifyGraphQL(
          context as TShopifyContextWithConn,
          customerQuery,
          {
            id: globalId,
          }
        );

        const customerData: ICustomerData = response.data?.customer || {};
        if (customerData.tags) {
          const currentTags = customerData.tags;
          finalTags = [...new Set([...currentTags, ...newTags])];
        }
      }

      const updateMutation = `
        mutation UpdateCustomerTags($input: CustomerInput!) {
          customerUpdate(input: $input) {
            customer {
              id
              email
              firstName
              lastName
              tags
              updatedAt
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const variables = {
        input: {
          id: `gid://shopify/Customer/${customerId}`,
          tags: finalTags.join(', '),
        },
      };

      const result = await executeShopifyGraphQL(
        context as TShopifyContextWithConn,
        updateMutation,
        variables
      );

      const userErrors = result.data?.customerUpdate?.userErrors || [];
      if (userErrors.length > 0) {
        const errors = userErrors.map((err: { message: string }) => err.message).join('; ');
        throw new ShopifyError(`Failed to update customer tags: ${errors}`);
      }

      return transformShopifyResponse(result.data.customerUpdate);
    } catch (error) {
      if (error instanceof ShopifyError) {
        throw error;
      }
      throw new ShopifyError(`Failed to add tags to Shopify customer: ${error.message}`, error);
    }
  },
  options,
  response_type: ShopifyAddTagToCustomerResponseType,
});

export default AddTagToShopifyCustomer;
