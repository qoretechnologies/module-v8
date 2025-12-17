import { IQoreTypeObjectNonList } from '@qoretechnologies/ts-toolkit';
import { configDotenv } from 'dotenv';
import { createZendeskRecords } from '../apps/zendesk/helpers/record-based/create-records';
import { deleteZendeskRecords } from '../apps/zendesk/helpers/record-based/delete-records';
import { getZendeskRecordType } from '../apps/zendesk/helpers/record-based/get-record-type';
import { getZendeskTableList } from '../apps/zendesk/helpers/record-based/get-table-list';
import { searchZendeskRecords } from '../apps/zendesk/helpers/record-based/search-records';
import { updateZendeskRecords } from '../apps/zendesk/helpers/record-based/update-records';
import {
  NewZendeskCustomObjectRecord,
  NewZendeskOrganization,
  NewZendeskTicket,
  NewZendeskUser,
} from '../apps/zendesk/triggers';
import { delay } from '../global/helpers';
import { Debugger, DebugLevels } from '../utils/Debugger';
import { retry } from './utils';
import _sodium from 'libsodium-wrappers';
import { createGitHubClient } from '../apps/github/helpers/constants';
import { encryptGitHubSecret } from '../qtests/utils';

configDotenv({ path: '.env' });
Debugger.level = DebugLevels.Verbose;

