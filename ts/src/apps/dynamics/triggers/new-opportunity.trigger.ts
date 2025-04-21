import { EQoreAppActionCode, QoreAppCreator, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import {
  pollCreatedItemsForTrigger,
  pollUpdatedItemsForTrigger,
} from '../../../global/helpers/event-triggers';
import { DYNAMICS_APP_NAME, formatDynamicsUrl } from '../constants';
import { dynamicsTriggerOptionsWithCondition } from './constants';

const DynamicsNewOpportunityTrigger = QoreAppCreator.createLocalizedTrigger({
  app: DYNAMICS_APP_NAME,
  action: 'new-or-updated-opportunity',
  action_code: EQoreAppActionCode.EVENT,
  options: dynamicsTriggerOptionsWithCondition,

  event_function: async (context, update, should_stop) => {
    const token = context.conn_opts?.token;
    const organizationUrl = formatDynamicsUrl(context?.conn_opts?.url);
    const condition = context.opts?.condition;

    const missingValues: string[] = [];
    if (!token) missingValues.push('token');
    if (!organizationUrl) missingValues.push('organizationUrl');
    if (!condition) missingValues.push('condition');

    if (missingValues.length) {
      throw new Error(
        `All of the following ${missingValues.join(', ')}` +
          ` are required to start the new opportunity Dynamics 365 trigger`
      );
    }

    if (condition === 'created') {
      const getItems = () => {
        return getLatestDynamicsOpportunities(token!, organizationUrl!, 'createdon');
      };

      await pollCreatedItemsForTrigger({
        trigger_name: 'dynamics_new_opportunity',
        uniqueField: 'opportunityid',
        getItems,
        update,
        should_stop,
      });
    } else if (condition === 'updated') {
      const getItems = () => {
        return getLatestDynamicsOpportunities(token!, organizationUrl!, 'modifiedon');
      };

      await pollUpdatedItemsForTrigger({
        trigger_name: 'dynamics_updated_opportunity',
        uniqueField: 'opportunityid',
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
      throw new Error('Token and organization URL are required to get example opportunity data');
    }

    const opportunities = await getLatestDynamicsOpportunities(
      token,
      organizationUrl,
      condition === 'created' ? 'createdon' : 'modifiedon'
    );

    return opportunities?.length > 0 ? opportunities[0] : null;
  },
  event_info: {
    desc: 'Dynamics 365 New Opportunity Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        '@odata.etag': { type: 'string' },
        opportunityid: { type: 'string' },
        name: { type: 'string' },
        createdon: { type: 'string' },
        modifiedon: { type: 'string' },
        statecode: { type: 'number' },
        statuscode: { type: 'number' },

        description: { type: 'string' },
        stepname: { type: 'string' },
        salesstage: { type: 'string' },

        estimatedvalue: { type: 'number' },
        estimatedvalue_base: { type: 'number' },
        actualvalue: { type: 'number' },
        actualvalue_base: { type: 'number' },

        estimatedclosedate: { type: 'string' },
        actualclosedate: { type: 'string' },

        opportunityratingcode: { type: 'number' },
        pricelevelid: { type: 'string' },
        closeprobability: { type: 'number' },

        _customerid_value: { type: 'string' },
        _ownerid_value: { type: 'string' },
        _owningbusinessunit_value: { type: 'string' },
        _owninguser_value: { type: 'string' },
        _owningteam_value: { type: 'string' },
        _transactioncurrencyid_value: { type: 'string' },
        _pricelevelid_value: { type: 'string' },
        _campaignid_value: { type: 'string' },
        _originatingleadid_value: { type: 'string' },

        isrevenuesystemcalculated: { type: 'boolean' },
        pricingpercentage: { type: 'number' },
        discountpercentage: { type: 'number' },
        discountamount: { type: 'number' },
        discountamount_base: { type: 'number' },

        freightamount: { type: 'number' },
        freightamount_base: { type: 'number' },
        totaltax: { type: 'number' },
        totaltax_base: { type: 'number' },
        totallineitemamount: { type: 'number' },
        totallineitemamount_base: { type: 'number' },
        totalamountlessfreight: { type: 'number' },
        totalamountlessfreight_base: { type: 'number' },

        participatesinworkflow: { type: 'boolean' },
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

const getLatestDynamicsOpportunities = async (
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
        path: '/api/data/v9.1/opportunities',
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
    throw new Error(`Error fetching Dynamics 365 opportunities: ${JSON.stringify(error)}`);
  }
};

export default DynamicsNewOpportunityTrigger;
