const SalesforceAppEn = {
  groups: ['CRM & Sales Management'],
  triggers: {
    new_record_trigger: {
      displayName: 'New Record',
      shortDesc: 'Triggers when a new record is created in the specified object.',
      longDesc:
        'This trigger fires whenever a new record is created in a specified Salesforce object. You can configure the object type to target specific record types, such as Leads, Contacts, or custom objects. It is useful for automating workflows triggered by record creation.',
      options: {
        object: {
          displayName: 'Object Type',
          shortDesc: 'The Salesforce object to monitor for new records.',
          longDesc:
            'Select the Salesforce object (e.g., Lead, Account, Contact) where this trigger will monitor for newly created records.',
        },
      },
      event_info: {
        desc: 'Fires when a new record is created in the specified Salesforce object.',
      },
    },
    new_contact_trigger: {
      displayName: 'New Contact',
      shortDesc: 'Triggers when a new Contact record is created.',
      longDesc:
        'This trigger fires whenever a new Contact record is created in Salesforce. It is ideal for automating workflows such as contact notifications, integrations, or CRM updates.',
      event_info: {
        desc: 'Fires when a new Contact record is created in Salesforce.',
      },
    },
    new_lead_trigger: {
      displayName: 'New Lead',
      shortDesc: 'Triggers when a new Lead record is created.',
      longDesc:
        'This trigger activates whenever a new Lead record is created in Salesforce. It is commonly used for workflows related to lead generation, qualification, or assignment.',
      event_info: {
        desc: 'Fires when a new Lead record is created in Salesforce.',
      },
    },
    updated_record_trigger: {
      displayName: 'Updated Record',
      shortDesc: 'Triggers when an existing record is updated.',
      longDesc:
        'This trigger fires whenever an existing record in a specified Salesforce object is updated. It is useful for workflows that depend on changes to specific fields or records, such as updating downstream systems or notifying users of record changes.',
      options: {
        object: {
          displayName: 'Object Type',
          shortDesc: 'The Salesforce object to monitor for updates.',
          longDesc:
            'Specify the Salesforce object (e.g., Opportunity, Contact, or custom objects) where this trigger will monitor for record updates.',
        },
      },
      event_info: {
        desc: 'Fires when a record in the specified Salesforce object is updated.',
      },
    },
  },
};

export default SalesforceAppEn;
