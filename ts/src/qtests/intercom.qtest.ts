import { INTERCOM_ACTIONS } from '../apps/intercom/constants';
import { getIntercomAdminIdAllowedValues } from '../apps/intercom/helpers/get-admin-id-allowed-values';
import { getIntercomCollectionIdAllowedValues } from '../apps/intercom/helpers/get-collection-id-allowed-values';
import { getIntercomCompanyIdAllowedValues } from '../apps/intercom/helpers/get-company-id-allowed-values';
import { getIntercomContactIdAllowedValues } from '../apps/intercom/helpers/get-contact-id-allowed-values';
import { getIntercomContactTagsAllowedValues } from '../apps/intercom/helpers/get-contact-tag-id-allowed-values';
import {
  getIntercomLeadIdAllowedValues,
  getIntercomUserIdAllowedValues,
} from '../apps/intercom/helpers/get-lead-id-allowed-values';
import { getIntercomSectionIdAllowedValues } from '../apps/intercom/helpers/get-section-id-allowed-values';
import { getIntercomTagIdAllowedValues } from '../apps/intercom/helpers/get-tag-id-allowed-values';
import { NewIntercomConversation } from '../apps/intercom/triggers';
import { delay } from '../global/helpers';
import { Debugger, DebugLevels } from '../utils/Debugger';

Debugger.level = DebugLevels.Verbose;

