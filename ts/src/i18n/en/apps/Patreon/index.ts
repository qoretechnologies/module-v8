/* eslint-disable max-len */
const PatreonAppEn = {
  displayName: 'Patreon',
  shortDesc:
    'Connect to Patreon to manage your creator content, memberships, and patron relationships.',
  longDesc:
    'The Patreon integration enables creators to automate their patron management workflows. Access patron data, manage memberships, track campaigns, and engage with your community through comprehensive API actions and real-time triggers for patron activities.',
  actions: {
    list_campaigns: {
      displayName: 'List Campaigns',
      shortDesc: 'Retrieve a list of campaigns for the authenticated creator',
      longDesc:
        'Fetches a paginated list of campaigns associated with the authenticated Patreon account. Returns comprehensive campaign information including patron counts, settings, and metadata.',
      options: {
        count: {
          displayName: 'Count',
          shortDesc: 'Maximum number of campaigns to return',
          longDesc:
            'Specifies the maximum number of campaigns to retrieve in a single request. Defaults to 20 if not specified.',
        },
        cursor: {
          displayName: 'Cursor',
          shortDesc: 'Pagination cursor for retrieving the next set of results',
          longDesc:
            'Use the cursor returned from a previous request to fetch the next page of campaigns. Leave empty for the first page.',
        },
      },
    },
    list_campaign_members: {
      displayName: 'List Campaign Members',
      shortDesc: 'Retrieve members of a specific campaign',
      longDesc:
        'Fetches a paginated list of members (patrons) for a specified campaign. Returns detailed member information including pledge amounts, payment status, and membership details.',
      options: {
        campaignId: {
          displayName: 'Campaign ID',
          shortDesc: 'The ID of the campaign to retrieve members from',
          longDesc:
            'Select the campaign whose members you want to retrieve. This is a required field.',
        },
        count: {
          displayName: 'Count',
          shortDesc: 'Maximum number of members to return',
          longDesc:
            'Specifies the maximum number of members to retrieve in a single request. Defaults to 20 if not specified.',
        },
        cursor: {
          displayName: 'Cursor',
          shortDesc: 'Pagination cursor for retrieving the next set of results',
          longDesc:
            'Use the cursor returned from a previous request to fetch the next page of members. Leave empty for the first page.',
        },
      },
    },
    get_campaign: {
      displayName: 'Get Campaign',
      shortDesc: 'Retrieve detailed information about a specific campaign',
      longDesc:
        'Fetches comprehensive details about a single campaign including summary, creation details, social media integration, RSS feed settings, and patron statistics.',
      options: {
        campaignId: {
          displayName: 'Campaign ID',
          shortDesc: 'The ID of the campaign to retrieve',
          longDesc:
            'Select the campaign you want to get detailed information about. This is a required field.',
        },
      },
    },
    get_member: {
      displayName: 'Get Member',
      shortDesc: 'Retrieve detailed information about a specific member',
      longDesc:
        'Fetches comprehensive details about a single campaign member (patron) including pledge amounts, payment history, membership status, and relationship timeline.',
      options: {
        campaignId: {
          displayName: 'Campaign ID',
          shortDesc: 'The campaign to filter members from',
          longDesc:
            'Optionally select a campaign to filter the member selection. This helps narrow down the member list when searching.',
        },
        memberId: {
          displayName: 'Member ID',
          shortDesc: 'The ID of the member to retrieve',
          longDesc:
            'Select or enter the ID of the member (patron) whose details you want to retrieve. This is a required field.',
        },
      },
    },
    list_posts: {
      displayName: 'List Posts',
      shortDesc: 'Retrieve posts from a specific campaign',
      longDesc:
        'Fetches a paginated list of posts from a specified campaign, sorted by publish date. Returns post content, metadata, and engagement information.',
      options: {
        campaignId: {
          displayName: 'Campaign ID',
          shortDesc: 'The ID of the campaign to retrieve posts from',
          longDesc:
            'Select the campaign whose posts you want to retrieve. This is a required field.',
        },
        count: {
          displayName: 'Count',
          shortDesc: 'Maximum number of posts to return',
          longDesc:
            'Specifies the maximum number of posts to retrieve in a single request. Defaults to 20 if not specified.',
        },
        cursor: {
          displayName: 'Cursor',
          shortDesc: 'Pagination cursor for retrieving the next set of results',
          longDesc:
            'Use the cursor returned from a previous request to fetch the next page of posts. Leave empty for the first page.',
        },
      },
    },
    get_post: {
      displayName: 'Get Post',
      shortDesc: 'Retrieve detailed information about a specific post',
      longDesc:
        'Fetches comprehensive details about a single post including content, publish information, access settings, and engagement metrics.',
      options: {
        campaignId: {
          displayName: 'Campaign ID',
          shortDesc: 'The campaign to filter posts from',
          longDesc:
            'Optionally select a campaign to filter the post selection. This helps narrow down the post list when searching.',
        },
        postId: {
          displayName: 'Post ID',
          shortDesc: 'The ID of the post to retrieve',
          longDesc:
            'Select or enter the ID of the post whose details you want to retrieve. This is a required field.',
        },
      },
    },
  },
  triggers: {
    pledge_trigger: {
      displayName: 'Pledge Event',
      shortDesc: 'Triggers when a pledge is created, updated, or deleted',
      longDesc:
        'Monitors pledge events for a specific campaign using Patreon webhooks. This trigger fires when a member creates, updates, or deletes their pledge, allowing you to automate workflows based on patron pledge activity.',
      options: {
        campaignId: {
          displayName: 'Campaign ID',
          shortDesc: 'The campaign to monitor for pledge events',
          longDesc:
            'Select the campaign you want to monitor for pledge-related events. This is a required field.',
        },
        trigger: {
          displayName: 'Trigger Event',
          shortDesc: 'The specific pledge event to monitor',
          longDesc:
            'Select which type of pledge event should trigger this workflow. Choose from pledge creation (when a member first pledges or a follower becomes a patron), pledge updates (upgrades or downgrades), or pledge deletion.',
        },
      },
    },
    member_trigger: {
      displayName: 'Member Event',
      shortDesc: 'Triggers when a member is created, updated, or deleted',
      longDesc:
        'Monitors member events for a specific campaign using Patreon webhooks. This trigger fires when a member is created, their information is updated (including payment charging events), or their membership is deleted.',
      options: {
        campaignId: {
          displayName: 'Campaign ID',
          shortDesc: 'The campaign to monitor for member events',
          longDesc:
            'Select the campaign you want to monitor for member-related events. This is a required field.',
        },
        trigger: {
          displayName: 'Trigger Event',
          shortDesc: 'The specific member event to monitor',
          longDesc:
            'Select which type of member event should trigger this workflow. Member creation occurs only if there was no prior payment between patron and creator. Updates include payment charging events. Deletion only occurs if no prior payment happened.',
        },
      },
    },
    post_trigger: {
      displayName: 'Post Event',
      shortDesc: 'Triggers when a post is published, updated, or deleted',
      longDesc:
        'Monitors post events for a specific campaign using Patreon webhooks. This trigger fires when a post is published, updated, or deleted on the campaign, allowing you to automate content distribution and notifications.',
      options: {
        campaignId: {
          displayName: 'Campaign ID',
          shortDesc: 'The campaign to monitor for post events',
          longDesc:
            'Select the campaign you want to monitor for post-related events. This is a required field.',
        },
        trigger: {
          displayName: 'Trigger Event',
          shortDesc: 'The specific post event to monitor',
          longDesc:
            'Select which type of post event should trigger this workflow. Choose from post publication, post updates, or post deletion events.',
        },
      },
    },
  },
};

export default PatreonAppEn;
