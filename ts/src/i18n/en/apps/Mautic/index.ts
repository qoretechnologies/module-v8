/* eslint-disable max-len */
const MauticAppEn = {
  displayName: 'Mautic',
  groups: ['Marketing Automation', 'CRM', 'Email & Email Marketing'],
  shortDesc: 'Open-source marketing automation platform',
  longDesc:
    'Connect your Mautic instance to automate marketing campaigns, manage contacts and companies, segment audiences, and send targeted emails. Build powerful marketing workflows with full control over your data.',
  connectionMessage: {
    title: 'Connect to Mautic',
    content: `To connect your Mautic instance, you will need your **Instance URL**, **Username**, and **Password**.

## Prerequisites

Before connecting, ensure API access is enabled in your Mautic instance:

1. Go to **Settings** (gear icon) → **Configuration** → **API Settings**
2. Set **API enabled** to **Yes**
3. Set **Enable HTTP basic auth?** to **Yes**
4. Save the configuration

## Connection Details

### Instance URL
The URL of your Mautic installation (e.g., \`https://mautic.yourcompany.com\`)

### Username
Your Mautic login username or email address

### Password
Your Mautic login password

**Note:** For security, we recommend creating a dedicated API user with appropriate permissions rather than using your main admin account.`,
  },
  actions: {
    // Campaign Contact Actions
    add_contact_to_campaign: {
      groups: ['Campaign Management'],
      displayName: 'Add Contact to Campaign',
      shortDesc: 'Manually add a contact to a campaign',
      longDesc:
        'Add a specific contact to a campaign in Mautic. This allows you to manually include contacts in campaign workflows.',
      options: {
        campaign: {
          displayName: 'Campaign',
          shortDesc: 'The campaign to add the contact to',
          longDesc: 'Select the campaign that you want to add the contact to',
        },
        contact: {
          displayName: 'Contact',
          shortDesc: 'The contact to add to the campaign',
          longDesc: 'Select the contact that you want to add to the campaign',
        },
      },
    },
    remove_contact_from_campaign: {
      groups: ['Campaign Management'],
      displayName: 'Remove Contact from Campaign',
      shortDesc: 'Remove a contact from a campaign',
      longDesc:
        'Remove a specific contact from a campaign in Mautic. This stops the contact from receiving further campaign actions.',
      options: {
        campaign: {
          displayName: 'Campaign',
          shortDesc: 'The campaign to remove the contact from',
          longDesc: 'Select the campaign that you want to remove the contact from',
        },
        contact: {
          displayName: 'Contact',
          shortDesc: 'The contact to remove from the campaign',
          longDesc: 'Select the contact that you want to remove from the campaign',
        },
      },
    },

    // Company Actions
    create_company: {
      groups: ['Company Management'],
      displayName: 'Create Company',
      shortDesc: 'Create a new company',
      longDesc: 'Create a new company record in Mautic with the specified details.',
      options: {
        companyname: {
          displayName: 'Company Name',
          shortDesc: 'The name of the company',
          longDesc: 'The name of the company (required)',
        },
        companyemail: {
          displayName: 'Company Email',
          shortDesc: 'The email address of the company',
          longDesc: 'The primary email address for the company',
        },
        companyphone: {
          displayName: 'Company Phone',
          shortDesc: 'The phone number of the company',
          longDesc: 'The primary phone number for the company',
        },
        companywebsite: {
          displayName: 'Website',
          shortDesc: 'The website URL of the company',
          longDesc: 'The company website URL',
        },
        companyaddress1: {
          displayName: 'Address Line 1',
          shortDesc: 'The first line of the company address',
          longDesc: 'The street address of the company',
        },
        companyaddress2: {
          displayName: 'Address Line 2',
          shortDesc: 'The second line of the company address',
          longDesc: 'Additional address information (suite, floor, etc.)',
        },
        companycity: {
          displayName: 'City',
          shortDesc: 'The city where the company is located',
          longDesc: 'The city of the company address',
        },
        companystate: {
          displayName: 'State/Region',
          shortDesc: 'The state or region of the company',
          longDesc: 'The state, province, or region of the company address',
        },
        companyzipcode: {
          displayName: 'Postal Code',
          shortDesc: 'The postal/ZIP code of the company',
          longDesc: 'The postal or ZIP code of the company address',
        },
        companycountry: {
          displayName: 'Country',
          shortDesc: 'The country of the company',
          longDesc: 'The country where the company is located',
        },
        companydescription: {
          displayName: 'Description',
          shortDesc: 'A description of the company',
          longDesc: 'Additional notes or description about the company',
        },
        companyindustry: {
          displayName: 'Industry',
          shortDesc: 'The industry of the company',
          longDesc: 'The industry or sector the company operates in',
        },
        custom_fields: {
          displayName: 'Custom Fields',
          shortDesc: 'Custom field values',
          longDesc:
            'An object containing custom field aliases and their values. Use the field alias as the key',
        },
      },
    },
    delete_company: {
      groups: ['Company Management'],
      displayName: 'Delete Company',
      shortDesc: 'Delete a company',
      longDesc: 'Permanently delete a company record from Mautic.',
      options: {
        company: {
          displayName: 'Company',
          shortDesc: 'The company to delete',
          longDesc: 'Select the company that you want to delete',
        },
      },
    },
    get_company: {
      groups: ['Data Retrieval'],
      displayName: 'Get Company',
      shortDesc: 'Retrieve company details',
      longDesc: 'Retrieve detailed information about a specific company in Mautic.',
      options: {
        company: {
          displayName: 'Company',
          shortDesc: 'The company to retrieve',
          longDesc: 'Select the company that you want to get details for',
        },
      },
    },
    get_many_companies: {
      groups: ['Data Retrieval'],
      displayName: 'Get Many Companies',
      shortDesc: 'Retrieve a list of companies',
      longDesc:
        'Retrieve a paginated list of companies from Mautic with optional search and filtering.',
      options: {
        search: {
          displayName: 'Search',
          shortDesc: 'Search term to filter companies',
          longDesc: 'Search for companies by name or other fields',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of companies to return',
          longDesc: 'The maximum number of companies to return (default: 30)',
        },
        start: {
          displayName: 'Start',
          shortDesc: 'Starting row for pagination',
          longDesc: 'The starting row for pagination (default: 0)',
        },
        orderBy: {
          displayName: 'Order By',
          shortDesc: 'Field to sort results by',
          longDesc: 'The field to use for sorting the results',
        },
        orderByDir: {
          displayName: 'Order Direction',
          shortDesc: 'Sort direction (asc or desc)',
          longDesc: 'The direction to sort results: ascending or descending',
        },
      },
    },
    update_company: {
      groups: ['Company Management'],
      displayName: 'Update Company',
      shortDesc: 'Update an existing company',
      longDesc: 'Update the information of an existing company in Mautic.',
      options: {
        company: {
          displayName: 'Company',
          shortDesc: 'The company to update',
          longDesc: 'Select the company that you want to update',
        },
        companyname: {
          displayName: 'Company Name',
          shortDesc: 'The updated name of the company',
          longDesc: 'The new name for the company',
        },
        companyemail: {
          displayName: 'Company Email',
          shortDesc: 'The updated email address',
          longDesc: 'The new primary email address for the company',
        },
        companyphone: {
          displayName: 'Company Phone',
          shortDesc: 'The updated phone number',
          longDesc: 'The new primary phone number for the company',
        },
        companywebsite: {
          displayName: 'Website',
          shortDesc: 'The updated website URL',
          longDesc: 'The new company website URL',
        },
        companyaddress1: {
          displayName: 'Address Line 1',
          shortDesc: 'The updated first line of the address',
          longDesc: 'The new street address of the company',
        },
        companyaddress2: {
          displayName: 'Address Line 2',
          shortDesc: 'The updated second line of the address',
          longDesc: 'New additional address information',
        },
        companycity: {
          displayName: 'City',
          shortDesc: 'The updated city',
          longDesc: 'The new city of the company address',
        },
        companystate: {
          displayName: 'State/Region',
          shortDesc: 'The updated state or region',
          longDesc: 'The new state, province, or region',
        },
        companyzipcode: {
          displayName: 'Postal Code',
          shortDesc: 'The updated postal/ZIP code',
          longDesc: 'The new postal or ZIP code',
        },
        companycountry: {
          displayName: 'Country',
          shortDesc: 'The updated country',
          longDesc: 'The new country of the company',
        },
        companydescription: {
          displayName: 'Description',
          shortDesc: 'The updated description',
          longDesc: 'New notes or description about the company',
        },
        companyindustry: {
          displayName: 'Industry',
          shortDesc: 'The updated industry',
          longDesc: 'The new industry or sector',
        },
        custom_fields: {
          displayName: 'Custom Fields',
          shortDesc: 'Custom field values',
          longDesc:
            'An object containing custom field aliases and their values. Use the field alias as the key ',
        },
      },
    },

    // Company Contact Actions
    add_contact_to_company: {
      groups: ['Company Management'],
      displayName: 'Add Contact to Company',
      shortDesc: 'Associate a contact with a company',
      longDesc: 'Create an association between a contact and a company in Mautic.',
      options: {
        company: {
          displayName: 'Company',
          shortDesc: 'The company to add the contact to',
          longDesc: 'Select the company that you want to associate the contact with',
        },
        contact: {
          displayName: 'Contact',
          shortDesc: 'The contact to add to the company',
          longDesc: 'Select the contact that you want to associate with the company',
        },
      },
    },
    remove_contact_from_company: {
      groups: ['Company Management'],
      displayName: 'Remove Contact from Company',
      shortDesc: 'Remove a contact from a company',
      longDesc: 'Remove the association between a contact and a company in Mautic.',
      options: {
        company: {
          displayName: 'Company',
          shortDesc: 'The company to remove the contact from',
          longDesc: 'Select the company that you want to remove the contact from',
        },
        contact: {
          displayName: 'Contact',
          shortDesc: 'The contact to remove from the company',
          longDesc: 'Select the contact that you want to remove from the company',
        },
      },
    },

    // Contact Actions
    create_contact: {
      groups: ['Contact Management'],
      displayName: 'Create Contact',
      shortDesc: 'Create a new contact',
      longDesc: 'Create a new contact in Mautic with the specified information.',
      options: {
        email: {
          displayName: 'Email Address',
          shortDesc: "The contact's email address",
          longDesc: 'The primary email address for the contact (required)',
        },
        firstname: {
          displayName: 'First Name',
          shortDesc: "The contact's first name",
          longDesc: 'The first name of the contact',
        },
        lastname: {
          displayName: 'Last Name',
          shortDesc: "The contact's last name",
          longDesc: 'The last name of the contact',
        },
        phone: {
          displayName: 'Phone',
          shortDesc: "The contact's phone number",
          longDesc: 'The phone number for the contact',
        },
        mobile: {
          displayName: 'Mobile',
          shortDesc: "The contact's mobile number",
          longDesc: 'The mobile phone number for the contact',
        },
        company: {
          displayName: 'Company',
          shortDesc: "The contact's company name",
          longDesc: 'The name of the company the contact works for',
        },
        position: {
          displayName: 'Position',
          shortDesc: "The contact's job title",
          longDesc: 'The job title or position of the contact',
        },
        address1: {
          displayName: 'Address Line 1',
          shortDesc: 'The first line of the address',
          longDesc: 'The street address of the contact',
        },
        address2: {
          displayName: 'Address Line 2',
          shortDesc: 'The second line of the address',
          longDesc: 'Additional address information',
        },
        city: {
          displayName: 'City',
          shortDesc: 'The city',
          longDesc: 'The city of the contact address',
        },
        state: {
          displayName: 'State/Region',
          shortDesc: 'The state or region',
          longDesc: 'The state, province, or region',
        },
        zipcode: {
          displayName: 'Postal Code',
          shortDesc: 'The postal/ZIP code',
          longDesc: 'The postal or ZIP code',
        },
        country: {
          displayName: 'Country',
          shortDesc: 'The country',
          longDesc: 'The country of the contact',
        },
        website: {
          displayName: 'Website',
          shortDesc: "The contact's website",
          longDesc: 'The personal or professional website URL',
        },
        tags: {
          displayName: 'Tags',
          shortDesc: 'Tags to apply to the contact',
          longDesc: 'A list of tags to apply to the contact for organization and segmentation',
        },
        custom_fields: {
          displayName: 'Custom Fields',
          shortDesc: 'Custom field values',
          longDesc:
            'An object containing custom field aliases and their values. Use the field alias as the key ',
        },
      },
    },
    delete_contact: {
      groups: ['Contact Management'],
      displayName: 'Delete Contact',
      shortDesc: 'Delete a contact',
      longDesc: 'Permanently delete a contact from Mautic.',
      options: {
        contact: {
          displayName: 'Contact',
          shortDesc: 'The contact to delete',
          longDesc: 'Select the contact that you want to delete',
        },
      },
    },
    edit_contact_points: {
      groups: ['Contact Management'],
      displayName: 'Edit Contact Points',
      shortDesc: "Add or subtract points from a contact's score",
      longDesc:
        'Modify the points score of a contact in Mautic. You can add points to reward engagement or subtract points to de-qualify leads.',
      options: {
        contact: {
          displayName: 'Contact',
          shortDesc: 'The contact to modify points for',
          longDesc: 'Select the contact whose points you want to modify',
        },
        operation: {
          displayName: 'Operation',
          shortDesc: 'Whether to add or subtract points',
          longDesc:
            'Choose whether to add points (increase score) or subtract points (decrease score)',
        },
        points: {
          displayName: 'Points',
          shortDesc: 'The number of points to add or subtract',
          longDesc: 'The number of points to add or subtract from the contact score',
        },
      },
    },
    edit_do_not_contact: {
      groups: ['Contact Management'],
      displayName: 'Edit Do Not Contact List',
      shortDesc: 'Add or remove a contact from the do not contact list',
      longDesc:
        'Manage the Do Not Contact (DNC) status for a contact on a specific channel (email, SMS, etc.).',
      options: {
        contact: {
          displayName: 'Contact',
          shortDesc: 'The contact to modify DNC status for',
          longDesc: 'Select the contact whose DNC status you want to modify',
        },
        channel: {
          displayName: 'Channel',
          shortDesc: 'The communication channel',
          longDesc: 'Select the channel for the DNC entry (email, sms, etc.)',
        },
        operation: {
          displayName: 'Operation',
          shortDesc: 'Whether to add or remove from DNC list',
          longDesc:
            'Choose whether to add the contact to the DNC list (stop communications) or remove them (allow communications)',
        },
        reason: {
          displayName: 'Reason',
          shortDesc: 'The reason for adding to DNC',
          longDesc: 'The reason for adding the contact to the do not contact list',
        },
        comments: {
          displayName: 'Comments',
          shortDesc: 'Additional comments',
          longDesc: 'Additional notes or comments about the DNC entry',
        },
      },
    },
    get_contact: {
      groups: ['Data Retrieval'],
      displayName: 'Get Contact',
      shortDesc: 'Retrieve contact details',
      longDesc:
        'Retrieve detailed information about a specific contact in Mautic including fields, tags, and DNC status.',
      options: {
        contact: {
          displayName: 'Contact',
          shortDesc: 'The contact to retrieve',
          longDesc: 'Select the contact that you want to get details for',
        },
      },
    },
    get_many_contacts: {
      groups: ['Data Retrieval'],
      displayName: 'Get Many Contacts',
      shortDesc: 'Retrieve a list of contacts',
      longDesc:
        'Retrieve a paginated list of contacts from Mautic with optional search and filtering.',
      options: {
        search: {
          displayName: 'Search',
          shortDesc: 'Search term to filter contacts',
          longDesc: 'Search for contacts by name, email, or other fields',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of contacts to return',
          longDesc: 'The maximum number of contacts to return (default: 30)',
        },
        start: {
          displayName: 'Start',
          shortDesc: 'Starting row for pagination',
          longDesc: 'The starting row for pagination (default: 0)',
        },
        orderBy: {
          displayName: 'Order By',
          shortDesc: 'Field to sort results by',
          longDesc: 'The field to use for sorting the results',
        },
        orderByDir: {
          displayName: 'Order Direction',
          shortDesc: 'Sort direction (asc or desc)',
          longDesc: 'The direction to sort results: ascending or descending',
        },
      },
    },
    send_email_to_contact: {
      groups: ['Email'],
      displayName: 'Send Email to Contact',
      shortDesc: 'Send an email to a specific contact',
      longDesc: 'Send a Mautic email template to a specific contact.',
      options: {
        email: {
          displayName: 'Email Template',
          shortDesc: 'The email template to send',
          longDesc: 'Select the Mautic email template that you want to send',
        },
        contact: {
          displayName: 'Contact',
          shortDesc: 'The contact to send the email to',
          longDesc: 'Select the contact that you want to send the email to',
        },
      },
    },
    update_contact: {
      groups: ['Contact Management'],
      displayName: 'Update Contact',
      shortDesc: 'Update an existing contact',
      longDesc: 'Update the information of an existing contact in Mautic.',
      options: {
        contact: {
          displayName: 'Contact',
          shortDesc: 'The contact to update',
          longDesc: 'Select the contact that you want to update',
        },
        email: {
          displayName: 'Email Address',
          shortDesc: 'The updated email address',
          longDesc: 'The new email address for the contact',
        },
        firstname: {
          displayName: 'First Name',
          shortDesc: 'The updated first name',
          longDesc: 'The new first name of the contact',
        },
        lastname: {
          displayName: 'Last Name',
          shortDesc: 'The updated last name',
          longDesc: 'The new last name of the contact',
        },
        phone: {
          displayName: 'Phone',
          shortDesc: 'The updated phone number',
          longDesc: 'The new phone number for the contact',
        },
        mobile: {
          displayName: 'Mobile',
          shortDesc: 'The updated mobile number',
          longDesc: 'The new mobile phone number',
        },
        company: {
          displayName: 'Company',
          shortDesc: 'The updated company name',
          longDesc: 'The new company name',
        },
        position: {
          displayName: 'Position',
          shortDesc: 'The updated job title',
          longDesc: 'The new job title or position',
        },
        address1: {
          displayName: 'Address Line 1',
          shortDesc: 'The updated first line of the address',
          longDesc: 'The new street address',
        },
        address2: {
          displayName: 'Address Line 2',
          shortDesc: 'The updated second line of the address',
          longDesc: 'New additional address information',
        },
        city: {
          displayName: 'City',
          shortDesc: 'The updated city',
          longDesc: 'The new city',
        },
        state: {
          displayName: 'State/Region',
          shortDesc: 'The updated state or region',
          longDesc: 'The new state, province, or region',
        },
        zipcode: {
          displayName: 'Postal Code',
          shortDesc: 'The updated postal/ZIP code',
          longDesc: 'The new postal or ZIP code',
        },
        country: {
          displayName: 'Country',
          shortDesc: 'The updated country',
          longDesc: 'The new country',
        },
        website: {
          displayName: 'Website',
          shortDesc: 'The updated website',
          longDesc: 'The new website URL',
        },
        tags: {
          displayName: 'Tags',
          shortDesc: 'Tags to apply or remove',
          longDesc:
            'Tags to apply to the contact. Prefix with "-" to remove a tag (e.g., "-oldtag")',
        },
        custom_fields: {
          displayName: 'Custom Fields',
          shortDesc: 'Custom field values',
          longDesc:
            'An object containing custom field aliases and their values. Use the field alias as the key ',
        },
      },
    },

    // Segment Actions
    add_contact_to_segment: {
      groups: ['Segment Management'],
      displayName: 'Add Contact to Segment',
      shortDesc: 'Add a contact to a segment',
      longDesc: 'Manually add a specific contact to a segment in Mautic.',
      options: {
        segment: {
          displayName: 'Segment',
          shortDesc: 'The segment to add the contact to',
          longDesc: 'Select the segment that you want to add the contact to',
        },
        contact: {
          displayName: 'Contact',
          shortDesc: 'The contact to add to the segment',
          longDesc: 'Select the contact that you want to add to the segment',
        },
      },
    },
    remove_contact_from_segment: {
      groups: ['Segment Management'],
      displayName: 'Remove Contact from Segment',
      shortDesc: 'Remove a contact from a segment',
      longDesc: 'Remove a specific contact from a segment in Mautic.',
      options: {
        segment: {
          displayName: 'Segment',
          shortDesc: 'The segment to remove the contact from',
          longDesc: 'Select the segment that you want to remove the contact from',
        },
        contact: {
          displayName: 'Contact',
          shortDesc: 'The contact to remove from the segment',
          longDesc: 'Select the contact that you want to remove from the segment',
        },
      },
    },
    send_email_to_segment: {
      groups: ['Email'],
      displayName: 'Send Email to Segment',
      shortDesc: 'Send an email to all contacts in a segment',
      longDesc:
        'Send a Mautic segment email to all contacts in the associated segment. The email must be of type "list" (segment email).',
      options: {
        email: {
          displayName: 'Segment Email',
          shortDesc: 'The segment email to send',
          longDesc:
            'Select the segment email that you want to send. This must be a "list" type email associated with a segment.',
        },
      },
    },
  },
};

export default MauticAppEn;
