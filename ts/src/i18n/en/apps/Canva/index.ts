/* eslint-disable max-len */
const CanvaAppEn = {
  displayName: 'Canva',
  groups: ['Design & Creative Tools'],
  shortDesc: 'Design platform for creating graphics, presentations, and visual content',
  longDesc:
    'Canva is a graphic design platform that allows users to create social media graphics, presentations, posters, documents and other visual content. It provides a drag-and-drop interface and access to millions of photographs, graphics and fonts.',
  actions: {
    upload_image: {
      displayName: 'Upload Image',
      shortDesc: 'Upload an image file to Canva',
      longDesc: 'Upload an image file to your Canva account and optionally set a name and tags',
      options: {
        image: {
          displayName: 'Image File',
          shortDesc: 'The image file to upload',
          longDesc: 'Select an image file from your device to upload to Canva',
        },
        name: {
          displayName: 'Name',
          shortDesc: 'Optional name for the image',
          longDesc:
            'Set a custom name for the uploaded image. If not provided, the original filename will be used',
        },
        tags: {
          displayName: 'Tags',
          shortDesc: 'Optional tags for the image',
          longDesc: 'Add tags to help organize and find your image later',
        },
      },
    },
    get_image: {
      displayName: 'Get Image',
      shortDesc: 'Retrieve image details from Canva',
      longDesc: 'Get detailed information about a specific image asset in your Canva account',
      options: {
        id: {
          displayName: 'Image ID',
          shortDesc: 'The unique identifier of the image',
          longDesc: 'The Canva asset ID of the image you want to retrieve',
        },
      },
    },
    delete_image: {
      displayName: 'Delete Image',
      shortDesc: 'Delete an image from Canva',
      longDesc: 'Permanently delete an image asset from your Canva account',
      options: {
        id: {
          displayName: 'Image ID',
          shortDesc: 'The unique identifier of the image to delete',
          longDesc: 'The Canva asset ID of the image you want to delete',
        },
      },
    },
    update_image: {
      displayName: 'Update Image',
      shortDesc: 'Update image name and tags',
      longDesc: 'Update the name and tags of an existing image in your Canva account',
      options: {
        id: {
          displayName: 'Image ID',
          shortDesc: 'The unique identifier of the image',
          longDesc: 'The Canva asset ID of the image you want to update',
        },
        name: {
          displayName: 'Name',
          shortDesc: 'New name for the image',
          longDesc: 'Update the name of the image asset',
        },
        tags: {
          displayName: 'Tags',
          shortDesc: 'New tags for the image',
          longDesc: 'Update the tags associated with the image for better organization',
        },
      },
    },
    upload_image_by_url: {
      displayName: 'Upload Image by URL',
      shortDesc: 'Upload an image from a URL to Canva',
      longDesc: 'Upload an image to your Canva account by providing a URL to the image',
      options: {
        url: {
          displayName: 'Image URL',
          shortDesc: 'The URL of the image to upload',
          longDesc: 'Provide a direct URL to the image file you want to upload to Canva',
        },
        name: {
          displayName: 'Name',
          shortDesc: 'Optional name for the image',
          longDesc:
            'Set a custom name for the uploaded image. If not provided, the filename from the URL will be used',
        },
        tags: {
          displayName: 'Tags',
          shortDesc: 'Optional tags for the image',
          longDesc: 'Add tags to help organize and find your image later',
        },
      },
    },
    list_designs: {
      displayName: 'List Designs',
      shortDesc: 'List your Canva designs',
      longDesc: 'Retrieve a list of your Canva designs with optional filtering and sorting',
      options: {
        query: {
          displayName: 'Search Query',
          shortDesc: 'Search term to filter designs',
          longDesc: 'Enter a search term to find specific designs by title or content',
        },
        continuation: {
          displayName: 'Continuation Token',
          shortDesc: 'Token for pagination',
          longDesc: 'Use this token to continue from where the previous request left off',
        },
        ownership: {
          displayName: 'Ownership Filter',
          shortDesc: 'Filter by ownership type',
          longDesc:
            'Choose whether to show all designs, only owned designs, or only shared designs',
        },
        sort_by: {
          displayName: 'Sort By',
          shortDesc: 'How to sort the results',
          longDesc: 'Choose how to sort the returned designs list',
        },
      },
    },
    create_thread: {
      displayName: 'Create Comment Thread',
      shortDesc: 'Create a new comment thread on a design',
      longDesc: 'Start a new comment thread on a Canva design to collaborate with team members',
      options: {
        design: {
          displayName: 'Design',
          shortDesc: 'The design to comment on',
          longDesc: 'Select the Canva design where you want to create the comment thread',
        },
        message: {
          displayName: 'Message',
          shortDesc: 'The comment message',
          longDesc: 'Enter the text content of your comment',
        },
        assignee: {
          displayName: 'Assignee',
          shortDesc: 'Optional person to assign the comment to',
          longDesc: 'Assign this comment to a specific team member for action',
        },
      },
    },
    create_reply: {
      displayName: 'Create Reply',
      shortDesc: 'Reply to an existing comment thread',
      longDesc: 'Add a reply to an existing comment thread on a Canva design',
      options: {
        design: {
          displayName: 'Design',
          shortDesc: 'The design containing the thread',
          longDesc: 'Select the Canva design that contains the comment thread',
        },
        thread: {
          displayName: 'Thread ID',
          shortDesc: 'The comment thread to reply to',
          longDesc: 'The unique identifier of the comment thread you want to reply to',
        },
        message: {
          displayName: 'Message',
          shortDesc: 'The reply message',
          longDesc: 'Enter the text content of your reply',
        },
      },
    },
    list_replies: {
      displayName: 'List Thread Replies',
      shortDesc: 'List replies in a comment thread',
      longDesc: 'Retrieve all replies from a specific comment thread on a Canva design',
      options: {
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of replies to return',
          longDesc: 'Set the maximum number of replies to retrieve (default: 50)',
        },
        continuation: {
          displayName: 'Continuation Token',
          shortDesc: 'Token for pagination',
          longDesc: 'Use this token to continue from where the previous request left off',
        },
        design: {
          displayName: 'Design',
          shortDesc: 'The design containing the thread',
          longDesc: 'Select the Canva design that contains the comment thread',
        },
        thread: {
          displayName: 'Thread ID',
          shortDesc: 'The comment thread to get replies from',
          longDesc: 'The unique identifier of the comment thread whose replies you want to list',
        },
      },
    },
  },
  triggers: {
    new_design: {
      displayName: 'New Design',
      shortDesc: 'Triggers when a new design is created',
      longDesc:
        'This trigger fires when a new design is created in your Canva account, with optional filtering by ownership and search query',
      options: {
        query: {
          displayName: 'Search Query',
          shortDesc: 'Filter designs by search term',
          longDesc:
            'Optional search term to filter which designs trigger the event. Only designs matching this query will trigger the event',
        },
        ownership: {
          displayName: 'Ownership Filter',
          shortDesc: 'Filter by ownership type',
          longDesc:
            'Choose whether to monitor all designs, only your owned designs, or only shared designs',
        },
      },
    },
    new_thread_reply: {
      displayName: 'New Thread Reply',
      shortDesc: 'Triggers when a new reply is added to a comment thread',
      longDesc:
        'This trigger fires when someone adds a new reply to a specific comment thread on a Canva design',
      options: {
        design: {
          displayName: 'Design',
          shortDesc: 'The design to monitor for new replies',
          longDesc:
            'Select the Canva design that contains the comment thread you want to monitor for new replies',
        },
        thread: {
          displayName: 'Thread ID',
          shortDesc: 'The comment thread to monitor',
          longDesc:
            'The unique identifier of the comment thread you want to monitor for new replies',
        },
      },
    },
  },
};

export default CanvaAppEn;
