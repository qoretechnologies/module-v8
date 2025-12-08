import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { SALESFORCE_APP_NAME } from '../constants';
import { fetchSalesforceObjectRecords } from '../helpers/constants';

const salesforceNewLeadTrigger = QoreAppCreator.createLocalizedTrigger({
  app: SALESFORCE_APP_NAME,
  action: 'new_lead_trigger',
  action_code: EQoreAppActionCode.EVENT,
  event_function: async (context, update, should_stop) => {
    const token = context.conn_opts?.token;
    const instance_url = context.conn_opts?.instance_url;

    if (!token || !instance_url) {
      throw new Error('The token and instance_url are required to register Salesforce webhook');
    }

    const getLeads = () => {
      return getLastCreatedLead(token, instance_url);
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'salesforce_new_lead_trigger',
      uniqueField: 'Id',
      getItems: getLeads,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const token = context?.conn_opts?.token;
    const instance_url = context?.conn_opts?.instance_url;

    if (!token || !instance_url) {
      throw new Error(
        'The token and instance_url are required to get Salesforce new lead example data'
      );
    }

    const data = await getLastCreatedLead(token, instance_url);

    return data?.length > 0 ? data[0] : null;
  },
  event_info: {
    desc: 'Salesforce New Lead Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        attributes: {
          type: {
            type: 'hash',
            fields: {
              type: {
                type: 'string',
              },
              url: {
                type: 'string',
              },
            },
          },
        },
        Id: {
          type: 'string',
        },
        IsDeleted: {
          type: 'bool',
        },
        MasterRecordId: {
          type: 'string',
        },
        LastName: {
          type: 'string',
        },
        FirstName: {
          type: 'string',
        },
        Salutation: {
          type: 'string',
        },
        Name: {
          type: 'string',
        },
        Title: {
          type: 'string',
        },
        Company: {
          type: 'string',
        },
        Street: {
          type: 'string',
        },
        City: {
          type: 'string',
        },
        State: {
          type: 'string',
        },
        PostalCode: {
          type: 'string',
        },
        Country: {
          type: 'string',
        },
        Latitude: {
          type: 'number',
        },
        Longitude: {
          type: 'number',
        },
        GeocodeAccuracy: {
          type: 'string',
        },
        Address: {
          type: 'string',
        },
        Phone: {
          type: 'string',
        },
        Email: {
          type: 'string',
        },
        Website: {
          type: 'string',
        },
        PhotoUrl: {
          type: 'string',
        },
        Description: {
          type: 'string',
        },
        LeadSource: {
          type: 'string',
        },
        Status: {
          type: 'string',
        },
        Industry: {
          type: 'string',
        },
        Rating: {
          type: 'string',
        },
        AnnualRevenue: {
          type: 'number',
        },
        NumberOfEmployees: {
          type: 'number',
        },
        OwnerId: {
          type: 'string',
        },
        HasOptedOutOfEmail: {
          type: 'bool',
        },
        IsConverted: {
          type: 'bool',
        },
        ConvertedDate: {
          type: 'string',
        },
        ConvertedAccountId: {
          type: 'string',
        },
        ConvertedContactId: {
          type: 'string',
        },
        ConvertedOpportunityId: {
          type: 'string',
        },
        IsUnreadByOwner: {
          type: 'bool',
        },
        CreatedDate: {
          type: 'string',
        },
        CreatedById: {
          type: 'string',
        },
        LastModifiedDate: {
          type: 'string',
        },
        LastModifiedById: {
          type: 'string',
        },
        SystemModstamp: {
          type: 'string',
        },
        LastActivityDate: {
          type: 'string',
        },
        LastViewedDate: {
          type: 'string',
        },
        LastReferencedDate: {
          type: 'string',
        },
        Jigsaw: {
          type: 'string',
        },
        JigsawContactId: {
          type: 'string',
        },
        EmailBouncedReason: {
          type: 'string',
        },
        EmailBouncedDate: {
          type: 'string',
        },
        IndividualId: {
          type: 'string',
        },
        ActionCadenceId: {
          type: 'string',
        },
        ActionCadenceAssigneeId: {
          type: 'string',
        },
        ActionCadenceState: {
          type: 'string',
        },
        ScheduledResumeDateTime: {
          type: 'string',
        },
        ActiveTrackerCount: {
          type: 'number',
        },
        FirstCallDateTime: {
          type: 'string',
        },
        FirstEmailDateTime: {
          type: 'string',
        },
        ActivityMetricId: {
          type: 'string',
        },
        ActivityMetricRollupId: {
          type: 'string',
        },
      },
    },
  },
});

const getLastCreatedLead = async (token: string, url: string): Promise<any> => {
  const lead = await fetchSalesforceObjectRecords({
    instanceUrl: url,
    token,
    query: `SELECT FIELDS(ALL) FROM Lead ORDER BY CreatedDate DESC LIMIT ${DEFAULT_TRIGGER_POLL_ITEM_LIMIT}`,
  });

  return lead;
};

export default salesforceNewLeadTrigger;
