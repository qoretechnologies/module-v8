const GithubAppEn = {
  displayName: 'Github',
  groups: ['Version Control & Code Repositories'],
  shortDesc: 'Collection of actions to interact with the Github API',
  longDesc: 'Collection of actions to interact with the Github API',
  triggers: {
    new_repository_issue: {
      displayName: 'New Repository Issue',
      shortDesc: 'Triggers when a new issue is created in a repository',
      longDesc: 'Triggers when a new issue is created in a repository',
      options: {
        repo: {
          longDesc: 'Repository name',
          shortDesc: 'Repository name',
          displayName: 'Repository name',
        },
        owner: {
          longDesc: 'Organization name or user login',
          shortDesc: 'Organization name or user login',
          displayName: 'Repository owner',
        },
      },
      event_info: {
        desc: 'GitHub Issue Event Data',
        type: {
          fields: {
            action: {
              displayName: 'Action',
              shortDesc: 'Action type',
              longDesc: 'Type of action performed on the issue (e.g., opened, closed)',
            },
            issue: {
              displayName: 'Issue',
              shortDesc: 'Issue details',
              longDesc: 'Details of the issue created',
              type: {
                fields: {
                  url: {
                    displayName: 'Issue URL',
                    shortDesc: 'URL of the issue',
                    longDesc: 'The API URL for the specific issue',
                  },
                  number: {
                    displayName: 'Issue Number',
                    shortDesc: 'Number of the issue',
                    longDesc: 'Unique number identifier for the issue',
                  },
                  title: {
                    displayName: 'Issue Title',
                    shortDesc: 'Title of the issue',
                    longDesc: 'The title or subject of the issue',
                  },
                  user: {
                    displayName: 'User',
                    shortDesc: 'Issue creator',
                    longDesc: 'Details of the user who created the issue',
                    type: {
                      fields: {
                        login: {
                          displayName: 'Login',
                          shortDesc: 'Username',
                          longDesc: 'GitHub username of the user',
                        },
                        id: {
                          displayName: 'User ID',
                          shortDesc: 'GitHub user ID',
                          longDesc: 'Unique identifier for the GitHub user',
                        },
                        avatar_url: {
                          displayName: 'Avatar URL',
                          shortDesc: 'User avatar URL',
                          longDesc: "URL of the user's avatar image",
                        },
                        html_url: {
                          displayName: 'Profile URL',
                          shortDesc: 'User profile URL',
                          longDesc: 'Link to the GitHub profile of the user',
                        },
                      },
                    },
                  },
                  labels: {
                    displayName: 'Labels',
                    shortDesc: 'Issue labels',
                    longDesc: 'List of labels associated with the issue',
                  },
                  state: {
                    displayName: 'State',
                    shortDesc: 'Issue state',
                    longDesc: 'Current state of the issue (e.g., open, closed)',
                  },
                  locked: {
                    displayName: 'Locked',
                    shortDesc: 'Issue lock status',
                    longDesc: 'Whether the issue is locked for editing',
                  },
                  assignee: {
                    displayName: 'Assignee',
                    shortDesc: 'Assigned user',
                    longDesc: 'Details of the user assigned to the issue',
                    type: {
                      fields: {
                        login: {
                          displayName: 'Login',
                          shortDesc: 'Username',
                          longDesc: 'GitHub username of the assignee',
                        },
                        id: {
                          displayName: 'User ID',
                          shortDesc: 'GitHub user ID',
                          longDesc: 'Unique identifier for the GitHub user',
                        },
                        avatar_url: {
                          displayName: 'Avatar URL',
                          shortDesc: 'User avatar URL',
                          longDesc: "URL of the user's avatar image",
                        },
                        html_url: {
                          displayName: 'Profile URL',
                          shortDesc: 'User profile URL',
                          longDesc: 'Link to the GitHub profile of the assignee',
                        },
                      },
                    },
                  },
                  milestone: {
                    displayName: 'Milestone',
                    shortDesc: 'Milestone details',
                    longDesc: 'Details of the milestone associated with the issue',
                    type: {
                      fields: {
                        url: {
                          displayName: 'Milestone URL',
                          shortDesc: 'Milestone API URL',
                          longDesc: 'The API URL for the milestone',
                        },
                        html_url: {
                          displayName: 'Milestone HTML URL',
                          shortDesc: 'Milestone webpage URL',
                          longDesc: "URL of the milestone's webpage",
                        },
                        labels_url: {
                          displayName: 'Labels URL',
                          shortDesc: 'Labels API URL',
                          longDesc: "API URL for milestone's labels",
                        },
                        id: {
                          displayName: 'Milestone ID',
                          shortDesc: 'Milestone identifier',
                          longDesc: 'Unique identifier for the milestone',
                        },
                        number: {
                          displayName: 'Milestone Number',
                          shortDesc: 'Milestone number',
                          longDesc: 'Unique number for the milestone',
                        },
                        title: {
                          displayName: 'Milestone Title',
                          shortDesc: 'Title of the milestone',
                          longDesc: 'The title of the associated milestone',
                        },
                        description: {
                          displayName: 'Milestone Description',
                          shortDesc: 'Milestone details',
                          longDesc: 'A description of the milestone',
                        },
                        creator: {
                          displayName: 'Creator',
                          shortDesc: 'Milestone creator',
                          longDesc: 'Details of the user who created the milestone',
                          type: {
                            fields: {
                              login: {
                                displayName: 'Login',
                                shortDesc: 'Username',
                                longDesc: 'GitHub username of the creator',
                              },
                              id: {
                                displayName: 'User ID',
                                shortDesc: 'GitHub user ID',
                                longDesc: 'Unique identifier for the creator',
                              },
                              avatar_url: {
                                displayName: 'Avatar URL',
                                shortDesc: 'User avatar URL',
                                longDesc: "URL of the creator's avatar image",
                              },
                              html_url: {
                                displayName: 'Profile URL',
                                shortDesc: 'User profile URL',
                                longDesc: "Link to the creator's GitHub profile",
                              },
                            },
                          },
                        },
                        open_issues: {
                          displayName: 'Open Issues',
                          shortDesc: 'Count of open issues',
                          longDesc: 'The number of open issues in this milestone',
                        },
                        closed_issues: {
                          displayName: 'Closed Issues',
                          shortDesc: 'Count of closed issues',
                          longDesc: 'The number of closed issues in this milestone',
                        },
                        state: {
                          displayName: 'State',
                          shortDesc: 'Milestone state',
                          longDesc: 'Current state of the milestone (e.g., open, closed)',
                        },
                        created_at: {
                          displayName: 'Created At',
                          shortDesc: 'Creation time',
                          longDesc: 'Timestamp when the milestone was created',
                        },
                        updated_at: {
                          displayName: 'Updated At',
                          shortDesc: 'Update time',
                          longDesc: 'Timestamp when the milestone was last updated',
                        },
                        due_on: {
                          displayName: 'Due Date',
                          shortDesc: 'Milestone due date',
                          longDesc: 'Date by which the milestone is expected to be completed',
                        },
                        closed_at: {
                          displayName: 'Closed At',
                          shortDesc: 'Closure time',
                          longDesc: 'Timestamp when the milestone was closed',
                        },
                      },
                    },
                  },
                  comments: {
                    displayName: 'Comments Count',
                    shortDesc: 'Number of comments',
                    longDesc: 'Total number of comments on the issue',
                  },
                  created_at: {
                    displayName: 'Created At',
                    shortDesc: 'Issue creation time',
                    longDesc: 'The timestamp when the issue was created',
                  },
                  updated_at: {
                    displayName: 'Updated At',
                    shortDesc: 'Issue update time',
                    longDesc: 'The timestamp when the issue was last updated',
                  },
                  closed_at: {
                    displayName: 'Closed At',
                    shortDesc: 'Issue closure time',
                    longDesc: 'The timestamp when the issue was closed (if applicable)',
                  },
                  body: {
                    displayName: 'Body',
                    shortDesc: 'Issue description',
                    longDesc: 'The detailed description of the issue',
                  },
                },
              },
            },
            repository: {
              displayName: 'Repository',
              shortDesc: 'Repository details',
              longDesc: 'Details of the repository where the issue resides',
              type: {
                fields: {
                  id: {
                    displayName: 'Repository ID',
                    shortDesc: 'Unique ID',
                    longDesc: 'Unique identifier for the repository',
                  },
                  name: {
                    displayName: 'Repository Name',
                    shortDesc: 'Name of the repository',
                    longDesc: 'The name of the GitHub repository',
                  },
                  private: {
                    displayName: 'Private',
                    shortDesc: 'Privacy status',
                    longDesc: 'Whether the repository is private',
                  },
                  owner: {
                    displayName: 'Owner',
                    shortDesc: 'Repository owner',
                    longDesc: 'Details of the user or organization that owns the repository',
                    type: {
                      fields: {
                        login: {
                          displayName: 'Login',
                          shortDesc: 'Username',
                          longDesc: 'GitHub username of the owner',
                        },
                        id: {
                          displayName: 'Owner ID',
                          shortDesc: 'Unique ID',
                          longDesc: 'Unique identifier for the repository owner',
                        },
                        avatar_url: {
                          displayName: 'Avatar URL',
                          shortDesc: 'Avatar link',
                          longDesc: "URL of the owner's avatar image",
                        },
                        html_url: {
                          displayName: 'Profile URL',
                          shortDesc: 'Profile link',
                          longDesc: "Link to the owner's GitHub profile",
                        },
                      },
                    },
                  },
                },
              },
            },
            sender: {
              displayName: 'Sender',
              shortDesc: 'Event sender',
              longDesc: 'Details of the sender who triggered the event',
              type: {
                fields: {
                  login: {
                    displayName: 'Login',
                    shortDesc: 'Username',
                    longDesc: 'GitHub username of the sender',
                  },
                  id: {
                    displayName: 'Sender ID',
                    shortDesc: 'Unique ID',
                    longDesc: 'Unique identifier for the sender',
                  },
                  html_url: {
                    displayName: 'Profile URL',
                    shortDesc: 'Profile link',
                    longDesc: "Link to the sender's GitHub profile",
                  },
                  avatar_url: {
                    displayName: 'Avatar URL',
                    shortDesc: 'Avatar link',
                    longDesc: "URL of the sender's avatar image",
                  },
                },
              },
            },
          },
        },
      },
    },
    new_repository_branch: {
      displayName: 'New Repository Branch',
      shortDesc: 'Triggers when a new branch is created in a repository',
      longDesc: 'Triggers when a new branch is created in a repository',
      options: {
        repo: {
          longDesc: 'Repository name',
          shortDesc: 'Repository name',
          displayName: 'Repository name',
        },
        owner: {
          longDesc: 'Organization name or user login',
          shortDesc: 'Organization name or user login',
          displayName: 'Repository owner',
        },
      },
    },
    new_commit_comment: {
      displayName: 'New Commit Comment',
      shortDesc: 'Triggers when a new comment is added to a commit',
      longDesc: 'Triggers when a new comment is added to a commit',
      options: {
        repo: {
          longDesc: 'Repository name',
          shortDesc: 'Repository name',
          displayName: 'Repository name',
        },
        owner: {
          longDesc: 'Organization name or user login',
          shortDesc: 'Organization name or user login',
          displayName: 'Repository owner',
        },
      },
    },
    new_commit: {
      displayName: 'New Commit',
      shortDesc: 'Triggers when a new commit is pushed to a repository',
      longDesc: 'Triggers when a new commit is pushed to a repository',
      options: {
        repo: {
          longDesc: 'Repository name',
          shortDesc: 'Repository name',
          displayName: 'Repository name',
        },
        owner: {
          longDesc: 'Organization name or user login',
          shortDesc: 'Organization name or user login',
          displayName: 'Repository owner',
        },
      },
    },
    new_pull_request: {
      displayName: 'New Pull Request',
      shortDesc: 'Triggers when a new pull request is opened',
      longDesc: 'Triggers when a new pull request is opened',
      options: {
        repo: {
          longDesc: 'Repository name',
          shortDesc: 'Repository name',
          displayName: 'Repository name',
        },
        owner: {
          longDesc: 'Organization name or user login',
          shortDesc: 'Organization name or user login',
          displayName: 'Repository owner',
        },
      },
    },
    new_release: {
      displayName: 'New Release',
      shortDesc: 'Triggers when a new release is published',
      longDesc: 'Triggers when a new release is published',
      options: {
        repo: {
          longDesc: 'Repository name',
          shortDesc: 'Repository name',
          displayName: 'Repository name',
        },
        owner: {
          longDesc: 'Organization name or user login',
          shortDesc: 'Organization name or user login',
          displayName: 'Repository owner',
        },
      },
    },
    new_review_request: {
      displayName: 'New Review Request',
      shortDesc: 'Triggers when a new review is requested',
      longDesc: 'Triggers when a new review is requested',
      options: {
        repo: {
          longDesc: 'Repository name',
          shortDesc: 'Repository name',
          displayName: 'Repository name',
        },
        owner: {
          longDesc: 'Organization name or user login',
          shortDesc: 'Organization name or user login',
          displayName: 'Repository owner',
        },
      },
    },
  },
  actions: {
    'repos-list-for-org': { groups: ['Repositories'] },
    'repos-create-in-org': { groups: ['Repositories'] },
    'repos-delete': { groups: ['Repositories'] },
    'repos-get': { groups: ['Repositories'] },
    'repos-update': { groups: ['Repositories'] },
    'repos-list-for-authenticated-user': { groups: ['Repositories'] },
    'repos-create-for-authenticated-user': { groups: ['Repositories'] },
    'repos-list-contributors': { groups: ['Repositories'] },
    'repos-get-content': { groups: ['Content & Files'] },
    'repos-delete-file': { groups: ['Content & Files'] },
    'repos-create-or-update-file-contents': { groups: ['Content & Files'] },
    'repos-list-branches': { groups: ['Branches'] },
    'repos-get-branch': { groups: ['Branches'] },
    new_repository_branch: { groups: ['Event Triggers'] },
    'repos-list-collaborators': { groups: ['Collaborators'] },
    'repos-list-commits': { groups: ['Commits'] },
    new_commit: { groups: ['Event Triggers'] },
    new_commit_comment: { groups: ['Event Triggers'] },
    'issues-list': { groups: ['Issues'] },
    'issues-list-for-repo': { groups: ['Issues'] },
    'issues-create': { groups: ['Issues'] },
    'issues-get': { groups: ['Issues'] },
    'issues-update': { groups: ['Issues'] },
    'issues-remove-assignees': { groups: ['Issues'] },
    'issues-add-assignees': { groups: ['Issues'] },
    new_repository_issue: { groups: ['Event Triggers'] },
    'pulls-list': { groups: ['Pull Requests'] },
    'pulls-create': { groups: ['Pull Requests'] },
    'pulls-get': { groups: ['Pull Requests'] },
    'pulls-update': { groups: ['Pull Requests'] },
    'pulls-remove-requested-reviewers': { groups: ['Pull Requests'] },
    'pulls-list-requested-reviewers': { groups: ['Pull Requests'] },
    'pulls-request-reviewers': { groups: ['Pull Requests'] },
    new_pull_request: { groups: ['Event Triggers'] },
    new_review_request: { groups: ['Event Triggers'] },
    'actions-get-repo-public-key': { groups: ['Actions & Secrets'] },
    'actions-delete-repo-secret': { groups: ['Actions & Secrets'] },
    'actions-get-repo-secret': { groups: ['Actions & Secrets'] },
    'actions-create-or-update-repo-secret': { groups: ['Actions & Secrets'] },
    'actions-list-repo-workflows': { groups: ['Actions & Secrets'] },
    'git-create-ref': { groups: ['Git'] },
    'repos-list-releases': { groups: ['Releases'] },
    'repos-create-release': { groups: ['Releases'] },
    new_release: { groups: ['Event Triggers'] },
    'orgs-list-members': { groups: ['Organizations'] },
    'search-issues-and-pull-requests': { groups: ['Search'] },
    'search-repos': { groups: ['Search'] },
  },
  expressions: {},
};

export default GithubAppEn;
