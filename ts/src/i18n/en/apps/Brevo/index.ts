/* eslint-disable max-len */
const BrevoAppEn = {
  displayName: 'Brevo',
  groups: ['Email & Email Marketing'],
  shortDesc: 'Brevo is a marketing platform for email, SMS, and automation campaigns.',
  longDesc: `Brevo (formerly Sendinblue) is a marketing automation platform that enables businesses to communicate with customers through email, SMS, chat, and more. It offers tools for campaign management, contact segmentation, transactional emails, and customer relationship management. Brevo helps businesses build stronger relationships with their audience by providing scalable communication and automation solutions.`,
  connectionMessage: {
    title: 'Connect to Brevo',
    content: `To connect your Brevo account, you will need your **API Key**.

## Getting Your API Key

1. Sign in to your [Brevo account](https://app.brevo.com/)
2. Navigate to **Settings** → **SMTP & API** → **API Keys**
3. Click **Generate a new API key**
4. Give your API key a descriptive name (e.g., "Qore Integration")
5. Copy the generated API key immediately (it won't be shown again)

You can also access the API keys page directly at [app.brevo.com/settings/keys/api](https://app.brevo.com/settings/keys/api)

## Connection Details

### API Key
Your Brevo API key starting with \`xkeysib-\`. This key authenticates all API requests to your Brevo account.

**Note:** Keep your API key secure and never share it publicly. You can revoke and regenerate keys at any time from the API Keys settings page.`,
  },
  actions: {
    get_contact: {
      displayName: 'Get contact',
      shortDesc: 'Retrieve a contact by identifier',
      longDesc:
        'Get detailed information about a specific contact. You can identify contacts using email address, contact ID, phone number, external ID, WhatsApp ID, or landline number.',
      groups: ['Contacts'],
      options: {
        identifier: {
          displayName: 'Contact identifier',
          shortDesc: 'Contact identifier (email, ID, phone, etc.)',
          longDesc:
            'Unique identifier for the contact. Can be email address, contact ID, phone number (SMS), external ID, WhatsApp ID, or landline number.',
        },
      },
    },
    create_contact: {
      displayName: 'Create contact',
      shortDesc: 'Create a new contact',
      longDesc:
        'Create a new contact in Brevo. Contacts can be created with email address, phone number (with country code), or external ID. Custom attributes and list assignments can be included.',
      groups: ['Contacts'],
      options: {
        email: {
          displayName: 'Email address',
          shortDesc: 'Contact email address',
          longDesc: 'Primary email address for the contact. Required for creating a contact.',
        },
        extId: {
          displayName: 'External ID',
          shortDesc: 'External identifier',
          longDesc: 'Custom external identifier for the contact from your system.',
        },
        listIds: {
          displayName: 'List IDs',
          shortDesc: 'Lists to add contact to',
          longDesc: 'Array of list IDs to automatically add the contact to upon creation.',
        },
        emailBlacklisted: {
          displayName: 'Email blacklisted',
          shortDesc: 'Blacklist contact from emails',
          longDesc: 'Set to true to blacklist the contact from receiving email campaigns.',
        },
        smsBlacklisted: {
          displayName: 'SMS blacklisted',
          shortDesc: 'Blacklist contact from SMS',
          longDesc: 'Set to true to blacklist the contact from receiving SMS campaigns.',
        },
        attributes: {
          displayName: 'Contact attributes',
          shortDesc: 'Custom contact attributes',
          longDesc:
            'Custom attributes for the contact including name, company, phone number, and any custom fields defined in your account.',
        },
      },
    },
    update_contact: {
      displayName: 'Update contact',
      shortDesc: 'Update an existing contact',
      longDesc:
        'Update contact information including attributes, email preferences, list memberships, and custom data. Contact can be identified by email, ID, or other identifiers.',
      groups: ['Contacts'],
      options: {
        identifier: {
          displayName: 'Contact identifier',
          shortDesc: 'Contact to update',
          longDesc:
            'Unique identifier for the contact to update. Can be email address, contact ID, phone number, external ID, WhatsApp ID, or landline number.',
        },
        email: {
          displayName: 'New email address',
          shortDesc: 'Update email address',
          longDesc: 'New email address for the contact.',
        },
        extId: {
          displayName: 'External ID',
          shortDesc: 'External identifier',
          longDesc: 'Custom external identifier for the contact from your system.',
        },
        listIds: {
          displayName: 'Add to lists',
          shortDesc: 'Lists to add contact to',
          longDesc: 'Array of list IDs to add the contact to.',
        },
        unlinkListIds: {
          displayName: 'Remove from lists',
          shortDesc: 'Lists to remove contact from',
          longDesc: 'Array of list IDs to remove the contact from.',
        },
        emailBlacklisted: {
          displayName: 'Email blacklisted',
          shortDesc: 'Email blacklist status',
          longDesc: 'Set email blacklist status for the contact.',
        },
        smsBlacklisted: {
          displayName: 'SMS blacklisted',
          shortDesc: 'SMS blacklist status',
          longDesc: 'Set SMS blacklist status for the contact.',
        },
        attributes: {
          displayName: 'Contact attributes',
          shortDesc: 'Update contact attributes',
          longDesc:
            'Update custom attributes for the contact including name, company, phone number, and any custom fields.',
        },
      },
    },
    list_contacts: {
      displayName: 'List contacts',
      shortDesc: 'Get all contacts with filtering',
      longDesc:
        'Retrieve a list of all contacts in your account with pagination, sorting, and filtering options. Filter by lists, attributes, or other criteria.',
      groups: ['Contacts'],
      options: {
        limit: {
          displayName: 'Results limit',
          shortDesc: 'Number of contacts per page',
          longDesc: 'Maximum number of contacts to return per page. Default is 10, maximum is 100.',
        },
        offset: {
          displayName: 'Page offset',
          shortDesc: 'Number of contacts to skip',
          longDesc: 'Number of contacts to skip for pagination. Use with limit for pagination.',
        },
        sort: {
          displayName: 'Sort order',
          shortDesc: 'Contact sort order',
          longDesc: 'Order to sort contacts by creation date.',
        },
        listIds: {
          displayName: 'Filter by lists',
          shortDesc: 'Filter contacts by list membership',
          longDesc:
            'Array of list IDs to filter contacts. Only contacts belonging to these lists will be returned.',
        },
        filter: {
          displayName: 'Attribute filter',
          shortDesc: 'Filter by contact attributes',
          longDesc: 'Filter contacts based on specific attribute values using equals operator.',
          type: {
            fields: {
              field: {
                displayName: 'Attribute field',
                shortDesc: 'Attribute to filter by',
                longDesc: 'Contact attribute field name to filter by.',
              },
              value: {
                displayName: 'Filter value',
                shortDesc: 'Value to match',
                longDesc: 'Value that the attribute must equal.',
              },
            },
          },
        },
      },
    },

    get_list: {
      displayName: 'Get list',
      shortDesc: 'Retrieve list details',
      longDesc:
        'Get detailed information about a specific contact list including subscriber counts, campaign statistics, and folder information.',
      groups: ['Lists'],
      options: {
        listId: {
          displayName: 'List ID',
          shortDesc: 'List to retrieve',
          longDesc: 'Unique identifier of the contact list to retrieve details for.',
        },
      },
    },
    create_list: {
      displayName: 'Create list',
      shortDesc: 'Create a new contact list',
      longDesc:
        'Create a new contact list in a specified folder. Lists are used to organize and segment your contacts for targeted campaigns.',
      groups: ['Lists'],
      options: {
        name: {
          displayName: 'List name',
          shortDesc: 'Name for the new list',
          longDesc: 'Display name for the contact list.',
        },
        folderId: {
          displayName: 'Folder',
          shortDesc: 'Folder to create list in',
          longDesc: 'Folder where the list will be created. Required for list organization.',
        },
      },
    },
    update_list: {
      displayName: 'Update list',
      shortDesc: 'Update list details',
      longDesc: 'Update the name or folder of an existing contact list.',
      groups: ['Lists'],
      options: {
        listId: {
          displayName: 'List ID',
          shortDesc: 'List to update',
          longDesc: 'Unique identifier of the contact list to update.',
        },
        name: {
          displayName: 'New name',
          shortDesc: 'Updated list name',
          longDesc: 'New display name for the contact list.',
        },
        folderId: {
          displayName: 'New folder',
          shortDesc: 'Move to different folder',
          longDesc: 'New folder ID to move the list to.',
        },
      },
    },
    delete_list: {
      displayName: 'Delete list',
      shortDesc: 'Delete a contact list',
      longDesc:
        'Permanently delete a contact list. This action cannot be undone. Contacts in the list will remain in your account.',
      groups: ['Lists'],
      options: {
        listId: {
          displayName: 'List ID',
          shortDesc: 'List to delete',
          longDesc: 'Unique identifier of the contact list to delete permanently.',
        },
      },
    },
    list_lists: {
      displayName: 'List all lists',
      shortDesc: 'Get all contact lists',
      longDesc:
        'Retrieve all contact lists in your account with pagination and sorting options. Includes subscriber counts and creation dates.',
      groups: ['Lists'],
      options: {
        limit: {
          displayName: 'Results limit',
          shortDesc: 'Number of lists per page',
          longDesc: 'Maximum number of lists to return per page. Default is 10.',
        },
        offset: {
          displayName: 'Page offset',
          shortDesc: 'Number of lists to skip',
          longDesc: 'Number of lists to skip for pagination.',
        },
        sort: {
          displayName: 'Sort order',
          shortDesc: 'List sort order',
          longDesc: 'Order to sort lists by creation date.',
        },
      },
    },
    list_folders: {
      displayName: 'List folders',
      shortDesc: 'Get all list folders',
      longDesc:
        'Retrieve all folders used to organize contact lists with subscriber counts and creation information.',
      groups: ['Lists'],
      options: {
        limit: {
          displayName: 'Results limit',
          shortDesc: 'Number of folders per page',
          longDesc: 'Maximum number of folders to return per page. Default is 10.',
        },
        offset: {
          displayName: 'Page offset',
          shortDesc: 'Number of folders to skip',
          longDesc: 'Number of folders to skip for pagination.',
        },
        sort: {
          displayName: 'Sort order',
          shortDesc: 'Folder sort order',
          longDesc: 'Order to sort folders by creation date.',
        },
      },
    },
    add_contacts_to_list: {
      displayName: 'Add contacts to list',
      shortDesc: 'Add contacts to a list',
      longDesc:
        'Add existing contacts to a contact list by email addresses or contact IDs. Contacts must already exist in your account.',
      groups: ['Lists'],
      options: {
        listId: {
          displayName: 'List ID',
          shortDesc: 'Target list',
          longDesc: 'Unique identifier of the list to add contacts to.',
        },
        emails: {
          displayName: 'Email addresses',
          shortDesc: 'Contact emails to add',
          longDesc: 'Array of email addresses of contacts to add to the list.',
        },
        ids: {
          displayName: 'Contact IDs',
          shortDesc: 'Contact IDs to add',
          longDesc: 'Array of contact IDs to add to the list.',
        },
      },
    },
    remove_contacts_from_list: {
      displayName: 'Remove contacts from list',
      shortDesc: 'Remove contacts from a list',
      longDesc:
        'Remove contacts from a contact list by email addresses, contact IDs, or remove all contacts from the list.',
      groups: ['Lists'],
      options: {
        listId: {
          displayName: 'List ID',
          shortDesc: 'Source list',
          longDesc: 'Unique identifier of the list to remove contacts from.',
        },
        emails: {
          displayName: 'Email addresses',
          shortDesc: 'Contact emails to remove',
          longDesc: 'Array of email addresses of contacts to remove from the list.',
        },
        ids: {
          displayName: 'Contact IDs',
          shortDesc: 'Contact IDs to remove',
          longDesc: 'Array of contact IDs to remove from the list.',
        },
        all: {
          displayName: 'Remove all',
          shortDesc: 'Remove all contacts',
          longDesc: 'Set to true to remove all contacts from the list.',
        },
      },
    },

    get_company: {
      displayName: 'Get company',
      shortDesc: 'Retrieve company details',
      longDesc:
        'Get detailed information about a specific company including custom attributes and associated contacts and deals.',
      groups: ['Companies'],
      options: {
        companyId: {
          displayName: 'Company ID',
          shortDesc: 'Company to retrieve',
          longDesc: 'Unique identifier of the company to retrieve details for.',
        },
      },
    },
    create_company: {
      displayName: 'Create company',
      shortDesc: 'Create a new company',
      longDesc:
        'Create a new company record with custom attributes and optional associations to existing contacts and deals.',
      groups: ['Companies'],
      options: {
        name: {
          displayName: 'Company name',
          shortDesc: 'Name of the company',
          longDesc: 'Business name of the company. Required field.',
        },
        attributes: {
          displayName: 'Company attributes',
          shortDesc: 'Custom company data',
          longDesc:
            'Custom attributes for the company including industry, size, website, and any custom fields defined in your account.',
          type: {
            fields: {
              domain: {
                displayName: 'Domain',
                shortDesc: 'Company domain',
                longDesc: 'The primary domain associated with the company.',
              },
            },
          },
        },
        linkedContactsIds: {
          displayName: 'Associated contacts',
          shortDesc: 'Link contacts to company',
          longDesc: 'Array of contact IDs to associate with this company.',
        },
        linkedDeals: {
          displayName: 'Associated deals',
          shortDesc: 'Link deals to company',
          longDesc: 'Array of deal IDs to associate with this company.',
        },
      },
    },
    update_company: {
      displayName: 'Update company',
      shortDesc: 'Update company information',
      longDesc:
        'Update company details including name, custom attributes, and associations with contacts and deals.',
      groups: ['Companies'],
      options: {
        companyId: {
          displayName: 'Company ID',
          shortDesc: 'Company to update',
          longDesc: 'Unique identifier of the company to update.',
        },
        name: {
          displayName: 'Company name',
          shortDesc: 'Updated company name',
          longDesc: 'New business name for the company.',
        },
        attributes: {
          displayName: 'Company attributes',
          shortDesc: 'Update company data',
          longDesc:
            'Update custom attributes for the company including industry, size, website, and any custom fields.',
        },
        linkedContactsIds: {
          displayName: 'Associated contacts',
          shortDesc: 'Update contact associations',
          longDesc:
            'Array of contact IDs to associate with this company. Replaces existing associations.',
        },
        linkedDeals: {
          displayName: 'Associated deals',
          shortDesc: 'Update deal associations',
          longDesc:
            'Array of deal IDs to associate with this company. Replaces existing associations.',
        },
      },
    },
    list_companies: {
      displayName: 'List companies',
      shortDesc: 'Get all companies with filtering',
      longDesc:
        'Retrieve a list of all companies with pagination, sorting, and filtering options. Filter by associated contacts, deals, or custom attributes.',
      groups: ['Companies'],
      options: {
        limit: {
          displayName: 'Results limit',
          shortDesc: 'Number of companies per page',
          longDesc: 'Maximum number of companies to return per page. Default is 10.',
        },
        page: {
          displayName: 'Page number',
          shortDesc: 'Page number for pagination',
          longDesc: 'Page number to retrieve (starts from 1).',
        },
        sort: {
          displayName: 'Sort order',
          shortDesc: 'Company sort order',
          longDesc: 'Order to sort companies.',
        },
        sortBy: {
          displayName: 'Sort by field',
          shortDesc: 'Field to sort by',
          longDesc: 'Company attribute to sort results by.',
        },
        linkedContactsId: {
          displayName: 'Filter by contact',
          shortDesc: 'Companies linked to contact',
          longDesc: 'Filter companies that are associated with a specific contact.',
        },
        linkedDealsId: {
          displayName: 'Filter by deal',
          shortDesc: 'Companies linked to deal',
          longDesc: 'Filter companies that are associated with a specific deal.',
        },
        filter: {
          displayName: 'Attribute filter',
          shortDesc: 'Filter by company attributes',
          longDesc: 'Filter companies based on specific attribute values.',
          type: {
            fields: {
              field: {
                displayName: 'Attribute field',
                shortDesc: 'Attribute to filter by',
                longDesc: 'Company attribute field name to filter by.',
              },
              value: {
                displayName: 'Filter value',
                shortDesc: 'Value to match',
                longDesc: 'Value that the attribute must equal.',
              },
            },
          },
        },
      },
    },

    get_deal: {
      displayName: 'Get deal',
      shortDesc: 'Retrieve deal details',
      longDesc:
        'Get detailed information about a specific deal including custom attributes and associated contacts and companies.',
      groups: ['Deals'],
      options: {
        dealId: {
          displayName: 'Deal ID',
          shortDesc: 'Deal to retrieve',
          longDesc: 'Unique identifier of the deal to retrieve details for.',
        },
      },
    },
    create_deal: {
      displayName: 'Create deal',
      shortDesc: 'Create a new deal',
      longDesc:
        'Create a new deal in your sales pipeline with custom attributes and optional associations to existing contacts and companies.',
      groups: ['Deals'],
      options: {
        name: {
          displayName: 'Deal name',
          shortDesc: 'Name of the deal',
          longDesc: 'Descriptive name for the deal opportunity. Required field.',
        },
        attributes: {
          displayName: 'Deal attributes',
          shortDesc: 'Custom deal data',
          longDesc:
            'Custom attributes for the deal including value, stage, close date, and any custom fields defined in your account.',
        },
        linkedContactsIds: {
          displayName: 'Associated contacts',
          shortDesc: 'Link contacts to deal',
          longDesc: 'Array of contact IDs to associate with this deal.',
        },
        linkedCompaniesIds: {
          displayName: 'Associated companies',
          shortDesc: 'Link companies to deal',
          longDesc: 'Array of company IDs to associate with this deal.',
        },
      },
    },
    update_deal: {
      displayName: 'Update deal',
      shortDesc: 'Update deal information',
      longDesc:
        'Update deal details including name, custom attributes, and associations with contacts and companies.',
      groups: ['Deals'],
      options: {
        dealId: {
          displayName: 'Deal ID',
          shortDesc: 'Deal to update',
          longDesc: 'Unique identifier of the deal to update.',
        },
        name: {
          displayName: 'Deal name',
          shortDesc: 'Updated deal name',
          longDesc: 'New descriptive name for the deal.',
        },
        attributes: {
          displayName: 'Deal attributes',
          shortDesc: 'Update deal data',
          longDesc:
            'Update custom attributes for the deal including value, stage, close date, and any custom fields.',
        },
        linkedContactsIds: {
          displayName: 'Associated contacts',
          shortDesc: 'Update contact associations',
          longDesc:
            'Array of contact IDs to associate with this deal. Replaces existing associations.',
        },
        linkedCompaniesIds: {
          displayName: 'Associated companies',
          shortDesc: 'Update company associations',
          longDesc:
            'Array of company IDs to associate with this deal. Replaces existing associations.',
        },
      },
    },
    list_deals: {
      displayName: 'List deals',
      shortDesc: 'Get all deals with filtering',
      longDesc:
        'Retrieve a list of all deals in your pipeline with pagination, sorting, and filtering options. Filter by associated contacts, companies, or deal name.',
      groups: ['Deals'],
      options: {
        limit: {
          displayName: 'Results limit',
          shortDesc: 'Number of deals per page',
          longDesc: 'Maximum number of deals to return per page. Default is 10.',
        },
        offset: {
          displayName: 'Page offset',
          shortDesc: 'Number of deals to skip',
          longDesc: 'Number of deals to skip for pagination.',
        },
        sort: {
          displayName: 'Sort order',
          shortDesc: 'Deal sort order',
          longDesc: 'Order to sort deals by creation date.',
        },
        linkedContactsId: {
          displayName: 'Filter by contact',
          shortDesc: 'Deals linked to contact',
          longDesc: 'Filter deals that are associated with a specific contact.',
        },
        linkedCompaniesId: {
          displayName: 'Filter by company',
          shortDesc: 'Deals linked to company',
          longDesc: 'Filter deals that are associated with a specific company.',
        },
        dealName: {
          displayName: 'Deal name filter',
          shortDesc: 'Filter by deal name',
          longDesc: 'Filter deals by name containing specified text.',
        },
      },
    },
    delete_contact: {
      displayName: 'Delete contact',
      shortDesc: 'Permanently delete a contact',
      longDesc:
        'Permanently delete a contact from your Brevo account. This action cannot be undone. The contact will be removed from all lists and campaigns.',
      groups: ['Contacts'],
      options: {
        identifier: {
          displayName: 'Contact identifier',
          shortDesc: 'Contact to delete',
          longDesc:
            'Unique identifier for the contact to delete permanently. Can be email address, contact ID, phone number, external ID, WhatsApp ID, or landline number.',
        },
      },
    },

    delete_company: {
      displayName: 'Delete company',
      shortDesc: 'Permanently delete a company',
      longDesc:
        'Permanently delete a company from your Brevo account. This action cannot be undone. All associations with contacts and deals will be removed.',
      groups: ['Companies'],
      options: {
        companyId: {
          displayName: 'Company ID',
          shortDesc: 'Company to delete',
          longDesc: 'Unique identifier of the company to delete permanently from your account.',
        },
      },
    },

    delete_deal: {
      displayName: 'Delete deal',
      shortDesc: 'Permanently delete a deal',
      longDesc:
        'Permanently delete a deal from your sales pipeline. This action cannot be undone. All associations with contacts and companies will be removed.',
      groups: ['Deals'],
      options: {
        dealId: {
          displayName: 'Deal ID',
          shortDesc: 'Deal to delete',
          longDesc: 'Unique identifier of the deal to delete permanently from your pipeline.',
        },
      },
    },
  },
  triggers: {
    new_contact: {
      displayName: 'New contact',
      shortDesc: 'Triggers when a new contact is created',
      longDesc:
        'Monitors your Brevo account for newly created contacts. Optionally filter by specific lists to only trigger when contacts are added to particular lists.',
      options: {
        listIds: {
          displayName: 'Filter by lists',
          shortDesc: 'Only trigger for specific lists',
          longDesc:
            'Optional filter to only trigger when contacts are created in the specified lists. If empty, triggers for all new contacts.',
        },
      },
    },

    new_company: {
      displayName: 'New company',
      shortDesc: 'Triggers when a new company is created',
      longDesc:
        'Monitors your Brevo account for newly created companies. Optionally filter by companies linked to specific contacts or deals.',
      options: {
        linkedContactsId: {
          displayName: 'Filter by contact',
          shortDesc: 'Only trigger for companies linked to contact',
          longDesc:
            'Optional filter to only trigger when companies are created that are linked to the specified contact.',
        },
        linkedDealsId: {
          displayName: 'Filter by deal',
          shortDesc: 'Only trigger for companies linked to deal',
          longDesc:
            'Optional filter to only trigger when companies are created that are linked to the specified deal.',
        },
      },
    },

    new_deal: {
      displayName: 'New deal',
      shortDesc: 'Triggers when a new deal is created',
      longDesc:
        'Monitors your Brevo account for newly created deals in the sales pipeline. Optionally filter by deals linked to specific contacts or companies.',
      options: {
        linkedContactsId: {
          displayName: 'Filter by contacts',
          shortDesc: 'Only trigger for deals linked to contacts',
          longDesc:
            'Optional filter to only trigger when deals are created that are linked to the specified contacts.',
        },
        linkedCompaniesId: {
          displayName: 'Filter by companies',
          shortDesc: 'Only trigger for deals linked to companies',
          longDesc:
            'Optional filter to only trigger when deals are created that are linked to the specified companies.',
        },
      },
    },

    new_list: {
      displayName: 'New list',
      shortDesc: 'Triggers when a new contact list is created',
      longDesc:
        'Monitors your Brevo account for newly created contact lists. Triggers whenever a new list is created in any folder.',
    },
  },
};

export default BrevoAppEn;
