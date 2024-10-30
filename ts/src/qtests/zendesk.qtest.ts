import { ZENDESK_CONN_OPTIONS } from '../apps/zendesk';

let connection: string;

describe('Tests Zendesk Actions', () => {
  beforeAll(() => {
    // Create a connection to the Zendesk app
    connection = testApi.createConnection<typeof ZENDESK_CONN_OPTIONS>('zendesk', {
      opts: {
        subdomain: process.env.ZENDESK_SUBDOMAIN,
        username: process.env.ZENDESK_USER,
        password: process.env.ZENDESK_API_KEY,
        oauth2_grant_type: 'none',
      },
    });

    expect(connection).toBeDefined();
  });

  describe('Should test Ticket Actions', () => {
    let ticketID: number;
    let ticketCount: number;

    it(`Should get account settings`, () => {
      const { body } = testApi.execAppAction('zendesk', 'ShowAccountSettings', connection);

      expect(body).toHaveProperty('settings');
      expect(body).toHaveProperty('settings.active_features');
    });

    it(`Should create a new ticket`, () => {
      const { body } = testApi.execAppAction('zendesk', 'CreateTicket', connection, {
        body: {
          ticket: {
            comment: {
              body: 'The smoke is very colorful.',
            },
            priority: 'urgent',
            subject: 'My printer is on fire!',
          },
        },
      });

      expect(body).toHaveProperty('ticket.id');
      ticketID = body.ticket.id;
    });

    it('Should get all tickets', () => {
      const { body } = testApi.execAppAction('zendesk', 'ListTickets', connection);

      expect(body).toHaveProperty('tickets');
      expect(body.tickets.length).toBeGreaterThan(0);

      ticketCount = body.tickets.length;
    });

    it('Should update a ticket', () => {
      console.log('Updating ticket', ticketID);
      const { body } = testApi.execAppAction('zendesk', 'UpdateTicket', connection, {
        ticket_id: ticketID,
        body: {
          ticket: {
            status: 'pending',
          },
        },
      });

      expect(body).toHaveProperty('ticket.id');
      expect(body.ticket.id).toBe(ticketID);
    });

    it('Should get a ticket by ID', () => {
      const { body } = testApi.execAppAction('zendesk', 'ShowTicket', connection, {
        ticket_id: ticketID,
      });

      expect(body).toHaveProperty('ticket');
      expect(body.ticket.id).toBe(ticketID);
      // Check if the body was updated
      expect(body.ticket.status).toBe('pending');
    });

    it('Should delete a ticket', () => {
      testApi.execAppAction('zendesk', 'DeleteTicket', connection, { ticket_id: ticketID });

      const { body } = testApi.execAppAction('zendesk', 'ListTickets', connection);

      expect(body.tickets.length).toBe(ticketCount - 1);
    });
  });

  describe('Should test User Actions', () => {
    let usersCount: number;
    let userID: number;

    it('Should get all users', () => {
      const { body } = testApi.execAppAction('zendesk', 'ListUsers', connection);

      expect(body).toHaveProperty('users');
      expect(body.users.length).toBeGreaterThan(0);

      usersCount = body.users.length;
    });

    it(`Should create a new user`, () => {
      const { body } = testApi.execAppAction('zendesk', 'CreateUser', connection, {
        body: {
          user: {
            name: 'Testing User',
            email: 'test@email.com',
          },
        },
      });

      expect(body).toHaveProperty('user.id');

      userID = body.user.id;

      const { body: listUsersBody } = testApi.execAppAction('zendesk', 'ListUsers', connection);

      expect(listUsersBody.users.length).toBe(usersCount + 1);

      usersCount = listUsersBody.users.length;
    });

    it('Should get a user by ID', () => {
      const { body } = testApi.execAppAction('zendesk', 'ShowUser', connection, {
        user_id: userID,
      });

      expect(body).toHaveProperty('user');
      expect(body.user.id).toBe(userID);
    });

    it('Should update a user', () => {
      const { body } = testApi.execAppAction('zendesk', 'UpdateUser', connection, {
        user_id: userID,
        body: {
          user: {
            role: 'end-user',
          },
        },
      });

      expect(body).toHaveProperty('user.id');
      expect(body.user.id).toBe(userID);
      expect(body.user.role).toBe('end-user');
    });

    it('Should delete a user', () => {
      testApi.execAppAction('zendesk', 'DeleteUser', connection, { user_id: userID });
      // testApi.execAppAction('zendesk', 'PermanentlyDeleteUser', connection, {
      //   deleted_user_id: userID,
      // });

      const { body } = testApi.execAppAction('zendesk', 'ListUsers', connection);

      expect(body.users.length).toBe(usersCount - 1);
    });
  });

  describe('Should test Organization Actions', () => {
    let orgID: number;
    let orgCount: number;

    it('Should get all organizations', () => {
      const { body } = testApi.execAppAction('zendesk', 'ListOrganizations', connection);

      expect(body).toHaveProperty('organizations');
      expect(body.organizations.length).toBeGreaterThan(0);

      orgCount = body.organizations.length;
    });

    it(`Should create a new organization`, () => {
      const { body } = testApi.execAppAction('zendesk', 'CreateOrganization', connection, {
        body: {
          organization: {
            name: 'Testing Organization',
          },
        },
      });

      expect(body).toHaveProperty('organization.id');

      orgID = body.organization.id;

      const { body: listOrgsBody } = testApi.execAppAction(
        'zendesk',
        'ListOrganizations',
        connection
      );

      expect(listOrgsBody.organizations.length).toBe(orgCount + 1);

      orgCount = listOrgsBody.organizations.length;
    });

    it('Should get an organization by ID', () => {
      const { body } = testApi.execAppAction('zendesk', 'ShowOrganization', connection, {
        organization_id: orgID,
      });

      expect(body).toHaveProperty('organization');
      expect(body.organization.id).toBe(orgID);
    });

    it('Should delete an organization', () => {
      testApi.execAppAction('zendesk', 'DeleteOrganization', connection, {
        organization_id: orgID,
      });

      const { body } = testApi.execAppAction('zendesk', 'ListOrganizations', connection);

      expect(body.organizations.length).toBe(orgCount - 1);
    });
  });

  // describe('Should test Macro Actions', () => {
  //   let macroID: number;
  //   let macroCount: number;

  //   it('Should get all macros', () => {
  //     const { body } = testApi.execAppAction('zendesk', 'ListMacros', connection);

  //     expect(body).toHaveProperty('macros');
  //     expect(body.macros.length).toBeGreaterThan(0);

  //     macroCount = body.macros.length;
  //   });

  //   it(`Should create a new macro`, () => {
  //     const { body } = testApi.execAppAction('zendesk', 'CreateMacro', connection, {
  //       body: {
  //         macro: {
  //           title: 'Test Macro',
  //           actions: [
  //             {
  //               field: 'status',
  //               value: 'open',
  //             },
  //           ],
  //         },
  //       },
  //     });

  //     expect(body).toHaveProperty('macro.id');

  //     macroID = body.macro.id;

  //     const { body: listMacrosBody } = testApi.execAppAction('zendesk', 'ListMacros', connection);

  //     expect(listMacrosBody.macros.length).toBe(macroCount + 1);

  //     macroCount = listMacrosBody.macros.length;
  //   });

  //   it('Should get a macro by ID', () => {
  //     const { body } = testApi.execAppAction('zendesk', 'ShowMacro', connection, {
  //       macro_id: macroID,
  //     });

  //     expect(body).toHaveProperty('macro');
  //     expect(body.macro.id).toBe(macroID);
  //   });

  //   it('Should delete a macro', () => {
  //     testApi.execAppAction('zendesk', 'DeleteMacro', connection, { macro_id: macroID });

  //     const { body } = testApi.execAppAction('zendesk', 'ListMacros', connection);

  //     expect(body.macros.length).toBe(macroCount - 1);
  //   });
  // });

  describe('Should test Search Actions', () => {
    it('Should search for tickets', () => {
      const { body } = testApi.execAppAction('zendesk', 'ListSearchResults', connection, {
        query: {
          query: 'status:open',
        },
      });

      expect(body).toHaveProperty('results');
      expect(body.results.length).toBeGreaterThan(0);
    });
  });

  // describe('Should test Ticket Fields Actions', () => {
  //   it('Should get all ticket fields', () => {
  //     const { body } = testApi.execAppAction('zendesk', 'ListTicketFields', connection);

  //     expect(body).toHaveProperty('ticket_fields');
  //     expect(body.ticket_fields.length).toBeGreaterThan(0);
  //   });
  // });

  describe('Should test Ticket Metrics Actions', () => {
    it('Should get all ticket metrics', () => {
      const { body } = testApi.execAppAction('zendesk', 'ListTicketMetrics', connection);

      expect(body).toHaveProperty('ticket_metrics');
      expect(body.ticket_metrics.length).toBeGreaterThan(0);
    });
  });
});
