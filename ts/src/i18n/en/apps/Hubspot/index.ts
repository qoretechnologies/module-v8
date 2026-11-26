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
      displayName: 'Create or update companies',
      shortDesc: 'Create or update multiple companies',
      groups: ['Companies'],
    },
    'get-crm-v3-objects-contacts': {
      displayName: 'List contacts',
      shortDesc: 'Retrieve a list of contacts',
      groups: ['Contacts'],
    },
    'post-crm-v3-objects-contacts': {
      displayName: 'Create contact',
      shortDesc: 'Create a new contact',
      groups: ['Contacts'],
      options: {
        associations: HubspotAssociationsEn,
      },
    },
    'post-crm-v3-objects-contacts-search': {
      displayName: 'Search contacts',
      shortDesc: 'Search for contacts based on specific criteria',
      longDesc: 'Search for contacts based on specific criteria',
      groups: ['Contacts'],
    },
    'delete-crm-v3-objects-contacts-contactId': {
      displayName: 'Delete contact',
      shortDesc: 'Soft delete a selected contact',
      groups: ['Contacts'],
    },
    'get-crm-v3-objects-contacts-contactId': {
      displayName: 'Retrieve contact',
      shortDesc: 'Retrieve a specific contact',
      groups: ['Contacts'],
    },
    'patch-crm-v3-objects-contacts-contactId': {
      displayName: 'Update contact',
      shortDesc: 'Update an existing contact',
      groups: ['Contacts'],
    },
    'get-crm-v3-objects-objectType_getPage': {
      displayName: 'List custom objects',
      shortDesc: 'Retrieve a list of selected custom objects',
      groups: ['Custom Objects'],
    },
    'post-crm-v3-objects-objectType_create': {
      displayName: 'Create custom object',
      shortDesc: 'Create a new custom object of a selected type',
      groups: ['Custom Objects'],
      options: {
        associations: HubspotAssociationsEn,
      },
    },
    'post-crm-v3-objects-objectType-batch-upsert': {
      displayName: 'Create or update custom objects',
      groups: ['Custom Objects'],
    },
    'post-crm-v3-objects-objectType-search_doSearch': {
      displayName: 'Search custom objects',
      shortDesc: 'Search for custom objects based on specific criteria',
      longDesc: 'Search for custom objects based on specific criteria',
      groups: ['Custom Objects'],
    },
    'delete-crm-v3-objects-objectType-objectId_archive': {
      displayName: 'Delete custom object',
      shortDesc: 'Soft delete a selected custom object',
      groups: ['Custom Objects'],
    },
    'get-crm-v3-objects-objectType-objectId_getById': {
      displayName: 'Retrieve custom object',
      shortDesc: 'Retrieve a specific custom object',
      groups: ['Custom Objects'],
    },
    'patch-crm-v3-objects-objectType-objectId_update': {
      displayName: 'Update custom object',
      shortDesc: 'Update an existing custom object',
      groups: ['Custom Objects'],
    },
    'get-crm-v3-objects-deals_getPage': {
      displayName: 'List deals',
      shortDesc: 'Retrieve a list of deals',
      groups: ['Deals'],
    },
    'post-crm-v3-objects-deals_create': {
      displayName: 'Create deal',
      shortDesc: 'Create a new deal',
      groups: ['Deals'],
      options: {
        associations: HubspotAssociationsEn,
      },
    },
    'post-crm-v3-objects-deals-batch-upsert_upsert': {
      displayName: 'Create or update deals',
      groups: ['Deals'],
    },
    'post-crm-v3-objects-deals-search_doSearch': {
      displayName: 'Search deals',
      shortDesc: 'Search for deals based on specific criteria',
      longDesc: 'Search for deals based on specific criteria',
      groups: ['Deals'],
    },
    'delete-crm-v3-objects-deals-dealId_archive': {
      displayName: 'Delete a deal',
      shortDesc: 'Soft delete a selected deal',
      groups: ['Deals'],
    },
    'get-crm-v3-objects-deals-dealId_getById': {
      displayName: 'Retrieve deal',
      shortDesc: 'Retrieve a specific deal',
      groups: ['Deals'],
    },
    'patch-crm-v3-objects-deals-dealId_update': {
      displayName: 'Update deal',
      shortDesc: 'Update an existing deal',
      groups: ['Deals'],
    },
    'get-crm-v3-objects-leads_getPage': {
      displayName: 'List leads',
      shortDesc: 'Retrieve a list of leads',
      groups: ['Leads'],
    },
    'post-crm-v3-objects-leads_create': {
      displayName: 'Create lead',
      shortDesc: 'Create a new lead',
      groups: ['Leads'],
      options: {
        associations: HubspotAssociationsEn,
      },
    },
    'post-crm-v3-objects-leads-batch-upsert_upsert': {
      displayName: 'Create or update leads',
      groups: ['Leads'],
    },
    'post-crm-v3-objects-leads-search_doSearch': {
      displayName: 'Search leads',
      shortDesc: 'Search for leads based on specific criteria',
      longDesc: 'Search for leads based on specific criteria',
      groups: ['Leads'],
    },
    'delete-crm-v3-objects-leads-leadsId_archive': {
      displayName: 'Delete lead',
      shortDesc: 'Soft delete a selected lead',
      groups: ['Leads'],
    },
    'get-crm-v3-objects-leads-leadsId_getById': {
      displayName: 'Retrieve lead',
      shortDesc: 'Retrieve a specific lead',
      groups: ['Leads'],
    },
    'patch-crm-v3-objects-leads-leadsId_update': {
      displayName: 'Update lead',
      shortDesc: 'Update an existing lead',
      groups: ['Leads'],
    },
    'get-crm-v3-objects-products_getPage': {
      displayName: 'List products',
      shortDesc: 'Retrieve a list of products',
      groups: ['Products'],
    },
    'post-crm-v3-objects-products_create': {
      displayName: 'Create product',
      shortDesc: 'Create a new product',
      groups: ['Products'],
      options: {
        associations: HubspotAssociationsEn,
      },
    },
    'post-crm-v3-objects-products-batch-upsert_upsert': {
      displayName: 'Create or update products',
      groups: ['Products'],
    },
    'post-crm-v3-objects-products-search_doSearch': {
      displayName: 'Search products',
      shortDesc: 'Search for products based on specific criteria',
      longDesc: 'Search for products based on specific criteria',
      groups: ['Products'],
    },
    'delete-crm-v3-objects-products-productId_archive': {
      displayName: 'Delete product',
      shortDesc: 'Soft delete a selected product',
      groups: ['Products'],
    },
    'get-crm-v3-objects-products-productId_getById': {
      displayName: 'Retrieve product',
      shortDesc: 'Retrieve a specific product',
      groups: ['Products'],
    },
    'patch-crm-v3-objects-products-productId_update': {
      displayName: 'Update product',
      shortDesc: 'Update an existing product',
      groups: ['Products'],
    },
    'get-crm-v3-objects-tickets_getPage': {
      displayName: 'List tickets',
      shortDesc: 'Retrieve a list of tickets',
      groups: ['Tickets'],
    },
    'post-crm-v3-objects-tickets_create': {
      displayName: 'Create ticket',
      shortDesc: 'Create a new ticket',
      groups: ['Tickets'],
      options: {
        associations: HubspotAssociationsEn,
      },
    },
    'post-crm-v3-objects-tickets-batch-upsert_upsert': {
      displayName: 'Create or update tickets',
      groups: ['Tickets'],
    },
    'post-crm-v3-objects-tickets-search_doSearch': {
      displayName: 'Search tickets',
      shortDesc: 'Search for tickets based on specific criteria',
      longDesc: 'Search for tickets based on specific criteria',
      groups: ['Tickets'],
    },
    'delete-crm-v3-objects-tickets-ticketId_archive': {
      displayName: 'Delete ticket',
      shortDesc: 'Soft delete a selected ticket',
      groups: ['Tickets'],
    },
    'get-crm-v3-objects-tickets-ticketId_getById': {
      displayName: 'Retrieve ticket',
      shortDesc: 'Retrieve a specific ticket',
      groups: ['Tickets'],
    },
    'patch-crm-v3-objects-tickets-ticketId_update': {
      displayName: 'Update ticket',
      shortDesc: 'Update an existing ticket',
      groups: ['Tickets'],
    },
    'get-crm-v3-objects-users': {
      displayName: 'List users',
      shortDesc: 'Retrieve a list of users',
      groups: ['Users'],
    },
    'post-crm-v3-objects-users-batch-upsert': {
      displayName: 'Create or update users',
      groups: ['Users'],
    },
    'post-crm-v3-objects-users-search': {
      displayName: 'Search users',
      shortDesc: 'Search for users based on specific criteria',
      longDesc: 'Search for users based on specific criteria',
      groups: ['Users'],
    },
    'get-crm-v3-objects-users-userId': {
      displayName: 'Retrieve user',
      shortDesc: 'Retrieve a specific user',
      groups: ['Users'],
    },
    'patch-crm-v3-objects-users-userId': {
      displayName: 'Update user',
      shortDesc: 'Update an existing user',
      groups: ['Users'],
    },
    create_list: {
      displayName: 'Create list',
      shortDesc: 'Create a new HubSpot list',
      longDesc:
        'Creates a new list in HubSpot CRM with the specified configuration and properties.',
      groups: ['Lists'],
    },
    search_lists: {
      displayName: 'Search lists',
      shortDesc: 'Search for HubSpot lists',
      longDesc: 'Search and retrieve HubSpot lists based on specified criteria and filters.',
      groups: ['Lists'],
    },
    delete_list: {
      displayName: 'Delete list',
      shortDesc: 'Delete a HubSpot list',
      longDesc: 'Permanently removes a specified list from HubSpot CRM by its ID.',
      groups: ['Lists'],
    },
    get_list: {
      displayName: 'Get list',
      shortDesc: 'Retrieve a HubSpot list by ID',
      longDesc:
        'Fetches detailed information about a specific HubSpot list using its unique identifier.',
      groups: ['Lists'],
    },
    add_memberships: {
      displayName: 'Add list records',
      shortDesc: 'Add records to a HubSpot list',
      longDesc: 'Adds specified records as members to an existing HubSpot list.',
      groups: ['Lists'],
    },
    add_members_from_source_list: {
      displayName: 'Add records from another list',
      shortDesc: 'Copy all members from one list to another',
      longDesc:
        'Adds all members from a source HubSpot list to a target list, effectively copying the membership.',
      groups: ['Lists'],
    },
    remove_members_from_list: {
      displayName: 'Remove list records',
      shortDesc: 'Remove records from a HubSpot list',
      longDesc: 'Removes specified records from an existing HubSpot list membership.',
      groups: ['Lists'],
    },
    get_list_records: {
      displayName: 'Get list records',
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
    get_forms: {
      displayName: 'List forms',
      shortDesc: 'Retrieve a paginated list of HubSpot marketing forms.',
      longDesc:
        'Returns a list of marketing form definitions in your HubSpot account, optionally filtered by form type (native HubSpot, captured, pop-up flow, or blog comment) and archive status.',
      groups: ['Forms'],
      options: {
        formTypes: {
          displayName: 'Form types',
          shortDesc: 'Filter the list to specific form types',
          longDesc:
            'Restrict the returned forms to one or more types: native HubSpot forms, captured external HTML forms, pop-up / flow CTAs, or blog comment forms.',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of forms per page',
          longDesc: 'Maximum number of form definitions to return in a single page (default 20).',
        },
      },
    },
    create_form: {
      displayName: 'Create form',
      shortDesc: 'Create a new HubSpot marketing form definition.',
      longDesc:
        'Creates a new HubSpot form definition with the specified field groups, configuration, display options, and legal consent settings.',
      groups: ['Forms'],
    },
    get_form: {
      displayName: 'Get form',
      shortDesc: 'Retrieve a single HubSpot form definition by ID.',
      longDesc:
        'Returns the complete form definition for the supplied form ID, including all field groups, configuration, display options, and legal consent settings.',
      groups: ['Forms'],
    },
    replace_form: {
      displayName: 'Replace form',
      shortDesc: 'Replace the full form definition.',
      longDesc:
        'Replaces all fields of a HubSpot form definition with the supplied payload. Any properties not included will be reset to their defaults.',
      groups: ['Forms'],
    },
    update_form: {
      displayName: 'Update form',
      shortDesc: 'Partially update a HubSpot form definition.',
      longDesc:
        'Updates one or more components of a HubSpot form definition without affecting the rest of the configuration.',
      groups: ['Forms'],
    },
    archive_form: {
      displayName: 'Archive form',
      shortDesc: 'Archive a HubSpot form definition.',
      longDesc:
        'Archives a HubSpot form definition. New submissions will no longer be accepted; the definition is permanently deleted three months after archival.',
      groups: ['Forms'],
    },
    get_form_submissions: {
      displayName: 'Get form submissions',
      shortDesc: 'Retrieve submissions made to a HubSpot form.',
      longDesc:
        'Fetches submissions made to a specified HubSpot form, with cursor-based pagination, an optional client-side "since" filter, and a `maxResults` cap. Uses the legacy forms-v1 endpoint — submissions are ordered most-recent first.',
      groups: ['Forms'],
      options: {
        formId: {
          displayName: 'Form',
          shortDesc: 'The HubSpot form to read submissions for',
          longDesc: 'The unique identifier (GUID) of the HubSpot form whose submissions to read.',
        },
        limit: {
          displayName: 'Page size',
          shortDesc: 'Records per request (1–50, default 20)',
          longDesc:
            'Number of submissions to retrieve per request. HubSpot enforces a maximum of 50; the action paginates automatically until `Max Results` is reached or no more pages remain.',
        },
        maxResults: {
          displayName: 'Max results',
          shortDesc: 'Cap on the total number of submissions returned',
          longDesc:
            'Stop paginating once this many submissions have been collected (default 200). Useful for keeping calls bounded against busy forms.',
        },
        after: {
          displayName: 'After',
          shortDesc: 'Pagination cursor returned by a previous call',
          longDesc:
            'Cursor returned by a previous call as `paging.next.after`. Used to resume pagination from a specific point.',
        },
        since: {
          displayName: 'Since',
          shortDesc: 'Only return submissions on or after this timestamp',
          longDesc:
            'Optional ISO 8601 timestamp. The action stops paginating when it crosses a submission older than this value. Applied client-side because the legacy endpoint does not support a server-side filter.',
        },
      },
    },
    submit_form: {
      displayName: 'Submit form',
      shortDesc: 'Submit data to a HubSpot form on behalf of the connected portal.',
      longDesc:
        'Submits values to a HubSpot form using the authenticated secure-submit endpoint. The `portalId` is resolved automatically from the connection. File-upload fields are not yet supported.',
      groups: ['Forms'],
      options: {
        formId: {
          displayName: 'Form',
          shortDesc: 'The HubSpot form to submit to',
          longDesc: 'The unique identifier (GUID) of the HubSpot form to receive this submission.',
        },
        fields: {
          displayName: 'Fields',
          shortDesc: 'List of name/value pairs to submit',
          longDesc:
            'List of form fields to submit. Each entry must include the internal `name` (matching the field on the form definition) and the `value` to submit. `objectTypeId` is optional and defaults to the contact object (`0-1`).',
          type: {
            element_type: {
              fields: {
                name: {
                  displayName: 'Field name',
                  shortDesc: 'Internal name of the form field',
                  longDesc:
                    'The internal name of the form field, as defined on the HubSpot form (e.g. `email`, `firstname`).',
                },
                value: {
                  displayName: 'Field value',
                  shortDesc: 'Value to submit for this field',
                  longDesc: 'The value to submit for this field. Must be a string.',
                },
                objectTypeId: {
                  displayName: 'Object type ID',
                  shortDesc: 'Object the field belongs to (e.g. `0-1` for contacts)',
                  longDesc:
                    'Optional HubSpot object-type identifier the field belongs to. Defaults to the contact object (`0-1`); set explicitly for fields belonging to a different object type.',
                },
              },
            },
          },
        },
        context: {
          displayName: 'Submission context',
          shortDesc: 'Optional submission context (tracking metadata)',
          longDesc:
            'Optional submission context, including the HubSpot user-tracking cookie (`hutk`), IP address, page URI/name/ID, Salesforce campaign ID, and GoToWebinar key.',
          type: {
            fields: {
              hutk: {
                displayName: 'HubSpot user token (hutk)',
                shortDesc: 'Tracking cookie value from the HubSpot script',
                longDesc:
                  'Value of the `hubspotutk` cookie set by the HubSpot tracking script on the visitor browser. Used to associate the submission with an existing visitor.',
              },
              ipAddress: {
                displayName: 'IP address',
                shortDesc: 'Originating IP address of the submitter',
                longDesc: 'IP address from which the submission was made.',
              },
              pageUri: {
                displayName: 'Page URI',
                shortDesc: 'Full URL of the page where the form was submitted',
                longDesc: 'Full URL of the page where the form was submitted.',
              },
              pageName: {
                displayName: 'Page name',
                shortDesc: 'Display name of the page where the form was submitted',
                longDesc: 'Display title of the page where the form was submitted.',
              },
              pageId: {
                displayName: 'Page ID',
                shortDesc: 'HubSpot page ID where the form was submitted',
                longDesc:
                  'HubSpot page ID where the form was submitted (only when submitting from a HubSpot-hosted page).',
              },
              sfdcCampaignId: {
                displayName: 'Salesforce campaign ID',
                shortDesc: 'Salesforce campaign to associate the submission with',
                longDesc:
                  'Salesforce campaign ID. Used when the HubSpot account is linked to a Salesforce org to associate this submission with the campaign.',
              },
              goToWebinarWebinarKey: {
                displayName: 'GoToWebinar webinar key',
                shortDesc: 'GoToWebinar key for webinar registration submissions',
                longDesc:
                  'GoToWebinar webinar key. Used when this submission is a webinar registration; HubSpot will register the contact for the corresponding GoToWebinar event.',
              },
            },
          },
        },
        legalConsentOptions: {
          displayName: 'Legal consent options',
          shortDesc: 'Optional GDPR / legitimate-interest consent payload',
          longDesc:
            'Optional GDPR consent payload passed through to HubSpot. Refer to HubSpot documentation for the exact `consent` or `legitimateInterest` shape required by your form.',
        },
        submittedAt: {
          displayName: 'Submitted at',
          shortDesc: 'Override the submission timestamp',
          longDesc:
            'Optional ISO 8601 timestamp to record as the submission time. Defaults to the time HubSpot receives the request.',
        },
        skipValidation: {
          displayName: 'Skip validation',
          shortDesc: 'Skip field-level validation on the HubSpot side',
          longDesc:
            'When true, HubSpot will accept the submission even if some field values fail validation. Use with care.',
        },
      },
    },
  },
  triggers: {
    hubspot_company_created_or_updated_trigger: {
      event_info: {
        desc: 'Company Information',
      },
      displayName: 'Company created or updated',
      shortDesc: 'Triggers when a company is added or updated in HubSpot.',
      longDesc:
        'This trigger activates whenever a company record is created or modified in HubSpot, enabling you to automate workflows based on company data changes.',
      options: HubspotTriggerOptionsEn,
    },
    hubspot_contact_created_or_updated_trigger: {
      event_info: {
        desc: 'Contact Information',
      },
      displayName: 'Contact created or updated',
      shortDesc: 'Triggers when a contact is added or updated in HubSpot.',
      longDesc:
        'Activate workflows whenever a new contact is created or an existing contact is updated within HubSpot. Ideal for managing customer information efficiently.',
      options: HubspotTriggerOptionsEn,
    },
    hubspot_custom_object_created_or_updated_trigger: {
      event_info: {
        desc: 'Custom Object Information',
      },
      displayName: 'Custom object created or updated',
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
      displayName: 'Deal created or updated',
      shortDesc: 'Triggers when a deal is created or updated in HubSpot.',
      longDesc:
        'This trigger fires when a deal is created or modified in HubSpot, allowing you to track sales opportunities and integrate with your sales pipeline automation workflows.',
      options: HubspotTriggerOptionsEn,
    },
    hubspot_lead_created_or_updated_trigger: {
      event_info: {
        desc: 'Lead Information',
      },
      displayName: 'Lead created or updated',
      shortDesc: 'Triggers when a lead is added or updated in HubSpot.',
      longDesc:
        'Monitor new leads and updates to existing leads in HubSpot with this trigger, enabling efficient lead management and follow-up processes.',
      options: HubspotTriggerOptionsEn,
    },
    hubspot_product_created_or_updated_trigger: {
      event_info: {
        desc: 'Product Information',
      },
      displayName: 'Product created or updated',
      shortDesc: 'Triggers when a product is added or updated in HubSpot.',
      longDesc:
        'This trigger alerts you to any new or updated products within your HubSpot account, ensuring that your product data remains synchronized with your workflows and external systems.',
      options: HubspotTriggerOptionsEn,
    },
    hubspot_ticket_created_or_updated_trigger: {
      event_info: {
        desc: 'Ticket Information',
      },
      displayName: 'Ticket created or updated',
      shortDesc: 'Triggers when a support ticket is created or updated in HubSpot.',
      longDesc:
        'Automatically trigger workflows when a support ticket is created or updated in HubSpot, ideal for managing customer support operations and streamlining issue resolution.',
      options: HubspotTriggerOptionsEn,
    },
    hubspot_user_created_or_updated_trigger: {
      event_info: {
        desc: 'User Information',
      },
      displayName: 'User created or updated',
      shortDesc: 'Triggers when a user is added or updated in HubSpot.',
      longDesc:
        'This trigger fires upon the creation or update of a user within HubSpot, helping you keep track of user accounts and maintain updated access control for your team.',
      options: HubspotTriggerOptionsEn,
    },
    hubspot_form_submitted_trigger: {
      event_info: {
        desc: 'Form Submission Information',
      },
      displayName: 'Form submitted',
      shortDesc: 'Triggers when a new submission is received for a HubSpot form.',
      longDesc:
        'Polls the configured HubSpot form for new submissions and emits an event for each one. Useful for kicking off automation as soon as a lead fills in a form. Submissions are identified by `conversionId`; if HubSpot omits it the trigger synthesizes a stable key from the timestamp.',
      options: {
        formId: {
          displayName: 'Form',
          shortDesc: 'The HubSpot form to watch for new submissions',
          longDesc:
            'The unique identifier (GUID) of the HubSpot form to poll. Only one form per trigger instance.',
        },
      },
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
  searchOptions: {
    orderBy: {
      displayName: 'Order by',
      shortDesc: 'Sort results by a specific field',
      longDesc: 'Define the field and direction to sort search results',
      type: {
        fields: {
          column: {
            displayName: 'Column',
            shortDesc: 'The column to sort by',
            longDesc: 'The name of the column to use for sorting results',
          },
          ascending: {
            displayName: 'Ascending',
            shortDesc: 'Sort in ascending order',
            longDesc: 'When enabled, results are sorted in ascending order (A-Z, 0-9)',
          },
        },
      },
    },
    limit: {
      displayName: 'Limit',
      shortDesc: 'Maximum number of records to return',
      longDesc:
        'The maximum number of records to return. If not specified, all matching records will be returned.',
    },
  },
  upsertOptions: {
    idProperty: {
      displayName: 'ID property',
      shortDesc: 'The unique identifier property for upsert operations',
      longDesc:
        'The unique identifier property name used to determine if a record already exists for updating. If no matching record is found, a new record will be created.',
    },
  },
};

export default HubspotAppEn;
