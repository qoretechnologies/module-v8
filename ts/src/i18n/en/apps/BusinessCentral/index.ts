/* eslint-disable max-len */
const BusinessCentralAppEn = {
  displayName: 'Microsoft Dynamics 365 Business Central',
  groups: ['Accounting & ERP'],
  shortDesc:
    'Comprehensive cloud-based ERP solution for managing finances, operations, sales, and customer relationships.',
  longDesc:
    'Microsoft Dynamics 365 Business Central is a comprehensive cloud-based Enterprise Resource Planning (ERP) solution designed for small to medium-sized businesses. It provides integrated capabilities for financial management, supply chain operations, sales automation, customer service, and project management. The platform offers real-time business insights through built-in analytics and reporting, enabling data-driven decision making. Business Central seamlessly integrates with the Microsoft ecosystem including Office 365, Power Platform, and Azure services, providing a unified business management experience. Features include automated workflows, customizable dashboards, mobile accessibility, and scalable architecture that grows with your business needs.',
  connectionMessage: {
    title: 'Connect to Business Central',
    content: `To connect to Microsoft Dynamics 365 Business Central, you need to configure **Microsoft Entra ID (Azure AD) OAuth2** authentication.

## Setting Up Azure AD Application

1. Sign in to the [Azure Portal](https://portal.azure.com/)
2. Navigate to **Microsoft Entra ID** (formerly Azure Active Directory)
3. Select **App registrations** → **New registration**
4. Configure the application:
   - **Name**: Give your app a descriptive name (e.g., "Qore Business Central Integration")
   - **Supported account types**: Select based on your organization's needs
   - **Redirect URI**: Add the OAuth2 callback URL provided by Qore
5. Click **Register**

## Configure API Permissions

1. In your registered app, go to **API permissions**
2. Click **Add a permission** → **APIs my organization uses**
3. Search for **Dynamics 365 Business Central**
4. Select **Delegated permissions** or **Application permissions** as needed
5. Add the required permissions (e.g., \`Financials.ReadWrite.All\`, \`API.ReadWrite.All\`)
6. Click **Grant admin consent** for your organization

## Create Client Secret

1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Add a description and select an expiration period
4. Click **Add** and copy the secret value immediately (it won't be shown again)

## Connection Details

### Client ID
The **Application (client) ID** from your Azure AD app registration overview page.

### Client Secret
The secret value you created in the Certificates & secrets section.

### Tenant ID
Your **Directory (tenant) ID** from the Azure AD app registration overview page.

### Environment
The Business Central environment name (e.g., \`Production\`, \`Sandbox\`).

**Note:** Ensure your Azure AD application has the necessary API permissions granted and admin consent provided. The user authenticating must have appropriate licenses and permissions in Business Central.`,
  },
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
