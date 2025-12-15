import { configDotenv } from 'dotenv';
import {
  GetAllSendGridBounces,
  GetAllSendGridLists,
  GetSendGridBlock,
  GetSendGridGlobalSuppression,
  ListSendGridBlocks,
  ListSendGridGlobalSuppressions,
  SearchSendGridContacts,
  SendSendGridEmail,
  SendSendGridTemplateEmail,
  ValidateSendGridEmail,
  AddSendGridGlobalSuppressions,
  DeleteSendGridGlobalSuppression,
  CreateSendGridList,
  DeleteSendGridList,
  AddOrUpdateSendGridContact,
  DeleteSendGridContacts,
  DeleteSendGridBlocks,
  DeleteSendGridBounces,
  RemoveSendGridContactsFromList,
} from '../apps/sendgrid/actions';
import { getSendGridBlockAllowedValues } from '../apps/sendgrid/helpers/get-block-allowed-values';
import { getSendGridBounceAllowedValues } from '../apps/sendgrid/helpers/get-bounce-allowed-values';
import { getSendGridContactAllowedValues } from '../apps/sendgrid/helpers/get-contact-allowed-values';
import { getSendGridGlobalSuppressionAllowedValues } from '../apps/sendgrid/helpers/get-global-suppression-allowed-values';
import { getSendGridListAllowedValues } from '../apps/sendgrid/helpers/get-list-allowed-values';
import { getSendGridSenderAllowedValues } from '../apps/sendgrid/helpers/get-sender-allowed-values';
import { getSendGridTemplateAllowedValues } from '../apps/sendgrid/helpers/get-template-allowed-values';
import { Debugger, DebugLevels } from '../utils/Debugger';
import { checkAllowedValues } from './utils';

configDotenv({ path: '.env' });

