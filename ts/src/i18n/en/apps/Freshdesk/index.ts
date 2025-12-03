

const FreshdeskAppEn = {
  displayName: 'Freshdesk',
  groups: ['Customer Support & Helpdesk'],
  shortDesc: 'Cloud-based customer support software',
  longDesc:
    'Freshdesk is a cloud-based customer support platform that was founded with the mission of enabling companies of all sizes to provide great customer service. Our goal is simple: make it easy for brands to talk to their customers and make it easy for users to get in touch with businesses.',
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
        'Fires whenever an existing contact’s details are updated in your Freshdesk instance. For example, changes to name, phone number, email, or custom fields.',
      event_info: {
        desc: 'Structure and types for Freshdesk’s updated contact data payload.',
      },
    },
  },
};

export default FreshdeskAppEn;