describe('Zendesk', () => {
  const baseContext = {
    conn_opts: {
      token: '',
      url: '',
    } as any,
  };

  beforeAll(async () => {
    const refreshToken = process.env.ZENDESK_REFRESH_TOKEN;
    const clientId = process.env.ZENDESK_CLIENT_ID;
    const clientSecret = process.env.ZENDESK_CLIENT_SECRET;
    const subdomain = process.env.ZENDESK_RECORD_BASED_SUBDOMAIN;

    if (!refreshToken || !clientId || !clientSecret) {
      throw new Error(`
        Please set the ZENDESK_REFRESH_TOKEN, ZENDESK_CLIENT_ID, ZENDESK_RECORD_BASED_SUBDOMAIN, 
        and ZENDESK_CLIENT_SECRET environment variables.
      `);
    }

    const data = {
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      redirect_uri: 'https://example.com/redirect',
    };

    const formBody = Object.keys(data)
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key as keyof typeof data])}`
      )
      .join('&');

    const response = await fetch(`https://${subdomain}.zendesk.com/oauth/tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formBody,
    });

    const responseData = await response.json();
    if (!responseData?.access_token) {
      throw new Error('Failed to get access token');
    }

    await updateZendeskRefreshTokenVariable(responseData.refresh_token);

    baseContext.conn_opts.token = responseData.access_token;
    baseContext.conn_opts.url = `https://${subdomain}.zendesk.com`;
    baseContext.conn_opts.subdomain = subdomain;
  });

  describe('Should test record based helpers', () => {
    describe('Table list and record type', () => {
      it('Should get table list', async () => {
        const result = await getZendeskTableList(baseContext);

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result).toContain('tickets');
        expect(result).toContain('users');
        expect(result).toContain('organizations');
      });

      it('Should get ticket record type', async () => {
        const result = (await getZendeskRecordType(
          baseContext,
          'tickets'
        )) as IQoreTypeObjectNonList;

        expect(result).toBeDefined();
        expect(result.type).toBe('hash');
        expect(result.fields).toBeDefined();
        expect(Object.keys(result.fields || {}).length).toBeGreaterThan(0);
      });

      it('Should get custom object record type', async () => {
        const result = (await getZendeskRecordType(
          baseContext,
          'test_custom_object'
        )) as IQoreTypeObjectNonList;

        expect(result).toBeDefined();
        expect(result.type).toBe('hash');
        expect(result.fields).toBeDefined();
        expect(Object.keys(result.fields || {}).length).toBeGreaterThan(0);
      });

      it('Should get user record type', async () => {
        const result = (await getZendeskRecordType(baseContext, 'users')) as IQoreTypeObjectNonList;

        expect(result).toBeDefined();
        expect(result.type).toBe('hash');
        expect(result.fields).toBeDefined();
        expect(Object.keys(result.fields || {}).length).toBeGreaterThan(0);
      });

      it('Should get organization record type', async () => {
        const result = (await getZendeskRecordType(
          baseContext,
          'organizations'
        )) as IQoreTypeObjectNonList;

        expect(result).toBeDefined();
        expect(result.type).toBe('hash');
        expect(result.fields).toBeDefined();
        expect(Object.keys(result.fields || {}).length).toBeGreaterThan(0);
      });
    });

    describe('Organization CRUD operations', () => {
      const testOrgNames = ['Test Org Alpha', 'Test Org Beta', 'Test Org Gamma'];

      afterEach(async () => {
        await delay(2000);
      });

      it('Should create organizations', async () => {
        const result = await createZendeskRecords(
          baseContext,
          {
            name: testOrgNames,
            notes: ['Notes for Alpha org', 'Notes for Beta org', 'Notes for Gamma org'],
          },
          { table: 'organizations' }
        );

        expect(result).toBeDefined();
        expect(result!.id).toBeDefined();
        expect(Array.isArray(result!.id)).toBe(true);
        expect(result!.id.length).toBe(3);
      });

      it('Should search organizations with simple expression', async () => {
        retry(async () => {
          const iterator = await searchZendeskRecords(
            baseContext,
            {
              exp: '==',
              args: [{ field: 'name' }, { value: 'Test Org Alpha' }],
            },
            { table: 'organizations' }
          );

          const result = await iterator(baseContext, 10);

          expect(result).toBeDefined();
          expect(result!.name).toBeDefined();
          expect(result!.name.length).toBeGreaterThan(0);
          expect(result!.name).toContain('Test Org Alpha');
        });
      });

      it('Should search organizations with OR expression', async () => {
        retry(async () => {
          const iterator = await searchZendeskRecords(
            baseContext,
            {
              exp: '||',
              args: [
                { exp: '==', args: [{ field: 'name' }, { value: 'Test Org Alpha' }] },
                { exp: '==', args: [{ field: 'name' }, { value: 'Test Org Beta' }] },
              ],
            },
            { table: 'organizations' }
          );

          const result = await iterator(baseContext, 10);

          expect(result).toBeDefined();
          if (result && result.name.length > 0) {
            result.name.forEach((name: string) => {
              expect(['Test Org Alpha', 'Test Org Beta']).toContain(name);
            });
          }
        });
      });

      it('Should update organizations', async () => {
        retry(async () => {
          const result = await updateZendeskRecords(
            baseContext,
            {
              notes: 'Updated notes for test org',
            },
            {
              exp: '==',
              args: [{ field: 'name' }, { value: 'Test Org Alpha' }],
            },
            { table: 'organizations' }
          );

          expect(result).toBeDefined();
          expect(result).toBeGreaterThanOrEqual(1);
        });
      });

      it('Should delete organizations', async () => {
        retry(async () => {
          const result = await deleteZendeskRecords(
            baseContext,
            {
              exp: '||',
              args: testOrgNames.map((name) => ({
                exp: '==',
                args: [{ field: 'name' }, { value: name }],
              })),
            },
            { table: 'organizations' }
          );

          expect(result).toBeDefined();
          expect(result).toBeGreaterThanOrEqual(3);
        });
      });
    });

    describe('User operations', () => {
      it('Should search users without conditions', async () => {
        const iterator = await searchZendeskRecords(baseContext, undefined, {
          table: 'users',
          limit: 5,
        });

        const result = await iterator(baseContext, 5);

        expect(result).toBeDefined();
        expect(result!.id).toBeDefined();
        expect(Array.isArray(result!.id)).toBe(true);
      });

      it('Should search users with role filter', async () => {
        const iterator = await searchZendeskRecords(
          baseContext,
          {
            exp: '==',
            args: [{ field: 'role' }, { value: 'agent' }],
          },
          { table: 'users' }
        );

        const result = await iterator(baseContext, 10);

        expect(result).toBeDefined();
      });
    });

    describe('Ticket operations', () => {
      let testTicketId = 'test_ticket_1';
      const testSubject = `Test Ticket ${Date.now()}`;

      afterEach(async () => {
        await delay(2000);
      });

      it('Should create a ticket', async () => {
        const result = await createZendeskRecords(
          baseContext,
          {
            subject: [testSubject],
            description: ['This is a test ticket created by automated tests'],
            priority: ['normal'],
            status: ['open'],
            external_id: [testTicketId],
          },
          { table: 'tickets' }
        );

        expect(result).toBeDefined();
        expect(result!.id).toBeDefined();
        expect(Array.isArray(result!.id)).toBe(true);
        expect(result!.id.length).toBe(1);
      });

      it('Should search tickets by status', async () => {
        const iterator = await searchZendeskRecords(
          baseContext,
          {
            exp: '==',
            args: [{ field: 'status' }, { value: 'open' }],
          },
          { table: 'tickets', limit: 10 }
        );

        const result = await iterator(baseContext, 10);

        expect(result).toBeDefined();
        if (result && result.status) {
          result.status.forEach((status: string) => {
            expect(status).toBe('open');
          });
        }
      });

      it('Should search tickets with AND expression', async () => {
        const iterator = await searchZendeskRecords(
          baseContext,
          {
            exp: '&&',
            args: [
              { exp: '==', args: [{ field: 'status' }, { value: 'open' }] },
              { exp: '==', args: [{ field: 'priority' }, { value: 'normal' }] },
            ],
          },
          { table: 'tickets', limit: 10 }
        );

        const result = await iterator(baseContext, 10);

        expect(result).toBeDefined();
        if (result && result.id.length > 0) {
          result.status.forEach((status: string) => {
            expect(status).toBe('open');
          });
          result.priority.forEach((priority: string) => {
            expect(priority).toBe('normal');
          });
        }
      });

      it('Should update the test ticket', async () => {
        retry(async () => {
          const result = await updateZendeskRecords(
            baseContext,
            {
              priority: 'high',
            },
            {
              exp: '==',
              args: [{ field: 'external_id' }, { value: testTicketId }],
            },
            { table: 'tickets' }
          );

          expect(result).toBeDefined();
          expect(result).toBe(1);
        });
      });

      it('Should delete the test ticket', async () => {
        retry(async () => {
          if (!testTicketId) {
            throw new Error('Test ticket was not created');
          }

          const result = await deleteZendeskRecords(
            baseContext,
            {
              exp: '==',
              args: [{ field: 'external_id' }, { value: testTicketId }],
            },
            { table: 'tickets' }
          );

          expect(result).toBeDefined();
          expect(result).toBe(1);
        }, 5);
      });
    });

    describe('Pagination tests', () => {
      it('Should handle pagination for tickets', async () => {
        const iterator = await searchZendeskRecords(baseContext, undefined, { table: 'tickets' });

        const firstPage = await iterator(baseContext, 2);

        expect(firstPage).toBeDefined();
        if (firstPage && firstPage.id.length > 0) {
          expect(firstPage.id.length).toBeLessThanOrEqual(2);

          const secondPage = await iterator(baseContext, 2);
          if (secondPage && secondPage.id.length > 0) {
            const firstIds = new Set(firstPage.id);
            secondPage.id.forEach((id: number) => {
              expect(firstIds.has(id)).toBe(false);
            });
          }
        }
      });

      it('Should respect limit option', async () => {
        const iterator = await searchZendeskRecords(baseContext, undefined, {
          table: 'users',
          limit: 3,
        });

        let totalRecords = 0;
        let result = await iterator(baseContext, 10);

        while (result && Object.keys(result).length > 0 && result.id?.length > 0) {
          totalRecords += result.id.length;
          result = await iterator(baseContext, 10);
        }

        expect(totalRecords).toBeLessThanOrEqual(3);
      });
    });

    describe('Search with ordering', () => {
      it('Should search tickets with ordering', async () => {
        retry(async () => {
          const iterator = await searchZendeskRecords(baseContext, undefined, {
            table: 'tickets',
            orderBy: {
              column: 'created_at',
              ascending: false,
            },
            limit: 10,
          });

          const result = await iterator(baseContext, 10);

          expect(result).toBeDefined();
          if (result && result.created_at && result.created_at.length > 1) {
            for (let i = 1; i < result.created_at.length; i++) {
              const prevDate = new Date(result.created_at[i - 1]).getTime();
              const currDate = new Date(result.created_at[i]).getTime();
              expect(prevDate).toBeGreaterThanOrEqual(currDate);
            }
          }
        });
      });
    });

    describe('Custom Object CRUD operations', () => {
      const customObjectTable = 'test_custom_object';
      const testTimestamp = Date.now();
      const testExternalIds = [
        `test_ext_${testTimestamp}_1`,
        `test_ext_${testTimestamp}_2`,
        `test_ext_${testTimestamp}_3`,
        `test_ext_${testTimestamp}_4`,
        `test_ext_${testTimestamp}_5`,
      ];
      const testNames = [
        `Test Object Alpha ${testTimestamp}`,
        `Test Object Beta ${testTimestamp}`,
        `Test Object Gamma ${testTimestamp}`,
        `Test Object Delta ${testTimestamp}`,
        `Test Object Epsilon ${testTimestamp}`,
      ];
      let createdRecordIds: string[] = [];

      afterEach(async () => {
        await delay(1000);
      });

      afterAll(async () => {
        if (createdRecordIds.length > 0) {
          try {
            await deleteZendeskRecords(
              baseContext,
              {
                exp: '||',
                args: testExternalIds.map((extId) => ({
                  exp: '==',
                  args: [{ field: 'external_id' }, { value: extId }],
                })),
              },
              { table: customObjectTable }
            );
          } catch (error) {
            Debugger.log('Cleanup error (may be expected if records were already deleted):', error);
          }
        }
      });

      describe('Create multiple custom objects', () => {
        it('Should create multiple custom objects at once', async () => {
          const result = await createZendeskRecords(
            baseContext,
            {
              name: testNames,
              external_id: testExternalIds,
              text_field: [
                'Text for Alpha',
                'Text for Beta',
                'Text for Gamma',
                'Text for Delta',
                'Text for Epsilon',
              ],
              number_field: [10, 20, 30, 40, 50],
              checkbox_field: [true, false, true, false, true],
              dropdown_field: ['test', 'test', 'another', 'test', 'another'],
            },
            { table: customObjectTable }
          );

          expect(result).toBeDefined();
          expect(result!.id).toBeDefined();
          expect(Array.isArray(result!.id)).toBe(true);
          expect(result!.id.length).toBe(5);

          createdRecordIds = result!.id.map(String);
        });
      });

      describe('Search custom objects with expressions', () => {
        it('Should search custom objects with simple equality expression', async () => {
          retry(async () => {
            const iterator = await searchZendeskRecords(
              baseContext,
              {
                exp: '==',
                args: [{ field: 'external_id' }, { value: testExternalIds[0] }],
              },
              { table: customObjectTable }
            );

            const result = await iterator(baseContext, 10);

            expect(result).toBeDefined();
            expect(result!.external_id).toBeDefined();
            expect(result!.external_id.length).toBe(1);
            expect(result!.external_id[0]).toBe(testExternalIds[0]);
          });
        });

        it('Should search custom objects with two-level AND expression', async () => {
          const iterator = await searchZendeskRecords(
            baseContext,
            {
              exp: '&&',
              args: [
                { exp: '==', args: [{ field: 'dropdown_field' }, { value: 'test' }] },
                { exp: '==', args: [{ field: 'checkbox_field' }, { value: true }] },
              ],
            },
            { table: customObjectTable }
          );

          const result = await iterator(baseContext, 10);

          expect(result).toBeDefined();
          if (result && result.id && result.id.length > 0) {
            result.dropdown_field.forEach((val: string) => {
              expect(val).toBe('test');
            });
            result.checkbox_field.forEach((val: boolean) => {
              expect(val).toBe(true);
            });
          }
        });

        it('Should search custom objects with two-level OR expression', async () => {
          const iterator = await searchZendeskRecords(
            baseContext,
            {
              exp: '||',
              args: [
                { exp: '==', args: [{ field: 'external_id' }, { value: testExternalIds[0] }] },
                { exp: '==', args: [{ field: 'external_id' }, { value: testExternalIds[1] }] },
              ],
            },
            { table: customObjectTable }
          );

          const result = await iterator(baseContext, 10);

          expect(result).toBeDefined();
          expect(result!.external_id).toBeDefined();
          if (result!.external_id.length > 0) {
            result!.external_id.forEach((extId: string) => {
              expect([testExternalIds[0], testExternalIds[1]]).toContain(extId);
            });
          }
        });

        it('Should search custom objects with comparison operators (greater than)', async () => {
          const iterator = await searchZendeskRecords(
            baseContext,
            {
              exp: '>',
              args: [{ field: 'number_field' }, { value: 25 }],
            },
            { table: customObjectTable }
          );

          const result = await iterator(baseContext, 10);

          expect(result).toBeDefined();
          if (result && result.number_field && result.number_field.length > 0) {
            result.number_field.forEach((val: number) => {
              expect(val).toBeGreaterThan(25);
            });
          }
        });

        it('Should search custom objects with not equal operator', async () => {
          const iterator = await searchZendeskRecords(
            baseContext,
            {
              exp: '!=',
              args: [{ field: 'dropdown_field' }, { value: 'test' }],
            },
            { table: customObjectTable }
          );

          const result = await iterator(baseContext, 10);

          expect(result).toBeDefined();
          if (result && result.dropdown_field && result.dropdown_field.length > 0) {
            result.dropdown_field.forEach((val: string) => {
              expect(val).not.toBe('test');
            });
          }
        });
      });

      describe('Custom objects pagination with sorting', () => {
        it('Should paginate custom objects with ascending sort by name', async () => {
          const iterator = await searchZendeskRecords(
            baseContext,
            {
              exp: '||',
              args: testExternalIds.map((extId) => ({
                exp: '==',
                args: [{ field: 'external_id' }, { value: extId }],
              })),
            },
            {
              table: customObjectTable,
              orderBy: {
                column: 'name',
                ascending: true,
              },
            }
          );

          const firstPage = await iterator(baseContext, 2);

          expect(firstPage).toBeDefined();
          expect(firstPage!.id).toBeDefined();

          if (firstPage && firstPage.id.length > 0) {
            const secondPage = await iterator(baseContext, 2);

            if (secondPage && secondPage.id && secondPage.id.length > 0) {
              const firstIds = new Set(firstPage.id.map(String));
              secondPage.id.forEach((id: string | number) => {
                expect(firstIds.has(String(id))).toBe(false);
              });
            }
          }
        });

        it('Should paginate custom objects with descending sort by created_at', async () => {
          const iterator = await searchZendeskRecords(
            baseContext,
            {
              exp: '||',
              args: testExternalIds.map((extId) => ({
                exp: '==',
                args: [{ field: 'external_id' }, { value: extId }],
              })),
            },
            {
              table: customObjectTable,
              orderBy: {
                column: 'created_at',
                ascending: false,
              },
            }
          );

          const result = await iterator(baseContext, 10);

          expect(result).toBeDefined();
          if (result && result.created_at && result.created_at.length > 1) {
            for (let i = 1; i < result.created_at.length; i++) {
              const prevDate = new Date(result.created_at[i - 1]).getTime();
              const currDate = new Date(result.created_at[i]).getTime();
              expect(prevDate).toBeGreaterThanOrEqual(currDate);
            }
          }
        });

        it('Should respect limit option for custom objects', async () => {
          const iterator = await searchZendeskRecords(
            baseContext,
            {
              exp: '||',
              args: testExternalIds.map((extId) => ({
                exp: '==',
                args: [{ field: 'external_id' }, { value: extId }],
              })),
            },
            {
              table: customObjectTable,
              limit: 2,
            }
          );

          let totalRecords = 0;
          let result = await iterator(baseContext, 10);

          while (result && Object.keys(result).length > 0 && result.id?.length > 0) {
            totalRecords += result.id.length;
            result = await iterator(baseContext, 10);
          }

          expect(totalRecords).toBeLessThanOrEqual(2);
        });
      });

      describe('Update custom objects', () => {
        it('Should update a single custom object by external_id', async () => {
          const result = await updateZendeskRecords(
            baseContext,
            {
              text_field: 'Updated text for Alpha',
              number_field: 999,
            },
            {
              exp: '==',
              args: [{ field: 'external_id' }, { value: testExternalIds[0] }],
            },
            { table: customObjectTable }
          );

          expect(result).toBeDefined();
          expect(result).toBe(1);

          const iterator = await searchZendeskRecords(
            baseContext,
            {
              exp: '==',
              args: [{ field: 'external_id' }, { value: testExternalIds[0] }],
            },
            { table: customObjectTable }
          );

          const searchResult = await iterator(baseContext, 10);
          expect(searchResult).toBeDefined();
          expect(searchResult!.text_field[0]).toBe('Updated text for Alpha');
          expect(searchResult!.number_field[0]).toBe(999);
        });

        it('Should update multiple custom objects matching a condition', async () => {
          const result = await updateZendeskRecords(
            baseContext,
            {
              text_field: 'Bulk updated text',
            },
            {
              exp: '==',
              args: [{ field: 'dropdown_field' }, { value: 'another' }],
            },
            { table: customObjectTable }
          );

          expect(result).toBeDefined();
          expect(result).toBeGreaterThanOrEqual(1);
        });
      });

      describe('Cleanup - Delete all test custom objects', () => {
        it('Should delete all remaining test custom objects', async () => {
          const result = await deleteZendeskRecords(
            baseContext,
            {
              exp: '||',
              args: testExternalIds.map((extId) => ({
                exp: '==',
                args: [{ field: 'external_id' }, { value: extId }],
              })),
            },
            { table: customObjectTable }
          );

          expect(result).toBeDefined();
          createdRecordIds = [];
        });
      });
    });
  });

  describe('Should test triggers event example data', () => {
    it('Should get example event data for new ticket', async () => {
      const trigger = NewZendeskTicket;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      const result = await trigger.get_example_event_data(baseContext);

      expect(result).toBeDefined();
      expect(result?.ticket_id).toBeDefined();
      expect(result?.ticket_subject).toBeDefined();
      expect(result?.ticket_status).toBeDefined();
    });

    it('Should get example event data for new user', async () => {
      const trigger = NewZendeskUser;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      const result = await trigger.get_example_event_data(baseContext);

      expect(result).toBeDefined();
      expect(result?.id).toBeDefined();
      expect(result?.email).toBeDefined();
      expect(result?.role).toBeDefined();
    });

    it('Should get example event data for new organization', async () => {
      const trigger = NewZendeskOrganization;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      const result = await trigger.get_example_event_data(baseContext);

      expect(result).toBeDefined();
      expect(result?.id).toBeDefined();
      expect(result?.name).toBeDefined();
    });

    it('Should get example event data for new custom object record', async () => {
      const trigger = NewZendeskCustomObjectRecord;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      const result = await trigger.get_example_event_data({
        ...baseContext,
        opts: {
          custom_object: 'test_custom_object',
        },
      });

      expect(result).toBeDefined();
      expect(result?.id).toBeDefined();
    });
  });
});

