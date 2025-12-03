/* eslint-disable max-len */
const BusinessCentralAppEn = {
  displayName: 'Microsoft Dynamics 365 Business Central',
  groups: ['Accounting & ERP'],
  shortDesc:
    'Comprehensive cloud-based ERP solution for managing finances, operations, sales, and customer relationships.',
  longDesc:
    'Microsoft Dynamics 365 Business Central is a comprehensive cloud-based Enterprise Resource Planning (ERP) solution designed for small to medium-sized businesses. It provides integrated capabilities for financial management, supply chain operations, sales automation, customer service, and project management. The platform offers real-time business insights through built-in analytics and reporting, enabling data-driven decision making. Business Central seamlessly integrates with the Microsoft ecosystem including Office 365, Power Platform, and Azure services, providing a unified business management experience. Features include automated workflows, customizable dashboards, mobile accessibility, and scalable architecture that grows with your business needs.',
  triggers: {
    new_record: {
      displayName: 'New Record',
      shortDesc: 'Triggers when a new record is created in Business Central.',
      longDesc:
        'Monitors for newly created records in a specified Business Central object. The trigger polls for records based on their creation timestamp and can be filtered by specific field criteria. Useful for automating workflows when new data is added to your Business Central system.',
      options: {
        object: {
          displayName: 'Object',
          shortDesc: 'Business Central object to monitor',
          longDesc:
            'The Business Central object (entity) to monitor for new records, such as customers, items, or sales orders.',
        },
        filter: {
          displayName: 'Filter',
          shortDesc: 'Optional filter criteria for records',
          longDesc:
            'Optional filter to limit which records trigger the event based on field values.',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'Field name to filter by',
                longDesc: 'The name of the field to apply the filter condition to.',
              },
              operator: {
                displayName: 'Operator',
                shortDesc: 'Filter operator',
                longDesc:
                  'The comparison operator to use for filtering (equals, not equals, greater than, less than).',
              },
              value: {
                displayName: 'Value',
                shortDesc: 'Filter value',
                longDesc: 'The value to compare against when filtering records.',
              },
            },
          },
        },
      },
    },

    updated_record: {
      displayName: 'Updated Record',
      shortDesc: 'Triggers when an existing record is modified in Business Central.',
      longDesc:
        'Monitors for recently updated records in a specified Business Central object. The trigger polls for records based on their modification timestamp and can be filtered by specific field criteria. Ideal for tracking changes and automating workflows when existing data is modified in your Business Central system.',
      options: {
        object: {
          displayName: 'Object',
          shortDesc: 'Business Central object to monitor',
          longDesc:
            'The Business Central object (entity) to monitor for updated records, such as customers, items, or sales orders.',
        },
        filter: {
          displayName: 'Filter',
          shortDesc: 'Optional filter criteria for records',
          longDesc:
            'Optional filter to limit which updated records trigger the event based on field values.',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'Field name to filter by',
                longDesc: 'The name of the field to apply the filter condition to.',
              },
              operator: {
                displayName: 'Operator',
                shortDesc: 'Filter operator',
                longDesc:
                  'The comparison operator to use for filtering (equals, not equals, greater than, less than).',
              },
              value: {
                displayName: 'Value',
                shortDesc: 'Filter value',
                longDesc: 'The value to compare against when filtering records.',
              },
            },
          },
        },
      },
    },
  },
};

export default BusinessCentralAppEn;
