/* eslint-disable max-len */
const LinkedInOrganizationsAppEn = {
  displayName: 'LinkedIn Organizations',
  shortDesc: 'Manage and analyze LinkedIn organization content and statistics',
  longDesc:
    "Connect to LinkedIn Organizations to manage, and monitor posts, analyze follower engagement, track page performance, and gather comprehensive statistics about your organization's LinkedIn presence.",
  triggers: {
    new_post: {
      displayName: 'New Post',
      shortDesc: 'Triggers when a new post is published by the organization',
      longDesc:
        'This trigger fires whenever a new post is published by the selected LinkedIn organization page. It monitors the organization for new content and provides details about the post.',
      options: {
        organization: {
          displayName: 'Organization',
          shortDesc: 'The LinkedIn organization to monitor for new posts',
          longDesc:
            'Select the LinkedIn organization page that you want to monitor for new posts. You must have access to manage this organization page.',
        },
      },
    },
  },
  actions: {
    get_follower_statistics: {
      displayName: 'Get Follower Statistics',
      shortDesc: 'Retrieve demographic and engagement statistics for organization followers',
      longDesc:
        'Analyze your LinkedIn organization page followers by retrieving detailed demographic breakdowns and engagement statistics. This helps understand your audience composition and reach.',
      options: {
        organization: {
          displayName: 'Organization',
          shortDesc: 'The LinkedIn organization to get follower statistics for',
          longDesc:
            'Select the LinkedIn organization page for which you want to retrieve follower demographics and statistics.',
        },
        dimensionType: {
          displayName: 'Dimension Type',
          shortDesc: 'The type of demographic dimension to analyze',
          longDesc:
            'Choose the demographic dimension to analyze follower statistics by, such as job function, industry, seniority level, geographic region, company size, or country.',
        },
        timeRange: {
          displayName: 'Time Range',
          shortDesc: 'Date range for the follower statistics',
          longDesc:
            'Specify the start and end dates for analyzing follower statistics. Leave empty to get lifetime statistics.',
          type: {
            fields: {
              start: {
                displayName: 'Start Date',
                shortDesc: 'The start date for the statistics period',
                longDesc: 'Enter the start date from which to begin analyzing follower statistics.',
              },
              end: {
                displayName: 'End Date',
                shortDesc: 'The end date for the statistics period',
                longDesc: 'Enter the end date until which to analyze follower statistics.',
              },
            },
          },
        },
      },
    },
    get_post: {
      displayName: 'Get Post',
      shortDesc: 'Retrieve detailed information about a specific LinkedIn organization post',
      longDesc:
        'Fetch comprehensive details about a specific post published by a LinkedIn organization page, including engagement metrics, content, and metadata.',
      options: {
        organization: {
          displayName: 'Organization',
          shortDesc: 'The LinkedIn organization that owns the post',
          longDesc:
            'Select the LinkedIn organization page that owns the post you want to retrieve. This field is preselected and helps filter available posts.',
        },
        post: {
          displayName: 'Post',
          shortDesc: 'The specific LinkedIn post to retrieve',
          longDesc:
            'Select the specific LinkedIn post you want to retrieve detailed information about. The list shows posts from the selected organization.',
        },
      },
    },
    list_user_organizations: {
      displayName: 'List User Organizations',
      shortDesc: 'Retrieve all LinkedIn organizations accessible to the authenticated user',
      longDesc:
        'Fetch a comprehensive list of all LinkedIn organization pages that the authenticated user has access to manage. This includes organizations where the user has admin or content management permissions, along with detailed organization information such as name, description, logo, location, and other metadata.',
    },
    list_organization_posts: {
      displayName: 'List Organization Posts',
      shortDesc: 'Retrieve a list of posts from a LinkedIn organization page',
      longDesc:
        'Fetch a paginated list of posts published by a LinkedIn organization page. This action allows you to browse through historical posts and retrieve metadata about each post.',
      options: {
        organization: {
          displayName: 'Organization',
          shortDesc: 'The LinkedIn organization to list posts from',
          longDesc:
            'Select the LinkedIn organization page from which you want to retrieve posts. You must have access to manage this organization page.',
        },
        count: {
          displayName: 'Post Count',
          shortDesc: 'Number of posts to retrieve',
          longDesc:
            'Specify the maximum number of posts to retrieve from the organization page. Default is 10 posts.',
        },
        cursor: {
          displayName: 'Pagination Cursor',
          shortDesc: 'Cursor for pagination to get the next set of posts',
          longDesc:
            'Use this cursor value to retrieve the next page of posts. Leave empty to get the first page of results.',
        },
      },
    },
  },
};

export default LinkedInOrganizationsAppEn;
