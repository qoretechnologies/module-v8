import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { SALESFORCE_APP_NAME } from '../constants';
import { fetchSalesforceObjectRecords } from '../helpers/constants';

const salesforceNewContactTrigger = QoreAppCreator.createLocalizedTrigger({
  app: SALESFORCE_APP_NAME,
  action: 'new_contact_trigger',
  action_code: EQoreAppActionCode.EVENT,
  event_function: async (context, update, should_stop) => {
    const token = context.conn_opts?.token;
    const instance_url = context.conn_opts?.instance_url;

    if (!token || !instance_url) {
      throw new Error('The token and instance_url are required to register Salesforce webhook');
    }

    const getContacts = () => {
      return getLastCreatedContacts(token, instance_url);
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'salesforce_new_contact_trigger',
      uniqueField: 'Id',
      getItems: getContacts,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const token = context?.conn_opts?.token;
    const instance_url = context?.conn_opts?.instance_url;

    if (!token || !instance_url) {
      throw new Error(
        'The token and instance_url are required to get Salesforce new contact example data'
      );
    }

    const data = await getLastCreatedContacts(token, instance_url);

    return data?.length > 0 ? data[0] : null;
  },
  event_info: {
    desc: 'Salesforce New Contact Trigger Event Info',
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
          type: 'boolean',
        },
        MasterRecordId: {
          type: 'string',
        },
        AccountId: {
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
        OtherStreet: {
          type: 'string',
        },
        OtherCity: {
          type: 'string',
        },
        OtherState: {
          type: 'string',
        },
        OtherPostalCode: {
          type: 'string',
        },
        OtherCountry: {
          type: 'string',
        },
        OtherLatitude: {
          type: 'number',
        },
        OtherLongitude: {
          type: 'number',
        },
        OtherGeocodeAccuracy: {
          type: 'string',
        },
        OtherAddress: {
          type: 'string',
        },
        MailingStreet: {
          type: 'string',
        },
        MailingCity: {
          type: 'string',
        },
        MailingState: {
          type: 'string',
        },
        MailingPostalCode: {
          type: 'string',
        },
        MailingCountry: {
          type: 'string',
        },
        MailingLatitude: {
          type: 'number',
        },
        MailingLongitude: {
          type: 'number',
        },
        MailingGeocodeAccuracy: {
          type: 'string',
        },
        MailingAddress: {
          type: 'string',
        },
        Phone: {
          type: 'string',
        },
        Fax: {
          type: 'string',
        },
        MobilePhone: {
          type: 'string',
        },
        HomePhone: {
          type: 'string',
        },
        OtherPhone: {
          type: 'string',
        },
        AssistantPhone: {
          type: 'string',
        },
        ReportsToId: {
          type: 'string',
        },
        Email: {
          type: 'string',
        },
        Title: {
          type: 'string',
        },
        Department: {
          type: 'string',
        },
        AssistantName: {
          type: 'string',
        },
        LeadSource: {
          type: 'string',
        },
        Birthdate: {
          type: 'string',
        },
        Description: {
          type: 'string',
        },
        OwnerId: {
          type: 'string',
        },
        HasOptedOutOfEmail: {
          type: 'boolean',
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
        LastCURequestDate: {
          type: 'string',
        },
        LastCUUpdateDate: {
          type: 'string',
        },
        LastViewedDate: {
          type: 'string',
        },
        LastReferencedDate: {
          type: 'string',
        },
        EmailBouncedReason: {
          type: 'string',
        },
        EmailBouncedDate: {
          type: 'string',
        },
        IsEmailBounced: {
          type: 'boolean',
        },
        PhotoUrl: {
          type: 'string',
        },
        Jigsaw: {
          type: 'string',
        },
        JigsawContactId: {
          type: 'string',
        },
        IndividualId: {
          type: 'string',
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
        ContactSource: {
          type: 'string',
        },
      },
    },
  },
});

const getLastCreatedContacts = async (token: string, url: string): Promise<any> => {
  const contacts = await fetchSalesforceObjectRecords({
    instanceUrl: url,
    token,
    query: `SELECT FIELDS(ALL) FROM Contact ORDER BY CreatedDate DESC LIMIT ${DEFAULT_TRIGGER_POLL_ITEM_LIMIT}`,
  });

  return contacts;
};

export default salesforceNewContactTrigger;