const updateZendeskRefreshTokenVariable = async (refreshToken: string) => {
  const zendeskRefreshTokenSecretName = process.env.ZENDESK_REFRESH_TOKEN_SECRET_NAME;
  const ghModuleRepoName = process.env.GH_MODULE_REPO_NAME;
  const ghModuleRepoOwner = process.env.GH_MODULE_REPO_OWNER;
  const ghPatForSecrets = process.env.GH_PAT_FOR_SECRETS;

  if (
    !zendeskRefreshTokenSecretName ||
    !ghModuleRepoName ||
    !ghModuleRepoOwner ||
    !ghPatForSecrets
  ) {
    throw new Error('Missing required environment variables for updating GitHub secret');
  }

  try {
    await _sodium.ready;

    const octokit = await createGitHubClient(ghPatForSecrets);

    const { data: publicKeyData } = await octokit.rest.actions.getRepoPublicKey({
      owner: ghModuleRepoOwner,
      repo: ghModuleRepoName,
    });

    const encryptedValue = encryptGitHubSecret(refreshToken, publicKeyData.key);

    await octokit.rest.actions.createOrUpdateRepoSecret({
      owner: ghModuleRepoOwner,
      repo: ghModuleRepoName,
      secret_name: zendeskRefreshTokenSecretName,
      encrypted_value: encryptedValue,
      key_id: publicKeyData.key_id,
    });

    return {
      success: true,
      secretName: zendeskRefreshTokenSecretName,
      message: 'GitHub secret updated successfully',
    };
  } catch (error) {
    throw new Error(`Failed to update GitHub secret: ${error.message || error}`);
  }
};
