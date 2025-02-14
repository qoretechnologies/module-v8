// import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { FRESHDESK_CONN_OPTIONS } from '../apps/freshdesk/constants';

let connection: string;

describe('Tests Freshdesk Actions', () => {
  const username = process.env.FRESHDESK_API_KEY;
  const password = 'X';
  const subdomain = process.env.FRESHDESK_SUBDOMAIN;

  beforeAll(() => {
    connection = testApi.createConnection<typeof FRESHDESK_CONN_OPTIONS>('freshdesk', {
      opts: {
        subdomain,
        username,
        password,
        oauth2_grant_type: 'none',
      },
    });

    expect(connection).toBeDefined();
  });

  it('Should check if the connection was created', () => {
    expect(connection).toBeDefined();
    expect(connection).not.toBeFalsy();
  });

  // let agentId: number | undefined;
  // let jobId: number | undefined;
  // let ticketRequesterId: number | undefined;

  // describe('Should test Agent Actions', () => {
  //   it('Should create an agent', async () => {
  //     const { body } = await testApi.execAppAction('freshdesk', 'api_v2_agents_post', connection, {
  //       email: 'example1@test.com',
  //       ticket_scope: 1,
  //     });

  //     expect(body).toHaveProperty('id');

  //     agentId = body.id;
  //   });

  //   it('Should create agents in bulk', async () => {
  //     const { body } = await testApi.execAppAction(
  //       'freshdesk',
  //       'api_v2_agents_bulk_post',
  //       connection,
  //       {
  //         agents: [
  //           {
  //             email: 'example2@test.com',
  //             ticket_scope: 1,
  //           },
  //           {
  //             email: 'example3@test.com',
  //             ticket_scope: 1,
  //           },
  //         ],
  //       }
  //     );

  //     expect(body).toHaveProperty('job_id');
  //     jobId = body.job_id;
  //   });

  //   it('Should update an agent', () => {
  //     const { body } = testApi.execAppAction('freshdesk', 'api_v2_agents_id_put', connection, {
  //       id: agentId,
  //       ticket_scope: 2,
  //     });

  //     expect(body).toHaveProperty('ticket_scope', 2);
  //   });

  //   it('Should get all agents', async () => {
  //     const { body } = await testApi.execAppAction('freshdesk', 'api_v2_agents_get', connection);

  //     expect(body).toBeDefined();
  //     expect(body.length).toBeGreaterThan(2);
  //   });

  //   it('Should get authenticated agent', async () => {
  //     const { body } = await testApi.execAppAction('freshdesk', 'api_v2_agents_me_get', connection);

  //     expect(body).toHaveProperty('id');
  //   });

  //   it('Should delete an agent', async () => {
  //     await testApi.execAppAction('freshdesk', 'api_v2_agents_id_delete', connection, {
  //       id: agentId,
  //     });
  //   });
  // });

  // describe('Should test Contacts Actions', () => {
  //   let contactId: number | undefined;

  //   it('Should create a contact', async () => {
  //     const { body } = await testApi.execAppAction(
  //       'freshdesk',
  //       'api_v2_contacts_post',
  //       connection,
  //       {
  //         name: 'John Doe',
  //         email: 'testcontact@test.com',
  //       }
  //     );

  //     expect(body).toHaveProperty('id');
  //     contactId = body.id;
  //   });

  //   it('Should update a contact', async () => {
  //     const description = 'This is a test contact';
  //     const { body } = await testApi.execAppAction(
  //       'freshdesk',
  //       'api_v2_contacts_id_put',
  //       connection,
  //       {
  //         id: contactId,
  //         description,
  //       }
  //     );

  //     expect(body).toHaveProperty('description', description);
  //   });

  //   it('Should get a contact', async () => {
  //     const { body } = await testApi.execAppAction(
  //       'freshdesk',
  //       'api_v2_contacts_id_get',
  //       connection,
  //       {
  //         id: contactId,
  //       }
  //     );

  //     expect(body).toHaveProperty('id', contactId);

  //     const { body: allContacts } = await testApi.execAppAction(
  //       'freshdesk',
  //       'api_v2_contacts_get',
  //       connection
  //     );

  //     expect(allContacts).toBeDefined();
  //   });

  //   it('Should delete a contact', async () => {
  //     await testApi.execAppAction(
  //       'freshdesk',
  //       'api_v2_contacts_id_hard_delete_delete',
  //       connection,
  //       {
  //         id: contactId,
  //         force: true,
  //       }
  //     );
  //   });
  // });

  // describe('Should test Companies actions', () => {
  //   let companyId: number | undefined;
  //   it('Should create a company', async () => {
  //     const { body } = await testApi.execAppAction(
  //       'freshdesk',
  //       'api_v2_companies_post',
  //       connection,
  //       {
  //         name: 'Test Company',
  //       }
  //     );

  //     expect(body).toHaveProperty('id');
  //     companyId = body.id;
  //   });

  //   it('Should get all companies', async () => {
  //     const { body } = await testApi.execAppAction('freshdesk', 'api_v2_companies_get', connection);

  //     expect(body).toBeDefined();
  //     expect(body.length).toBeGreaterThan(0);
  //   });

  //   it('Should update a company', async () => {
  //     const name = 'Updated Test Company';
  //     const { body } = await testApi.execAppAction(
  //       'freshdesk',
  //       'api_v2_companies_id_put',
  //       connection,
  //       {
  //         id: companyId,
  //         name,
  //       }
  //     );

  //     expect(body).toHaveProperty('name', name);
  //   });

  //   it('Should get a company', async () => {
  //     const { body } = await testApi.execAppAction(
  //       'freshdesk',
  //       'api_v2_companies_id_get',
  //       connection,
  //       {
  //         id: companyId,
  //       }
  //     );

  //     expect(body).toHaveProperty('id', companyId);
  //   });

  //   it('Should delete a company', async () => {
  //     await testApi.execAppAction('freshdesk', 'api_v2_companies_id_delete', connection, {
  //       id: companyId,
  //     });
  //   });
  // });

  // describe('Should test Tickets actions', () => {
  //   let ticketId: number | undefined;
  //   it('Should create a ticket', async () => {
  //     const { body } = await testApi.execAppAction('freshdesk', 'api_v2_tickets_post', connection, {
  //       description: 'Some test ticket description',
  //       email: 'ticket@test.com',
  //       subject: 'Just another test ticket',
  //       priority: 1,
  //       status: 2,
  //     });

  //     expect(body).toHaveProperty('id');
  //     expect(body).toHaveProperty('requester_id');
  //     ticketRequesterId = body.requester_id;
  //     ticketId = body.id;
  //   });

  //   it('Should get all tickets', async () => {
  //     const { body } = await testApi.execAppAction('freshdesk', 'api_v2_tickets_get', connection);

  //     expect(body).toBeDefined();
  //     expect(body.length).toBeGreaterThan(0);
  //   });

  //   it('Should update a ticket', async () => {
  //     const { body } = await testApi.execAppAction(
  //       'freshdesk',
  //       'api_v2_tickets_id_put',
  //       connection,
  //       {
  //         id: ticketId,
  //         status: 3,
  //       }
  //     );

  //     expect(body).toHaveProperty('status', 3);
  //   });

  //   it('Should get a ticket', async () => {
  //     const { body } = await testApi.execAppAction(
  //       'freshdesk',
  //       'api_v2_tickets_id_get',
  //       connection,
  //       {
  //         id: ticketId,
  //       }
  //     );

  //     expect(body).toHaveProperty('id', ticketId);
  //   });

  //   it('Should create a ticket summary', async () => {
  //     const { body } = await testApi.execAppAction(
  //       'freshdesk',
  //       'api_v2_tickets_id_summary_put',
  //       connection,
  //       {
  //         id: ticketId,
  //         body: {
  //           body: '<h1>Test</h1>',
  //         },
  //       }
  //     );

  //     expect(body).toHaveProperty('ticket_id', ticketId);
  //   });

  //   it('Should get a ticket summary', async () => {
  //     const { body } = await testApi.execAppAction(
  //       'freshdesk',
  //       'api_v2_tickets_id_summary_get',
  //       connection,
  //       {
  //         id: ticketId,
  //       }
  //     );

  //     expect(body).toHaveProperty('ticket_id', ticketId);
  //   });

  //   it('Should delete a ticket summary', async () => {
  //     await testApi.execAppAction('freshdesk', 'api_v2_tickets_id_summary_delete', connection, {
  //       id: ticketId,
  //     });
  //   });

  //   it('Should delete a ticket', async () => {
  //     await testApi.execAppAction('freshdesk', 'api_v2_tickets_id_delete', connection, {
  //       id: ticketId,
  //     });
  //   });
  // });

  // describe('Should clean up after the tests', () => {
  //   it('Should clean up agents', async () => {
  //     await testApi.execAppAction(
  //       'freshdesk',
  //       'api_v2_contacts_id_hard_delete_delete',
  //       connection,
  //       {
  //         id: agentId,
  //         force: true,
  //       }
  //     );
  //     expect(username).toBeDefined();
  //     expect(password).toBeDefined();
  //     expect(jobId).toBeDefined();
  //     expect(subdomain).toBeDefined();
  //     const agentIds = await awaitJobCompletion(jobId!, username!, password, subdomain!);

  //     await Promise.all(
  //       agentIds.map((id) => {
  //         testApi.execAppAction('freshdesk', 'api_v2_agents_id_delete', connection, {
  //           id,
  //         });
  //       })
  //     );

  //     await Promise.all(
  //       agentIds.map((id) => {
  //         testApi.execAppAction('freshdesk', 'api_v2_contacts_id_hard_delete_delete', connection, {
  //           id,
  //           force: true,
  //         });
  //       })
  //     );
  //   });

  //   it('Should clean up tickets', async () => {
  //     await testApi.execAppAction(
  //       'freshdesk',
  //       'api_v2_contacts_id_hard_delete_delete',
  //       connection,
  //       {
  //         id: ticketRequesterId,
  //         force: true,
  //       }
  //     );
  //   });
  // });
});

// const awaitJobCompletion = async (
//   jobId: number,
//   username: string,
//   password: string,
//   subdomain: string
// ): Promise<number[]> => {
//   let completed = false;
//   const startTime = Date.now();

//   while (!completed) {
//     const response = await QorusRequest.get<{
//       data: {
//         status: string;
//         data: {
//           id: number;
//         }[];
//       };
//     }>(
//       {
//         path: `/api/v2/jobs/${jobId}`,
//         headers: {
//           Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
//         },
//       },
//       { url: `https://${subdomain}.freshdesk.com`, endpointId: 'Freshdesk' }
//     );

//     await new Promise((resolve) => setTimeout(resolve, 1000));

//     if (Date.now() - startTime > 10000) {
//       throw new Error('Job completion timeout');
//     }

//     const responseData = response?.data;

//     if (responseData?.status === 'SUCCESS') {
//       completed = true;

//       return responseData.data.map(({ id }) => id);
//     }
//   }

//   return [];
// };
