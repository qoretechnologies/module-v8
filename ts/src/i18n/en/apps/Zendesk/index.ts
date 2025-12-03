const ZendeskAppEn = {
  displayName: 'Zendesk',
  groups: ['Customer Support & Helpdesk'],
  shortDesc: 'Collection of actions to interact with the Zendesk API',
  longDesc: 'Collection of actions to interact with the Zendesk API',
  triggers: {
    new_user: {
      displayName: 'New User',
      shortDesc: 'Triggers when a new user is created',
      longDesc: 'Triggers when a new user is created',
      event_info: {
        desc: 'Zendesk User Event Data',
        type: {
          fields: {
            account_id: {
              displayName: 'Account ID',
              shortDesc: 'Account ID',
              longDesc: 'ID of the associated account',
            },
            detail: {
              displayName: 'Detail',
              shortDesc: 'User details',
              longDesc: 'Detailed user information',
              type: {
                fields: {
                  created_at: {
                    displayName: 'Created At',
                    shortDesc: 'User creation time',
                    longDesc: 'Timestamp of user creation',
                  },
                  default_group_id: {
                    displayName: 'Default Group ID',
                    shortDesc: 'Default group ID',
                    longDesc: 'ID of the default group for the user',
                  },
                  email: {
                    displayName: 'Email',
                    shortDesc: 'User email',
                    longDesc: 'Email address of the user',
                  },
                  external_id: {
                    displayName: 'External ID',
                    shortDesc: 'User external ID',
                    longDesc: 'External identifier for the user',
                  },
                  id: {
                    displayName: 'User ID',
                    shortDesc: 'User ID',
                    longDesc: 'Unique identifier for the user',
                  },
                  organization_id: {
                    displayName: 'Organization ID',
                    shortDesc: 'Organization ID',
                    longDesc: 'ID of the organization associated with the user',
                  },
                  role: {
                    displayName: 'Role',
                    shortDesc: 'User role',
                    longDesc: 'Role of the user in the system',
                  },
                  updated_at: {
                    displayName: 'Updated At',
                    shortDesc: 'User update time',
                    longDesc: 'Last update timestamp for the user',
                  },
                },
              },
            },
            event: {
              displayName: 'Event',
              shortDesc: 'Event info',
              longDesc: 'Additional event information',
            },
            id: {
              displayName: 'Event ID',
              shortDesc: 'Event ID',
              longDesc: 'Unique identifier for the event',
            },
            subject: {
              displayName: 'Subject',
              shortDesc: 'Event subject',
              longDesc: 'Subject of the event',
            },
            time: {
              displayName: 'Time',
              shortDesc: 'Event time',
              longDesc: 'Timestamp of the event occurrence',
            },
            type: {
              displayName: 'Event Type',
              shortDesc: 'Event type',
              longDesc: 'Type of the event',
            },
            zendesk_event_version: {
              displayName: 'Zendesk Event Version',
              shortDesc: 'Event version',
              longDesc: 'Version of the Zendesk event format',
            },
          },
        },
      },
    },
    new_ticket: {
      displayName: 'New Ticket',
      shortDesc: 'Triggers when a new ticket is created',
      longDesc: 'Triggers when a new ticket is created',
      event_info: {
        desc: 'New Ticket Event Data',
        type: {
          fields: {
            assignee_email: {
              displayName: 'Assignee Email',
              shortDesc: 'Assignee email',
              longDesc: 'Email of the assignee',
            },
            assignee_name: {
              displayName: 'Assignee Name',
              shortDesc: 'Assignee name',
              longDesc: 'Name of the assignee',
            },
            group_name: {
              displayName: 'Group Name',
              shortDesc: 'Group name',
              longDesc: 'Name of the group handling the ticket',
            },
            organization_name: {
              displayName: 'Organization Name',
              shortDesc: 'Organization name',
              longDesc: 'Name of the associated organization',
            },
            requester_email: {
              displayName: 'Requester Email',
              shortDesc: 'Requester email',
              longDesc: 'Email of the requester',
            },
            requester_name: {
              displayName: 'Requester Name',
              shortDesc: 'Requester name',
              longDesc: 'Name of the requester',
            },
            tags: {
              displayName: 'Tags',
              shortDesc: 'Ticket tags',
              longDesc: 'Tags associated with the ticket',
            },
            ticket_description: {
              displayName: 'Ticket Description',
              shortDesc: 'Ticket description',
              longDesc: 'Description of the ticket',
            },
            ticket_id: {
              displayName: 'Ticket ID',
              shortDesc: 'Ticket ID',
              longDesc: 'Unique identifier for the ticket',
            },
            ticket_priority: {
              displayName: 'Ticket Priority',
              shortDesc: 'Ticket priority',
              longDesc: 'Priority level of the ticket',
            },
            ticket_status: {
              displayName: 'Ticket Status',
              shortDesc: 'Ticket status',
              longDesc: 'Current status of the ticket',
            },
            ticket_subject: {
              displayName: 'Ticket Subject',
              shortDesc: 'Ticket subject',
              longDesc: 'Subject of the ticket',
            },
            ticket_type: {
              displayName: 'Ticket Type',
              shortDesc: 'Ticket type',
              longDesc: 'Type of the ticket',
            },
            ticket_url: {
              displayName: 'Ticket URL',
              shortDesc: 'Ticket URL',
              longDesc: 'URL of the ticket in the system',
            },
          },
        },
      },
    },
    new_organization: {
      displayName: 'New Organization',
      shortDesc: 'Triggers when a new organization is created',
      longDesc: 'Triggers when a new organization is created',
      event_info: {
        desc: 'Zendesk Organization Event Data',
        type: {
          fields: {
            account_id: {
              displayName: 'Account ID',
              shortDesc: 'Account ID',
              longDesc: 'ID of the associated account',
            },
            detail: {
              displayName: 'Detail',
              shortDesc: 'Organization details',
              longDesc: 'Detailed organization information',
              type: {
                fields: {
                  created_at: {
                    displayName: 'Created At',
                    shortDesc: 'Organization creation time',
                    longDesc: 'Timestamp of organization creation',
                  },
                  external_id: {
                    displayName: 'External ID',
                    shortDesc: 'Organization external ID',
                    longDesc: 'External identifier for the organization',
                  },
                  group_id: {
                    displayName: 'Group ID',
                    shortDesc: 'Group ID',
                    longDesc: 'ID of the associated group',
                  },
                  id: {
                    displayName: 'Organization ID',
                    shortDesc: 'Organization ID',
                    longDesc: 'Unique identifier for the organization',
                  },
                  name: {
                    displayName: 'Name',
                    shortDesc: 'Organization name',
                    longDesc: 'Name of the organization',
                  },
                  shared_comments: {
                    displayName: 'Shared Comments',
                    shortDesc: 'Shared comments',
                    longDesc: 'Indicates if comments are shared',
                  },
                  shared_tickets: {
                    displayName: 'Shared Tickets',
                    shortDesc: 'Shared tickets',
                    longDesc: 'Indicates if tickets are shared',
                  },
                  updated_at: {
                    displayName: 'Updated At',
                    shortDesc: 'Organization update time',
                    longDesc: 'Last update timestamp for the organization',
                  },
                },
              },
            },
            event: {
              displayName: 'Event',
              shortDesc: 'Event info',
              longDesc: 'Additional event information',
            },
            id: {
              displayName: 'Event ID',
              shortDesc: 'Event ID',
              longDesc: 'Unique identifier for the event',
            },
            subject: {
              displayName: 'Subject',
              shortDesc: 'Event subject',
              longDesc: 'Subject of the event',
            },
            time: {
              displayName: 'Time',
              shortDesc: 'Event time',
              longDesc: 'Timestamp of the event occurrence',
            },
            type: {
              displayName: 'Event Type',
              shortDesc: 'Event type',
              longDesc: 'Type of the event',
            },
            zendesk_event_version: {
              displayName: 'Zendesk Event Version',
              shortDesc: 'Event version',
              longDesc: 'Version of the Zendesk event format',
            },
          },
        },
      },
    },
  },
  actions: {
    ShowAccountSettings: {
      groups: ['Settings'],
    },
    ShowAttachment: {
      groups: ['Attachments'],
    },
    ListGroups: {
      groups: ['Groups'],
    },
    CreateGroup: {
      groups: ['Groups'],
      options: {
        group: {
          displayName: 'Group',
          shortDesc: 'Group',
          longDesc: 'Group',
          type: {
            fields: {
              name: {
                displayName: 'Name',
                shortDesc: 'Group name',
                longDesc: 'Group name',
              },
              description: {
                displayName: 'Description',
                shortDesc: 'Group description',
                longDesc: 'Group description',
              },
              default: {
                displayName: 'Default',
                shortDesc: 'Default group assignment for team members in Zendesk.',
                longDesc:
                  "Team members will automatically be assigned to this group when they're added to Zendesk. There can only be one default group.",
              },
              is_public: {
                displayName: 'Public',
                shortDesc: 'Public group visibility',
                longDesc: 'Indicates if the group should be public. Default is true.',
              },
              user_ids: {
                displayName: 'User IDs',
                shortDesc: 'Users to add to the group',
                longDesc: 'List of user IDs to be added to the group',
              },
            },
          },
        },
      },
    },
    DeleteGroup: {
      groups: ['Groups'],
    },
    ShowGroupById: {
      groups: ['Groups'],
    },
    UpdateGroup: {
      groups: ['Groups'],
      options: {
        group_id: {
          displayName: 'Group ID',
          shortDesc: 'Group ID',
          longDesc: 'Group ID',
        },
        group: {
          displayName: 'Group',
          shortDesc: 'Group information',
          longDesc: 'Details about the group settings in Zendesk',
          type: {
            fields: {
              name: {
                displayName: 'Name',
                shortDesc: 'Group name',
                longDesc: 'The name of the group',
              },
              description: {
                displayName: 'Description',
                shortDesc: 'Group description',
                longDesc: 'A description of the group',
              },
              default: {
                displayName: 'Default',
                shortDesc: 'Default group assignment',
                longDesc:
                  "Team members will automatically be assigned to this group when they're added to Zendesk. There can only be one default group.",
              },
              is_public: {
                displayName: 'Public',
                shortDesc: 'Public group visibility',
                longDesc: 'Indicates whether the group should be public. Default is true.',
              },
              user_ids: {
                displayName: 'User IDs',
                shortDesc: 'List of user IDs',
                longDesc: 'The IDs of users to be added to the group',
              },
            },
          },
        },
      },
    },
    ListOrganizations: {
      groups: ['Organizations'],
    },
    CreateOrganization: {
      groups: ['Organizations'],
    },
    DeleteOrganization: {
      groups: ['Organizations'],
    },
    ShowOrganization: {
      groups: ['Organizations'],
    },
    UpdateOrganization: {
      groups: ['Organizations'],
      options: {
        name: {
          displayName: 'Name',
          shortDesc: 'Organization name',
          longDesc: 'Organization name',
        },
        group_id: {
          displayName: 'Group ID',
          shortDesc: 'Group ID',
          longDesc: 'Group ID',
        },
        notes: {
          displayName: 'Notes',
          shortDesc: 'Notes about the organization',
          longDesc: 'Notes about the organization',
        },
        details: {
          displayName: 'Details',
          shortDesc: 'Details',
          longDesc: 'Details',
        },
      },
    },
    ListSearchResults: {
      groups: ['Search'],
    },
    ListTickets: {
      groups: ['Tickets'],
    },
    CreateTicket: {
      groups: ['Tickets'],
    },
    CountTickets: {
      groups: ['Tickets'],
    },
    DeleteTicket: {
      groups: ['Tickets'],
    },
    ShowTicket: {
      groups: ['Tickets'],
    },
    UpdateTicket: {
      groups: ['Tickets'],
    },
    ListTicketMetrics: {
      groups: ['Ticket Metrics'],
    },
    ShowTicketMetrics: {
      groups: ['Ticket Metrics'],
    },
    DeleteUpload: {
      groups: ['Uploads'],
    },
    ListUsers: {
      groups: ['Users'],
    },
    CreateUser: {
      groups: ['Users'],
      options: {
        user: {
          displayName: 'User',
          shortDesc: 'User information',
          longDesc: 'Details about the user in Zendesk',
          type: {
            fields: {
              name: {
                displayName: 'Name',
                shortDesc: "User's name",
                longDesc: 'The full name of the user',
              },
              email: {
                displayName: 'Email',
                shortDesc: "User's email address",
                longDesc: 'The email address associated with the user',
              },
              phone: {
                displayName: 'Phone',
                shortDesc: "User's phone number",
                longDesc: 'The phone number associated with the user',
              },
              notes: {
                displayName: 'Notes',
                shortDesc: 'User notes',
                longDesc: 'Additional notes or comments about the user',
              },
              details: {
                displayName: 'Details',
                shortDesc: 'Additional details',
                longDesc: 'Detailed information about the user',
              },
              role: {
                displayName: 'Role',
                shortDesc: 'User role',
                longDesc: 'The role assigned to the user in the system',
              },
              organization_ids: {
                displayName: 'Organization IDs',
                shortDesc: 'List of organization IDs',
                longDesc: 'The IDs of the organizations the user is associated with',
              },
            },
          },
        },
      },
    },
    DeleteUser: {
      groups: ['Users'],
    },
    ShowUser: {
      groups: ['Users'],
    },
    UpdateUser: {
      groups: ['Users'],
      options: {
        user: {
          displayName: 'User',
          shortDesc: 'User information',
          longDesc: 'Details about the user in the Zendesk system',
          type: {
            fields: {
              name: {
                displayName: 'Name',
                shortDesc: "User's name",
                longDesc: 'The full name of the user',
              },
              email: {
                displayName: 'Email',
                shortDesc: "User's email address",
                longDesc: 'The email address associated with the user',
              },
              phone: {
                displayName: 'Phone',
                shortDesc: "User's phone number",
                longDesc: 'The phone number associated with the user',
              },
              notes: {
                displayName: 'Notes',
                shortDesc: 'User notes',
                longDesc: 'Additional notes or comments about the user',
              },
              details: {
                displayName: 'Details',
                shortDesc: 'Additional details',
                longDesc: 'Additional detailed information about the user',
              },
              role: {
                displayName: 'Role',
                shortDesc: 'User role',
                longDesc: 'The role assigned to the user within the system',
              },
              organization_ids: {
                displayName: 'Organization IDs',
                shortDesc: 'List of organization IDs',
                longDesc: 'The IDs of the organizations the user is associated with',
              },
            },
          },
        },
      },
    },
  },
};

export default ZendeskAppEn;
