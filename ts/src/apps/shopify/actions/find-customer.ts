import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { SHOPIFY_APP_NAME, TShopifyContextWithConn } from '../constants';
import {
  executeShopifyGraphQL,
  ShopifyError,
  transformShopifyResponse,
} from '../helpers/constants';
import { ShopifyFindCustomerResponseType } from './response-types/find-customer.response';

const options = {
  query: {
    type: 'string',
    required: false,
    preselected: true,
  },
  limit: {
    type: 'integer',
    required: false,
    default_value: 20,
  },
  cursor: {
    type: 'string',
    required: false,
  },
  sortKey: {
    type: 'string',
    required: false,
    default_value: 'CREATED_AT',
    allowed_values_creatable: true,
    allowed_values: [
      {
        value: 'CREATED_AT',
        display_name: 'Created At',
      },
      {
        value: 'UPDATED_AT',
        display_name: 'Updated At',
      },
      {
        value: 'LAST_ORDER_DATE',
        display_name: 'Last Order Date',
      },
      {
        value: 'NAME',
        display_name: 'Name',
      },
      {
        value: 'EMAIL',
        display_name: 'Email',
      },
      {
        value: 'TOTAL_SPENT',
        display_name: 'Total Spent',
      },
      {
        value: 'ORDERS_COUNT',
        display_name: 'Orders Count',
      },
    ],
    desc: 'Field to sort customers by',
  },
  reverse: {
    type: 'boolean',
    required: false,
    default_value: true,
  },
} satisfies TQoreOptions;

type TFindCustomerInput = {
  query?: string;
  limit?: number;
  cursor?: string;
  sortKey?: string;
  reverse?: boolean;
};

const findCustomers = async (context: TShopifyContextWithConn, data: TFindCustomerInput) => {
  const limit = Math.min(data?.limit || 20, 250);
  const query = data?.query ? `query:${data.query}` : '';
  const sortKey = data?.sortKey || 'CREATED_AT';
  const reverse = data?.reverse !== undefined ? data.reverse : true;

  let cursorParam = '';
  if (data?.cursor) {
    cursorParam = `, after: "${data.cursor}"`;
  }

  const findCustomersQuery = `
    query {
      customers(
        first: ${limit}, 
        sortKey: ${sortKey}, 
        reverse: ${reverse}
        ${cursorParam}
        ${query ? `, query: "${query}"` : ''}) {
        edges {
          node {
            id
            firstName
            lastName
            displayName
            email
            phone
            createdAt
            updatedAt
            verifiedEmail
            taxExempt
            tags
            note
            numberOfOrders
            defaultAddress {
              id
              address1
              address2
              city
              company
              country
              countryCode
              firstName
              lastName
              phone
              province
              provinceCode
              zip
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  const customersResult = await executeShopifyGraphQL(context, findCustomersQuery, {});

  if (customersResult.errors) {
    const errorMessage = customersResult.errors.message;
    throw new ShopifyError(`Failed to find customers: ${errorMessage}`);
  }

  return {
    customers: customersResult.data.customers,
    pageInfo: customersResult.data.customers.pageInfo,
  };
};

export const FindShopifyCustomer = QoreAppCreator.createLocalizedAction<typeof options>({
  action: 'find-customer',
  app: SHOPIFY_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (data, _opts, context) => {
    try {
      const { customers, pageInfo } = await findCustomers(
        context as TShopifyContextWithConn,
        data as TFindCustomerInput
      );

      const customersTransformed = transformShopifyResponse(customers);

      return {
        customers: customersTransformed,
        pageInfo,
      };
    } catch (error) {
      if (error instanceof ShopifyError) {
        throw error;
      }
      throw new ShopifyError(`Failed to find Shopify customers: ${error.message}`, error);
    }
  },
  options,
  response_type: ShopifyFindCustomerResponseType,
});
