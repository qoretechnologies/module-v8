/* eslint-disable max-len */
const GitLabAppEn = {
  displayName: 'GitLab',
  shortDesc:
    'Connect to GitLab to manage repositories, issues, merge requests, and CI/CD pipelines',
  longDesc:
    "The GitLab integration provides comprehensive access to GitLab's API for managing your development workflow. Automate repository operations, track issues and merge requests, manage team members and access controls, configure CI/CD variables, and maintain project documentation through wikis. Whether you're coordinating a development team or automating DevOps processes, this integration streamlines your GitLab operations.",
  actions: {
    // Groups Management
    getApiV4Groups: { group: 'Groups' },
    postApiV4Groups: { group: 'Groups' },
    deleteApiV4GroupsId: { group: 'Groups' },
    getApiV4GroupsId: { group: 'Groups' },
    putApiV4GroupsId: { group: 'Groups' },

    // Group Members
    getApiV4GroupsIdMembers: { group: 'Group Members' },
    postApiV4GroupsIdMembers: { group: 'Group Members' },
    deleteApiV4GroupsIdMembersUserId: { group: 'Group Members' },
    getApiV4GroupsIdMembersUserId: { group: 'Group Members' },
    putApiV4GroupsIdMembersUserId: { group: 'Group Members' },

    // Group Variables
    getApiV4GroupsIdVariables: { group: 'Group Variables' },
    postApiV4GroupsIdVariables: { group: 'Group Variables' },
    deleteApiV4GroupsIdVariablesKey: { group: 'Group Variables' },
    getApiV4GroupsIdVariablesKey: { group: 'Group Variables' },
    putApiV4GroupsIdVariablesKey: { group: 'Group Variables' },

    // Group Wikis
    getApiV4GroupsIdWikis: { group: 'Group Wikis' },
    postApiV4GroupsIdWikis: { group: 'Group Wikis' },
    deleteApiV4GroupsIdWikisSlug: { group: 'Group Wikis' },
    getApiV4GroupsIdWikisSlug: { group: 'Group Wikis' },
    putApiV4GroupsIdWikisSlug: { group: 'Group Wikis' },

    // Issues
    getApiV4Issues: { group: 'Issues' },
    getApiV4IssuesId: { group: 'Issues' },
    getApiV4ProjectsIdIssues: { group: 'Issues' },
    postApiV4ProjectsIdIssues: { group: 'Issues' },
    deleteApiV4ProjectsIdIssuesIssueIid: { group: 'Issues' },
    getApiV4ProjectsIdIssuesIssueIid: { group: 'Issues' },
    putApiV4ProjectsIdIssuesIssueIid: { group: 'Issues' },
    getApiV4ProjectsIdIssuesIssueIidTimeStats: { group: 'Issues' },

    // Projects Management
    getApiV4Projects: { group: 'Projects' },
    postApiV4Projects: { group: 'Projects' },
    deleteApiV4ProjectsId: { group: 'Projects' },
    getApiV4ProjectsId: { group: 'Projects' },
    putApiV4ProjectsId: { group: 'Projects' },
    get_project_id_by_url: {
      group: 'Projects',
      displayName: 'Get Project ID by URL',
      shortDesc: 'Retrieve a GitLab project ID and path information from a project URL',
      longDesc:
        'Extracts and retrieves the project ID, encoded path, and full path with namespace from a GitLab project URL. This action is useful when you have a project URL and need to obtain the project identifier for use in other GitLab API operations. The action decodes the URL, queries the GitLab API, and returns both the numeric project ID and the URL-encoded path for convenient use in subsequent actions.',
      options: {
        project_url: {
          displayName: 'Project URL',
          shortDesc: 'The full URL of the GitLab project',
          longDesc:
            'Provide the complete URL of the GitLab project (e.g., https://gitlab.com/username/project-name). The action will extract the project path from this URL and retrieve the corresponding project information including the numeric ID.',
        },
      },
    },
    getApiV4ProjectsIdUsers: { group: 'Projects' },

    // Project Members
    getApiV4ProjectsIdMembers: { group: 'Project Members' },
    postApiV4ProjectsIdMembers: { group: 'Project Members' },
    deleteApiV4ProjectsIdMembersUserId: { group: 'Project Members' },
    getApiV4ProjectsIdMembersUserId: { group: 'Project Members' },
    putApiV4ProjectsIdMembersUserId: { group: 'Project Members' },

    // Deploy Keys
    getApiV4ProjectsIdDeployKeys: { group: 'Deploy Keys' },
    postApiV4ProjectsIdDeployKeys: { group: 'Deploy Keys' },
    deleteApiV4ProjectsIdDeployKeysKeyId: { group: 'Deploy Keys' },
    getApiV4ProjectsIdDeployKeysKeyId: { group: 'Deploy Keys' },
    putApiV4ProjectsIdDeployKeysKeyId: { group: 'Deploy Keys' },
    postApiV4ProjectsIdDeployKeysKeyIdEnable: { group: 'Deploy Keys' },

    // Merge Requests
    getApiV4ProjectsIdMergeRequests: { group: 'Merge Requests' },
    postApiV4ProjectsIdMergeRequests: { group: 'Merge Requests' },
    deleteApiV4ProjectsIdMergeRequestsMergeRequestIid: { group: 'Merge Requests' },
    getApiV4ProjectsIdMergeRequestsMergeRequestIid: { group: 'Merge Requests' },
    putApiV4ProjectsIdMergeRequestsMergeRequestIid: { group: 'Merge Requests' },
    postApiV4ProjectsIdMergeRequestsMergeRequestIidApprove: { group: 'Merge Requests' },
    postApiV4ProjectsIdMergeRequestsMergeRequestIidUnapprove: { group: 'Merge Requests' },

    // Repository Branches
    getApiV4ProjectsIdRepositoryBranches: { group: 'Repository Branches' },
    postApiV4ProjectsIdRepositoryBranches: { group: 'Repository Branches' },
    deleteApiV4ProjectsIdRepositoryBranchesBranch: { group: 'Repository Branches' },
    getApiV4ProjectsIdRepositoryBranchesBranch: { group: 'Repository Branches' },
    deleteApiV4ProjectsIdRepositoryMergedBranches: { group: 'Repository Branches' },

    // Repository Commits
    getApiV4ProjectsIdRepositoryCommits: { group: 'Repository Commits' },
    postApiV4ProjectsIdRepositoryCommits: { group: 'Repository Commits' },
    getApiV4ProjectsIdRepositoryCommitsSha: { group: 'Repository Commits' },
    getApiV4ProjectsIdRepositoryCommitsShaComments: { group: 'Repository Commits' },
    postApiV4ProjectsIdRepositoryCommitsShaComments: { group: 'Repository Commits' },

    // Project Variables
    getApiV4ProjectsIdVariables: { group: 'Project Variables' },
    postApiV4ProjectsIdVariables: { group: 'Project Variables' },
    deleteApiV4ProjectsIdVariablesKey: { group: 'Project Variables' },
    getApiV4ProjectsIdVariablesKey: { group: 'Project Variables' },
    putApiV4ProjectsIdVariablesKey: { group: 'Project Variables' },

    // Project Wikis
    getApiV4ProjectsIdWikis: { group: 'Project Wikis' },
    postApiV4ProjectsIdWikis: { group: 'Project Wikis' },
    deleteApiV4ProjectsIdWikisSlug: { group: 'Project Wikis' },
    getApiV4ProjectsIdWikisSlug: { group: 'Project Wikis' },
    putApiV4ProjectsIdWikisSlug: { group: 'Project Wikis' },
  },
  triggers: {
    new_merge_request: {
      displayName: 'New Merge Request',
      shortDesc: 'Triggers when a new merge request is created in GitLab',
      longDesc:
        'Monitors GitLab projects or groups for newly created merge requests. This trigger polls for merge requests based on your specified filters, including project scope, group scope, reviewer assignments, and search criteria. Useful for automating code review workflows, notifications, and approval processes.',
      options: {
        project: {
          displayName: 'Project',
          shortDesc: 'The GitLab project to monitor for merge requests',
          longDesc:
            'Select a specific GitLab project to monitor for new merge requests. When specified, only merge requests from this project will trigger the event. Leave empty to monitor all projects you have access to, or use in combination with the group filter.',
        },
        group: {
          displayName: 'Group',
          shortDesc: 'The GitLab group to monitor for merge requests',
          longDesc:
            'Select a specific GitLab group to monitor for new merge requests across all projects within that group. When specified, only merge requests from projects in this group will trigger the event. This is useful for monitoring organization-wide merge request activity.',
        },
        onlyAssignedToMe: {
          displayName: 'Only Assigned to Me',
          shortDesc: 'Monitor only merge requests where you are a reviewer',
          longDesc:
            'When enabled, the trigger will only fire for merge requests where the authenticated user is assigned as a reviewer. This helps filter merge requests to show only those requiring your attention. When disabled, all merge requests matching other criteria will be monitored.',
        },
        search: {
          displayName: 'Search',
          shortDesc: 'Search term to filter merge requests',
          longDesc:
            'Enter a search term to filter merge requests by title or description. The search is case-insensitive and matches partial strings. Use this to monitor merge requests related to specific features, bug fixes, or keywords.',
        },
      },
    },
    new_commit: {
      displayName: 'New Commit',
      shortDesc: 'Triggers when a new commit is pushed to a GitLab project',
      longDesc:
        'Monitors a GitLab project for newly pushed commits. This trigger polls for commits based on your specified filters, including file paths, commit authors, and statistics. Ideal for automating deployment pipelines, code quality checks, and notification workflows when new code is pushed.',
      options: {
        project: {
          displayName: 'Project',
          shortDesc: 'The GitLab project to monitor for commits',
          longDesc:
            'Select the GitLab project to monitor for new commits. This field is required as commits are specific to individual projects. The trigger will check for new commits pushed to any branch in the selected project.',
        },
        withStats: {
          displayName: 'Include Statistics',
          shortDesc: 'Include commit statistics in the event data',
          longDesc:
            'When enabled, the trigger will include detailed statistics about each commit, such as the number of additions, deletions, and total changes. This adds processing overhead but provides valuable metrics for analyzing commit impact. When disabled, only basic commit information is returned.',
        },
        path: {
          displayName: 'File Path',
          shortDesc: 'Filter commits that modify a specific file or directory',
          longDesc:
            'Specify a file path or directory to filter commits. Only commits that modify files matching this path will trigger the event. This is useful for monitoring changes to specific components, configuration files, or documentation. Leave empty to monitor all commits regardless of changed files.',
        },
        author: {
          displayName: 'Author',
          shortDesc: 'Filter commits by author email or name',
          longDesc:
            'Enter an author email address or name to filter commits by committer. Only commits authored by the specified user will trigger the event. This helps monitor contributions from specific team members or external contributors. Leave empty to monitor commits from all authors.',
        },
      },
    },
    new_commit_comment: {
      displayName: 'New Commit Comment',
      shortDesc: 'Triggers when a new comment is added to a commit',
      longDesc:
        'Monitors a specific commit in a GitLab project for new comments. This trigger polls for comments added to the specified commit, including inline code comments and general commit discussion. Useful for tracking code review feedback, questions, and discussions about specific commits.',
      options: {
        project: {
          displayName: 'Project',
          shortDesc: 'The GitLab project containing the commit',
          longDesc:
            'Select the GitLab project that contains the commit you want to monitor. This field is required as commits are specific to individual projects. The project selection determines which commits are available in the commit dropdown.',
        },
        commit: {
          displayName: 'Commit',
          shortDesc: 'The specific commit to monitor for comments',
          longDesc:
            "Select the specific commit to monitor for new comments. The dropdown shows recent commits from the selected project with their titles and SHA identifiers. The trigger will fire whenever a new comment is added to this commit, whether it's an inline code comment or a general discussion comment.",
        },
      },
    },
    new_issue: {
      displayName: 'New Issue',
      shortDesc: 'Triggers when a new issue is created in GitLab',
      longDesc:
        'Monitors GitLab projects or groups for newly created issues. This trigger polls for issues based on your specified filters, including project scope, group scope, assignee, milestone, and search criteria. Perfect for automating issue tracking workflows, team notifications, and project management integration.',
      options: {
        project: {
          displayName: 'Project',
          shortDesc: 'The GitLab project to monitor for issues',
          longDesc:
            'Select a specific GitLab project to monitor for new issues. When specified, only issues from this project will trigger the event. Leave empty to monitor all projects you have access to, or use in combination with the group filter for broader monitoring.',
        },
        group: {
          displayName: 'Group',
          shortDesc: 'The GitLab group to monitor for issues',
          longDesc:
            'Select a specific GitLab group to monitor for new issues across all projects within that group. When specified, only issues from projects in this group will trigger the event. This is useful for monitoring organization-wide issue activity and cross-project tracking.',
        },
        onlyAssignedToMe: {
          displayName: 'Only Assigned to Me',
          shortDesc: 'Monitor only issues assigned to you',
          longDesc:
            'When enabled, the trigger will only fire for issues where the authenticated user is the assignee. This helps filter issues to show only those requiring your attention or action. When disabled, all issues matching other criteria will be monitored regardless of assignee.',
        },
        search: {
          displayName: 'Search',
          shortDesc: 'Search term to filter issues',
          longDesc:
            'Enter a search term to filter issues by title or description. The search is case-insensitive and matches partial strings. Use this to monitor issues related to specific features, bugs, or topics of interest.',
        },
        milestone: {
          displayName: 'Milestone',
          shortDesc: 'Filter issues by milestone',
          longDesc:
            'Enter a milestone title to filter issues assigned to a specific milestone. Only issues tagged with the specified milestone will trigger the event. This is useful for tracking issues within specific release cycles, sprints, or project phases. Leave empty to monitor issues across all milestones.',
        },
      },
    },
  },
};

export default GitLabAppEn;
