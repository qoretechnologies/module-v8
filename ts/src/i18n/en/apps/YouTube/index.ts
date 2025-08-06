/* eslint-disable max-len */
const YouTubeAppEn = {
  displayName: 'YouTube',
  shortDesc: 'Connect and interact with YouTube',
  longDesc:
    'YouTube integration allows you to manage videos, playlists, channels, and interact with the YouTube platform programmatically.',
  actions: {
    get_channel_id_from_url: {
      displayName: 'Get Channel ID from URL',
      shortDesc: 'Extract YouTube channel ID from various URL formats',
      longDesc:
        'Extracts the channel ID from different YouTube URL formats including channel URLs, handles (@username), custom URLs (/c/), usernames (/user/), and video URLs. Also returns basic channel information.',
      options: {
        url: {
          displayName: 'YouTube URL',
          shortDesc: 'The YouTube URL to extract channel ID from',
          longDesc:
            'Any valid YouTube URL format including channel URLs, handles (@username), custom URLs (/c/), usernames (/user/), or video URLs',
        },
      },
    },
    add_video_to_playlist: {
      displayName: 'Add Video to Playlist',
      shortDesc: 'Add a video to an existing YouTube playlist',
      longDesc:
        'Adds a specified video to an existing YouTube playlist. You can optionally specify the position where the video should be inserted in the playlist.',
      options: {
        playlistId: {
          displayName: 'Playlist ID',
          shortDesc: 'The ID of the playlist to add the video to',
          longDesc: 'The unique identifier of the YouTube playlist where the video will be added',
        },
        videoId: {
          displayName: 'Video ID',
          shortDesc: 'The ID of the video to add to the playlist',
          longDesc: 'The unique identifier of the YouTube video to be added to the playlist',
        },
        position: {
          displayName: 'Position',
          shortDesc: 'The position in the playlist where the video should be inserted',
          longDesc:
            'Optional position (0-based index) where the video should be inserted in the playlist. If not specified, the video will be added to the end',
        },
      },
    },
    create_playlist: {
      displayName: 'Create Playlist',
      shortDesc: 'Create a new YouTube playlist',
      longDesc:
        'Creates a new YouTube playlist with specified title, description, privacy settings, and optional tags',
      options: {
        title: {
          displayName: 'Title',
          shortDesc: 'The title of the playlist',
          longDesc: 'The name/title of the new playlist',
        },
        description: {
          displayName: 'Description',
          shortDesc: 'The description of the playlist',
          longDesc: 'Optional description text for the playlist explaining its content or purpose',
        },
        privacy: {
          displayName: 'Privacy Status',
          shortDesc: 'The privacy setting for the playlist',
          longDesc:
            'Privacy level for the playlist: public (visible to everyone), private (only visible to you), or unlisted (visible to anyone with the link)',
        },
        tags: {
          displayName: 'Tags',
          shortDesc: 'List of tags for the playlist',
          longDesc:
            'Optional list of tags/keywords to help categorize and make the playlist discoverable',
        },
        defaultLanguage: {
          displayName: 'Default Language',
          shortDesc: 'The default language for the playlist',
          longDesc:
            'Optional default language code for the playlist content (e.g., "en" for English)',
        },
      },
    },
    search_videos: {
      displayName: 'Search Videos',
      shortDesc: 'Search for YouTube videos',
      longDesc:
        'Search for YouTube videos using various filters including keywords, duration, quality, upload date, and more',
      options: {
        q: {
          displayName: 'Search Query',
          shortDesc: 'Keywords to search for',
          longDesc: 'Search terms or keywords to find videos on YouTube',
        },
        order: {
          displayName: 'Sort Order',
          shortDesc: 'How to sort the search results',
          longDesc:
            'The order in which search results should be returned (relevance, date, rating, title, or view count)',
        },
        publishedAfter: {
          displayName: 'Published After',
          shortDesc: 'Only return videos published after this date',
          longDesc:
            'Filter to only include videos published after the specified date (ISO 8601 format)',
        },
        publishedBefore: {
          displayName: 'Published Before',
          shortDesc: 'Only return videos published before this date',
          longDesc:
            'Filter to only include videos published before the specified date (ISO 8601 format)',
        },
        videoDuration: {
          displayName: 'Video Duration',
          shortDesc: 'Filter by video length',
          longDesc:
            'Filter videos by their duration: any, short (< 4 minutes), medium (4-20 minutes), or long (> 20 minutes)',
        },
        videoDefinition: {
          displayName: 'Video Definition',
          shortDesc: 'Filter by video quality',
          longDesc:
            'Filter videos by their definition quality: any, standard definition, or high definition',
        },
        videoDimension: {
          displayName: 'Video Dimension',
          shortDesc: 'Filter by 2D or 3D videos',
          longDesc: 'Filter videos by their dimensional format: any, 2D only, or 3D only',
        },
        videoCaption: {
          displayName: 'Video Caption',
          shortDesc: 'Filter by caption availability',
          longDesc:
            'Filter videos by caption availability: any, videos with closed captions, or videos without captions',
        },
        videoLicense: {
          displayName: 'Video License',
          shortDesc: 'Filter by video license type',
          longDesc:
            'Filter videos by their license: any, standard YouTube license, or Creative Commons license',
        },
        safeSearch: {
          displayName: 'Safe Search',
          shortDesc: 'Safe search filtering level',
          longDesc: 'Level of safe search filtering to apply: moderate (default), none, or strict',
        },
        regionCode: {
          displayName: 'Region Code',
          shortDesc: 'Country code to search within',
          longDesc:
            'Optional two-letter country code to restrict search results to a specific region',
        },
        relevanceLanguage: {
          displayName: 'Relevance Language',
          shortDesc: 'Language for relevance ranking',
          longDesc: 'Language code to use for relevance ranking of search results',
        },
        videoCategoryId: {
          displayName: 'Video Category',
          shortDesc: 'Filter by video category',
          longDesc: 'Optional category ID to filter videos by specific YouTube category',
        },
        maxResults: {
          displayName: 'Maximum Results',
          shortDesc: 'Maximum number of results to return',
          longDesc: 'The maximum number of search results to return (default is 25)',
        },
        pageToken: {
          displayName: 'Page Token',
          shortDesc: 'Token for pagination',
          longDesc: 'Token for retrieving a specific page of results (used for pagination)',
        },
      },
    },
    get_report: {
      displayName: 'Get Analytics Report',
      shortDesc: 'Get YouTube Analytics report data',
      longDesc:
        'Retrieve YouTube Analytics data for a specific channel within a date range, including metrics like views, watch time, and engagement',
      options: {
        startDate: {
          displayName: 'Start Date',
          shortDesc: 'The start date for the report',
          longDesc: 'The start date for the analytics report in YYYY-MM-DD format',
        },
        endDate: {
          displayName: 'End Date',
          shortDesc: 'The end date for the report',
          longDesc: 'The end date for the analytics report in YYYY-MM-DD format',
        },
        metrics: {
          displayName: 'Metrics',
          shortDesc: 'List of metrics to include in the report',
          longDesc:
            'List of analytics metrics to retrieve (e.g., views, estimatedMinutesWatched, likes, comments)',
        },
        channel: {
          displayName: 'Channel',
          shortDesc: 'The channel to get analytics for',
          longDesc: 'The YouTube channel ID to retrieve analytics data for',
        },
        maxResults: {
          displayName: 'Maximum Results',
          shortDesc: 'Maximum number of results to return',
          longDesc: 'The maximum number of data points to return in the report (default is 10)',
        },
      },
    },
    list_categories: {
      displayName: 'List Video Categories',
      shortDesc: 'Get list of YouTube video categories',
      longDesc:
        'Retrieve the list of available YouTube video categories that can be assigned to videos',
    },
    list_user_channels: {
      displayName: 'List User Channels',
      shortDesc: "Get list of authenticated user's YouTube channels",
      longDesc:
        "Retrieve information about the authenticated user's YouTube channels including statistics and branding settings",
      options: {
        maxResults: {
          displayName: 'Maximum Results',
          shortDesc: 'Maximum number of channels to return',
          longDesc: 'The maximum number of channels to return (default is 5)',
        },
        nextPageToken: {
          displayName: 'Next Page Token',
          shortDesc: 'Token for pagination',
          longDesc: 'Token for retrieving the next page of results',
        },
      },
    },
    list_video_comments: {
      displayName: 'List Video Comments',
      shortDesc: 'Get comments for a YouTube video',
      longDesc:
        'Retrieve comments and comment threads for a specific YouTube video with various filtering and sorting options',
      options: {
        videoId: {
          displayName: 'Video ID',
          shortDesc: 'The ID of the video to get comments for',
          longDesc: 'The unique identifier of the YouTube video to retrieve comments from',
        },
        order: {
          displayName: 'Sort Order',
          shortDesc: 'How to sort the comments',
          longDesc:
            'The order in which comments should be returned: time (newest first) or relevance',
        },
        searchTerms: {
          displayName: 'Search Terms',
          shortDesc: 'Filter comments by search terms',
          longDesc: 'Optional search terms to filter comments that contain specific keywords',
        },
        textFormat: {
          displayName: 'Text Format',
          shortDesc: 'Format of the comment text',
          longDesc: 'The format in which comment text should be returned: HTML or plain text',
        },
        maxResults: {
          displayName: 'Maximum Results',
          shortDesc: 'Maximum number of comments to return',
          longDesc: 'The maximum number of comment threads to return (default is 20)',
        },
        pageToken: {
          displayName: 'Page Token',
          shortDesc: 'Token for pagination',
          longDesc: 'Token for retrieving a specific page of comments',
        },
      },
    },
    list_user_videos: {
      displayName: 'List User Videos',
      shortDesc: "Get list of authenticated user's YouTube videos",
      longDesc:
        'Retrieve a list of videos uploaded by the authenticated user to their YouTube channel',
      options: {
        maxResults: {
          displayName: 'Maximum Results',
          shortDesc: 'Maximum number of videos to return',
          longDesc: 'The maximum number of videos to return (default is 10)',
        },
        nextPageToken: {
          displayName: 'Next Page Token',
          shortDesc: 'Token for pagination',
          longDesc: 'Token for retrieving the next page of videos',
        },
      },
    },
    reply_to_comment: {
      displayName: 'Reply to Comment',
      shortDesc: 'Reply to a YouTube comment',
      longDesc: 'Post a reply to an existing comment on a YouTube video',
      options: {
        parentId: {
          displayName: 'Parent Comment ID',
          shortDesc: 'The ID of the comment to reply to',
          longDesc: 'The unique identifier of the comment or comment thread to reply to',
        },
        textOriginal: {
          displayName: 'Reply Text',
          shortDesc: 'The text content of the reply',
          longDesc: 'The text content of your reply to the comment',
        },
      },
    },
    update_video_details: {
      displayName: 'Update Video Details',
      shortDesc: 'Update details of a YouTube video',
      longDesc:
        'Update the metadata of an existing YouTube video including title, description, privacy settings, and other properties',
      options: {
        title: {
          displayName: 'Title',
          shortDesc: 'New title for the video',
          longDesc: 'Optional new title for the video (leave empty to keep current title)',
        },
        video: {
          displayName: 'Video',
          shortDesc: 'The video to update',
          longDesc: 'The YouTube video to update',
        },
        category: {
          displayName: 'Category',
          shortDesc: 'Video category',
          longDesc: 'Optional new category for the video (numeric category ID)',
        },
        privacy: {
          displayName: 'Privacy Status',
          shortDesc: 'Privacy setting for the video',
          longDesc: 'Optional new privacy setting: public, private, or unlisted',
        },
        description: {
          displayName: 'Description',
          shortDesc: 'New description for the video',
          longDesc:
            'Optional new description for the video (leave empty to keep current description)',
        },
        forKids: {
          displayName: 'Made for Kids',
          shortDesc: 'Whether the video is made for kids',
          longDesc: 'Optional setting to indicate if the video is specifically made for children',
        },
        tags: {
          displayName: 'Tags',
          shortDesc: 'List of tags for the video',
          longDesc: 'Optional list of tags/keywords to help categorize the video',
        },
      },
    },
    upload_video: {
      displayName: 'Upload Video',
      shortDesc: 'Upload a video to YouTube',
      longDesc:
        'Upload a new video to YouTube with specified metadata including title, description, privacy settings, and category',
      options: {
        title: {
          displayName: 'Title',
          shortDesc: 'The title of the video',
          longDesc: 'The title/name for the video being uploaded',
        },
        video: {
          displayName: 'Video File',
          shortDesc: 'The video file to upload',
          longDesc: 'The video file to upload to YouTube',
        },
        category: {
          displayName: 'Category',
          shortDesc: 'Video category',
          longDesc: 'The YouTube category for the video (numeric category ID)',
        },
        privacy: {
          displayName: 'Privacy Status',
          shortDesc: 'Privacy setting for the video',
          longDesc:
            'Privacy level for the video: public (visible to everyone), private (only visible to you), or unlisted (visible to anyone with the link)',
        },
        description: {
          displayName: 'Description',
          shortDesc: 'The description of the video',
          longDesc: 'Optional description text for the video explaining its content',
        },
        forKids: {
          displayName: 'Made for Kids',
          shortDesc: 'Whether the video is made for kids',
          longDesc:
            'Optional setting to indicate if the video is specifically made for children (default is false)',
        },
        tags: {
          displayName: 'Tags',
          shortDesc: 'List of tags for the video',
          longDesc:
            'Optional list of tags/keywords to help categorize and make the video discoverable',
        },
      },
    },
  },

  triggers: {
    new_channel_video: {
      displayName: 'New Channel Video',
      shortDesc: 'Triggers when a new video is uploaded to a channel',
      longDesc:
        "Monitors a specific YouTube channel for new video uploads and triggers when a new video is detected in the channel's uploads playlist.",
      options: {
        channel: {
          displayName: 'Channel',
          shortDesc: 'The YouTube channel to monitor',
          longDesc: 'Select the YouTube channel to monitor for new video uploads',
        },
      },
    },
    new_livestream: {
      displayName: 'New Livestream',
      shortDesc: 'Triggers when a new livestream starts',
      longDesc:
        'Monitors for new live streams that are currently broadcasting. Can monitor all live streams or filter by a specific channel.',
      options: {
        channel: {
          displayName: 'Channel',
          shortDesc: 'The YouTube channel to monitor for livestreams',
          longDesc:
            'Optionally filter livestreams by a specific channel. Leave empty to monitor all livestreams.',
        },
      },
    },
    new_playlist_video: {
      displayName: 'New Playlist Video',
      shortDesc: 'Triggers when a new video is added to a playlist',
      longDesc:
        'Monitors a specific YouTube playlist for new videos being added and triggers when a new video is detected.',
      options: {
        playlist: {
          displayName: 'Playlist ID',
          shortDesc: 'The YouTube playlist ID to monitor',
          longDesc: 'Enter the YouTube playlist ID to monitor for new videos being added',
        },
      },
    },
    new_video_by_search: {
      displayName: 'New Video by Search',
      shortDesc: 'Triggers when new videos match a search query',
      longDesc:
        'Monitors YouTube search results for a specific query and triggers when new videos matching the search terms are found.',
      options: {
        query: {
          displayName: 'Search Query',
          shortDesc: 'The search terms to monitor',
          longDesc: 'Enter the search query to monitor for new matching videos on YouTube',
        },
      },
    },
    new_video_comment: {
      displayName: 'New Video Comment',
      shortDesc: 'Triggers when a new comment is posted on a video',
      longDesc:
        'Monitors a specific YouTube video for new comments and triggers when a new comment is detected.',
      options: {
        video: {
          displayName: 'Video',
          shortDesc: 'The YouTube video to monitor for comments',
          longDesc: 'Select the YouTube video to monitor for new comments',
        },
      },
    },
  },
};

export default YouTubeAppEn;
