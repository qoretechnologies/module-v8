/* eslint-disable max-len */

import { HubspotAssociationsEn } from './associations';
import { HubspotTriggerOptionsEn } from './trigger-options';

const HubspotAppEn = {
  displayName: 'HubSpot',
  groups: ['CRM & Sales Management', 'Email & Email Marketing'],
  shortDesc: 'Seamlessly connect to the HubSpot API to automate and streamline your CRM processes.',
  longDesc:
    'The HubSpot integration provides a comprehensive collection of actions and triggers to interact with the HubSpot API. Whether you need to manage companies, contacts, deals, or custom objects, this integration simplifies your workflow automation and CRM management.',
  actions: {
    'post-crm-v3-objects-companies-batch-upsert_upsert': {
      displayName: 'Create Or Update Companies',
      shortDesc: 'Create or update multiple companies',
      groups: ['Companies'],
    },
    'get-crm-v3-objects-contacts': {
      displayName: 'List Contacts',
      shortDesc: 'Retrieve a list of contacts',
      groups: ['Contacts'],
    },
    'post-crm-v3-objects-contacts': {
      displayName: 'Create Contact',
      shortDesc: 'Create a new contact',
      groups: ['Contacts'],
      options: {
        associations: HubspotAssociationsEn,
      },
    },
    'post-crm-v3-objects-contacts-search': {
      displayName: 'Search Contacts',
      shortDesc: 'Search for contacts based on specific criteria',
      longDesc: 'Search for contacts based on specific criteria',
      groups: ['Contacts'],
    },
    'delete-crm-v3-objects-contacts-contactId': {
      displayName: 'Delete Contact',
      shortDesc: 'Soft delete a selected contact',
      groups: ['Contacts'],
    },
    'get-crm-v3-objects-contacts-contactId': {
      displayName: 'Retrieve Contact',
      shortDesc: 'Retrieve a specific contact',
      groups: ['Contacts'],
    },
    'patch-crm-v3-objects-contacts-contactId': {
      displayName: 'Update Contact',
      shortDesc: 'Update an existing contact',
      groups: ['Contacts'],
    },
    'get-crm-v3-objects-objectType_getPage': {
      displayName: 'List Custom Objects',
      shortDesc: 'Retrieve a list of selected custom objects',
      groups: ['Custom Objects'],
    },
    'post-crm-v3-objects-objectType_create': {
      displayName: 'Create Custom Object',
      shortDesc: 'Create a new custom object of a selected type',
      groups: ['Custom Objects'],
      options: {
        associations: HubspotAssociationsEn,
      },
    },
    'post-crm-v3-objects-objectType-batch-upsert': {
      displayName: 'Create Or Update Custom Objects',
      groups: ['Custom Objects'],
    },
    'post-crm-v3-objects-objectType-search_doSearch': {
      displayName: 'Search Custom Objects',
      shortDesc: 'Search for custom objects based on specific criteria',
      longDesc: 'Search for custom objects based on specific criteria',
      groups: ['Custom Objects'],
    },
    'delete-crm-v3-objects-objectType-objectId_archive': {
      displayName: 'Delete Custom Object',
      shortDesc: 'Soft delete a selected custom object',
      groups: ['Custom Objects'],
    },
    'get-crm-v3-objects-objectType-objectId_getById': {
      displayName: 'Retrieve Custom Object',
      shortDesc: 'Retrieve a specific custom object',
      groups: ['Custom Objects'],
    },
    'patch-crm-v3-objects-objectType-objectId_update': {
      displayName: 'Update Custom Object',
      shortDesc: 'Update an existing custom object',
      groups: ['Custom Objects'],
    },
    'get-crm-v3-objects-deals_getPage': {
      displayName: 'List Deals',
      shortDesc: 'Retrieve a list of deals',
      groups: ['Deals'],
    },
    'post-crm-v3-objects-deals_create': {
      displayName: 'Create Deal',
      shortDesc: 'Create a new deal',
      groups: ['Deals'],
      options: {
        associations: HubspotAssociationsEn,
      },
    },
    'post-crm-v3-objects-deals-batch-upsert_upsert': {
      displayName: 'Create Or Update Deals',
      groups: ['Deals'],
    },
    'post-crm-v3-objects-deals-search_doSearch': {
      displayName: 'Search Deals',
      shortDesc: 'Search for deals based on specific criteria',
      longDesc: 'Search for deals based on specific criteria',
      groups: ['Deals'],
    },
    'delete-crm-v3-objects-deals-dealId_archive': {
      displayName: 'Delete a Deal',
      shortDesc: 'Soft delete a selected deal',
      groups: ['Deals'],
    },
    'get-crm-v3-objects-deals-dealId_getById': {
      displayName: 'Retrieve Deal',
      shortDesc: 'Retrieve a specific deal',
      groups: ['Deals'],
    },
    'patch-crm-v3-objects-deals-dealId_update': {
      displayName: 'Update Deal',
      shortDesc: 'Update an existing deal',
      groups: ['Deals'],
    },
    'get-crm-v3-objects-leads_getPage': {
      displayName: 'List Leads',
      shortDesc: 'Retrieve a list of leads',
      groups: ['Leads'],
    },
    'post-crm-v3-objects-leads_create': {
      displayName: 'Create Lead',
      shortDesc: 'Create a new lead',
      groups: ['Leads'],
      options: {
        associations: HubspotAssociationsEn,
      },
    },
    'post-crm-v3-objects-leads-batch-upsert_upsert': {
      displayName: 'Create Or Update Leads',
      groups: ['Leads'],
    },
    'post-crm-v3-objects-leads-search_doSearch': {
      displayName: 'Search Leads',
      shortDesc: 'Search for leads based on specific criteria',
      longDesc: 'Search for leads based on specific criteria',
      groups: ['Leads'],
    },
    'delete-crm-v3-objects-leads-leadsId_archive': {
      displayName: 'Delete Lead',
      shortDesc: 'Soft delete a selected lead',
      groups: ['Leads'],
    },
    'get-crm-v3-objects-leads-leadsId_getById': {
      displayName: 'Retrieve Lead',
      shortDesc: 'Retrieve a specific lead',
      groups: ['Leads'],
    },
    'patch-crm-v3-objects-leads-leadsId_update': {
      displayName: 'Update Lead',
      shortDesc: 'Update an existing lead',
      groups: ['Leads'],
    },
    'get-crm-v3-objects-products_getPage': {
      displayName: 'List Products',
      shortDesc: 'Retrieve a list of products',
      groups: ['Products'],
    },
    'post-crm-v3-objects-products_create': {
      displayName: 'Create Product',
      shortDesc: 'Create a new product',
      groups: ['Products'],
      options: {
        associations: HubspotAssociationsEn,
      },
    },
    'post-crm-v3-objects-products-batch-upsert_upsert': {
      displayName: 'Create Or Update Products',
      groups: ['Products'],
    },
    'post-crm-v3-objects-products-search_doSearch': {
      displayName: 'Search Products',
      shortDesc: 'Search for products based on specific criteria',
      longDesc: 'Search for products based on specific criteria',
      groups: ['Products'],
    },
    'delete-crm-v3-objects-products-productId_archive': {
      displayName: 'Delete Product',
      shortDesc: 'Soft delete a selected product',
      groups: ['Products'],
    },
    'get-crm-v3-objects-products-productId_getById': {
      displayName: 'Retrieve Product',
      shortDesc: 'Retrieve a specific product',
      groups: ['Products'],
    },
    'patch-crm-v3-objects-products-productId_update': {
      displayName: 'Update Product',
      shortDesc: 'Update an existing product',
      groups: ['Products'],
    },
    'get-crm-v3-objects-tickets_getPage': {
      displayName: 'List Tickets',
      shortDesc: 'Retrieve a list of tickets',
      groups: ['Tickets'],
    },
    'post-crm-v3-objects-tickets_create': {
      displayName: 'Create Ticket',
      shortDesc: 'Create a new ticket',
      groups: ['Tickets'],
      options: {
        associations: HubspotAssociationsEn,
      },
    },
    'post-crm-v3-objects-tickets-batch-upsert_upsert': {
      displayName: 'Create Or Update Tickets',
      groups: ['Tickets'],
    },
    'post-crm-v3-objects-tickets-search_doSearch': {
      displayName: 'Search Tickets',
      shortDesc: 'Search for tickets based on specific criteria',
      longDesc: 'Search for tickets based on specific criteria',
      groups: ['Tickets'],
    },
    'delete-crm-v3-objects-tickets-ticketId_archive': {
      displayName: 'Delete Ticket',
      shortDesc: 'Soft delete a selected ticket',
      groups: ['Tickets'],
    },
    'get-crm-v3-objects-tickets-ticketId_getById': {
      displayName: 'Retrieve Ticket',
      shortDesc: 'Retrieve a specific ticket',
      groups: ['Tickets'],
    },
    'patch-crm-v3-objects-tickets-ticketId_update': {
      displayName: 'Update Ticket',
      shortDesc: 'Update an existing ticket',
      groups: ['Tickets'],
    },
    'get-crm-v3-objects-users': {
      displayName: 'List Users',
      shortDesc: 'Retrieve a list of users',
      groups: ['Users'],
    },
    'post-crm-v3-objects-users-batch-upsert': {
      displayName: 'Create Or Update Users',
      groups: ['Users'],
    },
    'post-crm-v3-objects-users-search': {
      displayName: 'Search Users',
      shortDesc: 'Search for users based on specific criteria',
      longDesc: 'Search for users based on specific criteria',
      groups: ['Users'],
    },
    'get-crm-v3-objects-users-userId': {
      displayName: 'Retrieve User',
      shortDesc: 'Retrieve a specific user',
      groups: ['Users'],
    },
    'patch-crm-v3-objects-users-userId': {
      displayName: 'Update User',
      shortDesc: 'Update an existing user',
      groups: ['Users'],
    },
    create_list: {
      displayName: 'Create List',
      shortDesc: 'Create a new HubSpot list',
      longDesc:
        'Creates a new list in HubSpot CRM with the specified configuration and properties.',
      groups: ['Lists'],
    },
    search_lists: {
      displayName: 'Search Lists',
      shortDesc: 'Search for HubSpot lists',
      longDesc: 'Search and retrieve HubSpot lists based on specified criteria and filters.',
      groups: ['Lists'],
    },
    delete_list: {
      displayName: 'Delete List',
      shortDesc: 'Delete a HubSpot list',
      longDesc: 'Permanently removes a specified list from HubSpot CRM by its ID.',
      groups: ['Lists'],
    },
    get_list: {
      displayName: 'Get List',
      shortDesc: 'Retrieve a HubSpot list by ID',
      longDesc:
        'Fetches detailed information about a specific HubSpot list using its unique identifier.',
      groups: ['Lists'],
    },
    add_memberships: {
      displayName: 'Add List Records',
      shortDesc: 'Add records to a HubSpot list',
      longDesc: 'Adds specified records as members to an existing HubSpot list.',
      groups: ['Lists'],
    },
    add_members_from_source_list: {
      displayName: 'Add Records from another list',
      shortDesc: 'Copy all members from one list to another',
      longDesc:
        'Adds all members from a source HubSpot list to a target list, effectively copying the membership.',
      groups: ['Lists'],
    },
    remove_members_from_list: {
      displayName: 'Remove List Records',
      shortDesc: 'Remove records from a HubSpot list',
      longDesc: 'Removes specified records from an existing HubSpot list membership.',
      groups: ['Lists'],
    },
    get_list_records: {
      displayName: 'Get List Records',
      shortDesc: 'Retrieve records from a HubSpot list with pagination and property filtering.',
      longDesc:
        'Fetches records from a specified HubSpot list, including support for pagination using before/after cursors and filtering by specific properties. Returns the actual record data along with pagination metadata.',
      groups: ['Lists'],
      options: {
        listId: {
          displayName: 'List ID',
          shortDesc: 'The HubSpot list to retrieve records from',
          longDesc: 'The unique identifier of the HubSpot list to fetch records from.',
        },
        after: {
          displayName: 'After',
          shortDesc: 'Pagination cursor for next page',
          longDesc:
            'Cursor value to retrieve records after this point. Used for forward pagination.',
        },
        before: {
          displayName: 'Before',
          shortDesc: 'Pagination cursor for previous page',
          longDesc:
            'Cursor value to retrieve records before this point. Used for backward pagination.',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of records to return',
          longDesc: 'The maximum number of records to return in a single request. Default is 100.',
        },
        properties: {
          displayName: 'Properties',
          shortDesc: 'List of properties to include',
          longDesc:
            'Specific properties to include in the response for each record. If not specified, default properties will be returned.',
        },
      },
    },
  },
  triggers: {
    hubspot_company_created_or_updated_trigger: {
      event_info: {
        desc: 'Company Information',
      },
      displayName: 'Company Created or Updated',
      shortDesc: 'Triggers when a company is added or updated in HubSpot.',
      longDesc:
        'This trigger activates whenever a company record is created or modified in HubSpot, enabling you to automate workflows based on company data changes.',
      options: HubspotTriggerOptionsEn,
    },
    hubspot_contact_created_or_updated_trigger: {
      event_info: {
        desc: 'Contact Information',
      },
      displayName: 'Contact Created or Updated',
      shortDesc: 'Triggers when a contact is added or updated in HubSpot.',
      longDesc:
        'Activate workflows whenever a new contact is created or an existing contact is updated within HubSpot. Ideal for managing customer information efficiently.',
      options: HubspotTriggerOptionsEn,
    },
    hubspot_custom_object_created_or_updated_trigger: {
      event_info: {
        desc: 'Custom Object Information',
      },
      displayName: 'Custom Object Created or Updated',
      shortDesc: 'Triggers when a custom object is added or updated in HubSpot.',
      longDesc:
        'Use this trigger to capture changes to custom objects in HubSpot, ensuring that updates to custom data structures are processed immediately for automation or integration.',
      options: {
        ...HubspotTriggerOptionsEn,
        object: {
          displayName: 'Object',
          shortDesc: 'The custom object to monitor for changes.',
          longDesc: 'Select the custom object you want to monitor for new or updated records.',
        },
      },
    },
    hubspot_deal_created_or_updated_trigger: {
      event_info: {
        desc: 'Deal Information',
      },
      displayName: 'Deal Created or Updated',
      shortDesc: 'Triggers when a deal is created or updated in HubSpot.',
      longDesc:
        'This trigger fires when a deal is created or modified in HubSpot, allowing you to track sales opportunities and integrate with your sales pipeline automation workflows.',
      options: HubspotTriggerOptionsEn,
    },
    hubspot_lead_created_or_updated_trigger: {
      event_info: {
        desc: 'Lead Information',
      },
      displayName: 'Lead Created or Updated',
      shortDesc: 'Triggers when a lead is added or updated in HubSpot.',
      longDesc:
        'Monitor new leads and updates to existing leads in HubSpot with this trigger, enabling efficient lead management and follow-up processes.',
      options: HubspotTriggerOptionsEn,
    },
    hubspot_product_created_or_updated_trigger: {
      event_info: {
        desc: 'Product Information',
      },
      displayName: 'Product Created or Updated',
      shortDesc: 'Triggers when a product is added or updated in HubSpot.',
      longDesc:
        'This trigger alerts you to any new or updated products within your HubSpot account, ensuring that your product data remains synchronized with your workflows and external systems.',
      options: HubspotTriggerOptionsEn,
    },
    hubspot_ticket_created_or_updated_trigger: {
      event_info: {
        desc: 'Ticket Information',
      },
      displayName: 'Ticket Created or Updated',
      shortDesc: 'Triggers when a support ticket is created or updated in HubSpot.',
      longDesc:
        'Automatically trigger workflows when a support ticket is created or updated in HubSpot, ideal for managing customer support operations and streamlining issue resolution.',
      options: HubspotTriggerOptionsEn,
    },
    hubspot_user_created_or_updated_trigger: {
      event_info: {
        desc: 'User Information',
      },
      displayName: 'User Created or Updated',
      shortDesc: 'Triggers when a user is added or updated in HubSpot.',
      longDesc:
        'This trigger fires upon the creation or update of a user within HubSpot, helping you keep track of user accounts and maintain updated access control for your team.',
      options: HubspotTriggerOptionsEn,
    },
  },
  expressions: {
    '&&': {
      displayName: 'and (&&)',
      shortDesc: 'Returns True if all arguments are True',
      longDesc: 'Returns `True` if all arguments are `True` with logic short-circuiting',
      args: [
        {
          displayName: 'Condition',
          shortDesc: 'Boolean condition to evaluate',
          longDesc: 'A boolean expression or condition that evaluates to True or False',
        },
      ],
    },
    '||': {
      displayName: 'or (||)',
      shortDesc: 'Returns True if any argument is True',
      longDesc: 'Returns `True` if any argument is `True` with logic short-circuiting',
      args: [
        {
          displayName: 'Condition',
          shortDesc: 'Boolean condition to evaluate',
          longDesc: 'A boolean expression or condition that evaluates to True or False',
        },
      ],
    },
    '==': {
      displayName: 'equals (=)',
      shortDesc: 'Equality comparison',
      longDesc: 'Returns `True` if the field value equals the specified value',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Field to compare',
          longDesc: 'The field whose value will be compared',
        },
        {
          displayName: 'Value',
          shortDesc: 'Value to compare against',
          longDesc: 'The value to compare the field against',
        },
      ],
    },
    '!=': {
      displayName: 'not equals (!=)',
      shortDesc: 'Inequality comparison',
      longDesc: 'Returns `True` if the field value does not equal the specified value',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Field to compare',
          longDesc: 'The field whose value will be compared',
        },
        {
          displayName: 'Value',
          shortDesc: 'Value to compare against',
          longDesc: 'The value to compare the field against',
        },
      ],
    },
    '>': {
      displayName: 'greater than (>)',
      shortDesc: 'Greater than comparison',
      longDesc: 'Returns `True` if the field value is greater than the specified value',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Field to compare',
          longDesc: 'The field whose value will be compared',
        },
        {
          displayName: 'Value',
          shortDesc: 'Value to compare against',
          longDesc: 'The value to compare the field against',
        },
      ],
    },
    '>=': {
      displayName: 'greater than or equal (>=)',
      shortDesc: 'Greater than or equal comparison',
      longDesc: 'Returns `True` if the field value is greater than or equal to the specified value',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Field to compare',
          longDesc: 'The field whose value will be compared',
        },
        {
          displayName: 'Value',
          shortDesc: 'Value to compare against',
          longDesc: 'The value to compare the field against',
        },
      ],
    },
    '<': {
      displayName: 'less than (<)',
      shortDesc: 'Less than comparison',
      longDesc: 'Returns `True` if the field value is less than the specified value',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Field to compare',
          longDesc: 'The field whose value will be compared',
        },
        {
          displayName: 'Value',
          shortDesc: 'Value to compare against',
          longDesc: 'The value to compare the field against',
        },
      ],
    },
    '<=': {
      displayName: 'less than or equal (<=)',
      shortDesc: 'Less than or equal comparison',
      longDesc: 'Returns `True` if the field value is less than or equal to the specified value',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Field to compare',
          longDesc: 'The field whose value will be compared',
        },
        {
          displayName: 'Value',
          shortDesc: 'Value to compare against',
          longDesc: 'The value to compare the field against',
        },
      ],
    },
    in: {
      displayName: 'in',
      shortDesc: 'In list',
      longDesc: 'Returns `True` if the field value is in the provided list',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Field to check',
          longDesc: 'The field whose value will be checked',
        },
        {
          displayName: 'Values',
          shortDesc: 'List of values',
          longDesc: 'The list of values to check the field against',
        },
      ],
    },
    not_in: {
      displayName: 'not in',
      shortDesc: 'Not in list',
      longDesc: 'Returns `True` if the field value is not in the provided list',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Field to check',
          longDesc: 'The field whose value will be checked',
        },
        {
          displayName: 'Values',
          shortDesc: 'List of values',
          longDesc: 'The list of values the field should not match',
        },
      ],
    },
    between: {
      displayName: 'between',
      shortDesc: 'Between two values',
      longDesc: 'Returns `True` if the field value is between the two specified values',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Field to check',
          longDesc: 'The field whose value will be checked',
        },
        {
          displayName: 'Lower bound',
          shortDesc: 'Minimum value',
          longDesc: 'The lower bound of the range (inclusive)',
        },
        {
          displayName: 'Upper bound',
          shortDesc: 'Maximum value',
          longDesc: 'The upper bound of the range (inclusive)',
        },
      ],
    },
    has_property: {
      displayName: 'has property',
      shortDesc: 'Field has a value',
      longDesc: 'Returns `True` if the field has any value set (is not null or empty)',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Field to check',
          longDesc: 'The field to check for a value',
        },
      ],
    },
    not_has_property: {
      displayName: 'does not have property',
      shortDesc: 'Field has no value',
      longDesc: 'Returns `True` if the field has no value set (is null or empty)',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Field to check',
          longDesc: 'The field to check for emptiness',
        },
      ],
    },
    contains_token: {
      displayName: 'contains token',
      shortDesc: 'Contains token or substring',
      longDesc: 'Returns `True` if the field contains the specified token or substring',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Text field to search',
          longDesc: 'The text field to search within',
        },
        {
          displayName: 'Token',
          shortDesc: 'Token to find',
          longDesc: 'The token or substring to search for',
        },
      ],
    },
    not_contains_token: {
      displayName: 'does not contain token',
      shortDesc: 'Does not contain token or substring',
      longDesc: 'Returns `True` if the field does not contain the specified token or substring',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Text field to search',
          longDesc: 'The text field to search within',
        },
        {
          displayName: 'Token',
          shortDesc: 'Token to exclude',
          longDesc: 'The token or substring that should not be present',
        },
      ],
    },
  },
};

export default HubspotAppEn;
