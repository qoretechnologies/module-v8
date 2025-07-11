/* eslint-disable max-len */
const KlaviyoAppEn = {
  displayName: 'Klaviyo',
  shortDesc: 'Email and SMS marketing automation platform',
  longDesc:
    'Klaviyo is a unified customer platform that gives online brands direct ownership of their consumer data and interactions, empowering them to turn transactions with customers into productive long-term relationships.',
  actions: {
    get_profile: {
      displayName: 'Get Profile',
      shortDesc: 'Retrieves a specific profile',
      longDesc: 'Retrieves detailed information about a specific profile by its ID',
      options: {
        id: {
          displayName: 'Profile ID',
          shortDesc: 'The ID of the profile to retrieve',
          longDesc: 'The unique identifier of the profile you want to retrieve',
        },
        additionalFields: {
          displayName: 'Additional Fields',
          shortDesc: 'Additional profile fields to include',
          longDesc: 'Optional additional fields to include in the profile response',
        },
      },
    },
    list_campaigns: {
      displayName: 'List Campaigns',
      shortDesc: 'Lists campaigns',
      longDesc: 'Retrieves a list of campaigns with optional filtering and sorting',
      options: {
        cursor: {
          displayName: 'Cursor',
          shortDesc: 'Pagination cursor',
          longDesc: 'Cursor for pagination to get the next set of results',
        },
        pageSize: {
          displayName: 'Page Size',
          shortDesc: 'Number of items per page',
          longDesc: 'The number of campaigns to return per page',
        },
        channel: {
          displayName: 'Channel',
          shortDesc: 'Campaign channel type',
          longDesc: 'The channel type to filter campaigns by (email or SMS)',
        },
        name: {
          displayName: 'Name',
          shortDesc: 'Campaign name filter',
          longDesc: 'Filter campaigns by name containing this value',
        },
        sort: {
          displayName: 'Sort',
          shortDesc: 'Sort options',
          longDesc: 'Sort configuration for the campaign list',
          type: {
            fields: {
              field: {
                displayName: 'Sort Field',
                shortDesc: 'Field to sort by',
                longDesc: 'The field to use for sorting the campaign list',
              },
              direction: {
                displayName: 'Sort Direction',
                shortDesc: 'Sort direction',
                longDesc: 'The direction to sort the campaign list (ascending or descending)',
              },
            },
          },
        },
      },
    },
    list_lists: {
      displayName: 'List Lists',
      shortDesc: 'Lists all lists',
      longDesc: 'Retrieves a list of all lists with optional filtering and sorting',
      options: {
        cursor: {
          displayName: 'Cursor',
          shortDesc: 'Pagination cursor',
          longDesc: 'Cursor for pagination to get the next set of results',
        },
        filter: {
          displayName: 'Filter',
          shortDesc: 'Filter options',
          longDesc: 'Filter configuration for the list results',
          type: {
            fields: {
              name: {
                displayName: 'Name Filter',
                shortDesc: 'Filter by list names',
                longDesc: 'Filter lists by names containing these values',
              },
              id: {
                displayName: 'ID Filter',
                shortDesc: 'Filter by list IDs',
                longDesc: 'Filter lists by specific IDs',
              },
            },
          },
        },
        sort: {
          displayName: 'Sort',
          shortDesc: 'Sort options',
          longDesc: 'Sort configuration for the list results',
          type: {
            fields: {
              field: {
                displayName: 'Sort Field',
                shortDesc: 'Field to sort by',
                longDesc: 'The field to use for sorting the list results',
              },
              direction: {
                displayName: 'Sort Direction',
                shortDesc: 'Sort direction',
                longDesc: 'The direction to sort the list results (ascending or descending)',
              },
            },
          },
        },
      },
    },
    list_profiles: {
      displayName: 'List Profiles',
      shortDesc: 'Lists profiles',
      longDesc: 'Retrieves a list of profiles with optional filtering and sorting',
      options: {
        additionalFields: {
          displayName: 'Additional Fields',
          shortDesc: 'Additional profile fields to include',
          longDesc: 'Optional additional fields to include in the profile responses',
        },
        cursor: {
          displayName: 'Cursor',
          shortDesc: 'Pagination cursor',
          longDesc: 'Cursor for pagination to get the next set of results',
        },
        pageSize: {
          displayName: 'Page Size',
          shortDesc: 'Number of items per page',
          longDesc: 'The number of profiles to return per page',
        },
        filter: {
          displayName: 'Filter',
          shortDesc: 'Filter options',
          longDesc: 'Filter configuration for the profile results',
          type: {
            fields: {
              email: {
                displayName: 'Email Filter',
                shortDesc: 'Filter by email addresses',
                longDesc: 'Filter profiles by specific email addresses',
              },
              phone_number: {
                displayName: 'Phone Number Filter',
                shortDesc: 'Filter by phone numbers',
                longDesc: 'Filter profiles by specific phone numbers',
              },
              external_id: {
                displayName: 'External ID Filter',
                shortDesc: 'Filter by external IDs',
                longDesc: 'Filter profiles by specific external IDs',
              },
              id: {
                displayName: 'ID Filter',
                shortDesc: 'Filter by profile IDs',
                longDesc: 'Filter profiles by specific profile IDs',
              },
            },
          },
        },
        sort: {
          displayName: 'Sort',
          shortDesc: 'Sort options',
          longDesc: 'Sort configuration for the profile results',
          type: {
            fields: {
              field: {
                displayName: 'Sort Field',
                shortDesc: 'Field to sort by',
                longDesc: 'The field to use for sorting the profile results',
              },
              direction: {
                displayName: 'Sort Direction',
                shortDesc: 'Sort direction',
                longDesc: 'The direction to sort the profile results (ascending or descending)',
              },
            },
          },
        },
      },
    },
    list_segments: {
      displayName: 'List Segments',
      shortDesc: 'Lists segments',
      longDesc: 'Retrieves a list of segments with optional filtering and sorting',
      options: {
        cursor: {
          displayName: 'Cursor',
          shortDesc: 'Pagination cursor',
          longDesc: 'Cursor for pagination to get the next set of results',
        },
        filter: {
          displayName: 'Filter',
          shortDesc: 'Filter options',
          longDesc: 'Filter configuration for the segment results',
          type: {
            fields: {
              name: {
                displayName: 'Name Filter',
                shortDesc: 'Filter by segment names',
                longDesc: 'Filter segments by names containing these values',
              },
              id: {
                displayName: 'ID Filter',
                shortDesc: 'Filter by segment IDs',
                longDesc: 'Filter segments by specific IDs',
              },
            },
          },
        },
        sort: {
          displayName: 'Sort',
          shortDesc: 'Sort options',
          longDesc: 'Sort configuration for the segment results',
          type: {
            fields: {
              field: {
                displayName: 'Sort Field',
                shortDesc: 'Field to sort by',
                longDesc: 'The field to use for sorting the segment results',
              },
              direction: {
                displayName: 'Sort Direction',
                shortDesc: 'Sort direction',
                longDesc: 'The direction to sort the segment results (ascending or descending)',
              },
            },
          },
        },
      },
    },
    list_tags: {
      displayName: 'List Tags',
      shortDesc: 'Lists tags',
      longDesc: 'Retrieves a list of tags with optional filtering and sorting',
      options: {
        cursor: {
          displayName: 'Cursor',
          shortDesc: 'Pagination cursor',
          longDesc: 'Cursor for pagination to get the next set of results',
        },
        filter: {
          displayName: 'Filter',
          shortDesc: 'Filter options',
          longDesc: 'Filter configuration for the tag results',
          type: {
            fields: {
              name: {
                displayName: 'Name Filter',
                shortDesc: 'Filter by tag name',
                longDesc: 'Filter tags by name containing this value',
              },
            },
          },
        },
        sort: {
          displayName: 'Sort',
          shortDesc: 'Sort options',
          longDesc: 'Sort configuration for the tag results',
          type: {
            fields: {
              field: {
                displayName: 'Sort Field',
                shortDesc: 'Field to sort by',
                longDesc: 'The field to use for sorting the tag results',
              },
              direction: {
                displayName: 'Sort Direction',
                shortDesc: 'Sort direction',
                longDesc: 'The direction to sort the tag results (ascending or descending)',
              },
            },
          },
        },
      },
    },
    remove_profile_from_list: {
      displayName: 'Remove Profile from List',
      shortDesc: 'Removes a profile from a list',
      longDesc: 'Removes a specified profile from a specified list in Klaviyo',
      options: {
        profile: {
          displayName: 'Profile',
          shortDesc: 'Profile to remove',
          longDesc: 'The profile to remove from the list',
        },
        list: {
          displayName: 'List',
          shortDesc: 'Target list',
          longDesc: 'The list to remove the profile from',
        },
      },
    },
    remove_tag_from_list: {
      displayName: 'Remove Tag from List',
      shortDesc: 'Removes a tag from a list',
      longDesc: 'Removes a specified tag from a specified list in Klaviyo',
      options: {
        tag: {
          displayName: 'Tag',
          shortDesc: 'Tag to remove',
          longDesc: 'The tag to remove from the list',
        },
        list: {
          displayName: 'List',
          shortDesc: 'Target list',
          longDesc: 'The list to remove the tag from',
        },
      },
    },
    remove_tag_from_segment: {
      displayName: 'Remove Tag from Segment',
      shortDesc: 'Removes a tag from a segment',
      longDesc: 'Removes a specified tag from a specified segment in Klaviyo',
      options: {
        tag: {
          displayName: 'Tag',
          shortDesc: 'Tag to remove',
          longDesc: 'The tag to remove from the segment',
        },
        segment: {
          displayName: 'Segment',
          shortDesc: 'Target segment',
          longDesc: 'The segment to remove the tag from',
        },
      },
    },
    send_campaign: {
      displayName: 'Send Campaign',
      shortDesc: 'Sends a campaign',
      longDesc: 'Sends a draft campaign immediately to its target audience',
      options: {
        id: {
          displayName: 'Campaign ID',
          shortDesc: 'The ID of the campaign to send',
          longDesc: 'The unique identifier of the campaign you want to send',
        },
      },
    },
    subscribe_profile: {
      displayName: 'Subscribe Profile',
      shortDesc: 'Subscribes a profile to marketing channels',
      longDesc: 'Subscribes a profile to email marketing, SMS marketing, or both channels',
      options: {
        profileId: {
          displayName: 'Profile ID',
          shortDesc: 'The ID of the profile to subscribe',
          longDesc: 'The unique identifier of the profile to subscribe',
        },
        email: {
          displayName: 'Email',
          shortDesc: 'Email address',
          longDesc: 'The email address of the profile to subscribe',
        },
        phoneNumber: {
          displayName: 'Phone Number',
          shortDesc: 'Phone number',
          longDesc: 'The phone number of the profile to subscribe',
        },
        consentToSubscribeToChannel: {
          displayName: 'Subscription Channel',
          shortDesc: 'Channel to subscribe to',
          longDesc: 'The marketing channel(s) to subscribe the profile to',
        },
        smsSubscriptionType: {
          displayName: 'SMS Subscription Type',
          shortDesc: 'Type of SMS subscription',
          longDesc: 'The type of SMS subscription (marketing, transactional, or both)',
        },
        list: {
          displayName: 'List',
          shortDesc: 'Target list',
          longDesc: 'Optional list to add the profile to during subscription',
        },
      },
    },
    unsubscribe_profile: {
      displayName: 'Unsubscribe Profile',
      shortDesc: 'Unsubscribes a profile from marketing channels',
      longDesc:
        'Unsubscribes a profile from email and/or SMS marketing based on provided identifiers',
      options: {
        email: {
          displayName: 'Email',
          shortDesc: 'Email address',
          longDesc: 'The email address of the profile to unsubscribe',
        },
        phoneNumber: {
          displayName: 'Phone Number',
          shortDesc: 'Phone number',
          longDesc: 'The phone number of the profile to unsubscribe',
        },
        smsSubscriptionType: {
          displayName: 'SMS Subscription Type',
          shortDesc: 'Type of SMS subscription to cancel',
          longDesc: 'The type of SMS subscription to cancel (marketing, transactional, or both)',
        },
      },
    },
    update_profile: {
      displayName: 'Update Profile',
      shortDesc: 'Updates an existing profile',
      longDesc:
        'Updates an existing profile with new information and optionally adds them to a list',
      options: {
        id: {
          displayName: 'Profile ID',
          shortDesc: 'The ID of the profile to update',
          longDesc: 'The unique identifier of the profile you want to update',
        },
        email: {
          displayName: 'Email',
          shortDesc: 'Email address',
          longDesc: 'The new email address for the profile',
        },
        phoneNumber: {
          displayName: 'Phone Number',
          shortDesc: 'Phone number',
          longDesc: 'The new phone number for the profile',
        },
        firstName: {
          displayName: 'First Name',
          shortDesc: 'First name',
          longDesc: 'The first name of the profile',
        },
        lastName: {
          displayName: 'Last Name',
          shortDesc: 'Last name',
          longDesc: 'The last name of the profile',
        },
        title: {
          displayName: 'Title',
          shortDesc: 'Job title',
          longDesc: 'The job title of the profile',
        },
        organization: {
          displayName: 'Organization',
          shortDesc: 'Organization name',
          longDesc: 'The organization or company name for the profile',
        },
        city: {
          displayName: 'City',
          shortDesc: 'City',
          longDesc: 'The city where the profile is located',
        },
        region: {
          displayName: 'Region',
          shortDesc: 'State or region',
          longDesc: 'The state or region where the profile is located',
        },
        country: {
          displayName: 'Country',
          shortDesc: 'Country',
          longDesc: 'The country where the profile is located',
        },
        zip: {
          displayName: 'ZIP Code',
          shortDesc: 'ZIP or postal code',
          longDesc: 'The ZIP or postal code for the profile location',
        },
        imageUrl: {
          displayName: 'Image URL',
          shortDesc: 'Profile image URL',
          longDesc: 'URL to the profile image',
        },
        externalId: {
          displayName: 'External ID',
          shortDesc: 'External identifier',
          longDesc: 'External identifier for the profile from your system',
        },
        customProperties: {
          displayName: 'Custom Properties',
          shortDesc: 'Custom profile properties',
          longDesc: 'Additional custom properties to set on the profile',
        },
      },
    },
    add_tag_to_list: {
      displayName: 'Add Tag to List',
      shortDesc: 'Adds an existing tag to a list',
      longDesc: 'Associates an existing tag with a specified list in Klaviyo',
      options: {
        tag: {
          displayName: 'Tag',
          shortDesc: 'Tag to add',
          longDesc: 'The tag to add to the list',
        },
        list: {
          displayName: 'List',
          shortDesc: 'Target list',
          longDesc: 'The list to add the tag to',
        },
      },
    },
    add_tag_to_segment: {
      displayName: 'Add Tag to Segment',
      shortDesc: 'Adds an existing tag to a segment',
      longDesc: 'Associates an existing tag with a specified segment in Klaviyo',
      options: {
        tag: {
          displayName: 'Tag',
          shortDesc: 'Tag to add',
          longDesc: 'The tag to add to the segment',
        },
        segment: {
          displayName: 'Segment',
          shortDesc: 'Target segment',
          longDesc: 'The segment to add the tag to',
        },
      },
    },
    create_event: {
      displayName: 'Create Event',
      shortDesc: 'Creates a new event',
      longDesc: 'Creates a new event for a specific metric in Klaviyo',
      options: {
        email: {
          displayName: 'Email',
          shortDesc: 'Email address',
          longDesc: 'The email address of the profile for the event',
        },
        metric: {
          displayName: 'Metric',
          shortDesc: 'Event metric',
          longDesc: 'The metric or event type to track',
        },
        profile: {
          displayName: 'Profile',
          shortDesc: 'Profile ID',
          longDesc: 'The profile ID to associate with the event',
        },
        time: {
          displayName: 'Time',
          shortDesc: 'Event timestamp',
          longDesc: 'The timestamp when the event occurred',
        },
        value: {
          displayName: 'Value',
          shortDesc: 'Event value',
          longDesc: 'The monetary value associated with the event',
        },
        customId: {
          displayName: 'Custom ID',
          shortDesc: 'Unique event identifier',
          longDesc: 'A custom unique identifier for the event',
        },
        customProperties: {
          displayName: 'Custom Properties',
          shortDesc: 'Event properties',
          longDesc: 'Additional custom properties for the event',
        },
      },
    },
    create_list: {
      displayName: 'Create List',
      shortDesc: 'Creates a new list',
      longDesc: 'Creates a new list in Klaviyo with the specified configuration',
      options: {
        name: {
          displayName: 'Name',
          shortDesc: 'List name',
          longDesc: 'The name of the new list',
        },
      },
    },
    create_or_update_profile: {
      displayName: 'Create Or Update Profile',
      shortDesc: 'Creates a new profile or updates an existing one',
      longDesc:
        'Creates a new profile or updates an existing profile and optionally adds it to a list',
      options: {
        id: {
          displayName: 'Profile ID',
          shortDesc: 'Profile ID (for update)',
          longDesc: 'The ID of an existing profile to update (leave empty to create new)',
        },
        email: {
          displayName: 'Email',
          shortDesc: 'Email address',
          longDesc: 'The email address for the profile',
        },
        phoneNumber: {
          displayName: 'Phone Number',
          shortDesc: 'Phone number',
          longDesc: 'The phone number for the profile',
        },
        firstName: {
          displayName: 'First Name',
          shortDesc: 'First name',
          longDesc: 'The first name of the profile',
        },
        lastName: {
          displayName: 'Last Name',
          shortDesc: 'Last name',
          longDesc: 'The last name of the profile',
        },
        title: {
          displayName: 'Title',
          shortDesc: 'Job title',
          longDesc: 'The job title of the profile',
        },
        organization: {
          displayName: 'Organization',
          shortDesc: 'Organization name',
          longDesc: 'The organization or company name for the profile',
        },
        city: {
          displayName: 'City',
          shortDesc: 'City',
          longDesc: 'The city where the profile is located',
        },
        region: {
          displayName: 'Region',
          shortDesc: 'State or region',
          longDesc: 'The state or region where the profile is located',
        },
        country: {
          displayName: 'Country',
          shortDesc: 'Country',
          longDesc: 'The country where the profile is located',
        },
        zip: {
          displayName: 'ZIP Code',
          shortDesc: 'ZIP or postal code',
          longDesc: 'The ZIP or postal code for the profile location',
        },
        imageUrl: {
          displayName: 'Image URL',
          shortDesc: 'Profile image URL',
          longDesc: 'URL to the profile image',
        },
        externalId: {
          displayName: 'External ID',
          shortDesc: 'External identifier',
          longDesc: 'External identifier for the profile from your system',
        },
        customProperties: {
          displayName: 'Custom Properties',
          shortDesc: 'Custom profile properties',
          longDesc: 'Additional custom properties to set on the profile',
        },
      },
    },
    create_profile: {
      displayName: 'Create Profile',
      shortDesc: 'Creates a new profile',
      longDesc: 'Creates a new profile in Klaviyo with the specified information',
      options: {
        email: {
          displayName: 'Email',
          shortDesc: 'Email address',
          longDesc: 'The email address for the new profile',
        },
        phoneNumber: {
          displayName: 'Phone Number',
          shortDesc: 'Phone number',
          longDesc: 'The phone number for the new profile',
        },
        firstName: {
          displayName: 'First Name',
          shortDesc: 'First name',
          longDesc: 'The first name of the profile',
        },
        lastName: {
          displayName: 'Last Name',
          shortDesc: 'Last name',
          longDesc: 'The last name of the profile',
        },
        title: {
          displayName: 'Title',
          shortDesc: 'Job title',
          longDesc: 'The job title of the profile',
        },
        organization: {
          displayName: 'Organization',
          shortDesc: 'Organization name',
          longDesc: 'The organization or company name for the profile',
        },
        city: {
          displayName: 'City',
          shortDesc: 'City',
          longDesc: 'The city where the profile is located',
        },
        region: {
          displayName: 'Region',
          shortDesc: 'State or region',
          longDesc: 'The state or region where the profile is located',
        },
        country: {
          displayName: 'Country',
          shortDesc: 'Country',
          longDesc: 'The country where the profile is located',
        },
        zip: {
          displayName: 'ZIP Code',
          shortDesc: 'ZIP or postal code',
          longDesc: 'The ZIP or postal code for the profile location',
        },
        imageUrl: {
          displayName: 'Image URL',
          shortDesc: 'Profile image URL',
          longDesc: 'URL to the profile image',
        },
        externalId: {
          displayName: 'External ID',
          shortDesc: 'External identifier',
          longDesc: 'External identifier for the profile from your system',
        },
        customProperties: {
          displayName: 'Custom Properties',
          shortDesc: 'Custom profile properties',
          longDesc: 'Additional custom properties to set on the profile',
        },
      },
    },
    get_campaign: {
      displayName: 'Get Campaign',
      shortDesc: 'Retrieves a specific campaign',
      longDesc: 'Retrieves detailed information about a specific campaign by its ID',
      options: {
        id: {
          displayName: 'Campaign ID',
          shortDesc: 'The ID of the campaign to retrieve',
          longDesc: 'The unique identifier of the campaign you want to retrieve',
        },
      },
    },
    add_profile_to_list: {
      displayName: 'Add Profile to List',
      shortDesc: 'Adds an existing profile to a list',
      longDesc: 'Adds an existing profile to a specified list in Klaviyo',
      options: {
        profile: {
          displayName: 'Profile',
          shortDesc: 'Profile to add',
          longDesc: 'The profile to add to the list',
        },
        list: {
          displayName: 'List',
          shortDesc: 'Target list',
          longDesc: 'The list to add the profile to',
        },
      },
    },
  },
  triggers: {
    new_event: {
      displayName: 'New Event',
      shortDesc: 'Triggers when a new event occurs',
      longDesc: 'Triggers when a new event occurs for a specific metric in Klaviyo',
      options: {
        metric: {
          displayName: 'Metric',
          shortDesc: 'Event metric to monitor',
          longDesc: 'The specific metric or event type to monitor for new events',
        },
      },
    },
    new_profile: {
      displayName: 'New Profile',
      shortDesc: 'Triggers when a new profile is created',
      longDesc: 'Triggers when a new profile is created in Klaviyo',
    },
    new_list_profile: {
      displayName: 'Profile Added to List',
      shortDesc: 'Triggers when a profile is added to a list',
      longDesc: 'Triggers when a profile is added to a specific list in Klaviyo',
      options: {
        list: {
          displayName: 'List',
          shortDesc: 'List to monitor',
          longDesc: 'The specific list to monitor for new profile additions',
        },
      },
    },
    new_segment_profile: {
      displayName: 'Profile Added to Segment',
      shortDesc: 'Triggers when a profile is added to a segment',
      longDesc: 'Triggers when a profile is added to a specific segment in Klaviyo',
      options: {
        segment: {
          displayName: 'Segment',
          shortDesc: 'Segment to monitor',
          longDesc: 'The specific segment to monitor for new profile additions',
        },
      },
    },
  },
};

export default KlaviyoAppEn;
