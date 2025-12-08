import { EQoreAppActionCode, QoreAppCreator, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import {
  pollCreatedItemsForTrigger,
  pollUpdatedItemsForTrigger,
} from '../../../global/helpers/event-triggers';
import { DYNAMICS_APP_NAME, formatDynamicsUrl } from '../constants';
import { dynamicsTriggerOptionsWithCondition } from './constants';

const DynamicsNewCaseTrigger = QoreAppCreator.createLocalizedTrigger({
  app: DYNAMICS_APP_NAME,
  action: 'new-or-updated-case',
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
        `All of the following ${missingValues.join(', ')} are required to start the new case Dynamics 365 trigger`
      );
    }

    if (condition === 'created') {
      const getItems = () => {
        return getLatestDynamicsCases(token!, organizationUrl!, 'createdon');
      };

      await pollCreatedItemsForTrigger({
        trigger_name: 'dynamics_new_case',
        uniqueField: 'incidentid',
        getItems,
        update,
        should_stop,
      });
    } else if (condition === 'updated') {
      const getItems = () => {
        return getLatestDynamicsCases(token!, organizationUrl!, 'modifiedon');
      };

      await pollUpdatedItemsForTrigger({
        trigger_name: 'dynamics_updated_case',
        uniqueField: 'incidentid',
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
      throw new Error('Token and organization URL are required to get example case data');
    }

    const cases = await getLatestDynamicsCases(
      token,
      organizationUrl,
      condition === 'created' ? 'createdon' : 'modifiedon'
    );

    return cases?.length > 0 ? cases[0] : null;
  },
  event_info: {
    desc: 'Dynamics 365 New Case Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        '@odata.etag': { type: 'string' },
        incidentid: { type: 'string' },
        title: { type: 'string' },
        createdon: { type: 'string' },
        modifiedon: { type: 'string' },
        statecode: { type: 'number' },
        statuscode: { type: 'number' },

        ticketnumber: { type: 'string' },
        description: { type: 'string' },
        prioritycode: { type: 'number' },
        severitycode: { type: 'number' },
        caseorigincode: { type: 'number' },
        casetypecode: { type: 'number' },
        incidentstagecode: { type: 'number' },

        _customerid_value: { type: 'string' },
        _accountid_value: { type: 'string' },
        _contactid_value: { type: 'string' },
        _ownerid_value: { type: 'string' },
        _owningbusinessunit_value: { type: 'string' },
        _owninguser_value: { type: 'string' },
        _owningteam_value: { type: 'string' },
        _primarycontactid_value: { type: 'string' },
        _productid_value: { type: 'string' },
        _subjectid_value: { type: 'string' },
        _parentcaseid_value: { type: 'string' },
        _contractid_value: { type: 'string' },
        _contractdetailid_value: { type: 'string' },
        _entitlementid_value: { type: 'string' },
        _existingcase_value: { type: 'string' },
        _slaid_value: { type: 'string' },
        _slainvokedid_value: { type: 'string' },
        _transactioncurrencyid_value: { type: 'string' },
        _masterid_value: { type: 'string' },
        _kbarticleid_value: { type: 'string' },
        _resolvebykpiid_value: { type: 'string' },
        _firstresponsebykpiid_value: { type: 'string' },
        _socialprofileid_value: { type: 'string' },
        _createdby_value: { type: 'string' },
        _modifiedby_value: { type: 'string' },
        _createdonbehalfby_value: { type: 'string' },
        _modifiedonbehalfby_value: { type: 'string' },
        _createdbyexternalparty_value: { type: 'string' },
        _modifiedbyexternalparty_value: { type: 'string' },

        firstresponsesent: { type: 'bool' },
        firstresponseslastatus: { type: 'number' },
        resolvebyslastatus: { type: 'number' },
        resolveby: { type: 'string' },
        responseby: { type: 'string' },
        followupby: { type: 'string' },
        isescalated: { type: 'bool' },
        escalatedon: { type: 'string' },
        activitiescomplete: { type: 'bool' },
        followuptaskcreated: { type: 'bool' },

        merged: { type: 'bool' },
        customercontacted: { type: 'bool' },
        checkemail: { type: 'bool' },
        blockedprofile: { type: 'bool' },
        routecase: { type: 'bool' },
        isdecrementing: { type: 'bool' },
        decremententitlementterm: { type: 'bool' },

        servicestage: { type: 'number' },
        contractservicelevelcode: { type: 'number' },
        actualserviceunits: { type: 'number' },
        billedserviceunits: { type: 'number' },

        caseage: { type: 'string' },
        lastonholdtime: { type: 'string' },
        onholdtime: { type: 'string' },
        deactivatedon: { type: 'string' },

        msdyn_casesentiment: { type: 'number' },
        sentimentvalue: { type: 'number' },
        influencescore: { type: 'number' },

        emailaddress: { type: 'string' },
        productserialnumber: { type: 'string' },

        stageid: { type: 'string' },
        processid: { type: 'string' },
        traversedpath: { type: 'string' },
        messagetypecode: { type: 'number' },

        numberofchildincidents: { type: 'number' },
        customersatisfactioncode: { type: 'number' },
        importsequencenumber: { type: 'number' },
        utcconversiontimezonecode: { type: 'number' },
        timezoneruleversionnumber: { type: 'number' },
        overriddencreatedon: { type: 'string' },
        msdyn_casesurveyinviteurl: { type: 'string' },
        msdyn_copilotengaged: { type: 'bool' },
        msdyn_precreateattachmentsid: { type: 'string' },
        msdyn_precreatenotesid: { type: 'string' },

        exchangerate: { type: 'number' },
        versionnumber: { type: 'number' },
        lastinteraction: { type: 'string' },
        nextsla: { type: 'string' },

        entityimage: { type: 'string' },
        entityimage_url: { type: 'string' },
        entityimageid: { type: 'string' },
        entityimage_timestamp: { type: 'string' },
      },
    },
  },
});

const getLatestDynamicsCases = async (
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
        path: '/api/data/v9.1/incidents',
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
    throw new Error(`Error fetching Dynamics 365 cases: ${JSON.stringify(error)}`);
  }
};

export default DynamicsNewCaseTrigger;
