import { EQoreAppActionCode, QoreAppCreator, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import {
  pollCreatedItemsForTrigger,
  pollUpdatedItemsForTrigger,
} from '../../../global/helpers/event-triggers';
import { DYNAMICS_APP_NAME } from '../constants';
import { dynamicsTriggerOptionsWithCondition } from './constants';

const DynamicsNewAccountTrigger = QoreAppCreator.createLocalizedTrigger({
  app: DYNAMICS_APP_NAME,
  action: 'new-or-updated-account',
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
        `All of the following ${missingValues.join(', ')} are required to start the new account Dynamics 365 trigger`
      );
    }

    if (condition === 'created') {
      const getItems = () => {
        return getLatestDynamicsAccounts(token!, organizationUrl!, 'createdon');
      };

      await pollCreatedItemsForTrigger({
        trigger_name: 'dynamics_new_account',
        uniqueField: 'accountid',
        getItems,
        update,
        should_stop,
      });
    } else if (condition === 'updated') {
      const getItems = () => {
        return getLatestDynamicsAccounts(token!, organizationUrl!, 'modifiedon');
      };

      await pollUpdatedItemsForTrigger({
        trigger_name: 'dynamics_updated_account',
        uniqueField: 'accountid',
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
      throw new Error('Token and organization URL are required to get example account data');
    }

    const accounts = await getLatestDynamicsAccounts(
      token,
      organizationUrl,
      condition === 'created' ? 'createdon' : 'modifiedon'
    );

    return accounts?.length > 0 ? accounts[0] : null;
  },
  event_info: {
    desc: 'Dynamics 365 New Account Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        '@odata.etag': { type: 'string' },
        accountid: { type: 'string' },
        name: { type: 'string' },
        createdon: { type: 'string' },
        modifiedon: { type: 'string' },
        statecode: { type: 'number' },
        statuscode: { type: 'number' },

        telephone1: { type: 'string' },
        telephone2: { type: 'string' },
        telephone3: { type: 'string' },
        fax: { type: 'string' },
        emailaddress1: { type: 'string' },
        emailaddress2: { type: 'string' },
        emailaddress3: { type: 'string' },
        websiteurl: { type: 'string' },

        address1_line1: { type: 'string' },
        address1_line2: { type: 'string' },
        address1_line3: { type: 'string' },
        address1_city: { type: 'string' },
        address1_stateorprovince: { type: 'string' },
        address1_postalcode: { type: 'string' },
        address1_country: { type: 'string' },
        address1_composite: { type: 'string' },

        address2_line1: { type: 'string' },
        address2_line2: { type: 'string' },
        address2_line3: { type: 'string' },
        address2_city: { type: 'string' },
        address2_stateorprovince: { type: 'string' },
        address2_postalcode: { type: 'string' },
        address2_country: { type: 'string' },
        address2_composite: { type: 'string' },

        revenue: { type: 'number' },
        revenue_base: { type: 'number' },
        creditlimit: { type: 'number' },
        creditlimit_base: { type: 'number' },
        numberofemployees: { type: 'number' },

        sic: { type: 'string' },
        tickersymbol: { type: 'string' },
        description: { type: 'string' },
        accountnumber: { type: 'string' },

        _ownerid_value: { type: 'string' },
        _owningbusinessunit_value: { type: 'string' },
        _owninguser_value: { type: 'string' },
        _owningteam_value: { type: 'string' },

        _primarycontactid_value: { type: 'string' },
        _parentaccountid_value: { type: 'string' },
        _transactioncurrencyid_value: { type: 'string' },

        donotphone: { type: 'boolean' },
        donotemail: { type: 'boolean' },
        donotfax: { type: 'boolean' },
        donotpostalmail: { type: 'boolean' },
        donotbulkemail: { type: 'boolean' },
        donotbulkpostalmail: { type: 'boolean' },

        versionnumber: { type: 'number' },
        exchangerate: { type: 'number' },
        industrycode: { type: 'number' },
        customersizecode: { type: 'number' },
        openrevenue: { type: 'number' },
        opendeals: { type: 'number' },
        merged: { type: 'boolean' },

        _createdby_value: { type: 'string' },
        _modifiedby_value: { type: 'string' },
        _createdonbehalfby_value: { type: 'string' },
        _modifiedonbehalfby_value: { type: 'string' },
      },
    },
  },
});

const getLatestDynamicsAccounts = async (
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
        path: '/api/data/v9.1/accounts',
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
    throw new Error(`Error fetching Dynamics 365 accounts: ${JSON.stringify(error)}`);
  }
};

export default DynamicsNewAccountTrigger;
