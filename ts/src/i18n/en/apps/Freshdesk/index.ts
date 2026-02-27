

const FreshdeskAppEn = {
  displayName: 'Freshdesk',
  groups: ['Customer Support & Helpdesk'],
  shortDesc: 'Cloud-based customer support software',
  longDesc:
    'Freshdesk is a cloud-based customer support platform that was founded with the mission of enabling companies of all sizes to provide great customer service. Our goal is simple: make it easy for brands to talk to their customers and make it easy for users to get in touch with businesses.',
  connectionMessage: {
    title: 'Connect to Freshdesk',
    content: `To connect to Freshdesk, you will need your **Subdomain** and **API Key**.

## Finding Your Subdomain

Your Freshdesk subdomain is the unique identifier in your Freshdesk URL:
- If your Freshdesk URL is \`https://yourcompany.freshdesk.com\`, your subdomain is \`yourcompany\`

## Getting Your API Key

1. Log in to your Freshdesk account
2. Click on your **profile icon** in the top right corner
3. Select **Profile settings**
4. Scroll down to find your **API Key** section
5. Click **View API Key** to reveal your key
6. Copy the API key

## Connection Details

### Subdomain
Your Freshdesk subdomain (e.g., \`yourcompany\` from \`yourcompany.freshdesk.com\`). Do not include the full URL, just the subdomain portion.

### API Key
Your personal Freshdesk API key. This key is tied to your user account and inherits your permissions within Freshdesk.

**Note:** Your API key provides access based on your user role and permissions in Freshdesk. For production integrations, consider using a dedicated service account with appropriate permissions. Keep your API key secure and never share it publicly.`,
  },
  triggers: {
    new_ticket_trigger: {
      displayName: 'New Ticket',
      shortDesc: 'Triggers when a new ticket is created in Freshdesk.',
      longDesc:
        'Fires whenever a new ticket is created in your Freshdesk instance. You can capture details such as subject, description, priority, and more, and use this data in subsequent actions or notifications.',
      options: {
        ticketStatus: {
          displayName: 'Ticket Status Filter',
          shortDesc: 'Filters by ticket status',
          longDesc:
            'Restrict or filter the trigger to only fire for tickets matching a certain status (e.g. Open, Pending, Resolved, etc.).',
        },
        ticketPriority: {
          displayName: 'Ticket Priority Filter',
          shortDesc: 'Filters by ticket priority',
          longDesc:
            'Restrict or filter the trigger to only fire for tickets matching a certain priority (e.g. Low, Medium, High).',
        },
      },
      event_info: {
        desc: 'Structure and types for Freshdesk’s new ticket data payload.',
      },
    },

    new_contact_trigger: {
      displayName: 'New Contact',
      shortDesc: 'Triggers when a new contact is created in Freshdesk.',
      longDesc:
        'Fires whenever a new contact is added to your Freshdesk instance. Capture details such as name, email, phone, and any custom fields associated with the contact.',
      event_info: {
        desc: 'Structure and types for Freshdesk’s new contact data payload.',
      },
    },

    updated_ticket_trigger: {
      displayName: 'Updated Ticket',
      shortDesc: 'Triggers when an existing ticket is updated in Freshdesk.',
      longDesc:
        'Fires whenever an existing ticket is updated with new details in your Freshdesk instance. For example, changes to subject, priority, status, or assigned agent.',
      event_info: {
        desc: 'Structure and types for Freshdesk’s updated ticket data payload.',
      },
    },

    updated_contact_trigger: {
      displayName: 'Updated Contact',
      shortDesc: 'Triggers when an existing contact is updated in Freshdesk.',
      longDesc:
        "Fires whenever an existing contact's details are updated in your Freshdesk instance. For example, changes to name, phone number, email, or custom fields.",
      event_info: {
        desc: "Structure and types for Freshdesk's updated contact data payload.",
      },
    },
  },
  searchOptions: {
    orderBy: {
      displayName: 'Order By',
      shortDesc: 'Sort results by a specific field',
      longDesc: 'Define the field and direction to sort search results',
      type: {
        fields: {
          field: {
            displayName: 'Field',
            shortDesc: 'The field to sort by',
            longDesc: 'The name of the field to use for sorting results',
          },
          direction: {
            displayName: 'Direction',
            shortDesc: 'Sort direction',
            longDesc: 'The direction to sort results (ascending or descending)',
          },
        },
      },
    },
  },
  expressions: {
    '&&': {
      displayName: 'And',
      shortDesc: 'Logical AND operator',
      longDesc: 'Combines multiple conditions where all must be true',
    },
    '||': {
      displayName: 'Or',
      shortDesc: 'Logical OR operator',
      longDesc: 'Combines multiple conditions where at least one must be true',
    },
    '==': {
      displayName: 'Equals',
      shortDesc: 'Field equals value',
      longDesc: 'Matches records where the field equals the specified value',
    },
    '!=': {
      displayName: 'Not Equals',
      shortDesc: 'Field does not equal value',
      longDesc: 'Matches records where the field does not equal the specified value',
    },
    '>': {
      displayName: 'Greater Than',
      shortDesc: 'Field is greater than value',
      longDesc: 'Matches records where the field value is greater than the specified value',
    },
    '>=': {
      displayName: 'Greater Than or Equal',
      shortDesc: 'Field is greater than or equal to value',
      longDesc: 'Matches records where the field value is greater than or equal to the specified value',
    },
    '<': {
      displayName: 'Less Than',
      shortDesc: 'Field is less than value',
      longDesc: 'Matches records where the field value is less than the specified value',
    },
    '<=': {
      displayName: 'Less Than or Equal',
      shortDesc: 'Field is less than or equal to value',
      longDesc: 'Matches records where the field value is less than or equal to the specified value',
    },
    contains: {
      displayName: 'Contains',
      shortDesc: 'Field contains value',
      longDesc: 'Matches records where the field contains the specified substring',
    },
    'is-set': {
      displayName: 'Is Set',
      shortDesc: 'Field has a value',
      longDesc: 'Matches records where the field has a value (is not empty)',
    },
    'is-not-set': {
      displayName: 'Is Not Set',
      shortDesc: 'Field has no value',
      longDesc: 'Matches records where the field has no value (is empty)',
    },
  },
};

export default FreshdeskAppEn;
