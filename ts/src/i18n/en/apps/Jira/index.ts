

const JiraAppEn = {
  displayName: 'Jira',
  groups: ['Project & Task Management'],
  shortDesc: 'Collection of actions to interact with the Jira API',
  longDesc: 'Collection of actions to interact with the Jira API',
  triggers: {
    issue_created: {
      displayName: 'New Issue',
      shortDesc: 'Triggers when a new issue is created',
      longDesc: 'Triggers when a new issue is created',
      options: {
        project: {
          displayName: 'Project',
          shortDesc: 'The project to watch for new issues',
          longDesc: 'The project to watch for new issues',
        },
      },
    },
    issue_updated: {
      displayName: 'Updated Issue',
      shortDesc: 'Triggers when an issue is updated',
      longDesc: 'Triggers when an issue is updated',
      options: {
        project: {
          displayName: 'Project',
          shortDesc: 'The project to watch for updated issues',
          longDesc: 'The project to watch for updated issues',
        },
      },
    },
    project_created: {
      displayName: 'New Project',
      shortDesc: 'Triggers when a new project is created',
      longDesc: 'Triggers when a new project is created',
    },
  },
};

export default JiraAppEn;
