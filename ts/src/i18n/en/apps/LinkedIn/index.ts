/* eslint-disable max-len */
const LinkedInAppEn = {
  displayName: 'LinkedIn',
  groups: ['Social Media Management'],
  shortDesc: 'Professional networking and career development platform',
  longDesc:
    "LinkedIn is the world's largest professional networking platform that connects professionals, enables career development, and facilitates business networking. It allows users to build professional profiles, connect with colleagues, share industry insights, and discover career opportunities.",
  actions: {
    create_user_text_post: {
      displayName: 'Create User Text Post',
      shortDesc: 'Create a text post on LinkedIn',
      longDesc: 'Create a text-based post on LinkedIn with optional mentions and links',
      options: {
        content: {
          displayName: 'Content',
          shortDesc: 'The text content of the post',
          longDesc: 'The main text content that will be displayed in the LinkedIn post',
        },
        mentions: {
          displayName: 'Mentions',
          shortDesc: 'List of entities to mention in the post',
          longDesc:
            'A list of companies or other entities to mention in the post with their position and URN',
          type: {
            element_type: {
              fields: {
                entity: {
                  displayName: 'Entity Type',
                  shortDesc: 'Type of entity being mentioned',
                  longDesc: 'The type of entity being mentioned (e.g., company)',
                },
                urn: {
                  displayName: 'Entity URN',
                  shortDesc: 'LinkedIn URN of the entity',
                  longDesc:
                    'The LinkedIn URN (Uniform Resource Name) of the entity being mentioned',
                },
                start: {
                  displayName: 'Start Position',
                  shortDesc: 'Character position where mention starts',
                  longDesc: 'The character position in the text where the mention begins',
                },
              },
            },
          },
        },
        visibility: {
          displayName: 'Visibility',
          shortDesc: 'Who can see this post',
          longDesc: 'Set the visibility of the post to either public or connections only',
        },
        link: {
          displayName: 'Link',
          shortDesc: 'Optional link to include in the post',
          longDesc: 'Add a link with title and description to the post',
          type: {
            fields: {
              description: {
                displayName: 'Link Description',
                shortDesc: 'Description of the linked content',
                longDesc: 'A brief description of what the link contains',
              },
              url: {
                displayName: 'URL',
                shortDesc: 'The web address to link to',
                longDesc: 'The complete URL that will be linked in the post',
              },
              title: {
                displayName: 'Link Title',
                shortDesc: 'Title for the linked content',
                longDesc: 'The title that will be displayed for the linked content',
              },
            },
          },
        },
      },
    },
    create_user_video_post: {
      displayName: 'Create User Video Post',
      shortDesc: 'Create a video post on LinkedIn',
      longDesc: 'Upload and share a video post on LinkedIn with optional mentions',
      options: {
        content: {
          displayName: 'Content',
          shortDesc: 'The text content of the post',
          longDesc: 'The main text content that will accompany the video in the LinkedIn post',
        },
        mentions: {
          displayName: 'Mentions',
          shortDesc: 'List of entities to mention in the post',
          longDesc:
            'A list of companies or other entities to mention in the post with their position and URN',
          type: {
            element_type: {
              fields: {
                entity: {
                  displayName: 'Entity Type',
                  shortDesc: 'Type of entity being mentioned',
                  longDesc: 'The type of entity being mentioned (e.g., company)',
                },
                urn: {
                  displayName: 'Entity URN',
                  shortDesc: 'LinkedIn URN of the entity',
                  longDesc:
                    'The LinkedIn URN (Uniform Resource Name) of the entity being mentioned',
                },
                start: {
                  displayName: 'Start Position',
                  shortDesc: 'Character position where mention starts',
                  longDesc: 'The character position in the text where the mention begins',
                },
              },
            },
          },
        },
        visibility: {
          displayName: 'Visibility',
          shortDesc: 'Who can see this post',
          longDesc: 'Set the visibility of the post to either public or connections only',
        },
        video: {
          displayName: 'Video File',
          shortDesc: 'Video file to upload',
          longDesc: 'The video file that will be uploaded and shared in the LinkedIn post',
        },
        videoTitle: {
          displayName: 'Video Title',
          shortDesc: 'Optional title for the video',
          longDesc: 'A title that will be displayed with the video content',
        },
      },
    },
    create_user_image_post: {
      displayName: 'Create User Image Post',
      shortDesc: 'Create an image post on LinkedIn',
      longDesc: 'Upload and share an image post on LinkedIn with optional mentions',
      options: {
        content: {
          displayName: 'Content',
          shortDesc: 'The text content of the post',
          longDesc: 'The main text content that will accompany the image in the LinkedIn post',
        },
        mentions: {
          displayName: 'Mentions',
          shortDesc: 'List of entities to mention in the post',
          longDesc:
            'A list of companies or other entities to mention in the post with their position and URN',
          type: {
            element_type: {
              fields: {
                entity: {
                  displayName: 'Entity Type',
                  shortDesc: 'Type of entity being mentioned',
                  longDesc: 'The type of entity being mentioned (e.g., company)',
                },
                urn: {
                  displayName: 'Entity URN',
                  shortDesc: 'LinkedIn URN of the entity',
                  longDesc:
                    'The LinkedIn URN (Uniform Resource Name) of the entity being mentioned',
                },
                start: {
                  displayName: 'Start Position',
                  shortDesc: 'Character position where mention starts',
                  longDesc: 'The character position in the text where the mention begins',
                },
              },
            },
          },
        },
        visibility: {
          displayName: 'Visibility',
          shortDesc: 'Who can see this post',
          longDesc: 'Set the visibility of the post to either public or connections only',
        },
        image: {
          displayName: 'Image File',
          shortDesc: 'Image file to upload',
          longDesc: 'The image file that will be uploaded and shared in the LinkedIn post',
        },
        imageTitle: {
          displayName: 'Image Title',
          shortDesc: 'Optional title for the image',
          longDesc: 'A title that will be displayed with the image content',
        },
      },
    },
    delete_user_post: {
      displayName: 'Delete User Post',
      shortDesc: 'Delete a LinkedIn post',
      longDesc: 'Delete an existing LinkedIn post by providing its ID',
      options: {
        post: {
          displayName: 'Post ID',
          shortDesc: 'ID of the post to delete',
          longDesc: 'The unique identifier of the LinkedIn post that should be deleted',
        },
      },
    },
    get_current_user: {
      displayName: 'Get Current User',
      shortDesc: 'Get current LinkedIn user information',
      longDesc: 'Retrieve information about the currently authenticated LinkedIn user',
    },
  },
};

export default LinkedInAppEn;
