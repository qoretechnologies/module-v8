import { EQoreAppActionCode, QoreAppCreator, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import {
  pollCreatedItemsForTrigger,
  pollUpdatedItemsForTrigger,
} from '../../../global/helpers/event-triggers';
import { DYNAMICS_APP_NAME } from '../constants';
import { dynamicsTriggerOptionsWithCondition } from './constants';

const DynamicsNewOrderTrigger = QoreAppCreator.createLocalizedTrigger({
  app: DYNAMICS_APP_NAME,
  action: 'new-or-updated-order',
  action_code: EQoreAppActionCode.EVENT,
  options: dynamicsTriggerOptionsWithCondition,
  event_function: async (context, update, should_stop) => {
    const token = context.conn_opts?.token;
    const organizationUrl = context.conn_opts?.url;
    const condition = context.opts?.condition;

    const missingValues: string[] = [];
    if (!token) missingValues.push('token');
    if (!organizationUrl) missingValues.push('organizationUrl');
    if (!condition) missingValues.push('condition');

    if (missingValues.length) {
      throw new Error(
        `All of the following ${missingValues.join(', ')} are required to start the new order Dynamics 365 trigger`
      );
    }

    if (condition === 'created') {
      const getItems = () => {
        return getLatestDynamicsOrders(token!, organizationUrl!, 'createdon');
      };

      await pollCreatedItemsForTrigger({
        trigger_name: 'dynamics_new_order',
        uniqueField: 'salesorderid',
        getItems,
        update,
        should_stop,
      });
    } else if (condition === 'updated') {
      const getItems = () => {
        return getLatestDynamicsOrders(token!, organizationUrl!, 'modifiedon');
      };

      await pollUpdatedItemsForTrigger({
        trigger_name: 'dynamics_updated_order',
        uniqueField: 'salesorderid',
        updatedDateField: 'modifiedon',
        getItems,
        update,
        should_stop,
      });
    }
  },
  get_example_event_data: async (context) => {
    const token = context?.conn_opts?.token;
    const organizationUrl = context?.conn_opts?.url;
    const condition = context?.opts?.condition;

    if (!token || !organizationUrl) {
      throw new Error('Token and organization URL are required to get example order data');
    }

    const orders = await getLatestDynamicsOrders(
      token,
      organizationUrl,
      condition === 'created' ? 'createdon' : 'modifiedon'
    );

    return orders?.length > 0 ? orders[0] : null;
  },
  event_info: {
    desc: 'Dynamics 365 New Order Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        '@odata.etag': { type: 'string' },
        salesorderid: { type: 'string' },
        name: { type: 'string' },
        ordernumber: { type: 'string' },
        createdon: { type: 'string' },
        modifiedon: { type: 'string' },
        statecode: { type: 'number' },
        statuscode: { type: 'number' },

        description: { type: 'string' },
        totalamount: { type: 'number' },
        totalamount_base: { type: 'number' },
        totaltax: { type: 'number' },
        totaltax_base: { type: 'number' },
        totallineitemamount: { type: 'number' },
        totallineitemamount_base: { type: 'number' },
        totaldiscountamount: { type: 'number' },
        totaldiscountamount_base: { type: 'number' },
        discountamount: { type: 'number' },
        discountamount_base: { type: 'number' },
        discountpercentage: { type: 'number' },

        _customerid_value: { type: 'string' },
        _ownerid_value: { type: 'string' },
        _owningbusinessunit_value: { type: 'string' },
        _owninguser_value: { type: 'string' },
        _owningteam_value: { type: 'string' },
        _pricelevelid_value: { type: 'string' },
        _opportunityid_value: { type: 'string' },
        _quoteid_value: { type: 'string' },
        _transactioncurrencyid_value: { type: 'string' },

        billto_line1: { type: 'string' },
        billto_line2: { type: 'string' },
        billto_line3: { type: 'string' },
        billto_city: { type: 'string' },
        billto_stateorprovince: { type: 'string' },
        billto_postalcode: { type: 'string' },
        billto_country: { type: 'string' },
        billto_composite: { type: 'string' },
        billto_name: { type: 'string' },

        shipto_line1: { type: 'string' },
        shipto_line2: { type: 'string' },
        shipto_line3: { type: 'string' },
        shipto_city: { type: 'string' },
        shipto_stateorprovince: { type: 'string' },
        shipto_postalcode: { type: 'string' },
        shipto_country: { type: 'string' },
        shipto_composite: { type: 'string' },
        shipto_name: { type: 'string' },

        submitdate: { type: 'string' },
        datefulfilled: { type: 'string' },
        requestdeliveryby: { type: 'string' },

        freightamount: { type: 'number' },
        freightamount_base: { type: 'number' },
        paymenttermscode: { type: 'number' },
        shippingmethodcode: { type: 'number' },

        willcall: { type: 'boolean' },
        ispricelocked: { type: 'boolean' },
        lastbackofficesubmit: { type: 'string' },
        submitstatus: { type: 'number' },

        _createdby_value: { type: 'string' },
        _modifiedby_value: { type: 'string' },
        _createdonbehalfby_value: { type: 'string' },
        _modifiedonbehalfby_value: { type: 'string' },

        versionnumber: { type: 'number' },
        exchangerate: { type: 'number' },
      },
    },
  },
});

const getLatestDynamicsOrders = async (
  token: string,
  organizationUrl: string,
  sortField: 'modifiedon' | 'createdon'
) => {
  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0',
    };

    const response = await QorusRequest.get<{ data: { value: any[] } }>(
      {
        path: '/api/data/v9.1/salesorders',
        headers,
        params: {
          $orderby: `${sortField} asc`,
          $top: DEFAULT_TRIGGER_POLL_ITEM_LIMIT.toString(),
        },
      },
      {
        url: organizationUrl,
        endpointId: 'Dynamics365',
      }
    );

    return response?.data?.value || [];
  } catch (error) {
    throw new Error(`Error fetching Dynamics 365 orders: ${JSON.stringify(error)}`);
  }
};

export default DynamicsNewOrderTrigger;
