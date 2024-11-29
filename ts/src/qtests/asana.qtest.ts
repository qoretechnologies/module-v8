import { ASANA_ACTIONS } from '../apps/asana';

let connection: string;

describe('Tests Asana Actions', () => {
  let workspaceId: string | null = null;
  let projectId: string | null = null;
  let taskId: string | null = null;
  let sectionId: string | null = null;
  let tagId: string | null = null;
  // let teamId: string | null = null;
  // let timePeriodId: string | null = null;
  // let portfolioId: string | null = null;
  // let goalId: string | null = null;

  beforeAll(() => {
    connection = testApi.createConnection('asana', {
      opts: {
        token: process.env.ASANA_PAT,
      },
    });

    workspaceId = process.env.ASANA_WORKSPACE_ID;
    expect(connection).toBeDefined();
  });

  // Workspaces
  it('Should list all workspaces', async () => {
    const action = ASANA_ACTIONS.find((a) => a.action === 'getWorkspaces');
    expect(action).toBeDefined();

    const { body } = await testApi.execAppAction('asana', action.action, connection);
    expect(body.data).toBeDefined();
    expect(body.data.length).toBeGreaterThan(0);
  });

  it('Should get a workspace', async () => {
    const action = ASANA_ACTIONS.find((a) => a.action === 'getWorkspace');
    expect(action).toBeDefined();

    const { body } = await testApi.execAppAction('asana', action.action, connection, {
      workspace_gid: workspaceId,
    });

    expect(body.data).toBeDefined();
    expect(body.data.gid).toBe(workspaceId);
  });

  it('should update a workspace', async () => {
    const action = ASANA_ACTIONS.find((a) => a.action === 'updateWorkspace');
    expect(action).toBeDefined();

    const workspaceName = `Updated Workspace Name ${Date.now()}`;
    const { body } = await testApi.execAppAction('asana', action.action, connection, {
      workspace_gid: workspaceId,
      body: {
        data: {
          name: workspaceName,
        },
      },
    });

    expect(body.data).toBeDefined();
    expect(body.data.name).toBe(workspaceName);
  });

  // Projects
  it('Should create a project', async () => {
    const action = ASANA_ACTIONS.find((a) => a.action === 'createProject');
    expect(action).toBeDefined();

    const { body } = await testApi.execAppAction('asana', action.action, connection, {
      body: {
        data: {
          name: 'Test Project',
          workspace: workspaceId,
        },
      },
    });

    expect(body.data).toBeDefined();
    projectId = body.data.gid;
  });

  it('Should update a project', async () => {
    const action = ASANA_ACTIONS.find((a) => a.action === 'updateProject');
    expect(action).toBeDefined();

    const projectName = `Updated Project Name ${Date.now()}`;
    const { body } = await testApi.execAppAction('asana', action.action, connection, {
      project_gid: projectId,
      body: {
        data: {
          name: projectName,
        },
      },
    });

    expect(body.data).toBeDefined();
    expect(body.data.name).toBe(projectName);
  });

  it('Should get all projects', async () => {
    const action = ASANA_ACTIONS.find((a) => a.action === 'getProjects');
    expect(action).toBeDefined();

    const { body } = await testApi.execAppAction('asana', action.action, connection, {
      query: {
        workspace: workspaceId,
      },
    });

    expect(body.data).toBeDefined();
    expect(body.data.length).toBeGreaterThan(0);
  });

  it('Should get the project details', async () => {
    const action = ASANA_ACTIONS.find((a) => a.action === 'getProject');
    expect(action).toBeDefined();

    const { body } = await testApi.execAppAction('asana', action.action, connection, {
      project_gid: projectId,
    });

    expect(body.data).toBeDefined();
    expect(body.data.gid).toBe(projectId);
  });

  // Tasks
  it('Should create a task in project', async () => {
    const action = ASANA_ACTIONS.find((a) => a.action === 'createTask');
    expect(action).toBeDefined();

    const { body } = await testApi.execAppAction('asana', action.action, connection, {
      body: {
        data: {
          name: 'Test Task',
          projects: [projectId],
        },
      },
    });

    expect(body.data).toBeDefined();
    taskId = body.data.gid;
  });

  it('Should get the task details', async () => {
    const action = ASANA_ACTIONS.find((a) => a.action === 'getTask');
    expect(action).toBeDefined();

    const { body } = await testApi.execAppAction('asana', action.action, connection, {
      task_gid: taskId,
    });

    expect(body.data).toBeDefined();
    expect(body.data.gid).toBe(taskId);
  });

  it('Should get all tasks', async () => {
    const action = ASANA_ACTIONS.find((a) => a.action === 'getTasks');
    expect(action).toBeDefined();

    const { body } = await testApi.execAppAction('asana', action.action, connection, {
      query: {
        project: projectId,
      },
    });

    expect(body.data).toBeDefined();
    expect(body.data.length).toBeGreaterThan(0);
  });

  it('Should get tasks for a project', async () => {
    const action = ASANA_ACTIONS.find((a) => a.action === 'getTasksForProject');
    expect(action).toBeDefined();

    const { body } = await testApi.execAppAction('asana', action.action, connection, {
      project_gid: projectId,
    });

    expect(body.data).toBeDefined();
    expect(body.data.length).toBeGreaterThan(0);
  });

  // Tags
  it('Should create a tag', async () => {
    const action = ASANA_ACTIONS.find((a) => a.action === 'createTag');
    expect(action).toBeDefined();

    const { body } = await testApi.execAppAction('asana', action.action, connection, {
      body: {
        data: {
          name: 'Stuff to buy',
          color: 'light-green',
          notes: 'Mittens really likes the stuff from Humboldt.',
          workspace: workspaceId,
        },
      },
    });

    expect(body.data).toBeDefined();
    tagId = body.data.gid;
  });

  it('Should get tag details', async () => {
    const action = ASANA_ACTIONS.find((a) => a.action === 'getTag');
    expect(action).toBeDefined();

    const { body } = await testApi.execAppAction('asana', action.action, connection, {
      tag_gid: tagId,
    });

    expect(body.data).toBeDefined();
    expect(body.data.gid).toBe(tagId);
  });

  it('Should get all tags', async () => {
    const action = ASANA_ACTIONS.find((a) => a.action === 'getTags');
    expect(action).toBeDefined();

    const { body } = await testApi.execAppAction('asana', action.action, connection, {
      query: {
        workspace: workspaceId,
      },
    });

    expect(body.data).toBeDefined();
    expect(body.data.length).toBeGreaterThan(0);
  });

  it('Should create a section in project', async () => {
    const action = ASANA_ACTIONS.find((a) => a.action === 'createSectionForProject');
    expect(action).toBeDefined();

    const { body } = await testApi.execAppAction('asana', action.action, connection, {
      project_gid: projectId,
      body: {
        data: {
          name: 'Test Section',
        },
      },
    });

    expect(body.data).toBeDefined();
    sectionId = body.data.gid;
  });

  it('Should get all sections for a project', async () => {
    const action = ASANA_ACTIONS.find((a) => a.action === 'getSectionsForProject');
    expect(action).toBeDefined();

    const { body } = await testApi.execAppAction('asana', action.action, connection, {
      project_gid: projectId,
    });

    expect(body.data).toBeDefined();
    expect(body.data.length).toBeGreaterThan(0);
  });

  it('Should get section details', async () => {
    const action = ASANA_ACTIONS.find((a) => a.action === 'getSection');
    expect(action).toBeDefined();

    const { body } = await testApi.execAppAction('asana', action.action, connection, {
      section_gid: sectionId,
    });

    expect(body.data).toBeDefined();
  });

  it('Should update a section', async () => {
    const action = ASANA_ACTIONS.find((a) => a.action === 'updateSection');
    expect(action).toBeDefined();

    const updatedName = `Updated Section Name ${Date.now()}`;
    const { body } = await testApi.execAppAction('asana', action.action, connection, {
      section_gid: sectionId,
      body: {
        data: {
          name: updatedName,
        },
      },
    });

    expect(body.data).toBeDefined();
    expect(body.data.name).toBe(updatedName);
  });

  it('Should get time periods', async () => {
    const action = ASANA_ACTIONS.find((a) => a.action === 'getTimePeriods');
    expect(action).toBeDefined();

    const { body } = await testApi.execAppAction('asana', action.action, connection, {
      query: { workspace: workspaceId },
    });
    expect(body.data).toBeDefined();
    expect(body.data.length).toBeGreaterThan(0);

    // timePeriodId = response.data[0].gid;
  });

  /**
   *
   *  Only available for Asana Premium users
   *
   * */

  // it('Should create a goal', async () => {
  //   const action = ASANA_ACTIONS.find((a) => a.action === 'createGoal');
  //   expect(action).toBeDefined();

  //   const response = await testApi.execAppAction('asana', action.action, connection, {
  //     body: {
  //       data: {
  //         name: 'Test Goal',
  //         workspace: workspaceId,
  //         time_period: timePeriodId,
  //       },
  //     },
  //   });

  //   expect(response.data).toBeDefined();
  //   goalId = response.data.gid;
  // });

  // it('Should get all goals', async () => {
  //   const action = ASANA_ACTIONS.find((a) => a.action === 'getGoals');
  //   expect(action).toBeDefined();

  //   const response = await testApi.execAppAction('asana', action.action, connection, {
  //     query: {
  //       workspace: workspaceId,
  //     },
  //   });

  //   expect(response.data).toBeDefined();
  //   expect(response.data.length).toBeGreaterThan(0);
  // });

  // it('Should get goal details', async () => {
  //   const action = ASANA_ACTIONS.find((a) => a.action === 'getGoal');
  //   expect(action).toBeDefined();

  //   const response = await testApi.execAppAction('asana', action.action, connection, {
  //     goal_gid: goalId,
  //   });

  //   expect(response.data).toBeDefined();
  //   expect(response.data.gid).toBe(goalId);
  // });

  // it('Should update a goal', async () => {
  //   const action = ASANA_ACTIONS.find((a) => a.action === 'updateGoal');
  //   expect(action).toBeDefined();

  //   const updatedGoalName = `Updated Goal Name ${Date.now()}`;
  //   const response = await testApi.execAppAction('asana', action.action, connection, {
  //     goal_gid: goalId,
  //     body: {
  //       data: {
  //         name: updatedGoalName,
  //       },
  //     },
  //   });

  //   expect(response.data).toBeDefined();
  //   expect(response.data.name).toBe(updatedGoalName);
  // });

  // it('Should delete the goal', async () => {
  //   const action = ASANA_ACTIONS.find((a) => a.action === 'deleteGoal');
  //   expect(action).toBeDefined();

  //   const response = await testApi.execAppAction('asana', action.action, connection, {
  //     goal_gid: goalId,
  //   });

  //   expect(response.data).toBeDefined();
  // });

  /**
   *
   *  Only available for Asana Business users
   *
   * */

  // it('Should create a portfolio', async () => {
  //   const action = ASANA_ACTIONS.find((a) => a.action === 'createPortfolio');
  //   expect(action).toBeDefined();

  //   const response = await testApi.execAppAction('asana', action.action, connection, {
  //     body: {
  //       data: {
  //         name: 'Test Portfolio',
  //         workspace: workspaceId,
  //       },
  //     },
  //   });

  //   expect(response.data).toBeDefined();
  //   portfolioId = response.data.gid;
  // });

  // it('Should get portfolio details', async () => {
  //   const action = ASANA_ACTIONS.find((a) => a.action === 'getPortfolio');
  //   expect(action).toBeDefined();

  //   const response = await testApi.execAppAction('asana', action.action, connection, {
  //     portfolio_gid: portfolioId,
  //   });

  //   expect(response.data).toBeDefined();
  //   expect(response.data.gid).toBe(portfolioId);
  // });

  // it('Should update the portfolio', async () => {
  //   const action = ASANA_ACTIONS.find((a) => a.action === 'updatePortfolio');
  //   expect(action).toBeDefined();

  //   const updatedPortfolioName = `Updated Portfolio ${Date.now()}`;
  //   const response = await testApi.execAppAction('asana', action.action, connection, {
  //     portfolio_gid: portfolioId,
  //     body: {
  //       data: {
  //         name: updatedPortfolioName,
  //       },
  //     },
  //   });

  //   expect(response.data).toBeDefined();
  //   expect(response.data.name).toBe(updatedPortfolioName);
  // });

  // it('Should delete the portfolio', async () => {
  //   const action = ASANA_ACTIONS.find((a) => a.action === 'deletePortfolio');
  //   expect(action).toBeDefined();

  //   const response = await testApi.execAppAction('asana', action.action, connection, {
  //     portfolio_gid: portfolioId,
  //   });

  //   expect(response.data).toBeDefined();
  // });

  /**
   *
   *  Only available for Asana Enterprise users
   *
   * */

  // it('Should create a team', async () => {
  //   const action = ASANA_ACTIONS.find((a) => a.action === 'createTeam');
  //   expect(action).toBeDefined();

  //   const response = await testApi.execAppAction('asana', action.action, connection, {
  //     body: {
  //       data: {
  //         name: 'Test Team',
  //         organization: workspaceId, // Assuming the workspace is the organization
  //       },
  //     },
  //   });

  //   expect(response.data).toBeDefined();
  //   teamId = response.data.gid;
  // });

  // it('Should get team details', async () => {
  //   const action = ASANA_ACTIONS.find((a) => a.action === 'getTeam');
  //   expect(action).toBeDefined();

  //   const response = await testApi.execAppAction('asana', action.action, connection, {
  //     team_gid: teamId,
  //   });

  //   expect(response.data).toBeDefined();
  //   expect(response.data.gid).toBe(teamId);
  // });

  // it('Should update the team', async () => {
  //   const action = ASANA_ACTIONS.find((a) => a.action === 'updateTeam');
  //   expect(action).toBeDefined();

  //   const updatedTeamName = `Updated Team Name ${Date.now()}`;
  //   const response = await testApi.execAppAction('asana', action.action, connection, {
  //     team_gid: teamId,
  //     body: {
  //       data: {
  //         name: updatedTeamName,
  //       },
  //     },
  //   });

  //   expect(response.data).toBeDefined();
  //   expect(response.data.name).toBe(updatedTeamName);
  // });

  // it('Should get projects for a team', async () => {
  //   const action = ASANA_ACTIONS.find((a) => a.action === 'getProjectsForTeam');
  //   expect(action).toBeDefined();

  //   const response = await testApi.execAppAction('asana', action.action, connection, {
  //     team_gid: teamId,
  //   });

  //   expect(response.data).toBeDefined();
  //   expect(response.data.length).toBeGreaterThan(0);
  // });

  it('Should delete a section', async () => {
    const action = ASANA_ACTIONS.find((a) => a.action === 'deleteSection');
    expect(action).toBeDefined();

    const { body } = await testApi.execAppAction('asana', action.action, connection, {
      section_gid: sectionId,
    });

    expect(body.data).toBeDefined();
  });

  it('Should delete the project', async () => {
    const action = ASANA_ACTIONS.find((a) => a.action === 'deleteProject');
    expect(action).toBeDefined();

    const { body } = await testApi.execAppAction('asana', action.action, connection, {
      project_gid: projectId,
    });

    expect(body.data).toBeDefined();
  });

  it('Should delete the task', async () => {
    const action = ASANA_ACTIONS.find((a) => a.action === 'deleteTask');
    expect(action).toBeDefined();

    const { body } = await testApi.execAppAction('asana', action.action, connection, {
      task_gid: taskId,
    });

    expect(body.data).toBeDefined();
  });

  it('Should delete the tag', async () => {
    const action = ASANA_ACTIONS.find((a) => a.action === 'deleteTag');
    expect(action).toBeDefined();

    const { body } = await testApi.execAppAction('asana', action.action, connection, {
      tag_gid: tagId,
    });

    expect(body.data).toBeDefined();
  });
});
