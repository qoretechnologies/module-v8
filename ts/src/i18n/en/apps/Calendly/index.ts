/* eslint-disable max-len */
const CalendlyAppEn = {
  displayName: 'Calendly',
  groups: ['Forms, Surveys & Scheduling', 'Video Conferencing & Meetings'],
  shortDesc: 'Schedule meetings and manage appointments with Calendly integration',
  longDesc:
    'Connect to Calendly to automate scheduling workflows, manage event types, and sync calendar data with your automation processes.',
  triggers: {
    event_canceled: {
      displayName: 'Event Canceled',
      shortDesc: 'Triggers when a Calendly event is canceled',
      longDesc:
        'This trigger activates when any scheduled event in your Calendly account is canceled by either the organizer or invitee.',
      options: {},
    },
    invitee_created: {
      displayName: 'Invitee Created',
      shortDesc: 'Triggers when a new invitee is created',
      longDesc:
        'This trigger activates when someone books a meeting and becomes an invitee for a scheduled event.',
      options: {
        scope: {
          displayName: 'Scope',
          shortDesc: 'The scope for monitoring invitee creation',
          longDesc:
            'Defines the level at which to monitor for new invitees - organization-wide, specific user, or specific group.',
        },
        group: {
          displayName: 'Group',
          shortDesc: 'The specific group to monitor',
          longDesc: 'Select the group to monitor for new invitees when scope is set to group.',
        },
      },
    },
    invitee_canceled: {
      displayName: 'Invitee Canceled',
      shortDesc: 'Triggers when an invitee cancels their booking',
      longDesc:
        'This trigger activates when an invitee cancels their scheduled meeting or appointment.',
      options: {
        scope: {
          displayName: 'Scope',
          shortDesc: 'The scope for monitoring invitee cancellations',
          longDesc:
            'Defines the level at which to monitor for invitee cancellations - organization-wide, specific user, or specific group.',
        },
        group: {
          displayName: 'Group',
          shortDesc: 'The specific group to monitor',
          longDesc:
            'Select the group to monitor for invitee cancellations when scope is set to group.',
        },
      },
    },
    invitee_no_show_created: {
      displayName: 'Invitee No-Show Created',
      shortDesc: 'Triggers when an invitee is marked as a no-show',
      longDesc:
        'This trigger activates when an invitee fails to attend their scheduled meeting and is marked as a no-show.',
      options: {
        scope: {
          displayName: 'Scope',
          shortDesc: 'The scope for monitoring no-show events',
          longDesc:
            'Defines the level at which to monitor for no-show events - organization-wide, specific user, or specific group.',
        },
        group: {
          displayName: 'Group',
          shortDesc: 'The specific group to monitor',
          longDesc: 'Select the group to monitor for no-show events when scope is set to group.',
        },
      },
    },
    new_form_submission_created: {
      displayName: 'New Form Submission Created',
      shortDesc: 'Triggers when a routing form submission is created',
      longDesc:
        'This trigger activates when someone submits a routing form, which helps direct them to the appropriate scheduling option.',
      options: {},
    },
  },
  actions: {
    cancel_event: {
      displayName: 'Cancel Event',
      shortDesc: 'Cancel a scheduled Calendly event',
      longDesc:
        'Cancels a scheduled event in Calendly and notifies all participants about the cancellation.',
      options: {
        event_id: {
          displayName: 'Event ID',
          shortDesc: 'The ID of the event to cancel',
          longDesc: 'Select the specific event that you want to cancel from your scheduled events.',
        },
        reason: {
          displayName: 'Cancellation Reason',
          shortDesc: 'Reason for canceling the event',
          longDesc:
            'Optional reason that will be included in the cancellation notification sent to participants.',
        },
      },
    },
    get_group: {
      displayName: 'Get Group',
      shortDesc: 'Retrieve details of a specific group',
      longDesc:
        'Fetches comprehensive information about a specific group within your Calendly organization, including member count and organization details.',
      options: {
        group_id: {
          displayName: 'Group ID',
          shortDesc: 'The ID of the group to retrieve',
          longDesc:
            'Select the specific group whose details you want to retrieve from your organization.',
        },
      },
    },
    create_scheduling_link: {
      displayName: 'Create Scheduling Link',
      shortDesc: 'Create a scheduling link for an event type',
      longDesc:
        'Generates a scheduling link that can be shared with others to book meetings for a specific event type.',
      options: {
        max_event_count: {
          displayName: 'Maximum Event Count',
          shortDesc: 'Maximum number of events that can be scheduled',
          longDesc:
            'The maximum number of events that can be scheduled using this link before it becomes inactive.',
        },
        event_type: {
          displayName: 'Event Type',
          shortDesc: 'The type of event to create a scheduling link for',
          longDesc:
            'Select the event type that people will be able to book when using this scheduling link.',
        },
      },
    },
    get_event: {
      displayName: 'Get Event',
      shortDesc: 'Retrieve details of a specific event',
      longDesc:
        'Fetches comprehensive information about a scheduled event including participants, timing, and meeting details.',
      options: {
        event_id: {
          displayName: 'Event ID',
          shortDesc: 'The ID of the event to retrieve',
          longDesc: 'Select the specific event whose details you want to retrieve.',
        },
      },
    },
    get_event_invitee: {
      displayName: 'Get Event Invitee',
      shortDesc: 'Retrieve details of a specific event invitee',
      longDesc:
        'Fetches detailed information about a specific invitee for an event, including their contact information and responses.',
      options: {
        event_id: {
          displayName: 'Event ID',
          shortDesc: 'The ID of the event',
          longDesc: 'Select the event for which you want to retrieve invitee information.',
        },
        invitee: {
          displayName: 'Invitee',
          shortDesc: 'The invitee to retrieve details for',
          longDesc: 'Select the specific invitee whose information you want to retrieve.',
        },
      },
    },
    get_event_type: {
      displayName: 'Get Event Type',
      shortDesc: 'Retrieve details of a specific event type',
      longDesc:
        'Fetches comprehensive information about an event type including duration, settings, and configuration.',
      options: {
        event_type_id: {
          displayName: 'Event Type ID',
          shortDesc: 'The ID of the event type to retrieve',
          longDesc: 'Select the specific event type whose details you want to retrieve.',
        },
      },
    },
    list_event_invitees: {
      displayName: 'List Event Invitees',
      shortDesc: 'List all invitees for a specific event',
      longDesc:
        'Retrieves a list of all invitees for a scheduled event with their status and contact information.',
      options: {
        event_id: {
          displayName: 'Event ID',
          shortDesc: 'The ID of the event',
          longDesc: 'Select the event for which you want to list all invitees.',
        },
        count: {
          displayName: 'Count',
          shortDesc: 'Number of invitees to return',
          longDesc: 'The maximum number of invitees to return in the response (default is 20).',
        },
        page_token: {
          displayName: 'Page Token',
          shortDesc: 'Token for pagination',
          longDesc:
            'Use this token to retrieve the next page of results when there are more invitees than the count limit.',
        },
        email: {
          displayName: 'Email Filter',
          shortDesc: 'Filter invitees by email address',
          longDesc: 'Filter the results to only include invitees with this specific email address.',
        },
        sort: {
          displayName: 'Sort Options',
          shortDesc: 'How to sort the invitees list',
          longDesc: 'Configure how the list of invitees should be sorted.',
          type: {
            fields: {
              direction: {
                displayName: 'Sort Direction',
                shortDesc: 'Direction to sort (ascending or descending)',
                longDesc: 'Choose whether to sort in ascending or descending order.',
              },
              field: {
                displayName: 'Sort Field',
                shortDesc: 'Field to sort by',
                longDesc: 'Choose which field to use for sorting the invitees.',
              },
            },
          },
        },
        status: {
          displayName: 'Status Filter',
          shortDesc: 'Filter invitees by their status',
          longDesc:
            'Filter the results to only include invitees with the specified status (active or canceled).',
        },
      },
    },
    list_events: {
      displayName: 'List Events',
      shortDesc: 'List scheduled events',
      longDesc:
        'Retrieves a list of scheduled events with optional filtering and sorting capabilities.',
      options: {
        count: {
          displayName: 'Count',
          shortDesc: 'Number of events to return',
          longDesc: 'The maximum number of events to return in the response (default is 20).',
        },
        group: {
          displayName: 'Group Filter',
          shortDesc: 'Filter events by group',
          longDesc: 'Filter the results to only include events associated with a specific group.',
        },
        invitee_email: {
          displayName: 'Invitee Email Filter',
          shortDesc: 'Filter events by invitee email',
          longDesc:
            'Filter the results to only include events where the specified email address is an invitee.',
        },
        max_start_time: {
          displayName: 'Maximum Start Time',
          shortDesc: 'Latest start time for events',
          longDesc: 'Filter events to only include those that start before this date and time.',
        },
        min_start_time: {
          displayName: 'Minimum Start Time',
          shortDesc: 'Earliest start time for events',
          longDesc: 'Filter events to only include those that start after this date and time.',
        },
        page_token: {
          displayName: 'Page Token',
          shortDesc: 'Token for pagination',
          longDesc:
            'Use this token to retrieve the next page of results when there are more events than the count limit.',
        },
        sort: {
          displayName: 'Sort Options',
          shortDesc: 'How to sort the events list',
          longDesc: 'Configure how the list of events should be sorted.',
          type: {
            fields: {
              direction: {
                displayName: 'Sort Direction',
                shortDesc: 'Direction to sort (ascending or descending)',
                longDesc: 'Choose whether to sort in ascending or descending order.',
              },
              field: {
                displayName: 'Sort Field',
                shortDesc: 'Field to sort by',
                longDesc:
                  'Choose which field to use for sorting the events (start_time or end_time).',
              },
            },
          },
        },
        organization: {
          displayName: 'Organization',
          shortDesc: 'Organization to filter by',
          longDesc: 'Filter events to only include those from a specific organization.',
        },
        user: {
          displayName: 'User Filter',
          shortDesc: 'Filter events by user',
          longDesc: 'Filter the results to only include events associated with a specific user.',
        },
      },
    },
    list_event_types: {
      displayName: 'List Event Types',
      shortDesc: 'List available event types',
      longDesc: 'Retrieves a list of event types that can be used for scheduling meetings.',
      options: {
        count: {
          displayName: 'Count',
          shortDesc: 'Number of event types to return',
          longDesc: 'The maximum number of event types to return in the response (default is 20).',
        },
        page_token: {
          displayName: 'Page Token',
          shortDesc: 'Token for pagination',
          longDesc:
            'Use this token to retrieve the next page of results when there are more event types than the count limit.',
        },
        sort: {
          displayName: 'Sort Options',
          shortDesc: 'How to sort the event types list',
          longDesc: 'Configure how the list of event types should be sorted.',
          type: {
            fields: {
              direction: {
                displayName: 'Sort Direction',
                shortDesc: 'Direction to sort (ascending or descending)',
                longDesc: 'Choose whether to sort in ascending or descending order.',
              },
              field: {
                displayName: 'Sort Field',
                shortDesc: 'Field to sort by',
                longDesc:
                  'Choose which field to use for sorting the event types (name, position, created_at, or updated_at).',
              },
            },
          },
        },
        organization: {
          displayName: 'Organization',
          shortDesc: 'Organization to filter by',
          longDesc: 'Filter event types to only include those from a specific organization.',
        },
        user: {
          displayName: 'User Filter',
          shortDesc: 'Filter event types by user',
          longDesc:
            'Filter the results to only include event types associated with a specific user.',
        },
        admin_managed: {
          displayName: 'Admin Managed Filter',
          shortDesc: 'Filter by admin-managed status',
          longDesc: 'Filter event types based on whether they are managed by an administrator.',
        },
        active: {
          displayName: 'Active Filter',
          shortDesc: 'Filter by active status',
          longDesc:
            'Filter event types based on whether they are currently active and available for booking.',
        },
        user_availability_schedule: {
          displayName: 'User Availability Schedule',
          shortDesc: 'Filter by user availability schedule',
          longDesc: 'Filter event types based on a specific user availability schedule.',
        },
      },
    },
    list_groups: {
      displayName: 'List Groups',
      shortDesc: 'List available groups',
      longDesc:
        'Retrieves a list of groups within an organization that can be used for organizing events and users.',
      options: {
        count: {
          displayName: 'Count',
          shortDesc: 'Number of groups to return',
          longDesc: 'The maximum number of groups to return in the response (default is 20).',
        },
        page_token: {
          displayName: 'Page Token',
          shortDesc: 'Token for pagination',
          longDesc:
            'Use this token to retrieve the next page of results when there are more groups than the count limit.',
        },
        organization: {
          displayName: 'Organization',
          shortDesc: 'Organization to list groups from',
          longDesc: 'The organization from which to retrieve the list of groups.',
        },
      },
    },
    list_organization_members: {
      displayName: 'List Organization Members',
      shortDesc: 'List members of an organization',
      longDesc:
        'Retrieves a list of all members within a Calendly organization along with their roles and information.',
      options: {
        count: {
          displayName: 'Count',
          shortDesc: 'Number of members to return',
          longDesc:
            'The maximum number of organization members to return in the response (default is 20).',
        },
        page_token: {
          displayName: 'Page Token',
          shortDesc: 'Token for pagination',
          longDesc:
            'Use this token to retrieve the next page of results when there are more members than the count limit.',
        },
        email: {
          displayName: 'Email Filter',
          shortDesc: 'Filter members by email address',
          longDesc: 'Filter the results to only include members with this specific email address.',
        },
        organization: {
          displayName: 'Organization',
          shortDesc: 'Organization to list members from',
          longDesc: 'The organization from which to retrieve the list of members.',
        },
      },
    },
  },
};

export default CalendlyAppEn;
