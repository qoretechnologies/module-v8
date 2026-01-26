import { EQoreAppActionCode, QoreAppCreator, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import {
  pollCreatedItemsForTrigger,
  pollUpdatedItemsForTrigger,
} from '../../../global/helpers/event-triggers';
import { DYNAMICS_APP_NAME, formatDynamicsUrl } from '../constants';
import { dynamicsTriggerOptionsWithCondition } from './constants';

const DynamicsNewContactTrigger = QoreAppCreator.createLocalizedTrigger({
  app: DYNAMICS_APP_NAME,
  action: 'new-or-updated-contact',
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
        `All of the following ${missingValues.join(', ')} are required to start the new contact Dynamics 365 trigger`
      );
    }

    if (condition === 'created') {
      const getItems = () => {
        return getLatestDynamicsContacts(token!, organizationUrl!, 'createdon');
      };

      await pollCreatedItemsForTrigger({
        trigger_name: 'dynamics_new_contact',
        uniqueField: 'contactid',
        getItems,
        update,
        should_stop,
      });
    } else if (condition === 'updated') {
      const getItems = () => {
        return getLatestDynamicsContacts(token!, organizationUrl!, 'modifiedon');
      };

      await pollUpdatedItemsForTrigger({
        trigger_name: 'dynamics_updated_contact',
        uniqueField: 'contactid',
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
      throw new Error('Token and organization URL are required to get example contact data');
    }

    const contacts = await getLatestDynamicsContacts(
      token,
      organizationUrl,
      condition === 'created' ? 'createdon' : 'modifiedon'
    );

    return contacts?.length > 0 ? contacts[0] : null;
  },
  event_info: {
    desc: 'Dynamics 365 New Contact Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        '@odata.etag': { type: 'string' },
        contactid: { type: 'string' },
        fullname: { type: 'string' },
        firstname: { type: 'string' },
        lastname: { type: 'string' },
        middlename: { type: 'string' },
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

        address2_line1: { type: 'string' },
        address2_line2: { type: 'string' },
        address2_line3: { type: 'string' },
        address2_city: { type: 'string' },
        address2_stateorprovince: { type: 'string' },
        address2_postalcode: { type: 'string' },
        address2_country: { type: 'string' },
        address2_composite: { type: 'string' },

        jobtitle: { type: 'string' },
        department: { type: 'string' },
        _parentcustomerid_value: { type: 'string' },
        _ownerid_value: { type: 'string' },
        _owningbusinessunit_value: { type: 'string' },
        _owninguser_value: { type: 'string' },
        _owningteam_value: { type: 'string' },

        donotphone: { type: 'bool' },
        donotemail: { type: 'bool' },
        donotfax: { type: 'bool' },
        donotpostalmail: { type: 'bool' },
        donotbulkemail: { type: 'bool' },
        donotbulkpostalmail: { type: 'bool' },

        gendercode: { type: 'number' },
        birthdate: { type: 'string' },
        anniversary: { type: 'string' },
        preferredcontactmethodcode: { type: 'number' },

        _createdby_value: { type: 'string' },
        _modifiedby_value: { type: 'string' },
        _createdonbehalfby_value: { type: 'string' },
        _modifiedonbehalfby_value: { type: 'string' },

        versionnumber: { type: 'number' },
      },
    },
  },
});

const getLatestDynamicsContacts = async (
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
        path: '/api/data/v9.1/contacts',
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
    throw new Error(`Error fetching Dynamics 365 contacts: ${JSON.stringify(error)}`);
  }
};

export default DynamicsNewContactTrigger;
