import { EQoreAppActionCode, QoreAppCreator, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import {
  pollCreatedItemsForTrigger,
  pollUpdatedItemsForTrigger,
} from '../../../global/helpers/event-triggers';
import { DYNAMICS_APP_NAME, formatDynamicsUrl } from '../constants';
import { dynamicsTriggerOptionsWithCondition } from './constants';

const DynamicsNewLeadTrigger = QoreAppCreator.createLocalizedTrigger({
  app: DYNAMICS_APP_NAME,
  action: 'new-or-updated-lead',
  action_code: EQoreAppActionCode.EVENT,
  options: dynamicsTriggerOptionsWithCondition,
  event_function: async (context, update, should_stop) => {
    const token = context.conn_opts?.token;
    const organizationUrl = formatDynamicsUrl(context.conn_opts?.url);
    const condition = context.opts?.condition;

    const missingValues: string[] = [];
    if (!token) missingValues.push('token');
    if (!organizationUrl) missingValues.push('organizationUrl');
    if (!condition) missingValues.push('condition');

    if (missingValues.length) {
      throw new Error(
        `All of the following ${missingValues.join(', ')} are required to start the new lead Dynamics 365 trigger`
      );
    }

    if (condition === 'created') {
      const getItems = () => {
        return getLatestDynamicsLeads(token!, organizationUrl!, 'createdon');
      };

      await pollCreatedItemsForTrigger({
        trigger_name: 'dynamics_new_lead',
        uniqueField: 'leadid',
        getItems,
        orderKey: (item) => item.createdon,
        update,
        should_stop,
      });
    } else if (condition === 'updated') {
      const getItems = () => {
        return getLatestDynamicsLeads(token!, organizationUrl!, 'modifiedon');
      };

      await pollUpdatedItemsForTrigger({
        trigger_name: 'dynamics_updated_lead',
        uniqueField: 'leadid',
        updatedDateField: 'modifiedon',
        getItems,
        update,
        should_stop,
      });
    }
  },
  get_example_event_data: async (context) => {
    const token = context?.conn_opts?.token;
    const organizationUrl = formatDynamicsUrl(context?.conn_opts?.url);
    const condition = context?.opts?.condition;

    if (!token || !organizationUrl) {
      throw new Error('Token and organization URL are required to get example lead data');
    }

    const leads = await getLatestDynamicsLeads(
      token,
      organizationUrl,
      condition === 'created' ? 'createdon' : 'modifiedon'
    );

    return leads?.length > 0 ? leads[0] : null;
  },
  event_info: {
    desc: 'Dynamics 365 New Lead Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        '@odata.etag': { type: 'string' },
        leadid: { type: 'string' },
        fullname: { type: 'string' },
        firstname: { type: 'string' },
        lastname: { type: 'string' },
        middlename: { type: 'string' },
        subject: { type: 'string' },
        companyname: { type: 'string' },
        createdon: { type: 'string' },
        modifiedon: { type: 'string' },
        statecode: { type: 'number' },
        statuscode: { type: 'number' },

        emailaddress1: { type: 'string' },
        emailaddress2: { type: 'string' },
        emailaddress3: { type: 'string' },
        telephone1: { type: 'string' },
        telephone2: { type: 'string' },
        telephone3: { type: 'string' },
        mobilephone: { type: 'string' },
        fax: { type: 'string' },

        address1_line1: { type: 'string' },
        address1_line2: { type: 'string' },
        address1_line3: { type: 'string' },
        address1_city: { type: 'string' },
        address1_stateorprovince: { type: 'string' },
        address1_postalcode: { type: 'string' },
        address1_country: { type: 'string' },
        address1_composite: { type: 'string' },

        jobtitle: { type: 'string' },
        leadqualitycode: { type: 'number' },
        leadsourcecode: { type: 'number' },
        industrycode: { type: 'number' },
        revenue: { type: 'number' },
        revenue_base: { type: 'number' },
        numberofemployees: { type: 'number' },
        description: { type: 'string' },

        _ownerid_value: { type: 'string' },
        _owningbusinessunit_value: { type: 'string' },
        _owninguser_value: { type: 'string' },
        _owningteam_value: { type: 'string' },
        _transactioncurrencyid_value: { type: 'string' },
        _campaignid_value: { type: 'string' },

        estimatedvalue: { type: 'number' },
        estimatedvalue_base: { type: 'number' },
        estimatedclosedate: { type: 'string' },

        donotphone: { type: 'bool' },
        donotemail: { type: 'bool' },
        donotfax: { type: 'bool' },
        donotpostalmail: { type: 'bool' },
        donotbulkemail: { type: 'bool' },
        donotbulkpostalmail: { type: 'bool' },

        qualificationcomments: { type: 'string' },
        participatesinworkflow: { type: 'bool' },
        processid: { type: 'string' },
        stageid: { type: 'string' },

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

const getLatestDynamicsLeads = async (
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
        path: '/api/data/v9.1/leads',
        headers,
        params: {
          $orderby: `${sortField} desc`,
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
    throw new Error(`Error fetching Dynamics 365 leads: ${JSON.stringify(error)}`);
  }
};

export default DynamicsNewLeadTrigger;