describe('Should test Intercom integration', () => {
  let connection: string;
  const token = process.env.INTERCOM_TOKEN;

  let contactId: string;
  // let conversationId: string;
  let companyId: string;
  let tagId: string;
  let articleId: string;
  let adminId: string;

  beforeAll(() => {
    if (!token) {
      throw new Error('INTERCOM_TOKEN environment variable is not set');
    }

    connection = testApi.createConnection('intercom', {
      opts: {
        token,
        oauth2_grant_type: 'none' as any,
      },
    });

    expect(connection).toBeDefined();
  });

  describe('Should test intercom allowed values functions', () => {
    afterEach(async () => {
      await delay(1000);
    });

    // Plan restricted
    // it('Should get intercom conversation id allowed values', async () => {
    //   const allowed_values = await getIntercomConversationIdAllowedValues({
    //     conn_opts: { token },
    //   } as any);

    //   expect(allowed_values).toBeDefined();
    //   expect(allowed_values.length).toBeGreaterThan(0);

    //   if (allowed_values.length > 0) {
    //     conversationId = allowed_values[0].value;
    //   }
    // });

    it('Should get intercom contact id allowed values', async () => {
      const allowed_values = await getIntercomContactIdAllowedValues({
        conn_opts: { token },
      } as any);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      if (allowed_values.length > 0) {
        contactId = allowed_values[0].value;
      }
    });

    it('Should get intercom contact tag id allowed values', async () => {
      if (!contactId) {
        console.warn('No contact ID available. Skipping test.');

        return;
      }

      const allowed_values = await getIntercomContactTagsAllowedValues({
        conn_opts: { token },
        opts: { contact_id: contactId },
      } as any);

      expect(allowed_values).toBeDefined();
    });

    it('Should get intercom tag id allowed values', async () => {
      const allowed_values = await getIntercomTagIdAllowedValues({
        conn_opts: { token },
      } as any);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      if (allowed_values.length > 0) {
        tagId = allowed_values[0].value;
      }
    });

    it('Should get intercom admin id allowed values', async () => {
      const allowed_values = await getIntercomAdminIdAllowedValues({
        conn_opts: { token },
      } as any);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      adminId = allowed_values[0].value;
    });

    it('Should get intercom collection id allowed values', async () => {
      const allowed_values = await getIntercomCollectionIdAllowedValues({
        conn_opts: { token },
      } as any);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get intercom section id allowed values', async () => {
      const allowed_values = await getIntercomSectionIdAllowedValues({
        conn_opts: { token },
      } as any);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get intercom company id allowed values', async () => {
      const allowed_values = await getIntercomCompanyIdAllowedValues({
        conn_opts: { token },
      } as any);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      if (allowed_values.length > 0) {
        companyId = allowed_values[0].value;
      }
    });

    it('Should get intercom lead id allowed values', async () => {
      const allowed_values = await getIntercomLeadIdAllowedValues({
        conn_opts: { token },
      } as any);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get intercom user id allowed values', async () => {
      const allowed_values = await getIntercomUserIdAllowedValues({
        conn_opts: { token },
      } as any);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get example event data for new conversation trigger', async () => {
      const trigger = NewIntercomConversation;

      if ('get_example_event_data' in trigger) {
        const createdData = await trigger.get_example_event_data!({
          conn_opts: { token },
          opts: { role: 'user' },
        } as any);

        expect(createdData).toBeDefined();
      }
    });
  });

  describe('Should test Intercom actions', () => {
    const timestamp = Date.now();

    afterEach(async () => {
      await delay(1000);
    });

    it('Should list all companies', async () => {
      const action = INTERCOM_ACTIONS.find((a) => a.action === 'listAllCompanies');
      expect(action).toBeDefined();

      const { body } = await testApi.execAppAction('intercom', action!.action, connection);

      expect(body).toBeDefined();
      expect(body.data).toBeDefined();
      expect(Array.isArray(body.data)).toBe(true);
    });

    it('Should create or update a company', async () => {
      const action = INTERCOM_ACTIONS.find((a) => a.action === 'createOrUpdateCompany');
      expect(action).toBeDefined();

      const companyName = `Test Company ${timestamp}`;
      const { body } = await testApi.execAppAction('intercom', action!.action, connection, {
        name: companyName,
        company_id: `test-company`,
      });

      expect(body).toBeDefined();
      expect(body.name).toBe(companyName);

      if (!companyId) {
        companyId = body.id;
        console.log(`Created company ID: ${companyId}`);
      }
    });

    it('Should search contacts', async () => {
      const action = INTERCOM_ACTIONS.find((a) => a.action === 'SearchContacts');
      expect(action).toBeDefined();

      const { body } = await testApi.execAppAction('intercom', action!.action, connection, {
        query: {
          field: 'role',
          operator: '=',
          value: 'user',
        },
      });

      expect(body).toBeDefined();
      expect(body.data).toBeDefined();
      expect(Array.isArray(body.data)).toBe(true);

      if (!contactId && body.data.length > 0) {
        contactId = body.data[0].id;
        console.log(`Found contact ID: ${contactId}`);
      }
    });

    it('Should attach a tag to a contact', async () => {
      const action = INTERCOM_ACTIONS.find((a) => a.action === 'attachTagToContact');
      expect(action).toBeDefined();

      if (!contactId || !tagId) {
        console.warn('Contact ID or Tag ID not available, skipping test');

        return;
      }

      const { body } = await testApi.execAppAction('intercom', action!.action, connection, {
        contact_id: contactId,
        id: tagId,
      });

      expect(body).toBeDefined();
      expect(body.id).toBe(tagId);
    });

    it('Should detach a tag from a contact', async () => {
      const action = INTERCOM_ACTIONS.find((a) => a.action === 'detachTagFromContact');
      expect(action).toBeDefined();

      if (!contactId || !tagId) {
        console.warn('Contact ID or Tag ID not available, skipping test');

        return;
      }

      const { body } = await testApi.execAppAction('intercom', action!.action, connection, {
        contact_id: contactId,
        id: tagId,
      });

      expect(body).toBeDefined();
      expect(body.id).toBe(tagId);
    });

    it('Should create a note for a contact', async () => {
      const action = INTERCOM_ACTIONS.find((a) => a.action === 'createNote');
      expect(action).toBeDefined();

      if (!contactId) {
        console.warn('Contact ID not available, skipping test');

        return;
      }

      const { body } = await testApi.execAppAction('intercom', action!.action, connection, {
        id: contactId,
        body: {
          body: `Test note created at ${new Date().toISOString()}`,
        },
      });

      expect(body).toBeDefined();
      expect(body.body).toBeDefined();
      expect(body.contact).toBeDefined();
      expect(body.contact.id).toBe(contactId);
    });

    // Plan restricted
    // it('Should create a conversation', async () => {
    //   const action = INTERCOM_ACTIONS.find((a) => a.action === 'createConversation');
    //   expect(action).toBeDefined();

    //   if (!contactId) {
    //     console.warn('Contact ID not available, skipping test');

    //     return;
    //   }

    //   const { body } = await testApi.execAppAction('intercom', action!.action, connection, {
    //     body: {
    //       from: {
    //         type: 'user',
    //         id: contactId,
    //       },
    //       body: `Test conversation created at ${new Date().toISOString()}`,
    //     },
    //   });

    //   expect(body).toBeDefined();
    //   expect(body.id).toBeDefined();
    // });

    it('Should search conversations', async () => {
      const action = INTERCOM_ACTIONS.find((a) => a.action === 'searchConversations');
      expect(action).toBeDefined();

      const { body } = await testApi.execAppAction('intercom', action!.action, connection, {
        query: {
          field: 'updated_at',
          operator: '>',
          value: 0,
        },
      });

      expect(body).toBeDefined();
      expect(body.conversations).toBeDefined();
      expect(Array.isArray(body.conversations)).toBe(true);
    });

    // Plan restricted
    // it('Should reply to a conversation', async () => {
    //   const action = INTERCOM_ACTIONS.find((a) => a.action === 'replyConversation');
    //   expect(action).toBeDefined();

    //   if (!conversationId) {
    //     console.warn('Conversation ID not available, skipping test');

    //     return;
    //   }

    //   const { body } = await testApi.execAppAction('intercom', action!.action, connection, {
    //     id: conversationId,
    //     from: adminId,
    //     message: `Test reply created at ${new Date().toISOString()}`,
    //   });

    //   expect(body).toBeDefined();
    //   expect(body.id).toBe(conversationId);
    // });

    it('Should list tags', async () => {
      const action = INTERCOM_ACTIONS.find((a) => a.action === 'listTags');
      expect(action).toBeDefined();

      const { body } = await testApi.execAppAction('intercom', action!.action, connection);

      expect(body).toBeDefined();
      expect(body.data).toBeDefined();
      expect(Array.isArray(body.data)).toBe(true);

      if (!tagId && body.data.length > 0) {
        tagId = body.data[0].id;
        console.log(`Found tag ID: ${tagId}`);
      }
    });

    it('Should create a data event', async () => {
      const action = INTERCOM_ACTIONS.find((a) => a.action === 'createDataEvent');
      expect(action).toBeDefined();

      if (!contactId) {
        console.warn('Contact ID not available, skipping test');

        return;
      }

      const response = await testApi.execAppAction('intercom', action!.action, connection, {
        body: {
          event_name: `Test`,
          id: contactId,
        },
      });

      expect(response).toBeDefined();
    });

    it('Should list data events', async () => {
      const action = INTERCOM_ACTIONS.find((a) => a.action === 'lisDataEvents');
      expect(action).toBeDefined();

      if (!contactId) {
        console.warn('Contact ID not available, skipping test');

        return;
      }

      const { body } = await testApi.execAppAction('intercom', action!.action, connection, {
        type: 'user',
        email: 'test@example.com',
      });

      expect(body).toBeDefined();
      expect(body.events).toBeDefined();
      expect(Array.isArray(body.events)).toBe(true);
    });

    it('Should create an article', async () => {
      const action = INTERCOM_ACTIONS.find((a) => a.action === 'createArticle');
      expect(action).toBeDefined();

      const { body } = await testApi.execAppAction('intercom', action!.action, connection, {
        body: {
          title: `Test Article ${timestamp}`,
          body: '<p>This is the content of the test article</p>',
          author_id: adminId,
        },
      });

      expect(body).toBeDefined();
      expect(body.id).toBeDefined();
      expect(body.title).toContain(`Test Article ${timestamp}`);

      articleId = body.id;
      console.log(`Created article ID: ${articleId}`);
    });

    it('Should list articles', async () => {
      const action = INTERCOM_ACTIONS.find((a) => a.action === 'listArticles');
      expect(action).toBeDefined();

      const { body } = await testApi.execAppAction('intercom', action!.action, connection);

      expect(body).toBeDefined();
      expect(body.data).toBeDefined();
      expect(Array.isArray(body.data)).toBe(true);
    });

    // Plan restricted
    // it('Should create a message', async () => {
    //   const action = INTERCOM_ACTIONS.find((a) => a.action === 'createMessage');
    //   expect(action).toBeDefined();

    //   if (!contactId) {
    //     console.warn('Contact ID not available, skipping test');

    //     return;
    //   }

    //   const { body } = await testApi.execAppAction('intercom', action!.action, connection, {
    //     body: {
    //       from: adminId,
    //       to: {
    //         type: 'user',
    //         id: contactId,
    //       },
    //       body: `Test message created at ${new Date().toISOString()}`,
    //       message_type: 'in_app',
    //     },
    //   });

    //   expect(body).toBeDefined();
    //   expect(body.type).toBe('admin_message');
    // });
  });
});
