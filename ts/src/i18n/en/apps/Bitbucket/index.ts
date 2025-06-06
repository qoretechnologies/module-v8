/* eslint-disable max-len */
const BitbucketAppEn = {
  displayName: 'Bitbucket',
  shortDesc: 'Bitbucket is a Git repository management solution designed for professional teams.',
  longDesc:
    'Bitbucket is a Git repository management solution designed for professional teams. It provides features such as pull requests, code reviews, and continuous integration to help teams collaborate on code effectively.',
  triggers: {
    new_commit: {
      displayName: 'New Commit',
      shortDesc: 'Triggers when a new commit is pushed to a repository.',
      longDesc:
        'Monitors a Bitbucket repository for new commits and triggers when commits are pushed to any branch. Provides detailed commit information including author, message, hash, and repository details.',
      options: {
        workspace: {
          displayName: 'Workspace',
          shortDesc: 'The Bitbucket workspace',
          longDesc:
            'The Bitbucket workspace (organization or user account) that contains the repository to monitor.',
        },
        repo_slug: {
          displayName: 'Repository',
          shortDesc: 'The repository to monitor',
          longDesc:
            'The repository slug (name) of the Bitbucket repository to monitor for new commits.',
        },
      },
    },

    new_deployment: {
      displayName: 'New Deployment',
      shortDesc: 'Triggers when a new deployment is created for a repository.',
      longDesc:
        'Monitors a Bitbucket repository for new deployments and triggers when deployments are created or updated. Provides comprehensive deployment information including environment, state, commit details, and deployment steps.',
      options: {
        workspace: {
          displayName: 'Workspace',
          shortDesc: 'The Bitbucket workspace',
          longDesc:
            'The Bitbucket workspace (organization or user account) that contains the repository to monitor for deployments.',
        },
        repo_slug: {
          displayName: 'Repository',
          shortDesc: 'The repository to monitor',
          longDesc:
            'The repository slug (name) of the Bitbucket repository to monitor for new deployments.',
        },
      },
    },

    new_pull_request: {
      displayName: 'New Pull Request',
      shortDesc: 'Triggers when a new pull request is created or updated.',
      longDesc:
        'Monitors a Bitbucket repository for new pull requests and triggers when pull requests are created or their state changes. Supports filtering by pull request state and provides detailed information about the pull request, reviewers, and changes.',
      options: {
        workspace: {
          displayName: 'Workspace',
          shortDesc: 'The Bitbucket workspace',
          longDesc:
            'The Bitbucket workspace (organization or user account) that contains the repository to monitor for pull requests.',
        },
        repo_slug: {
          displayName: 'Repository',
          shortDesc: 'The repository to monitor',
          longDesc:
            'The repository slug (name) of the Bitbucket repository to monitor for new pull requests.',
        },
        state: {
          displayName: 'Pull Request State',
          shortDesc: 'Filter by pull request state',
          longDesc:
            'Optional filter to monitor only pull requests in a specific state (Open, Merged, Declined, or Superseded). If not specified, all pull requests will be monitored.',
        },
      },
    },
  },
};

export default BitbucketAppEn;
