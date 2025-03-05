export const HubspotAssociationsEn = {
  displayName: 'HubSpot Associations',
  shortDesc: 'Define relationships between HubSpot objects',
  longDesc:
    'Associations create connections between different HubSpot objects such as contacts, companies, deals, tickets, and custom objects.',
  type: {
    element_type: {
      fields: {
        to: {
          displayName: 'Target Object',
          shortDesc: 'The HubSpot object to create an association with',
          longDesc:
            'Specifies the target HubSpot object (company, contact, deal, etc.) that will be associated with the current object.',
          type: {
            fields: {
              id: {
                displayName: 'Object ID',
                shortDesc: 'Unique identifier of the target object',
                longDesc:
                  'The unique identifier (ID) of the HubSpot object being associated with. This could be a company ID, contact ID, deal ID, etc.',
              },
            },
          },
        },
        types: {
          displayName: 'Association Types',
          shortDesc: 'Types of relationship between objects',
          longDesc:
            'Defines the nature and direction of the relationship between the two HubSpot objects being associated.',
          type: {
            element_type: {
              fields: {
                associationTypeId: {
                  displayName: 'Association Type ID',
                  shortDesc: 'Numeric identifier of the association type',
                  longDesc:
                    'A numeric ID that defines the type of association (e.g., 1 for company-to-contact, 3 for deal-to-contact). Each ID represents a specific directional relationship between two object types.',
                },
                associationCategory: {
                  displayName: 'Association Category',
                  shortDesc: 'Category of the association type',
                  longDesc:
                    'Categorizes the association as either "HUBSPOT_DEFINED" (built-in system associations) or "USER_DEFINED" (custom associations created by users). Most standard associations use HUBSPOT_DEFINED.',
                },
              },
            },
          },
        },
      },
    },
  },
};
