/* eslint-disable max-len */
const GoogleContactsAppEn = {
  displayName: 'Google Contacts',
  shortDesc: 'Manage your Google Contacts',
  longDesc:
    'Connect to Google Contacts to manage your contacts directly from your application. Create, update, and delete contacts seamlessly.',
  actions: {
    get_contact: {
      displayName: 'Get Contact',
      shortDesc: 'Retrieve detailed information about a specific Google contact.',
      longDesc:
        'Fetches comprehensive contact information from Google Contacts including names, email addresses, phone numbers, organizations, addresses, birthdays, and other personal details. Returns all available fields for the specified contact.',
      options: {
        resource_name: {
          displayName: 'Contact Resource Name',
          shortDesc: 'The unique identifier for the contact',
          longDesc:
            'The resource name of the contact to retrieve (e.g., "people/12345"). This uniquely identifies the contact in Google Contacts.',
        },
      },
    },

    list_groups: {
      displayName: 'List Contact Groups',
      shortDesc: 'Retrieve a list of contact groups from Google Contacts.',
      longDesc:
        'Fetches all contact groups from Google Contacts with support for filtering by group type, searching by name, and selecting specific fields. Returns both system and user-created groups with metadata including member counts.',
      options: {
        search_name: {
          displayName: 'Search Name',
          shortDesc: 'Filter groups by name',
          longDesc:
            'Optional search term to filter groups by name. The search is case-insensitive and matches partial names.',
        },
        group_type: {
          displayName: 'Group Type',
          shortDesc: 'Type of groups to retrieve',
          longDesc:
            'Filter groups by type: "all" for both system and user groups, "user" for user-created groups only, or "system" for system groups only. Default is "all".',
        },
        group_fields: {
          displayName: 'Group Fields',
          shortDesc: 'Fields to include in the response',
          longDesc:
            'Comma-separated list of fields to include in the response. Options range from basic name only to all fields including custom data. Default includes name, type, member count, and metadata.',
        },
      },
    },

    search_contacts: {
      displayName: 'Search Contacts',
      shortDesc: 'Search for contacts in Google Contacts by various criteria.',
      longDesc:
        'Search through Google Contacts using email addresses, full names, or phone numbers. Supports both exact matching and partial matching (contains) search types. Returns basic contact information for matching contacts.',
      options: {
        search_field: {
          displayName: 'Search Field',
          shortDesc: 'Field to search in',
          longDesc:
            'The contact field to search in: "email" for email addresses, "full_name" for names, or "phone_number" for phone numbers.',
        },
        search_type: {
          displayName: 'Search Type',
          shortDesc: 'Type of search to perform',
          longDesc:
            'Search matching type: "contains" for partial matches or "exact" for exact matches. Default is "contains".',
        },
        search_value: {
          displayName: 'Search Value',
          shortDesc: 'Value to search for',
          longDesc:
            'The search term or value to look for in the specified field. Search is case-insensitive.',
        },
      },
    },

    add_contact_to_group: {
      displayName: 'Add Contact to Group',
      shortDesc: 'Add an existing contact to a contact group.',
      longDesc:
        'Adds a contact to an existing contact group in Google Contacts. Both the contact and group must already exist. Returns confirmation with details about both the contact and group.',
      options: {
        group_resource_name: {
          displayName: 'Group Resource Name',
          shortDesc: 'The contact group to add to',
          longDesc:
            'The resource name of the contact group where the contact will be added (e.g., "contactGroups/12345").',
        },
        contact_resource_name: {
          displayName: 'Contact Resource Name',
          shortDesc: 'The contact to add to the group',
          longDesc: 'The resource name of the contact to add to the group (e.g., "people/12345").',
        },
      },
    },

    create_contact: {
      displayName: 'Create Contact',
      shortDesc: 'Create a new contact in Google Contacts.',
      longDesc:
        "Creates a new contact in Google Contacts with comprehensive information including names, contact details, addresses, organizations, relationships, and custom fields. Returns the created contact's basic information.",
      options: {
        first_name: {
          displayName: 'First Name',
          shortDesc: "Contact's first name",
          longDesc: 'The given name (first name) of the contact. This field is required.',
        },
        middle_name: {
          displayName: 'Middle Name',
          shortDesc: "Contact's middle name",
          longDesc: 'The middle name of the contact. This field is optional.',
        },
        last_name: {
          displayName: 'Last Name',
          shortDesc: "Contact's last name",
          longDesc: 'The family name (last name) of the contact. This field is required.',
        },
        name_prefix: {
          displayName: 'Name Prefix',
          shortDesc: 'Honorific prefix (e.g., Mr., Dr.)',
          longDesc: 'Honorific prefix such as "Mr.", "Ms.", "Dr.", etc. This field is optional.',
        },
        name_suffix: {
          displayName: 'Name Suffix',
          shortDesc: 'Honorific suffix (e.g., Jr., Sr.)',
          longDesc: 'Honorific suffix such as "Jr.", "Sr.", "III", etc. This field is optional.',
        },
        job_title: {
          displayName: 'Job Title',
          shortDesc: "Contact's job title",
          longDesc: "The contact's job title or position. This field is optional.",
        },
        company: {
          displayName: 'Company',
          shortDesc: "Contact's company or organization",
          longDesc:
            'The name of the company or organization where the contact works. This field is optional.',
        },
        email: {
          displayName: 'Email Address',
          shortDesc: 'Primary email address',
          longDesc:
            "The contact's primary email address. This field is optional but commonly used.",
        },
        email_type: {
          displayName: 'Email Type',
          shortDesc: 'Type of email address',
          longDesc: 'The type of email address: "home", "work", or "other". Default is "other".',
        },
        phone_number: {
          displayName: 'Phone Number',
          shortDesc: 'Primary phone number',
          longDesc: "The contact's primary phone number. This field is optional.",
        },
        phone_type: {
          displayName: 'Phone Type',
          shortDesc: 'Type of phone number',
          longDesc:
            'The type of phone number: "home", "work", "mobile", "main", "homeFax", "workFax", "pager", or "other". Default is "other".',
        },
        additional_phone_numbers: {
          displayName: 'Additional Phone Numbers',
          shortDesc: 'Additional phone numbers for the contact',
          longDesc:
            'A list of additional phone numbers with their respective types. Each entry contains a number and type.',
          type: {
            fields: {
              number: {
                displayName: 'Phone Number',
                shortDesc: 'The phone number',
                longDesc: 'The phone number value.',
              },
              type: {
                displayName: 'Phone Type',
                shortDesc: 'Type of phone number',
                longDesc:
                  'The type of phone number: "home", "work", "mobile", "main", "homeFax", "workFax", "pager", or "other". Default is "other".',
              },
            },
          },
        },
        address: {
          displayName: 'Address',
          shortDesc: "Contact's address information",
          longDesc:
            'Complete address information for the contact including street, city, state, and country.',
          type: {
            fields: {
              street: {
                displayName: 'Street Address',
                shortDesc: 'Street address',
                longDesc: 'The street address line.',
              },
              po_box: {
                displayName: 'PO Box',
                shortDesc: 'Post office box number',
                longDesc: 'Post office box number if applicable.',
              },
              neighbourhood: {
                displayName: 'Neighbourhood',
                shortDesc: 'Neighbourhood or district',
                longDesc: 'The neighbourhood, district, or extended address information.',
              },
              city: {
                displayName: 'City',
                shortDesc: 'City name',
                longDesc: 'The city or locality name.',
              },
              state: {
                displayName: 'State/Province',
                shortDesc: 'State or province',
                longDesc: 'The state, province, or region name.',
              },
              zip: {
                displayName: 'ZIP/Postal Code',
                shortDesc: 'ZIP or postal code',
                longDesc: 'The ZIP code or postal code.',
              },
              country: {
                displayName: 'Country',
                shortDesc: 'Country name',
                longDesc: 'The country name.',
              },
              type: {
                displayName: 'Address Type',
                shortDesc: 'Type of address',
                longDesc: 'The type of address: "home", "work", or "other". Default is "other".',
              },
            },
          },
        },
        birthday: {
          displayName: 'Birthday',
          shortDesc: "Contact's birthday",
          longDesc: "The contact's date of birth. Provide as a date value.",
        },
        url: {
          displayName: 'Website URL',
          shortDesc: "Contact's website or URL",
          longDesc: 'A website URL associated with the contact.',
        },
        related_person: {
          displayName: 'Related Person',
          shortDesc: 'Name of a related person',
          longDesc: 'The name of a person related to this contact (e.g., spouse, manager, etc.).',
        },
        relationship_type: {
          displayName: 'Relationship Type',
          shortDesc: 'Type of relationship',
          longDesc:
            'The type of relationship: "spouse", "child", "mother", "father", "parent", "brother", "sister", "friend", "relative", "domesticPartner", "manager", "assistant", "referredBy", "partner", or "other". Default is "other".',
        },
        custom_fields: {
          displayName: 'Custom Fields',
          shortDesc: 'Custom user-defined fields',
          longDesc: 'A hash of custom key-value pairs for storing additional contact information.',
        },
        notes: {
          displayName: 'Notes',
          shortDesc: 'Additional notes about the contact',
          longDesc: 'Free-form text notes or biography information about the contact.',
        },
      },
    },

    create_group: {
      displayName: 'Create Contact Group',
      shortDesc: 'Create a new contact group in Google Contacts.',
      longDesc:
        "Creates a new user-defined contact group in Google Contacts. The group can then be used to organize contacts. Returns the created group's information including its resource name.",
      options: {
        name: {
          displayName: 'Group Name',
          shortDesc: 'Name for the new contact group',
          longDesc:
            'The display name for the new contact group. This name will be visible in Google Contacts and must be provided.',
        },
      },
    },
  },
  triggers: {
    new_contact: {
      displayName: 'New Contact Created',
      shortDesc: 'Trigger when a new contact is created in Google Contacts.',
      longDesc:
        'This trigger activates whenever a new contact is added to Google Contacts. It provides detailed information about the newly created contact including names, email addresses, phone numbers, and more.',
    },
  },
};

export default GoogleContactsAppEn;
