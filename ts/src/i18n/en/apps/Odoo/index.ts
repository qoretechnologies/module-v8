/* eslint-disable max-len */
const OdooAppEn = {
  displayName: 'Odoo CRM',
  groups: ['CRM & Sales Management'],
  shortDesc: 'Connect to your Odoo CRM instance',
  longDesc: `Odoo is a suite of open-source business apps that cover all your company needs: CRM, eCommerce, accounting, inventory, point of sale, project management, etc.`,
  actions: {
    // Locales for partner actions

    create_partner: {
      displayName: 'Create Partner',
      shortDesc: 'Create a new partner (contact or company) in Odoo',
      longDesc:
        'Creates a new partner record in Odoo with comprehensive contact information, address details, business information, and relationship data. Partners can be individuals or companies and serve as customers, vendors, or both.',
      options: {
        name: {
          displayName: 'Name',
          shortDesc: 'Partner name',
          longDesc: 'The name of the partner (individual or company name).',
        },
        is_company: {
          displayName: 'Is Company',
          shortDesc: 'Whether this partner is a company',
          longDesc:
            'Set to true if this partner represents a company/organization, false for individual contacts.',
        },
        contact_info: {
          displayName: 'Contact Information',
          shortDesc: 'Contact details for the partner',
          longDesc: 'Contact information including email, phone, website, job function and title.',
          type: {
            fields: {
              email: {
                displayName: 'Email',
                shortDesc: 'Email address',
                longDesc: 'Primary email address for the partner.',
              },
              phone: {
                displayName: 'Phone',
                shortDesc: 'Phone number',
                longDesc: 'Primary phone number for the partner.',
              },
              website: {
                displayName: 'Website',
                shortDesc: 'Website URL',
                longDesc: 'Website URL for the partner or company.',
              },
              function: {
                displayName: 'Job Function',
                shortDesc: 'Job title or function',
                longDesc: 'Job title or function of the contact person.',
              },
              title: {
                displayName: 'Title',
                shortDesc: 'Title (Mr., Mrs., etc.)',
                longDesc: 'Personal title such as Mr., Mrs., Ms., Dr., Prof.',
              },
            },
          },
        },
        address_info: {
          displayName: 'Address Information',
          shortDesc: 'Address details for the partner',
          longDesc:
            'Complete address information including street, city, state, country, and postal code.',
          type: {
            fields: {
              street: {
                displayName: 'Street',
                shortDesc: 'Street address',
                longDesc: 'Primary street address line.',
              },
              street2: {
                displayName: 'Street 2',
                shortDesc: 'Additional street address',
                longDesc: 'Additional street address line (apartment, suite, etc.).',
              },
              city: {
                displayName: 'City',
                shortDesc: 'City name',
                longDesc: 'City or locality name.',
              },
              zip: {
                displayName: 'ZIP Code',
                shortDesc: 'Postal code',
                longDesc: 'ZIP or postal code.',
              },
              country_id: {
                displayName: 'Country',
                shortDesc: 'Country',
                longDesc: 'Country where the partner is located.',
              },
              state_id: {
                displayName: 'State',
                shortDesc: 'State or province',
                longDesc: 'State, province, or region within the country.',
              },
            },
          },
        },
        business_info: {
          displayName: 'Business Information',
          shortDesc: 'Business-related details',
          longDesc:
            'Business information including VAT number, reference code, and industry classification.',
          type: {
            fields: {
              vat: {
                displayName: 'VAT Number',
                shortDesc: 'Tax identification number',
                longDesc: 'VAT or tax identification number for the partner.',
              },
              ref: {
                displayName: 'Reference',
                shortDesc: 'Internal reference code',
                longDesc: 'Internal reference code or identifier for the partner.',
              },
              industry_id: {
                displayName: 'Industry',
                shortDesc: 'Industry classification',
                longDesc: 'Industry or business sector classification.',
              },
            },
          },
        },
        relationship_info: {
          displayName: 'Relationship Information',
          shortDesc: 'Relationship and assignment details',
          longDesc: 'Information about relationships to other partners and user assignments.',
          type: {
            fields: {
              parent_id: {
                displayName: 'Parent Company',
                shortDesc: 'Parent company or organization',
                longDesc: 'Parent company or organization this partner belongs to.',
              },
              user_id: {
                displayName: 'Assigned User',
                shortDesc: 'User responsible for this partner',
                longDesc: 'Odoo user responsible for managing this partner.',
              },
            },
          },
        },
        category_ids: {
          displayName: 'Categories',
          shortDesc: 'Partner categories or tags',
          longDesc: 'Categories or tags to classify and organize partners.',
        },
        active: {
          displayName: 'Active',
          shortDesc: 'Whether the partner is active',
          longDesc: 'Set to false to archive the partner without deleting it.',
        },
        comment: {
          displayName: 'Internal Notes',
          shortDesc: 'Internal notes about the partner',
          longDesc: 'Internal notes or comments about the partner.',
        },
        lang: {
          displayName: 'Language',
          shortDesc: 'Preferred language',
          longDesc: 'Preferred language for communication with this partner.',
        },
        tz: {
          displayName: 'Timezone',
          shortDesc: 'Partner timezone',
          longDesc: 'Timezone where the partner is located.',
        },
        image_1920: {
          displayName: 'Profile Image',
          shortDesc: 'Partner profile image',
          longDesc: 'Profile image for the partner (base64 encoded).',
        },
      },
    },

    get_partner: {
      displayName: 'Get Partner',
      shortDesc: 'Retrieve a single partner record from Odoo',
      longDesc:
        'Fetches detailed information about a specific partner from Odoo. Allows selecting which fields to retrieve for customized data requirements.',
      options: {
        partner_id: {
          displayName: 'Partner ID',
          shortDesc: 'ID of the partner to retrieve',
          longDesc: 'The unique identifier of the partner record to fetch from Odoo.',
        },
        fields: {
          displayName: 'Fields to Retrieve',
          shortDesc: 'Partner fields to include in response',
          longDesc:
            'List of specific partner fields to retrieve. If not specified, returns basic partner information including ID, name, email, phone, and company status.',
        },
      },
    },

    delete_partner: {
      displayName: 'Delete Partner',
      shortDesc: 'Delete a partner record from Odoo',
      longDesc:
        'Permanently deletes a partner record from Odoo. This action cannot be undone. Consider archiving (setting active to false) instead if you need to preserve the record.',
      options: {
        partner_id: {
          displayName: 'Partner ID',
          shortDesc: 'ID of the partner to delete',
          longDesc: 'The unique identifier of the partner record to delete from Odoo.',
        },
      },
    },
    create_lead: {
      displayName: 'Create Lead',
      shortDesc: 'Create a new lead or opportunity in Odoo CRM',
      longDesc:
        'Creates a new lead or opportunity record in Odoo CRM with comprehensive contact, sales, and marketing information. Supports grouping related fields for better organization.',
      options: {
        name: {
          displayName: 'Opportunity',
          shortDesc: 'The name/title of the lead or opportunity',
          longDesc:
            'The main title or name that identifies this lead or opportunity. This is a required field that will be displayed in lead lists and reports.',
        },
        contact_name: {
          displayName: 'Contact Name',
          shortDesc: 'Name of the contact person',
          longDesc: 'The full name of the primary contact person associated with this lead.',
        },
        partner_name: {
          displayName: 'Company Name',
          shortDesc: 'Name of the customer company',
          longDesc: 'The name of the company or organization that this lead represents.',
        },
        contact_info: {
          displayName: 'Contact Information',
          shortDesc: 'Contact details for the lead',
          longDesc:
            'Complete contact information including email addresses, phone numbers, job position, and website details.',
          type: {
            fields: {
              email_from: {
                displayName: 'Email',
                shortDesc: 'Primary email address',
                longDesc: 'The main email address for contacting this lead.',
              },
              email_cc: {
                displayName: 'Email CC',
                shortDesc: 'CC email addresses',
                longDesc: 'Additional email addresses that should be copied on communications.',
              },
              phone: {
                displayName: 'Phone',
                shortDesc: 'Primary phone number',
                longDesc: 'The main phone number for contacting this lead.',
              },
              mobile: {
                displayName: 'Phone Number',
                shortDesc: 'Mobile phone number',
                longDesc: 'Mobile or cell phone number for the contact.',
              },
              function: {
                displayName: 'Job Position',
                shortDesc: 'Job title or position of the contact',
                longDesc:
                  'The job title, role, or position of the contact person within their organization.',
              },
              website: {
                displayName: 'Website',
                shortDesc: 'Company or contact website',
                longDesc: 'The website URL for the company or contact.',
              },
            },
          },
        },
        address_info: {
          displayName: 'Address Information',
          shortDesc: 'Address details for the lead',
          longDesc:
            'Complete address information including street address, city, state, country, and postal code.',
          type: {
            fields: {
              street: {
                displayName: 'Street',
                shortDesc: 'Street address',
                longDesc: 'The street address or first line of the address.',
              },
              street2: {
                displayName: 'Street2',
                shortDesc: 'Additional street address information',
                longDesc:
                  'Additional address information such as apartment number, suite, or building details.',
              },
              city: {
                displayName: 'City',
                shortDesc: 'City name',
                longDesc: 'The city or town name.',
              },
              zip: {
                displayName: 'Zip',
                shortDesc: 'Postal/ZIP code',
                longDesc: 'The postal code or ZIP code for the address.',
              },
              country_id: {
                displayName: 'Country',
                shortDesc: 'Country ID (use country record ID)',
                longDesc:
                  'The ID of the country record in Odoo. Use the appropriate country ID from your Odoo instance.',
              },
              state_id: {
                displayName: 'State',
                shortDesc: 'State/Province ID (use state record ID)',
                longDesc:
                  'The ID of the state or province record in Odoo. Use the appropriate state ID from your Odoo instance.',
              },
            },
          },
        },
        sales_info: {
          displayName: 'Sales Information',
          shortDesc: 'Sales-related details for the lead',
          longDesc:
            'Sales management information including assigned salesperson, team, stage, priority, and expected closing details.',
          type: {
            fields: {
              user_id: {
                displayName: 'Salesperson',
                shortDesc: 'ID of the assigned salesperson',
                longDesc: 'The ID of the user who is assigned as the salesperson for this lead.',
              },
              team_id: {
                displayName: 'Sales Team',
                shortDesc: 'ID of the sales team',
                longDesc: 'The ID of the sales team responsible for this lead.',
              },
              stage_id: {
                displayName: 'Stage',
                shortDesc: 'ID of the lead stage',
                longDesc: 'The ID of the current stage in the sales pipeline for this lead.',
              },
              priority: {
                displayName: 'Priority',
                shortDesc: 'Priority level',
                longDesc: 'The priority level for this lead, ranging from Low to Very High.',
              },
              probability: {
                displayName: 'Probability',
                shortDesc: 'Success probability (0-100)',
                longDesc:
                  'The estimated probability of closing this lead successfully, expressed as a percentage from 0 to 100.',
              },
              date_deadline: {
                displayName: 'Expected Closing',
                shortDesc: 'Expected closing date',
                longDesc:
                  'The expected date when this lead or opportunity is anticipated to close.',
              },
            },
          },
        },
        marketing_info: {
          displayName: 'Marketing Information',
          shortDesc: 'Marketing and source tracking information',
          longDesc:
            'Marketing campaign and lead source tracking information to understand how this lead was generated and acquired.',
          type: {
            fields: {
              campaign_id: {
                displayName: 'Campaign',
                shortDesc: 'ID of the marketing campaign',
                longDesc: 'The ID of the marketing campaign that generated this lead.',
              },
              medium_id: {
                displayName: 'Medium',
                shortDesc: 'ID of the marketing medium',
                longDesc:
                  'The ID of the marketing medium (such as email, social media, advertising) through which this lead was acquired.',
              },
              source_id: {
                displayName: 'Source',
                shortDesc: 'ID of the lead source',
                longDesc: 'The ID of the specific source that generated this lead.',
              },
              referred: {
                displayName: 'Referred by',
                shortDesc: 'Who referred this lead',
                longDesc: 'Information about who or what referred this lead to your organization.',
              },
            },
          },
        },
        activity_info: {
          displayName: 'Activity Information',
          shortDesc: 'Next activity planning information',
          longDesc:
            'Information about the next planned activity or follow-up action for this lead.',
          type: {
            fields: {
              activity_summary: {
                displayName: 'Next Activity Summary',
                shortDesc: 'Summary of the next planned activity',
                longDesc:
                  'A brief description or summary of the next activity planned for this lead.',
              },
              activity_type_id: {
                displayName: 'Next Activity Type',
                shortDesc: 'ID of the activity type (Email, Call, Meeting, etc.)',
                longDesc:
                  'The ID of the type of activity planned next, such as Email, Call, Meeting, or Document review.',
              },
            },
          },
        },
        active: {
          displayName: 'Active',
          shortDesc: 'Whether the lead is active',
          longDesc:
            'Indicates whether this lead is currently active and should appear in standard views and reports.',
        },
        description: {
          displayName: 'Notes',
          shortDesc: 'Internal notes about the lead',
          longDesc:
            'Internal notes and comments about this lead. This information is for internal use and not visible to the customer.',
        },
        color: {
          displayName: 'Color Index',
          shortDesc: 'Color index for UI display (0-11)',
          longDesc:
            'A color index (0-11) used for visual identification in the user interface. This helps with quick visual organization of leads.',
        },
        tag_ids: {
          displayName: 'Tags',
          shortDesc: 'List of tag IDs to associate with the lead',
          longDesc:
            'A list of tag IDs to categorize and organize this lead. Tags help with filtering and grouping leads.',
        },
        partner_id: {
          displayName: 'Customer',
          shortDesc: 'ID of existing customer/partner record',
          longDesc:
            'The ID of an existing customer or partner record if this lead is associated with an existing contact.',
        },
        company_id: {
          displayName: 'Company',
          shortDesc: 'ID of the company (usually current user company)',
          longDesc:
            "The ID of the company record that owns this lead. Typically this is the current user's company.",
        },
        lang_code: {
          displayName: 'Language',
          shortDesc: 'Language code (e.g., en_US, fr_FR)',
          longDesc:
            'The preferred language code for communications with this lead (e.g., en_US for English, fr_FR for French).',
        },
        type: {
          displayName: 'Type',
          shortDesc: 'Whether this is a lead or opportunity',
          longDesc:
            'Specifies whether this record should be treated as a lead (early stage) or opportunity (qualified prospect).',
        },
        recurring_plan: {
          displayName: 'Recurring Plan',
          shortDesc: 'ID of recurring plan if applicable',
          longDesc:
            'The ID of a recurring plan if this lead is associated with a subscription or recurring service.',
        },
        reveal_id: {
          displayName: 'Reveal ID',
          shortDesc: 'External reveal service ID',
          longDesc: 'An external identifier from a reveal service or lead intelligence platform.',
        },
        lead_mining_request_id: {
          displayName: 'Lead Mining Request',
          shortDesc: 'ID of lead mining request',
          longDesc: 'The ID of the lead mining request that generated this lead, if applicable.',
        },
        enrichment_done: {
          displayName: 'Enrichment Done',
          shortDesc: 'Whether lead enrichment has been completed',
          longDesc:
            'Indicates whether automated lead enrichment (data enhancement) has been completed for this lead.',
        },
        email_bounce: {
          displayName: 'Bounce',
          shortDesc: 'Email bounce count',
          longDesc: "The number of email bounces recorded for this lead's email address.",
        },
        lost_reason: {
          displayName: 'Lost Reason',
          shortDesc: 'ID of lost reason if lead was lost',
          longDesc: 'The ID of the reason why this lead was marked as lost, if applicable.',
        },
      },
    },
    get_lead: {
      displayName: 'Get Lead',
      shortDesc: 'Retrieve a specific lead by ID with customizable fields.',
      longDesc:
        'Fetches detailed information about a specific lead from Odoo CRM. Allows you to specify which fields to retrieve, with common fields like ID, name, email, contact name, and partner name selected by default.',
      options: {
        lead_id: {
          displayName: 'Lead ID',
          shortDesc: 'The ID of the lead to retrieve',
          longDesc: 'The unique identifier of the lead record in Odoo CRM.',
        },
        fields: {
          displayName: 'Fields',
          shortDesc: 'Fields to retrieve',
          longDesc:
            'List of field names to retrieve from the lead record. Common fields are pre-selected.',
        },
      },
    },

    list_companies: {
      displayName: 'List Companies',
      shortDesc: 'List companies with filtering, sorting, and pagination options.',
      longDesc:
        'Retrieves a list of companies from Odoo with support for filtering by field values, sorting by specific fields, and pagination. Returns company information including display name, email, phone, and website.',
      options: {
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of companies to return',
          longDesc: 'The maximum number of company records to return. Default is 10.',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Number of companies to skip',
          longDesc:
            'The number of company records to skip before starting to return results. Used for pagination. Default is 0.',
        },
        fields: {
          displayName: 'Fields',
          shortDesc: 'Fields to retrieve',
          longDesc:
            'List of field names to retrieve from each company record. Common fields are pre-selected.',
        },
        sort: {
          displayName: 'Sort',
          shortDesc: 'Sorting configuration',
          longDesc: 'Specify the field and direction to sort the results.',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'Field to sort by',
                longDesc: 'The field name to sort the results by.',
              },
              direction: {
                displayName: 'Direction',
                shortDesc: 'Sort direction',
                longDesc: 'The direction to sort the results - ascending or descending.',
              },
            },
          },
        },
        filter: {
          displayName: 'Filter',
          shortDesc: 'Filter criteria',
          longDesc: 'List of filter conditions to apply to the query.',
          type: {
            element_type: {
              fields: {
                field: {
                  displayName: 'Field',
                  shortDesc: 'Field to filter by',
                  longDesc: 'The field name to apply the filter condition to.',
                },
                searchType: {
                  displayName: 'Search Type',
                  shortDesc: 'Type of search operation',
                  longDesc: 'The type of comparison to perform - equals or contains.',
                },
                value: {
                  displayName: 'Value',
                  shortDesc: 'Filter value',
                  longDesc: 'The value to compare against the field.',
                },
              },
            },
          },
        },
      },
    },

    list_leads: {
      displayName: 'List Leads',
      shortDesc: 'List leads with filtering, sorting, and pagination options.',
      longDesc:
        'Retrieves a list of leads from Odoo CRM with support for filtering by field values, sorting by specific fields, and pagination. Returns lead information including ID, name, email, contact name, and partner name.',
      options: {
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of leads to return',
          longDesc: 'The maximum number of lead records to return. Default is 10.',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Number of leads to skip',
          longDesc:
            'The number of lead records to skip before starting to return results. Used for pagination. Default is 0.',
        },
        fields: {
          displayName: 'Fields',
          shortDesc: 'Fields to retrieve',
          longDesc:
            'List of field names to retrieve from each lead record. Common fields are pre-selected.',
        },
        sort: {
          displayName: 'Sort',
          shortDesc: 'Sorting configuration',
          longDesc: 'Specify the field and direction to sort the results.',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'Field to sort by',
                longDesc: 'The field name to sort the results by.',
              },
              direction: {
                displayName: 'Direction',
                shortDesc: 'Sort direction',
                longDesc: 'The direction to sort the results - ascending or descending.',
              },
            },
          },
        },
        filter: {
          displayName: 'Filter',
          shortDesc: 'Filter criteria',
          longDesc: 'List of filter conditions to apply to the query.',
          type: {
            element_type: {
              fields: {
                field: {
                  displayName: 'Field',
                  shortDesc: 'Field to filter by',
                  longDesc: 'The field name to apply the filter condition to.',
                },
                searchType: {
                  displayName: 'Search Type',
                  shortDesc: 'Type of search operation',
                  longDesc: 'The type of comparison to perform - equals or contains.',
                },
                value: {
                  displayName: 'Value',
                  shortDesc: 'Filter value',
                  longDesc: 'The value to compare against the field.',
                },
              },
            },
          },
        },
      },
    },

    list_partners: {
      displayName: 'List Partners',
      shortDesc: 'List partners with filtering, sorting, and pagination options.',
      longDesc:
        'Retrieves a list of partners from Odoo with support for filtering by field values, sorting by specific fields, and pagination. Returns partner information including ID, display name, and email.',
      options: {
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of partners to return',
          longDesc: 'The maximum number of partner records to return. Default is 10.',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Number of partners to skip',
          longDesc:
            'The number of partner records to skip before starting to return results. Used for pagination. Default is 0.',
        },
        fields: {
          displayName: 'Fields',
          shortDesc: 'Fields to retrieve',
          longDesc:
            'List of field names to retrieve from each partner record. Common fields are pre-selected.',
        },
        sort: {
          displayName: 'Sort',
          shortDesc: 'Sorting configuration',
          longDesc: 'Specify the field and direction to sort the results.',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'Field to sort by',
                longDesc: 'The field name to sort the results by.',
              },
              direction: {
                displayName: 'Direction',
                shortDesc: 'Sort direction',
                longDesc: 'The direction to sort the results - ascending or descending.',
              },
            },
          },
        },
        filter: {
          displayName: 'Filter',
          shortDesc: 'Filter criteria',
          longDesc: 'List of filter conditions to apply to the query.',
          type: {
            element_type: {
              fields: {
                field: {
                  displayName: 'Field',
                  shortDesc: 'Field to filter by',
                  longDesc: 'The field name to apply the filter condition to.',
                },
                searchType: {
                  displayName: 'Search Type',
                  shortDesc: 'Type of search operation',
                  longDesc: 'The type of comparison to perform - equals or contains.',
                },
                value: {
                  displayName: 'Value',
                  shortDesc: 'Filter value',
                  longDesc: 'The value to compare against the field.',
                },
              },
            },
          },
        },
      },
    },

    update_lead: {
      displayName: 'Update Lead',
      shortDesc: 'Update an existing lead with new information.',
      longDesc:
        'Updates an existing lead in Odoo CRM with new information. Supports updating contact information, address details, sales information, marketing data, and activity details. All fields are optional except the lead ID.',
      options: {
        lead_id: {
          displayName: 'Lead ID',
          shortDesc: 'The ID of the lead to update',
          longDesc: 'The unique identifier of the lead record to update in Odoo CRM.',
        },
        name: {
          displayName: 'Name',
          shortDesc: 'Lead title or subject',
          longDesc: 'The title or subject of the lead.',
        },
        contact_name: {
          displayName: 'Contact Name',
          shortDesc: 'Name of the contact person',
          longDesc: 'The name of the primary contact person for this lead.',
        },
        partner_name: {
          displayName: 'Partner Name',
          shortDesc: 'Name of the partner/company',
          longDesc: 'The name of the partner or company associated with this lead.',
        },
        contact_info: {
          displayName: 'Contact Information',
          shortDesc: 'Contact details for the lead',
          longDesc: 'Email addresses, phone number, job function, and website information.',
          type: {
            fields: {
              email_from: {
                displayName: 'Email',
                shortDesc: 'Primary email address',
                longDesc: 'The primary email address of the contact.',
              },
              email_cc: {
                displayName: 'CC Email',
                shortDesc: 'CC email addresses',
                longDesc: 'Additional email addresses to include in communications.',
              },
              phone: {
                displayName: 'Phone',
                shortDesc: 'Phone number',
                longDesc: 'The phone number of the contact.',
              },
              function: {
                displayName: 'Job Function',
                shortDesc: 'Job title or function',
                longDesc: 'The job title or function of the contact person.',
              },
              website: {
                displayName: 'Website',
                shortDesc: 'Website URL',
                longDesc: 'The website URL of the contact or company.',
              },
            },
          },
        },
        address_info: {
          displayName: 'Address Information',
          shortDesc: 'Address details for the lead',
          longDesc: 'Street address, city, postal code, country, and state information.',
          type: {
            fields: {
              street: {
                displayName: 'Street',
                shortDesc: 'Street address',
                longDesc: 'The street address of the contact.',
              },
              street2: {
                displayName: 'Street 2',
                shortDesc: 'Additional address line',
                longDesc: 'Additional address information (apartment, suite, etc.).',
              },
              city: {
                displayName: 'City',
                shortDesc: 'City name',
                longDesc: 'The city of the contact address.',
              },
              zip: {
                displayName: 'ZIP Code',
                shortDesc: 'Postal/ZIP code',
                longDesc: 'The postal or ZIP code of the contact address.',
              },
              country_id: {
                displayName: 'Country',
                shortDesc: 'Country selection',
                longDesc: 'The country of the contact address.',
              },
              state_id: {
                displayName: 'State',
                shortDesc: 'State/province selection',
                longDesc: 'The state or province of the contact address.',
              },
            },
          },
        },
        sales_info: {
          displayName: 'Sales Information',
          shortDesc: 'Sales-related details for the lead',
          longDesc:
            'Salesperson assignment, team, stage, priority, probability, and deadline information.',
          type: {
            fields: {
              user_id: {
                displayName: 'Salesperson',
                shortDesc: 'Assigned salesperson',
                longDesc: 'The salesperson assigned to this lead.',
              },
              team_id: {
                displayName: 'Sales Team',
                shortDesc: 'Assigned sales team',
                longDesc: 'The sales team responsible for this lead.',
              },
              stage_id: {
                displayName: 'Stage',
                shortDesc: 'Current stage of the lead',
                longDesc: 'The current stage or phase of the lead in the sales process.',
              },
              priority: {
                displayName: 'Priority',
                shortDesc: 'Lead priority level',
                longDesc: 'The priority level of this lead (Low, Medium, High, Very High).',
              },
              probability: {
                displayName: 'Probability',
                shortDesc: 'Success probability percentage',
                longDesc: 'The estimated probability of converting this lead (0-100%).',
              },
              date_deadline: {
                displayName: 'Deadline',
                shortDesc: 'Expected closing date',
                longDesc: 'The expected date for closing this lead.',
              },
            },
          },
        },
        marketing_info: {
          displayName: 'Marketing Information',
          shortDesc: 'Marketing campaign and source details',
          longDesc:
            'Information about the marketing campaign, medium, source, and referral that generated this lead.',
          type: {
            fields: {
              campaign_id: {
                displayName: 'Campaign',
                shortDesc: 'Marketing campaign',
                longDesc: 'The marketing campaign that generated this lead.',
              },
              medium_id: {
                displayName: 'Medium',
                shortDesc: 'Marketing medium',
                longDesc: 'The marketing medium used (email, social media, etc.).',
              },
              source_id: {
                displayName: 'Source',
                shortDesc: 'Marketing source',
                longDesc: 'The specific source that generated this lead.',
              },
              referred: {
                displayName: 'Referred By',
                shortDesc: 'Referral source',
                longDesc: 'Information about who or what referred this lead.',
              },
            },
          },
        },
        activity_info: {
          displayName: 'Activity Information',
          shortDesc: 'Next activity details',
          longDesc: 'Information about the next planned activity for this lead.',
          type: {
            fields: {
              activity_summary: {
                displayName: 'Activity Summary',
                shortDesc: 'Summary of next activity',
                longDesc: 'A brief summary of the next planned activity.',
              },
              activity_type_id: {
                displayName: 'Activity Type',
                shortDesc: 'Type of next activity',
                longDesc: 'The type of the next planned activity (call, meeting, email, etc.).',
              },
            },
          },
        },
        active: {
          displayName: 'Active',
          shortDesc: 'Whether the lead is active',
          longDesc: 'Set to false to archive the lead without deleting it.',
        },
        description: {
          displayName: 'Description',
          shortDesc: 'Lead description or notes',
          longDesc: 'Additional notes or description about the lead.',
        },
        color: {
          displayName: 'Color',
          shortDesc: 'Color code for the lead',
          longDesc: 'A color code to visually distinguish this lead in the interface.',
        },
        tag_ids: {
          displayName: 'Tags',
          shortDesc: 'Tags to categorize the lead',
          longDesc: 'List of tags to help categorize and organize this lead.',
        },
        partner_id: {
          displayName: 'Partner',
          shortDesc: 'Associated partner record',
          longDesc: 'Link this lead to an existing partner/customer record.',
        },
        company_id: {
          displayName: 'Company',
          shortDesc: 'Company that owns this lead',
          longDesc: 'The company that owns this lead record.',
        },
        type: {
          displayName: 'Type',
          shortDesc: 'Lead or opportunity',
          longDesc: 'Whether this record is a lead or has been converted to an opportunity.',
        },
        email_bounce: {
          displayName: 'Email Bounce Count',
          shortDesc: 'Number of email bounces',
          longDesc: 'The number of times emails to this contact have bounced.',
        },
        lost_reason: {
          displayName: 'Lost Reason',
          shortDesc: 'Reason for losing the lead',
          longDesc: 'The reason why this lead was marked as lost.',
        },
        lang_code: {
          displayName: 'Language',
          shortDesc: 'Preferred language',
          longDesc: 'The preferred language for communicating with this contact.',
        },
      },
    },

    delete_lead: {
      displayName: 'Delete Lead',
      shortDesc: 'Delete a lead from Odoo CRM.',
      longDesc:
        'Permanently deletes a lead record from Odoo CRM. This action cannot be undone. Consider archiving the lead instead by setting it as inactive.',
      options: {
        lead_id: {
          displayName: 'Lead ID',
          shortDesc: 'The ID of the lead to delete',
          longDesc: 'The unique identifier of the lead record to permanently delete from Odoo CRM.',
        },
      },
    },
  },
  triggers: {
    new_lead: {
      displayName: 'New Lead',
      shortDesc: 'Triggers when a new lead is created in Odoo',
      longDesc:
        'Monitors Odoo for newly created leads or opportunities. Supports filtering by company, team, user, stage, lead type, and tags to only trigger for specific leads that match your criteria.',
      options: {
        company_id: {
          displayName: 'Company',
          shortDesc: 'Filter by company',
          longDesc:
            'Only trigger for leads belonging to the specified company. Leave empty to monitor all companies.',
        },
        team_id: {
          displayName: 'Sales Team',
          shortDesc: 'Filter by sales team',
          longDesc:
            'Only trigger for leads assigned to the specified sales team. Leave empty to monitor all teams.',
        },
        user_id: {
          displayName: 'Salesperson',
          shortDesc: 'Filter by assigned salesperson',
          longDesc:
            'Only trigger for leads assigned to the specified salesperson. Leave empty to monitor all users.',
        },
        stage_id: {
          displayName: 'Stage',
          shortDesc: 'Filter by lead stage',
          longDesc:
            'Only trigger for leads in the specified stage. Leave empty to monitor all stages.',
        },
        lead_type: {
          displayName: 'Lead Type',
          shortDesc: 'Type of records to monitor',
          longDesc: 'Choose whether to monitor leads, opportunities, or both types of records.',
        },
        tag_ids: {
          displayName: 'Tags',
          shortDesc: 'Filter by tags',
          longDesc:
            'Only trigger for leads that have any of the specified tags. Leave empty to monitor all leads regardless of tags.',
        },
      },
    },

    updated_lead: {
      displayName: 'Updated Lead',
      shortDesc: 'Triggers when an existing lead is updated in Odoo',
      longDesc:
        'Monitors Odoo for updates to existing leads or opportunities. Supports filtering by company, team, user, stage, lead type, and tags to only trigger for specific leads that match your criteria.',
      options: {
        company_id: {
          displayName: 'Company',
          shortDesc: 'Filter by company',
          longDesc:
            'Only trigger for leads belonging to the specified company. Leave empty to monitor all companies.',
        },
        team_id: {
          displayName: 'Sales Team',
          shortDesc: 'Filter by sales team',
          longDesc:
            'Only trigger for leads assigned to the specified sales team. Leave empty to monitor all teams.',
        },
        user_id: {
          displayName: 'Salesperson',
          shortDesc: 'Filter by assigned salesperson',
          longDesc:
            'Only trigger for leads assigned to the specified salesperson. Leave empty to monitor all users.',
        },
        stage_id: {
          displayName: 'Stage',
          shortDesc: 'Filter by lead stage',
          longDesc:
            'Only trigger for leads in the specified stage. Leave empty to monitor all stages.',
        },
        lead_type: {
          displayName: 'Lead Type',
          shortDesc: 'Type of records to monitor',
          longDesc: 'Choose whether to monitor leads, opportunities, or both types of records.',
        },
        tag_ids: {
          displayName: 'Tags',
          shortDesc: 'Filter by tags',
          longDesc:
            'Only trigger for leads that have any of the specified tags. Leave empty to monitor all leads regardless of tags.',
        },
      },
    },
    new_company: {
      displayName: 'New Company',
      shortDesc: 'Triggers when a new company is created in Odoo',
      longDesc:
        'Monitors Odoo for newly created company records in the res.company model. This trigger fires whenever a new company entity is added to your Odoo system, providing company configuration details including address, currency, and organizational information.',
    },
    new_partner: {
      displayName: 'New Partner',
      shortDesc: 'Triggers when a new partner is created in Odoo',
      longDesc:
        'Monitors Odoo for newly created partner records in the res.partner model. This trigger fires whenever a new partner entity is added to your Odoo system, providing partner configuration details including address, contact information, and organizational information.',
    },
  },
};

export default OdooAppEn;
