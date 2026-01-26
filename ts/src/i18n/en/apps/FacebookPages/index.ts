/* eslint-disable max-len */
const FacebookPagesAppEn = {
  displayName: 'Facebook Pages',
  groups: ['Social Media Management'],
  shortDesc: 'Manage your Facebook pages and posts',
  longDesc: `Connect your Facebook account to manage your pages, posts, and comments directly from Qore. You can create, read, update, and delete posts on your Facebook pages, as well as manage comments and reactions.`,
  actions: {
    create_page_post: {
      displayName: 'Create Page Post',
      shortDesc: 'Create a new post on a Facebook page',
      longDesc:
        'Creates a new post on a Facebook page with support for text, links, photos, scheduling, and visibility settings. Can create both immediate and scheduled posts.',
      options: {
        page_id: {
          displayName: 'Page ID',
          shortDesc: 'The Facebook page to post to',
          longDesc: 'The unique identifier of the Facebook page where the post will be created.',
        },
        message: {
          displayName: 'Message',
          shortDesc: 'The text content of the post',
          longDesc: 'The main text content for the post. Optional if link or photos are provided.',
        },
        link: {
          displayName: 'Link',
          shortDesc: 'URL to share in the post',
          longDesc:
            'A URL to be shared in the post. Facebook will automatically generate a preview.',
        },
        photo_urls: {
          displayName: 'Photo URLs',
          shortDesc: 'List of photo URLs to attach',
          longDesc:
            'A list of image URLs to be attached to the post. Images will be uploaded to Facebook.',
        },
        published: {
          displayName: 'Published',
          shortDesc: 'Whether to publish the post immediately',
          longDesc:
            'If true, the post will be published immediately. If false, it will be saved as a draft or scheduled.',
        },
        scheduled_publish_time: {
          displayName: 'Scheduled Publish Time',
          shortDesc: 'When to publish the post',
          longDesc:
            'ISO timestamp for when the post should be published. Requires published to be false.',
        },
        feed_story_visibility: {
          displayName: 'Feed Story Visibility',
          shortDesc: 'Visibility in news feed',
          longDesc: 'Controls whether the post appears in the news feed.',
        },
        timeline_visibility: {
          displayName: 'Timeline Visibility',
          shortDesc: 'Visibility on timeline',
          longDesc: 'Controls whether the post appears on the page timeline.',
        },
      },
    },

    get_page_post_insights: {
      displayName: 'Get Page Post Insights',
      shortDesc: 'Get analytics data for a Facebook page post',
      longDesc:
        'Retrieves detailed insights and analytics data for a specific Facebook page post, including impressions, clicks, engagement metrics, and time-series data.',
      options: {
        page_id: {
          displayName: 'Page ID',
          shortDesc: 'The Facebook page ID',
          longDesc: 'The unique identifier of the Facebook page that owns the post.',
        },
        post_id: {
          displayName: 'Post ID',
          shortDesc: 'The post to get insights for',
          longDesc: 'The unique identifier of the Facebook post to retrieve insights for.',
        },
        metrics: {
          displayName: 'Metrics',
          shortDesc: 'List of metrics to retrieve',
          longDesc:
            'The specific insight metrics to retrieve for the post, such as impressions, clicks, and engagement.',
        },
        period: {
          displayName: 'Period',
          shortDesc: 'Time period for insights',
          longDesc:
            'The time period for which to retrieve insights data. Lifetime returns total metrics.',
        },
      },
    },

    get_page_post: {
      displayName: 'Get Page Post',
      shortDesc: 'Get details of a Facebook page post',
      longDesc:
        'Retrieves detailed information about a specific Facebook page post, including content, metadata, engagement counts, and other post properties.',
      options: {
        page_id: {
          displayName: 'Page ID',
          shortDesc: 'The Facebook page ID',
          longDesc: 'The unique identifier of the Facebook page that owns the post.',
        },
        post_id: {
          displayName: 'Post ID',
          shortDesc: 'The post to retrieve',
          longDesc: 'The unique identifier of the Facebook post to retrieve details for.',
        },
        fields: {
          displayName: 'Fields',
          shortDesc: 'Post fields to retrieve',
          longDesc:
            'The specific fields to retrieve for the post, such as message, created time, and engagement metrics.',
        },
      },
    },

    get_page: {
      displayName: 'Get Page',
      shortDesc: 'Get details of a Facebook page',
      longDesc:
        'Retrieves detailed information about a Facebook page, including basic information, contact details, location, statistics, and other page properties.',
      options: {
        page_id: {
          displayName: 'Page ID',
          shortDesc: 'The Facebook page to retrieve',
          longDesc: 'The unique identifier of the Facebook page to retrieve details for.',
        },
        fields: {
          displayName: 'Fields',
          shortDesc: 'Page fields to retrieve',
          longDesc:
            'The specific fields to retrieve for the page, such as name, category, about section, and contact information.',
        },
      },
    },

    search_page_posts: {
      displayName: 'Search Page Posts',
      shortDesc: 'Search and filter posts on a Facebook page',
      longDesc:
        'Searches for posts on a Facebook page with support for text filtering, date ranges, visibility options, and field selection. Returns a list of matching posts.',
      options: {
        page_id: {
          displayName: 'Page ID',
          shortDesc: 'The Facebook page to search',
          longDesc: 'The unique identifier of the Facebook page to search for posts.',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of posts to return',
          longDesc:
            'The maximum number of posts to return in the search results. Cannot exceed 100.',
        },
        since: {
          displayName: 'Since',
          shortDesc: 'Start date for search',
          longDesc:
            'ISO timestamp or date string for the earliest post creation date to include in results.',
        },
        until: {
          displayName: 'Until',
          shortDesc: 'End date for search',
          longDesc:
            'ISO timestamp or date string for the latest post creation date to include in results.',
        },
        search_text: {
          displayName: 'Search Text',
          shortDesc: 'Text to search for in posts',
          longDesc:
            'Text string to search for within post messages and stories. Case-insensitive search.',
        },
        include_hidden: {
          displayName: 'Include Hidden',
          shortDesc: 'Whether to include hidden posts',
          longDesc:
            'If true, includes posts that are hidden from the timeline in the search results.',
        },
        fields: {
          displayName: 'Fields',
          shortDesc: 'Post fields to retrieve',
          longDesc: 'The specific fields to retrieve for each post in the search results.',
        },
      },
    },

    get_post_comments: {
      displayName: 'Get Post Comments',
      shortDesc: 'Get comments on a Facebook page post',
      longDesc:
        'Retrieves comments on a specific Facebook page post with support for filtering, ordering, pagination, and optional reply inclusion.',
      options: {
        page_id: {
          displayName: 'Page ID',
          shortDesc: 'The Facebook page ID',
          longDesc: 'The unique identifier of the Facebook page that owns the post.',
        },
        post_id: {
          displayName: 'Post ID',
          shortDesc: 'The post to get comments for',
          longDesc: 'The unique identifier of the Facebook post to retrieve comments for.',
        },
        fields: {
          displayName: 'Fields',
          shortDesc: 'Comment fields to retrieve',
          longDesc:
            'The specific fields to retrieve for each comment, such as message, author, and engagement metrics.',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of comments to return',
          longDesc: 'The maximum number of comments to return. Cannot exceed 100.',
        },
        order: {
          displayName: 'Order',
          shortDesc: 'Order of comments',
          longDesc:
            'The order in which to return comments - chronological (oldest first) or reverse chronological (newest first).',
        },
        filter: {
          displayName: 'Filter',
          shortDesc: 'Comment filter type',
          longDesc:
            'Whether to return only top-level comments or all comments including replies in a stream format.',
        },
        include_replies: {
          displayName: 'Include Replies',
          shortDesc: 'Whether to include replies to comments',
          longDesc: 'If true, includes replies to each top-level comment in the results.',
        },
      },
    },

    like_comment: {
      displayName: 'Like Comment',
      shortDesc: 'Like or unlike a comment on a Facebook post',
      longDesc:
        'Likes or unlikes a specific comment on a Facebook page post. Can toggle the like status and returns updated engagement metrics.',
      options: {
        page_id: {
          displayName: 'Page ID',
          shortDesc: 'The Facebook page ID',
          longDesc: 'The unique identifier of the Facebook page that owns the post.',
        },
        post_id: {
          displayName: 'Post ID',
          shortDesc: 'The post containing the comment',
          longDesc: 'The unique identifier of the Facebook post that contains the comment.',
        },
        comment_id: {
          displayName: 'Comment ID',
          shortDesc: 'The comment to like/unlike',
          longDesc: 'The unique identifier of the comment to like or unlike.',
        },
        action: {
          displayName: 'Action',
          shortDesc: 'Whether to like or unlike',
          longDesc: 'The action to perform - either like the comment or remove the like (unlike).',
        },
      },
    },

    reply_to_comment: {
      displayName: 'Reply to Comment',
      shortDesc: 'Reply to a comment on a Facebook page post',
      longDesc:
        'Creates a reply to a specific comment on a Facebook page post. Supports text replies and optional attachment URLs.',
      options: {
        page_id: {
          displayName: 'Page ID',
          shortDesc: 'The Facebook page ID',
          longDesc: 'The unique identifier of the Facebook page that owns the post.',
        },
        post_id: {
          displayName: 'Post ID',
          shortDesc: 'The post containing the comment',
          longDesc:
            'The unique identifier of the Facebook post that contains the comment being replied to.',
        },
        comment_id: {
          displayName: 'Comment ID',
          shortDesc: 'The comment to reply to',
          longDesc: 'The unique identifier of the comment to reply to.',
        },
        message: {
          displayName: 'Message',
          shortDesc: 'The reply message',
          longDesc: 'The text content of the reply to the comment.',
        },
        attachment_url: {
          displayName: 'Attachment URL',
          shortDesc: 'Optional attachment URL',
          longDesc: 'Optional URL to attach to the reply, such as an image or link.',
        },
      },
    },
  },
  triggers: {
    new_post: {
      displayName: 'New Post',
      shortDesc: 'Triggers when a new post is created on a Facebook page.',
      longDesc:
        'Monitors a Facebook page for new posts and triggers when a post is created. Supports filtering by visibility and customizable fields to retrieve specific post data.',
      options: {
        page_id: {
          displayName: 'Page ID',
          shortDesc: 'The Facebook page to monitor',
          longDesc: 'The ID of the Facebook page to monitor for new posts.',
        },
        fields: {
          displayName: 'Fields',
          shortDesc: 'Post fields to retrieve',
          longDesc:
            'List of post fields to include in the trigger data. Default includes id, message, created_time, permalink_url, full_picture, is_published, and is_hidden.',
        },
        include_hidden: {
          displayName: 'Include Hidden Posts',
          shortDesc: 'Whether to include hidden posts',
          longDesc:
            'When enabled, the trigger will also fire for posts that are hidden from the page timeline. Default is false.',
        },
      },
    },
    new_post_comment: {
      displayName: 'New Post Comment',
      shortDesc: 'Triggers when a new comment is added to a Facebook post.',
      longDesc:
        'Monitors a specific Facebook post for new comments and triggers when a comment is added. Supports filtering by visibility, including replies, and customizable fields to retrieve specific comment data.',
      options: {
        page_id: {
          displayName: 'Page ID',
          shortDesc: 'The Facebook page containing the post',
          longDesc: 'The ID of the Facebook page that contains the post to monitor for comments.',
        },
        post_id: {
          displayName: 'Post ID',
          shortDesc: 'The post to monitor for comments',
          longDesc: 'The ID of the specific Facebook post to monitor for new comments.',
        },
        fields: {
          displayName: 'Fields',
          shortDesc: 'Comment fields to retrieve',
          longDesc:
            'List of comment fields to include in the trigger data. Default includes id, message, created_time, from, like_count, comment_count, and permalink_url.',
        },
        include_hidden: {
          displayName: 'Include Hidden Comments',
          shortDesc: 'Whether to include hidden comments',
          longDesc:
            'When enabled, the trigger will also fire for comments that are hidden. Default is false.',
        },
        include_replies: {
          displayName: 'Include Replies',
          shortDesc: 'Whether to include comment replies',
          longDesc:
            'When enabled, the trigger will include replies to comments in addition to top-level comments. Default is true.',
        },
      },
    },
  },
};

export default FacebookPagesAppEn;
