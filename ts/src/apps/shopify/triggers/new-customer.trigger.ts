import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { SHOPIFY_APP_NAME, TShopifyContextWithConn } from '../constants';
import { executeShopifyGraphQL, transformShopifyResponse } from '../helpers/constants';
import { getShopifyCustomerQuery, ShopifyCustomerType } from './constants';
const triggerName = 'shopify-customer-created-trigger';

const shopifyCustomerCreatedTrigger = QoreAppCreator.createLocalizedTrigger({
  app: SHOPIFY_APP_NAME,
  action: triggerName,
  action_code: EQoreAppActionCode.EVENT,
  event_function: async (context, update, should_stop) => {
    if (!context.conn_opts?.token || !context.conn_opts?.shop) {
      throw new Error(
        `The shop and token are required to start the Shopify ${triggerName} trigger`
      );
    }

    await pollCreatedItemsForTrigger({
      trigger_name: triggerName,
      uniqueField: 'id',
      getItems: () => getRecentlyCreatedCustomers(context as TShopifyContextWithConn),
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    if (!context.conn_opts?.token || !context.conn_opts?.shop) {
      throw new Error(
        `The shop and token are required to get the example event data for the Shopify ${triggerName}`
      );
    }

    const customers = await getRecentlyCreatedCustomers(context as TShopifyContextWithConn);

    return customers?.length > 0 ? customers[0] : null;
  },
  event_info: {
    desc: 'Triggers when a new customer is created in Shopify',
    type: ShopifyCustomerType,
  },
});

const getRecentlyCreatedCustomers = async (context: TShopifyContextWithConn) => {
  const query = getShopifyCustomerQuery('CREATED_AT');

  const variables = {};

  try {
    const response = await executeShopifyGraphQL(context, query, variables);
    const transformedResponse = transformShopifyResponse(response);

    return transformedResponse || [];
  } catch (error) {
    throw new Error(`Failed to fetch customers: ${error.message}`);
  }
};

export default shopifyCustomerCreatedTrigger;
