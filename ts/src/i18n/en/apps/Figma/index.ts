/* eslint-disable max-len */
const FigmaAppEn = {
  displayName: 'Figma',
  shortDesc: 'Design and prototyping platform for teams',
  longDesc:
    'Figma is a collaborative interface design tool that allows teams to create, prototype, and collaborate on digital designs in real-time. Connect to access files, comments, projects, and team data.',
  triggers: {
    new_file_comment: {
      displayName: 'New File Comment',
      shortDesc: 'Triggers when a new comment is added to a file',
      longDesc:
        'Monitors a specific Figma design file for new comments and triggers when team members add feedback or discussions',
      options: {
        team: {
          displayName: 'Team',
          shortDesc: 'The Figma team to monitor',
          longDesc: 'Select the Figma team that contains the project and file you want to monitor',
        },
        project: {
          displayName: 'Project',
          shortDesc: 'The project containing the file',
          longDesc: 'Choose the specific project within the team that contains the file to monitor',
        },
        key: {
          displayName: 'File Key',
          shortDesc: 'The specific file to monitor for comments',
          longDesc:
            'Select the Figma design file that you want to monitor for new comment activity',
        },
      },
    },
    new_file_version: {
      displayName: 'New File Version',
      shortDesc: 'Triggers when a new version of a file is created',
      longDesc:
        'Monitors a specific Figma design file for version updates and triggers when new versions are saved',
      options: {
        team: {
          displayName: 'Team',
          shortDesc: 'The Figma team to monitor',
          longDesc: 'Select the Figma team that contains the project and file you want to monitor',
        },
        project: {
          displayName: 'Project',
          shortDesc: 'The project containing the file',
          longDesc: 'Choose the specific project within the team that contains the file to monitor',
        },
        key: {
          displayName: 'File Key',
          shortDesc: 'The specific file to monitor for versions',
          longDesc:
            'Select the Figma design file that you want to monitor for new version activity',
        },
      },
    },
  },

  actions: {
    create_comment: {
      displayName: 'Create Comment',
      shortDesc: 'Add a new comment to a Figma file',
      longDesc:
        'Post a new comment or reply to an existing comment on a specific Figma design file',
      options: {
        team: {
          displayName: 'Team',
          shortDesc: 'The Figma team containing the file',
          longDesc: 'Select the Figma team that contains the project and file',
        },
        project: {
          displayName: 'Project',
          shortDesc: 'The project containing the file',
          longDesc: 'Choose the specific project within the team that contains the file',
        },
        key: {
          displayName: 'File Key',
          shortDesc: 'The file to comment on',
          longDesc: 'Select the specific Figma design file where you want to add a comment',
        },
        message: {
          displayName: 'Message',
          shortDesc: 'The comment message content',
          longDesc: 'Enter the text content of the comment you want to post on the Figma file',
        },
        comment_id: {
          displayName: 'Parent Comment ID',
          shortDesc: 'ID of comment to reply to (optional)',
          longDesc:
            'Optional ID of an existing comment to reply to, leave empty to create a new top-level comment',
        },
      },
    },
    list_comments: {
      displayName: 'List Comments',
      shortDesc: 'List all comments on a Figma file',
      longDesc:
        'Retrieve all comments and discussions on a specific Figma design file, including user information and timestamps',
      options: {
        team: {
          displayName: 'Team',
          shortDesc: 'The Figma team containing the file',
          longDesc: 'Select the Figma team that contains the project and file',
        },
        project: {
          displayName: 'Project',
          shortDesc: 'The project containing the file',
          longDesc: 'Choose the specific project within the team that contains the file',
        },
        key: {
          displayName: 'File Key',
          shortDesc: 'The file to list comments from',
          longDesc: 'Select the specific Figma design file whose comments you want to retrieve',
        },
      },
    },
    list_file_version_history: {
      displayName: 'List File Version History',
      shortDesc: 'Get version history for a Figma file',
      longDesc:
        'Retrieve the complete version history of a specific Figma design file, including timestamps, labels, and user information',
      options: {
        team: {
          displayName: 'Team',
          shortDesc: 'The Figma team containing the file',
          longDesc: 'Select the Figma team that contains the project and file',
        },
        project: {
          displayName: 'Project',
          shortDesc: 'The project containing the file',
          longDesc: 'Choose the specific project within the team that contains the file',
        },
        key: {
          displayName: 'File Key',
          shortDesc: 'The file to get version history for',
          longDesc:
            'Select the specific Figma design file whose version history you want to retrieve',
        },
        next_page_url: {
          displayName: 'Next Page URL',
          shortDesc: 'URL for pagination to get next page of results',
          longDesc:
            'Optional URL to retrieve the next page of version history results for large files with many versions',
        },
      },
    },
    list_project_files: {
      displayName: 'List Project Files',
      shortDesc: 'List all files in a Figma project',
      longDesc:
        'Retrieve a list of all design files within a specified Figma project, including file keys, names, and metadata',
      options: {
        team: {
          displayName: 'Team',
          shortDesc: 'The Figma team containing the project',
          longDesc: 'Select the Figma team that contains the project whose files you want to list',
        },
        project: {
          displayName: 'Project ID',
          shortDesc: 'The project to list files from',
          longDesc: 'Choose the specific Figma project whose files you want to retrieve',
        },
      },
    },
    list_projects: {
      displayName: 'List Projects',
      shortDesc: 'List all projects in a Figma team',
      longDesc:
        'Retrieve a list of all projects within a specified Figma team, including project names and IDs',
      options: {
        team: {
          displayName: 'Team ID',
          shortDesc: 'The Figma team to list projects from',
          longDesc: 'Enter the ID of the Figma team whose projects you want to retrieve',
        },
      },
    },
  },
};

export default FigmaAppEn;