describe('Should test SendGrid app', () => {
  Debugger.level = DebugLevels.Verbose;

  const token = process.env.SENDGRID_API_KEY;

  const baseContext: Record<string, any> = {
    conn_opts: {
      token,
    },
  };

  const allowedValuesCheckConfig = {
    checkNonEmpty: true,
  };

  beforeAll(() => {
    if (!token) {
      throw new Error('SENDGRID_API_KEY must be set in .env file to run tests');
    }
  });

  describe('Should test SendGrid allowed values', () => {
    it('Should get block allowed values', async () => {
      const allowedValues = await getSendGridBlockAllowedValues(baseContext);

      checkAllowedValues(allowedValues, { checkNonEmpty: false });
    });

    it('Should get bounce allowed values', async () => {
      const allowedValues = await getSendGridBounceAllowedValues(baseContext);

      checkAllowedValues(allowedValues, { checkNonEmpty: false });
    });

    it('Should get contact allowed values', async () => {
      const allowedValues = await getSendGridContactAllowedValues(baseContext);

      checkAllowedValues(allowedValues, { checkNonEmpty: false });
    });

    it('Should get global suppression allowed values', async () => {
      const allowedValues = await getSendGridGlobalSuppressionAllowedValues(baseContext);

      checkAllowedValues(allowedValues, allowedValuesCheckConfig);
    });

    it('Should get list allowed values', async () => {
      const allowedValues = await getSendGridListAllowedValues(baseContext);

      checkAllowedValues(allowedValues, allowedValuesCheckConfig);
    });

    it('Should get sender allowed values', async () => {
      const allowedValues = await getSendGridSenderAllowedValues(baseContext);

      checkAllowedValues(allowedValues, allowedValuesCheckConfig);
    });

    it('Should get template allowed values', async () => {
      const allowedValues = await getSendGridTemplateAllowedValues(baseContext);

      checkAllowedValues(allowedValues, allowedValuesCheckConfig);
    });
  });

  describe('Should test SendGrid actions (read-only, no credits required)', () => {
    let blockEmail: string;
    let globalSuppressionEmail: string;

    it('Should list blocks', async () => {
      const action = ListSendGridBlocks;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('Action does not have an api_function');

      const result = await action.api_function(
        {
          limit: 10,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      if (result.length > 0) {
        expect(result[0]).toHaveProperty('email');
        expect(result[0]).toHaveProperty('reason');
        expect(result[0]).toHaveProperty('created');
        blockEmail = result[0].email;
      }

      console.log('List Blocks Result:', result?.length, 'blocks');
    });

    it('Should get a specific block (if exists)', async () => {
      if (!blockEmail) {
        console.log('Skipping: No block email available');
        return;
      }

      const action = GetSendGridBlock;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('Action does not have an api_function');

      const result = await action.api_function(
        {
          email: blockEmail,
        },
        undefined,
        baseContext
      );

      console.log('Get Block Result:', result?.email);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('reason');
      expect(result).toHaveProperty('created');
      expect(result.email).toBe(blockEmail);
    });

    it('Should get all bounces', async () => {
      const action = GetAllSendGridBounces;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('Action does not have an api_function');

      const result = await action.api_function(
        {
          limit: 10,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      if (result.length > 0) {
        expect(result[0]).toHaveProperty('email');
        expect(result[0]).toHaveProperty('reason');
        expect(result[0]).toHaveProperty('status');
        expect(result[0]).toHaveProperty('created');
      }

      console.log('Get All Bounces Result:', result?.length, 'bounces');
    });

    it('Should list global suppressions', async () => {
      const action = ListSendGridGlobalSuppressions;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('Action does not have an api_function');

      const result = await action.api_function(
        {
          limit: 10,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      if (result.length > 0) {
        expect(result[0]).toHaveProperty('email');
        expect(result[0]).toHaveProperty('created');
        globalSuppressionEmail = result[0].email;
      }

      console.log('List Global Suppressions Result:', result?.length, 'suppressions');
    });

    it('Should get a specific global suppression (if exists)', async () => {
      if (!globalSuppressionEmail) {
        console.log('Skipping: No global suppression email available');
        return;
      }

      const action = GetSendGridGlobalSuppression;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('Action does not have an api_function');

      const result = await action.api_function(
        {
          email: globalSuppressionEmail,
        },
        undefined,
        baseContext
      );

      console.log('Get Global Suppression Result:', result?.recipient_email);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('recipient_email');
    });

    it('Should get all lists', async () => {
      const action = GetAllSendGridLists;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('Action does not have an api_function');

      const result = await action.api_function({}, undefined, baseContext);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      if (result.length > 0) {
        expect(result[0]).toHaveProperty('id');
        expect(result[0]).toHaveProperty('name');
        expect(result[0]).toHaveProperty('recipient_count');
      }

      console.log('Get All Lists Result:', result?.length, 'lists');
    });

    it('Should search contacts', async () => {
      const action = SearchSendGridContacts;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('Action does not have an api_function');

      const result = await action.api_function(
        {
          fieldName: 'email',
          value: 'test',
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      if (result.length > 0) {
        expect(result[0]).toHaveProperty('id');
        expect(result[0]).toHaveProperty('email');
      }

      console.log('Search Contacts Result:', result?.length, 'contacts');
    });
  });

  describe('Should test SendGrid actions (consume credits or modify data)', () => {
    let testListId: string;
    let testContactId: string;
    const testSuppressionEmail = `test-suppression-${Date.now()}@example.com`;

    describe('Email Validation (consumes credits)', () => {
      it.skip('Should validate an email address', async () => {
        const action = ValidateSendGridEmail;

        if (!('api_function' in action) || !action.api_function)
          throw new Error('Action does not have an api_function');

        const result = await action.api_function(
          {
            email: 'test@example.com',
          },
          undefined,
          baseContext
        );

        console.log('Validate Email Result:', result?.verdict);

        expect(result).toBeDefined();
        expect(result).toHaveProperty('email');
        expect(result).toHaveProperty('verdict');
        expect(result).toHaveProperty('score');
      });
    });

    describe('Send Email (consumes credits)', () => {
      it.skip('Should send an email', async () => {
        const senders = await getSendGridSenderAllowedValues(baseContext);
        if (!senders || senders.length === 0) {
          console.log('Skipping: No verified senders available');
          return;
        }

        const action = SendSendGridEmail;

        if (!('api_function' in action) || !action.api_function)
          throw new Error('Action does not have an api_function');

        const result = await action.api_function(
          {
            toEmail: 'myckmazurenko@gmail.com',
            fromEmail: senders[0].value,
            subject: 'Test Email from SendGrid Tests',
            textContent: 'This is a test email sent from automated tests.',
          },
          undefined,
          baseContext
        );

        console.log('Send Email Result:', result);

        expect(result).toBeDefined();
        expect(result).toHaveProperty('success');
        expect(result).toHaveProperty('statusCode');
      });

      it.skip('Should send a template email', async () => {
        const senders = await getSendGridSenderAllowedValues(baseContext);
        const templates = await getSendGridTemplateAllowedValues(baseContext);

        if (!senders || senders.length === 0) {
          console.log('Skipping: No verified senders available');
          return;
        }

        if (!templates || templates.length === 0) {
          console.log('Skipping: No templates available');
          return;
        }

        const action = SendSendGridTemplateEmail;

        if (!('api_function' in action) || !action.api_function)
          throw new Error('Action does not have an api_function');

        const result = await action.api_function(
          {
            toEmail: 'myckmazurenko@gmail.com',
            fromEmail: senders[0].value,
            templateId: templates[0].value,
            values: {
              another: 'Another',
            },
          },
          undefined,
          baseContext
        );

        console.log('Send Template Email Result:', result);

        expect(result).toBeDefined();
        expect(result).toHaveProperty('success');
        expect(result).toHaveProperty('statusCode');
      });
    });

    describe('List Management (modifies data)', () => {
      it('Should create a list', async () => {
        const action = CreateSendGridList;

        if (!('api_function' in action) || !action.api_function)
          throw new Error('Action does not have an api_function');

        const result = await action.api_function(
          {
            name: `Test List ${Date.now()}`,
          },
          undefined,
          baseContext
        );

        console.log('Create List Result:', result);

        expect(result).toBeDefined();
        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('name');

        testListId = String(result.id);
      });

      it('Should delete a list', async () => {
        if (!testListId) {
          console.log('Skipping: No test list ID available');
          return;
        }

        const action = DeleteSendGridList;

        if (!('api_function' in action) || !action.api_function)
          throw new Error('Action does not have an api_function');

        const result = await action.api_function(
          {
            listId: testListId,
            deleteContacts: false,
          },
          undefined,
          baseContext
        );

        console.log('Delete List Result:', result);

        expect(result).toBeDefined();
        expect(result).toHaveProperty('success');
        expect(result.success).toBe(true);
      });
    });

    describe('Contact Management (modifies data)', () => {
      it.skip('Should add or update a contact', async () => {
        const action = AddOrUpdateSendGridContact;

        if (!('api_function' in action) || !action.api_function)
          throw new Error('Action does not have an api_function');

        const result = await action.api_function(
          {
            email: `test-contact-${Date.now()}@example.com`,
            firstName: 'Test',
            lastName: 'Contact',
          },
          undefined,
          baseContext
        );

        console.log('Add Or Update Contact Result:', result);

        expect(result).toBeDefined();
        expect(result).toHaveProperty('persisted_recipients');

        if (result.persisted_recipients && result.persisted_recipients.length > 0) {
          testContactId = result.persisted_recipients[0];
        }
      });

      it.skip('Should delete contacts', async () => {
        if (!testContactId) {
          console.log('Skipping: No test contact ID available');
          return;
        }

        const action = DeleteSendGridContacts;

        if (!('api_function' in action) || !action.api_function)
          throw new Error('Action does not have an api_function');

        const result = await action.api_function(
          {
            contactIds: [testContactId],
          },
          undefined,
          baseContext
        );

        console.log('Delete Contacts Result:', result);

        expect(result).toBeDefined();
        expect(result).toHaveProperty('success');
        expect(result.success).toBe(true);
      });

      it.skip('Should remove contacts from list', async () => {
        const lists = await getSendGridListAllowedValues(baseContext);
        const contacts = await getSendGridContactAllowedValues(baseContext);

        if (!lists || lists.length === 0) {
          console.log('Skipping: No lists available');
          return;
        }

        if (!contacts || contacts.length === 0) {
          console.log('Skipping: No contacts available');
          return;
        }

        const action = RemoveSendGridContactsFromList;

        if (!('api_function' in action) || !action.api_function)
          throw new Error('Action does not have an api_function');

        const result = await action.api_function(
          {
            listId: lists[0].value,
            contactIds: [contacts[0].value],
          },
          undefined,
          baseContext
        );

        console.log('Remove Contacts From List Result:', result);

        expect(result).toBeDefined();
        expect(result).toHaveProperty('success');
      });
    });

    describe('Global Suppression Management (modifies data)', () => {
      it('Should add global suppressions', async () => {
        const action = AddSendGridGlobalSuppressions;

        if (!('api_function' in action) || !action.api_function)
          throw new Error('Action does not have an api_function');

        const result = await action.api_function(
          {
            emails: [testSuppressionEmail],
          },
          undefined,
          baseContext
        );

        console.log('Add Global Suppressions Result:', result);

        expect(result).toBeDefined();
        expect(result).toHaveProperty('success');
        expect(result).toHaveProperty('recipient_emails');
      });

      it('Should delete a global suppression', async () => {
        const action = DeleteSendGridGlobalSuppression;

        if (!('api_function' in action) || !action.api_function)
          throw new Error('Action does not have an api_function');

        const result = await action.api_function(
          {
            email: testSuppressionEmail,
          },
          undefined,
          baseContext
        );

        console.log('Delete Global Suppression Result:', result);

        expect(result).toBeDefined();
        expect(result).toHaveProperty('success');
        expect(result.success).toBe(true);
      });
    });

    describe('Block/Bounce Management (modifies data)', () => {
      it.skip('Should delete blocks', async () => {
        const blocks = await getSendGridBlockAllowedValues(baseContext);

        if (!blocks || blocks.length === 0) {
          console.log('Skipping: No blocks available to delete');
          return;
        }

        const action = DeleteSendGridBlocks;

        if (!('api_function' in action) || !action.api_function)
          throw new Error('Action does not have an api_function');

        const result = await action.api_function(
          {
            emails: [blocks[0].value],
            deleteAll: false,
          },
          undefined,
          baseContext
        );

        console.log('Delete Blocks Result:', result);

        expect(result).toBeDefined();
        expect(result).toHaveProperty('success');
        expect(result.success).toBe(true);
      });

      it.skip('Should delete bounces', async () => {
        const bounces = await getSendGridBounceAllowedValues(baseContext);

        if (!bounces || bounces.length === 0) {
          console.log('Skipping: No bounces available to delete');
          return;
        }

        const action = DeleteSendGridBounces;

        if (!('api_function' in action) || !action.api_function)
          throw new Error('Action does not have an api_function');

        const result = await action.api_function(
          {
            emails: [bounces[0].value],
            deleteAll: false,
          },
          undefined,
          baseContext
        );

        console.log('Delete Bounces Result:', result);

        expect(result).toBeDefined();
        expect(result).toHaveProperty('success');
        expect(result.success).toBe(true);
      });
    });
  });
});
