

const DynamicsAppEn = {
  displayName: 'Microsoft Dynamics 365',
  shortDesc: 'Connect to Microsoft Dynamics 365 CRM and ERP',
  longDesc: 'Microsoft Dynamics 365 is a suite of enterprise resource planning (ERP) and customer relationship management (CRM) applications. This integration enables you to automate workflows triggered by Dynamics 365 events such as new accounts, contacts, leads, opportunities, and orders.',
  groups: ['CRM & Sales Management', 'Accounting & ERP'],
  triggers: {
    'new-or-updated-account': {
      displayName: 'New or Updated Account',
      shortDesc: 'Triggers when an account is created or modified',
      longDesc:
        'Monitors Dynamics 365 for accounts, allowing you to choose whether to trigger on newly created accounts or when existing accounts are modified.',
      options: {
        condition: {
          displayName: 'Trigger Condition',
          shortDesc: 'Choose created or updated',
          longDesc:
            'Select whether to trigger when accounts are created or when they are updated. Only one condition can be selected at a time.',
        },
      },
    },
    'new-or-updated-case': {
      displayName: 'New or Updated Case',
      shortDesc: 'Triggers when a case is created or modified',
      longDesc:
        'Detects when support cases are created or updated in Dynamics 365, enabling automated responses, notifications, or case management workflows.',
      options: {
        condition: {
          displayName: 'Trigger Condition',
          shortDesc: 'Choose created or updated',
          longDesc:
            'Specify whether to trigger on new cases (created) or when existing cases are modified (updated). You must select one option.',
        },
      },
    },
    'new-or-updated-contact': {
      displayName: 'New or Updated Contact',
      shortDesc: 'Triggers when a contact is created or modified',
      longDesc:
        'Monitors your Dynamics 365 environment for contacts, allowing you to trigger workflows either when new contacts are added or when existing contact records are changed.',
      options: {
        condition: {
          displayName: 'Trigger Condition',
          shortDesc: 'Choose created or updated',
          longDesc:
            'Select whether the trigger should fire for newly created contacts or for updates to existing contacts. Only one option can be active.',
        },
      },
    },
    'new-custom-entity': {
      displayName: 'New Custom Entity Record',
      shortDesc: 'Triggers when a custom entity record is created',
      longDesc:
        "Works with your organization's custom entities in Dynamics 365, allowing you to monitor and respond when new records are created for any custom entity type you specify.",
      options: {
        entityName: {
          displayName: 'Entity Logical Name',
          shortDesc: 'The internal name of the custom entity',
          longDesc:
            'Enter the logical (schema) name of the custom entity you want to monitor. This is typically in the format "new_entityname" or "custom_entityname".',
        },
      },
    },
    'new-or-updated-invoice': {
      displayName: 'New or Updated Invoice',
      shortDesc: 'Triggers when an invoice is created or modified',
      longDesc:
        'Monitors invoice-related activities in Dynamics 365, letting you choose to trigger workflows either when new invoices are created or when existing ones are updated.',
      options: {
        condition: {
          displayName: 'Trigger Condition',
          shortDesc: 'Choose created or updated',
          longDesc:
            'Specify whether to trigger on newly created invoices or when existing invoices are modified. You must select one option.',
        },
      },
    },
    'new-or-updated-lead': {
      displayName: 'New or Updated Lead',
      shortDesc: 'Triggers when a lead is created or modified',
      longDesc:
        'Detects when leads are added or modified in Dynamics 365, allowing you to choose whether to trigger on new leads or when existing lead records change.',
      options: {
        condition: {
          displayName: 'Trigger Condition',
          shortDesc: 'Choose created or updated',
          longDesc:
            'Select whether to trigger when new leads are created or when existing leads are updated. Only one condition can be selected.',
        },
      },
    },
    'new-or-updated-opportunity': {
      displayName: 'New or Updated Opportunity',
      shortDesc: 'Triggers when an opportunity is created or modified',
      longDesc:
        'Monitors your sales pipeline in Dynamics 365, giving you the option to trigger workflows either when new opportunities are created or when existing ones change.',
      options: {
        condition: {
          displayName: 'Trigger Condition',
          shortDesc: 'Choose created or updated',
          longDesc:
            'Specify whether to trigger on new opportunities being created or on updates to existing opportunities. You must select one option.',
        },
      },
    },
    'new-or-updated-order': {
      displayName: 'New or Updated Order',
      shortDesc: 'Triggers when an order is created or modified',
      longDesc:
        'Tracks order-related activities in Dynamics 365, allowing you to choose whether to trigger workflows when new orders are placed or when existing orders are updated.',
      options: {
        condition: {
          displayName: 'Trigger Condition',
          shortDesc: 'Choose created or updated',
          longDesc:
            'Select whether to trigger on newly created orders or when existing orders are modified. Only one condition can be active at a time.',
        },
      },
    },
  },
};

export default DynamicsAppEn;
