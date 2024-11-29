import { JIRA_ACTIONS } from '../apps/jira';
import { JIRA_CONN_OPTIONS } from '../apps/jira/constants';

let connection: string;

describe('Tests Jira Actions', () => {
  const bannerText = `Test Banner Message-${Date.now()}`;
  let projectId: string | null = null;
  let customFieldId: string | null = null;
  const leadAccountId: string = process.env.JIRA_LEAD_ACCOUNT_ID;
  let issueId: string | null = null;
  let commentId: string | null = null;
  let worklogId: string | null = null;

  beforeAll(() => {
    connection = testApi.createConnection<typeof JIRA_CONN_OPTIONS>('jira', {
      opts: {
        username: process.env.JIRA_USERNAME,
        password: process.env.JIRA_PASSWORD,
        cloud_id: process.env.JIRA_CLOUD_ID,
        swagger_base_path: `/ex/jira/${process.env.JIRA_CLOUD_ID}`,
        oauth2_grant_type: 'none',
      },
    });

    expect(connection).toBeDefined();
  });

  // Banner Actions
  it('Should set the banner', async () => {
    const action = JIRA_ACTIONS.find((a) => a.action === 'setBanner');
    expect(action).toBeDefined();

    await testApi.execAppAction('jira', action.action, connection, {
      body: {
        isDismissible: true,
        isEnabled: true,
        message: bannerText,
        visibility: 'public',
      },
    });
  });

  it('Should get the banner', async () => {
    const action = JIRA_ACTIONS.find((a) => a.action === 'getBanner');
    expect(action).toBeDefined();

    const response = await testApi.execAppAction('jira', action.action, connection);

    expect(response.body).toBeDefined();
    expect(response.body.message).toBe(bannerText);
  });

  // Fields

  it('Should create a custom field', async () => {
    const action = JIRA_ACTIONS.find((a) => a.action === 'createCustomField');
    expect(action).toBeDefined();
    const name = `Test Custom Field ${Date.now()}`;
    const response = await testApi.execAppAction('jira', action.action, connection, {
      body: {
        name,
        type: 'com.atlassian.jira.plugin.system.customfieldtypes:textarea',
        description: 'A description for the test custom field',
        searcherKey: 'com.atlassian.jira.plugin.system.customfieldtypes:textsearcher',
      },
    });

    expect(response.body).toBeDefined();
    expect(response.body.name).toBe(name);
    customFieldId = response.body.id;
  });

  it('Should get all fields', async () => {
    const action = JIRA_ACTIONS.find((a) => a.action === 'getFields');
    expect(action).toBeDefined();

    const response = await testApi.execAppAction('jira', action.action, connection);
    expect(response.body).toBeDefined();
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('Should update a custom field', async () => {
    const action = JIRA_ACTIONS.find((a) => a.action === 'updateCustomField');
    expect(action).toBeDefined();
    const response = await testApi.execAppAction('jira', action.action, connection, {
      fieldId: customFieldId,
      body: {
        name: 'Updated Custom Field',
      },
    });
    expect(response.body).toBeDefined();
  });

  it('Should trash a custom field', async () => {
    const action = JIRA_ACTIONS.find((a) => a.action === 'trashCustomField');
    expect(action).toBeDefined();

    const response = await testApi.execAppAction('jira', action.action, connection, {
      id: customFieldId,
    });

    expect(response.body).toBeDefined();
  });

  // Projects
  it('Should create a project', async () => {
    const action = JIRA_ACTIONS.find((a) => a.action === 'createProject');
    expect(action).toBeDefined();

    const response = await testApi.execAppAction('jira', action.action, connection, {
      body: {
        key: `TEST` + Date.now().toString().slice(-6),
        name: `Test Project ${Date.now()}`,
        projectTypeKey: 'software',
        projectTemplateKey: 'com.pyxis.greenhopper.jira:gh-simplified-agility-kanban',
        description: 'A test project',
        leadAccountId,
      },
    });

    expect(response.body).toBeDefined();
    projectId = response.body.id;
  });

  it('Should update a project', async () => {
    const action = JIRA_ACTIONS.find((a) => a.action === 'updateProject');
    expect(action).toBeDefined();

    const projectName = `Updated Project ${Date.now()}`;
    const response = await testApi.execAppAction('jira', action.action, connection, {
      projectIdOrKey: projectId,
      body: {
        name: projectName,
      },
    });

    expect(response.body).toBeDefined();
    expect(response.body.name).toBe(projectName);
  });

  it('Should get a project by ID', async () => {
    const action = JIRA_ACTIONS.find((a) => a.action === 'getProject');
    expect(action).toBeDefined();

    const response = await testApi.execAppAction('jira', action.action, connection, {
      projectIdOrKey: projectId,
    });

    expect(response.body).toBeDefined();
    expect(response.body.id).toBe(projectId.toString());
  });

  // // Issues
  it('Should create an issue', async () => {
    const action = JIRA_ACTIONS.find((a) => a.action === 'createIssue');
    expect(action).toBeDefined();

    const response = await testApi.execAppAction('jira', action.action, connection, {
      body: {
        fields: {
          project: {
            id: projectId,
          },
          summary: 'Test Issue',
          description: {
            content: [
              {
                content: [
                  {
                    text: 'Order entry fails when selecting supplier.',
                    type: 'text',
                  },
                ],
                type: 'paragraph',
              },
            ],
            type: 'doc',
            version: 1,
          },
          issuetype: {
            name: 'Task',
          },
        },
      },
    });
    expect(response.body).toBeDefined();
    issueId = response.body.id;
  });

  it('Should get an issue by ID', async () => {
    const action = JIRA_ACTIONS.find((a) => a.action === 'getIssue');
    expect(action).toBeDefined();

    const response = await testApi.execAppAction('jira', action.action, connection, {
      issueIdOrKey: issueId,
    });
    expect(response.body).toBeDefined();
    expect(response.body.id).toBe(issueId);
  });

  it('Should edit an issue', async () => {
    const action = JIRA_ACTIONS.find((a) => a.action === 'editIssue');
    expect(action).toBeDefined();

    const response = await testApi.execAppAction('jira', action.action, connection, {
      issueIdOrKey: issueId,
      body: {
        fields: {
          summary: 'Updated Issue',
        },
      },
    });
    expect(response).toBeDefined();
  });

  // Comments
  it('Should add a comment to an issue', async () => {
    const action = JIRA_ACTIONS.find((a) => a.action === 'addComment');
    expect(action).toBeDefined();

    const response = await testApi.execAppAction('jira', action.action, connection, {
      issueIdOrKey: issueId,
      body: {
        body: {
          content: [
            {
              content: [
                {
                  text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
                  type: 'text',
                },
              ],
              type: 'paragraph',
            },
          ],
          type: 'doc',
          version: 1,
        },
      },
    });

    expect(response.body).toBeDefined();
    commentId = response.body.id;
  });

  it('Should get comments for an issue', async () => {
    const action = JIRA_ACTIONS.find((a) => a.action === 'getComments');
    expect(action).toBeDefined();

    const response = await testApi.execAppAction('jira', action.action, connection, {
      issueIdOrKey: issueId,
    });
    expect(response.body).toBeDefined();
    expect(response.body.comments.length).toBeGreaterThan(0);
  });

  it('Should update a comment', async () => {
    const action = JIRA_ACTIONS.find((a) => a.action === 'updateComment');
    expect(action).toBeDefined();

    const response = await testApi.execAppAction('jira', action.action, connection, {
      issueIdOrKey: issueId,
      id: commentId,
      body: {
        body: {
          content: [
            {
              content: [
                {
                  text: 'Updated comment',
                  type: 'text',
                },
              ],
              type: 'paragraph',
            },
          ],
          type: 'doc',
          version: 1,
        },
      },
    });

    expect(response).toBeDefined();
  });

  it('Should get a comment by ID', async () => {
    const action = JIRA_ACTIONS.find((a) => a.action === 'getComment');
    expect(action).toBeDefined();

    const response = await testApi.execAppAction('jira', action.action, connection, {
      issueIdOrKey: issueId,
      id: commentId,
    });

    expect(response.body).toBeDefined();
  });

  it('Should add a worklog to an issue', async () => {
    const action = JIRA_ACTIONS.find((a) => a.action === 'addWorklog');
    expect(action).toBeDefined();

    const response = await testApi.execAppAction('jira', action.action, connection, {
      issueIdOrKey: issueId,
      body: {
        comment: {
          content: [
            {
              content: [
                {
                  text: 'I did some work here.',
                  type: 'text',
                },
              ],
              type: 'paragraph',
            },
          ],
          type: 'doc',
          version: 1,
        },
        timeSpentSeconds: 12_000,
      },
    });

    expect(response.body).toBeDefined();
    worklogId = response.body.id;
  });

  it('Should get worklog for an issue', async () => {
    const action = JIRA_ACTIONS.find((a) => a.action === 'getWorklog');
    expect(action).toBeDefined();

    const response = await testApi.execAppAction('jira', action.action, connection, {
      issueIdOrKey: issueId,
      id: worklogId,
    });

    expect(response.body).toBeDefined();
  });

  it('Should delete a worklog', async () => {
    const action = JIRA_ACTIONS.find((a) => a.action === 'deleteWorklog');
    expect(action).toBeDefined();

    const response = await testApi.execAppAction('jira', action.action, connection, {
      issueIdOrKey: issueId,
      id: worklogId,
    });

    expect(response).toBeDefined();
  });

  it('Should delete a comment', async () => {
    const action = JIRA_ACTIONS.find((a) => a.action === 'deleteComment');
    expect(action).toBeDefined();

    const response = await testApi.execAppAction('jira', action.action, connection, {
      issueIdOrKey: issueId,
      id: commentId,
    });

    expect(response).toBeDefined();
  });

  it('Should delete an issue', async () => {
    const action = JIRA_ACTIONS.find((a) => a.action === 'deleteIssue');
    expect(action).toBeDefined();

    const response = await testApi.execAppAction('jira', action.action, connection, {
      issueIdOrKey: issueId,
    });

    expect(response).toBeDefined();
  });

  it('Should delete a project', async () => {
    const action = JIRA_ACTIONS.find((a) => a.action === 'deleteProject');
    expect(action).toBeDefined();

    const response = await testApi.execAppAction('jira', action.action, connection, {
      projectIdOrKey: projectId,
    });

    expect(response).toBeDefined();
  });
});
