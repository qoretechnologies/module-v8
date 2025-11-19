import { TCustomConnOptions, TQoreAppActionFunctionContext } from '@qoretechnologies/ts-toolkit';
import { getPipedriveOrganizationIdAllowedValues } from '../apps/pipedrive/helpers/get-organization-id-allowed-values';
import { delay } from '../global/helpers';

let connection: string;
describe('Tests Pipedrive  actions', () => {
  const refreshToken = process.env.PIPEDRIVE_REFRESH_TOKEN;
  const clientId = process.env.PIPEDRIVE_CLIENT_ID;
  const clientSecret = process.env.PIPEDRIVE_CLIENT_SECRET;

  let token: string;
  let baseContext: TQoreAppActionFunctionContext<TCustomConnOptions> = {};

  beforeAll(async () => {
    if (!refreshToken || !clientId || !clientSecret) {
      throw new Error('Pipedrive credentials are not provided');
    }

    const data: {
      grant_type: string;
      redirect_uri: string;
      refresh_token: string;
    } = {
      grant_type: 'refresh_token',
      redirect_uri: 'https://qorebase.io',
      refresh_token: refreshToken,
    };

    const basicToken = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const formBody = Object.keys(data)
      .map(
        (key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key as keyof typeof data])
      )
      .join('&');

    const response = await fetch('https://oauth.pipedrive.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicToken}`,
      },
      body: formBody,
    });

    const responseData = await response.json();

    if (!responseData?.access_token) {
      throw new Error('Failed to get access token');
    }

    token = responseData.access_token;

    baseContext = {
      conn_opts: {
        token: token!,
      } as any,
    };

    connection = testApi.createConnection('pipedrive', {
      opts: {
        token,
      },
    });

    expect(connection).toBeDefined();
  });

  // let boardId: string;
  let organizationId: number;
  describe('Tests Pipedrive options allowed values', () => {
    afterEach(async () => {
      await delay(1000);
    });

    it('Should get organization id allowed values', async () => {
      const allowed_values = await getPipedriveOrganizationIdAllowedValues(baseContext);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      organizationId = allowed_values[0].value;
    });

    // Only for paid accounts

    // it('Should get project board allowed values', async () => {
    //   const allowed_values = await getPipedriveProjectBoardIdAllowedValues(baseContext);

    //   expect(allowed_values).toBeDefined();
    //   expect(allowed_values.length).toBeGreaterThan(0);

    //   boardId = allowed_values[0].value as string;
    // });

    // it('Should get project phase allowed values', async () => {
    //   const allowed_values = await getPipedriveProjectPhaseIdAllowedValues({
    //     ...baseContext,
    //     opts: {
    //       board_id: boardId,
    //     },
    //   });

    //   expect(allowed_values).toBeDefined();
    //   expect(allowed_values.length).toBeGreaterThan(0);
    // });
  });

  describe('Tests Pipedrive actions', () => {
    describe('Tests Pipedrive activity actions', () => {
      let activityId: string;

      it('Should create activity', async () => {
        const { body } = await testApi.execAppAction('pipedrive', 'addActivity', connection, {
          subject: 'Test activity',
          due_date: new Date().toISOString().split('T')[0],
        });

        expect(body).toBeDefined();
        expect(body.data).toBeDefined();
        expect(body.data.id).toBeDefined();
        activityId = body.data.id;
      });

      it('Should get activity by id', async () => {
        const { body } = await testApi.execAppAction('pipedrive', 'getActivity', connection, {
          id: activityId,
        });

        expect(body).toBeDefined();
        expect(body.data).toBeDefined();
        expect(body.data.id).toBe(activityId);
      });

      it('Should update activity', async () => {
        const { body } = await testApi.execAppAction('pipedrive', 'updateActivity', connection, {
          id: activityId,
          subject: 'Updated activity',
        });

        expect(body).toBeDefined();
        expect(body.data).toBeDefined();
        expect(body.data.id).toBe(activityId);
        expect(body.data.subject).toBe('Updated activity');
      });

      it('Should get all activities', async () => {
        const { body } = await testApi.execAppAction('pipedrive', 'getActivities', connection);

        expect(body).toBeDefined();
        expect(body.data).toBeDefined();
        expect(body.data.length).toBeGreaterThan(0);
      });

      it('Should delete activity', async () => {
        const { body } = await testApi.execAppAction('pipedrive', 'deleteActivity', connection, {
          id: activityId,
        });

        expect(body).toBeDefined();
        expect(body.data).toBeDefined();
        expect(body.data.id).toBe(activityId);
      });
    });

    describe('Tests Pipedrive deal actions', () => {
      let dealId: string;

      it('Should create deal', async () => {
        const { body } = await testApi.execAppAction('pipedrive', 'addDeal', connection, {
          title: 'Test deal',
          value: 1000,
          currency: 'USD',
        });

        expect(body).toBeDefined();
        expect(body.data).toBeDefined();
        expect(body.data.id).toBeDefined();
        dealId = body.data.id;
      });

      it('Should get deal by id', async () => {
        const { body } = await testApi.execAppAction('pipedrive', 'getDeal', connection, {
          id: dealId,
        });

        expect(body).toBeDefined();
        expect(body.data).toBeDefined();
        expect(body.data.id).toBe(dealId);
      });

      it('Should update deal', async () => {
        const { body } = await testApi.execAppAction('pipedrive', 'updateDeal', connection, {
          id: dealId,
          title: 'Updated deal',
        });

        expect(body).toBeDefined();
        expect(body.data).toBeDefined();
        expect(body.data.id).toBe(dealId);
        expect(body.data.title).toBe('Updated deal');
      });

      it('Should get all deals', async () => {
        const { body } = await testApi.execAppAction('pipedrive', 'getDeals', connection);

        expect(body).toBeDefined();
        expect(body.data).toBeDefined();
        expect(body.data.length).toBeGreaterThan(0);
      });

      it('Should delete deal', async () => {
        const { body } = await testApi.execAppAction('pipedrive', 'deleteDeal', connection, {
          id: dealId,
        });

        expect(body).toBeDefined();
        expect(body.success).toBeTruthy();
      });
    });

    describe('Tests Pipedrive lead actions', () => {
      let leadId: string;

      it('Should create lead', async () => {
        const { body } = await testApi.execAppAction('pipedrive', 'addLead', connection, {
          title: 'Test lead',
          value: {
            amount: 1000,
            currency: 'USD',
          },
          organization_id: organizationId,
        });

        expect(body).toBeDefined();
        expect(body.data).toBeDefined();
        expect(body.data.id).toBeDefined();
        leadId = body.data.id;
      });

      it('Should get lead by id', async () => {
        const { body } = await testApi.execAppAction('pipedrive', 'getLead', connection, {
          id: leadId,
        });

        expect(body).toBeDefined();
        expect(body.data).toBeDefined();
        expect(body.data.id).toBe(leadId);
      });

      it('Should update lead', async () => {
        const { body } = await testApi.execAppAction('pipedrive', 'updateLead', connection, {
          id: leadId,
          title: 'Updated lead',
        });

        expect(body).toBeDefined();
        expect(body.data).toBeDefined();
        expect(body.data.id).toBe(leadId);
        expect(body.data.title).toBe('Updated lead');
      });

      it('Should get all leads', async () => {
        const { body } = await testApi.execAppAction('pipedrive', 'getLeads', connection);

        expect(body).toBeDefined();
        expect(body.data).toBeDefined();
        expect(body.data.length).toBeGreaterThan(0);
      });

      it('Should delete lead', async () => {
        const { body } = await testApi.execAppAction('pipedrive', 'deleteLead', connection, {
          id: leadId,
        });

        expect(body).toBeDefined();
        expect(body.success).toBeTruthy();
      });
    });

    describe('Tests Pipedrive note actions', () => {
      let noteId: string;

      it('Should create note', async () => {
        const { body } = await testApi.execAppAction('pipedrive', 'addNote', connection, {
          content: 'Test note content',
          org_id: organizationId,
        });

        expect(body).toBeDefined();
        expect(body.data).toBeDefined();
        expect(body.data.id).toBeDefined();
        noteId = body.data.id;
      });

      it('Should get note by id', async () => {
        const { body } = await testApi.execAppAction('pipedrive', 'getNote', connection, {
          id: noteId,
        });

        expect(body).toBeDefined();
        expect(body.data).toBeDefined();
        expect(body.data.id).toBe(noteId);
      });

      it('Should update note', async () => {
        const { body } = await testApi.execAppAction('pipedrive', 'updateNote', connection, {
          id: noteId,
          content: 'Updated note content',
        });

        expect(body).toBeDefined();
        expect(body.data).toBeDefined();
        expect(body.data.id).toBe(noteId);
        expect(body.data.content).toBe('Updated note content');
      });

      it('Should get all notes', async () => {
        const { body } = await testApi.execAppAction('pipedrive', 'getNotes', connection);

        expect(body).toBeDefined();
        expect(body.data).toBeDefined();
        expect(body.data.length).toBeGreaterThan(0);
      });

      it('Should delete note', async () => {
        const { body } = await testApi.execAppAction('pipedrive', 'deleteNote', connection, {
          id: noteId,
        });

        expect(body).toBeDefined();
        expect(body.success).toBeTruthy();
      });
    });

    describe('Tests Pipedrive organization actions', () => {
      let organizationId: string;

      it('Should create organization', async () => {
        const { body } = await testApi.execAppAction('pipedrive', 'addOrganization', connection, {
          name: 'Test Organization',
        });

        expect(body).toBeDefined();
        expect(body.data).toBeDefined();
        expect(body.data.id).toBeDefined();
        organizationId = body.data.id;
      });

      it('Should get organization by id', async () => {
        const { body } = await testApi.execAppAction('pipedrive', 'getOrganization', connection, {
          id: organizationId,
        });

        expect(body).toBeDefined();
        expect(body.data).toBeDefined();
        expect(body.data.id).toBe(organizationId);
      });

      it('Should update organization', async () => {
        const { body } = await testApi.execAppAction(
          'pipedrive',
          'updateOrganization',
          connection,
          {
            id: organizationId,
            name: 'Updated Organization',
            visible_to: 3,
          }
        );

        expect(body).toBeDefined();
        expect(body.data).toBeDefined();
        expect(body.data.id).toBe(organizationId);
        expect(body.data.name).toBe('Updated Organization');
      });

      it('Should get all organizations', async () => {
        const { body } = await testApi.execAppAction('pipedrive', 'getOrganizations', connection);

        expect(body).toBeDefined();
        expect(body.data).toBeDefined();
        expect(body.data.length).toBeGreaterThan(0);
      });

      it('Should delete organization', async () => {
        const { body } = await testApi.execAppAction(
          'pipedrive',
          'deleteOrganization',
          connection,
          {
            id: organizationId,
          }
        );

        expect(body).toBeDefined();
        expect(body.success).toBeTruthy();
      });
    });

    describe('Tests Pipedrive person actions', () => {
      let personId: string;

      it('Should create person', async () => {
        const { body } = await testApi.execAppAction('pipedrive', 'addPerson', connection, {
          name: 'Test Person',
        });

        expect(body).toBeDefined();
        expect(body.data).toBeDefined();
        expect(body.data.id).toBeDefined();
        personId = body.data.id;
      });

      it('Should get person by id', async () => {
        const { body } = await testApi.execAppAction('pipedrive', 'getPerson', connection, {
          id: personId,
        });

        expect(body).toBeDefined();
        expect(body.data).toBeDefined();
        expect(body.data.id).toBe(personId);
      });

      it('Should update person', async () => {
        const { body } = await testApi.execAppAction('pipedrive', 'updatePerson', connection, {
          id: personId,
          name: 'Updated Person',
        });

        expect(body).toBeDefined();
        expect(body.data).toBeDefined();
        expect(body.data.id).toBe(personId);
        expect(body.data.name).toBe('Updated Person');
      });

      it('Should get all persons', async () => {
        const { body } = await testApi.execAppAction('pipedrive', 'getPersons', connection);

        expect(body).toBeDefined();
        expect(body.data).toBeDefined();
        expect(body.data.length).toBeGreaterThan(0);
      });

      it('Should delete person', async () => {
        const { body } = await testApi.execAppAction('pipedrive', 'deletePerson', connection, {
          id: personId,
        });

        expect(body).toBeDefined();
        expect(body.success).toBeTruthy();
      });
    });

    // Only for paid accounts
    // describe('Tests Pipedrive project actions', () => {
    //   let projectId: string;

    //   it('Should create project', async () => {
    //     const { body } = await testApi.execAppAction('pipedrive', 'addProject', connection, {
    //       name: 'Test Project',
    //       status: 'open',
    //       board_id: boardId,
    //     });

    //     expect(body).toBeDefined();
    //     expect(body.data).toBeDefined();
    //     expect(body.data.id).toBeDefined();
    //     projectId = body.data.id;
    //   });

    //   it('Should get project by id', async () => {
    //     const { body } = await testApi.execAppAction('pipedrive', 'getProject', connection, {
    //       id: projectId,
    //     });

    //     expect(body).toBeDefined();
    //     expect(body.data).toBeDefined();
    //     expect(body.data.id).toBe(projectId);
    //   });

    //   it('Should update project', async () => {
    //     const { body } = await testApi.execAppAction('pipedrive', 'updateProject', connection, {
    //       id: projectId,
    //       name: 'Updated Project',
    //       status: 'on-hold',
    //     });

    //     expect(body).toBeDefined();
    //     expect(body.data).toBeDefined();
    //     expect(body.data.id).toBe(projectId);
    //     expect(body.data.name).toBe('Updated Project');
    //     expect(body.data.status).toBe('on-hold');
    //   });

    //   it('Should get all projects', async () => {
    //     const { body } = await testApi.execAppAction('pipedrive', 'getProjects', connection);

    //     expect(body).toBeDefined();
    //     expect(body.data).toBeDefined();
    //     expect(body.data.length).toBeGreaterThan(0);
    //   });

    //   it('Should delete project', async () => {
    //     const { body } = await testApi.execAppAction('pipedrive', 'deleteProject', connection, {
    //       id: projectId,
    //     });

    //     expect(body).toBeDefined();
    //     expect(body.success).toBeTruthy();
    //   });
    // });

    // describe('Tests Pipedrive task actions', () => {
    //   let taskId: string;

    //   it('Should create task', async () => {
    //     const { body } = await testApi.execAppAction('pipedrive', 'addTask', connection, {
    //       title: 'Test Task',
    //       due_date: new Date().toISOString().split('T')[0],
    //     });

    //     expect(body).toBeDefined();
    //     expect(body.data).toBeDefined();
    //     expect(body.data.id).toBeDefined();
    //     taskId = body.data.id;
    //   });

    //   it('Should get task by id', async () => {
    //     const { body } = await testApi.execAppAction('pipedrive', 'getTask', connection, {
    //       id: taskId,
    //     });

    //     expect(body).toBeDefined();
    //     expect(body.data).toBeDefined();
    //     expect(body.data.id).toBe(taskId);
    //   });

    //   it('Should update task', async () => {
    //     const { body } = await testApi.execAppAction('pipedrive', 'updateTask', connection, {
    //       id: taskId,
    //       title: 'Updated Task',
    //       priority: 2,
    //     });

    //     expect(body).toBeDefined();
    //     expect(body.data).toBeDefined();
    //     expect(body.data.id).toBe(taskId);
    //     expect(body.data.title).toBe('Updated Task');
    //     expect(body.data.priority).toBe(2);
    //   });

    //   it('Should get all tasks', async () => {
    //     const { body } = await testApi.execAppAction('pipedrive', 'getTasks', connection);

    //     expect(body).toBeDefined();
    //     expect(body.data).toBeDefined();
    //     expect(body.data.length).toBeGreaterThan(0);
    //   });

    //   it('Should delete task', async () => {
    //     const { body } = await testApi.execAppAction('pipedrive', 'deleteTask', connection, {
    //       id: taskId,
    //     });

    //     expect(body).toBeDefined();
    //     expect(body.success).toBeTruthy();
    //   });
    // });
  });
});
