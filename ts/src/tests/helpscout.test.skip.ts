import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { configDotenv } from 'dotenv';
import {
  AddHelpScoutNote,
  AddHelpScoutTags,
  CreateHelpScoutConversation,
  DeleteHelpScoutConversation,
  FindHelpScoutMailbox,
  GetHelpScoutConversation,
  GetHelpScoutCustomer,
  ListHelpScoutConversations,
  ListHelpScoutCustomers,
  ListHelpScoutSavedReplies,
  ListHelpScoutThreads,
  ListHelpScoutUsers,
  SearchHelpScoutCustomers,
  UpdateHelpScoutConversation,
  UpdateHelpScoutCustomer,
} from '../apps/helpscout/actions';
import createHelpScoutCustomer from '../apps/helpscout/actions/create-customer.action';
import deleteHelpScoutCustomer from '../apps/helpscout/actions/delete-customer.action';
import { getHelpScoutConversationAllowedValues } from '../apps/helpscout/helpers/get-conversation-allowed-values';
import { getHelpScoutCustomerAllowedValues } from '../apps/helpscout/helpers/get-customer-allowed-values';
import { getHelpScoutFolderAllowedValues } from '../apps/helpscout/helpers/get-folder-allowed-values';
import { getHelpScoutMailboxAllowedValues } from '../apps/helpscout/helpers/get-mailbox-allowed-values';
import { getHelpScoutOrganizationAllowedValues } from '../apps/helpscout/helpers/get-organization-allowed-values';
import { getHelpScoutTagAllowedValues } from '../apps/helpscout/helpers/get-tag-allowed-values';
import { getHelpScoutTagNameAllowedValues } from '../apps/helpscout/helpers/get-tag-name-allowed-values';
import { getHelpScoutThreadAllowedValues } from '../apps/helpscout/helpers/get-thread-allowed-values';
import { getHelpScoutUserAllowedValues } from '../apps/helpscout/helpers/get-user-allowed-values';
import {
  HelpScoutAssignedConversation,
  HelpScoutNewConversation,
  HelpScoutNewCustomer,
  HelpScoutNewOrganization,
  HelpScoutUpdatedCustomer,
} from '../apps/helpscout/triggers';
import { Debugger, DebugLevels } from '../utils/Debugger';
import { checkAllowedValues } from './utils';

configDotenv({ path: '.env' });

const allowedValuesConfig = {
  logSingleValue: false,
  checkNonEmpty: true,
};

describe('Should test HelpScout', () => {
  Debugger.level = DebugLevels.Verbose;
  const clientId = process.env.HELPSCOUT_CLIENT_ID;
  const clientSecret = process.env.HELPSCOUT_CLIENT_SECRET;

  const baseContext = {
    conn_opts: {
      token: '',
    } as any,
  };

  let mailboxId: number | undefined;

  beforeAll(async () => {
    if (!clientId || !clientSecret) {
      throw new Error('HelpScout credentials are not provided');
    }

    const data = {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
    };

    const response = await QorusRequest.post<{ data: { access_token: string } }>(
      {
        path: '/v2/oauth2/token',
        bodyType: 'form-urlencoded',
        data,
      },
      {
        url: 'https://api.helpscout.net',
        endpointId: 'token_refresh',
      }
    );

    baseContext.conn_opts.token = response.data.access_token;
  });

  describe('Should test allowed values', () => {
    it('Should get customer allowed values', async () => {
      const allowedValues = await getHelpScoutCustomerAllowedValues(baseContext);

      checkAllowedValues(allowedValues, allowedValuesConfig);
    });

    it('Should get mailbox allowed values', async () => {
      const allowedValues = await getHelpScoutMailboxAllowedValues(baseContext);

      checkAllowedValues(allowedValues, allowedValuesConfig);

      if (allowedValues.length > 0) {
        mailboxId = allowedValues[0].value;
      }
    });

    it('Should get user allowed values', async () => {
      const allowedValues = await getHelpScoutUserAllowedValues(baseContext);

      checkAllowedValues(allowedValues, allowedValuesConfig);
    });

    it('Should get conversation allowed values', async () => {
      const allowedValues = await getHelpScoutConversationAllowedValues(baseContext);

      checkAllowedValues(allowedValues, allowedValuesConfig);
    });

    it('Should get tag allowed values', async () => {
      const allowedValues = await getHelpScoutTagAllowedValues(baseContext);

      checkAllowedValues(allowedValues, allowedValuesConfig);
    });

    it('Should get tag name allowed values', async () => {
      const allowedValues = await getHelpScoutTagNameAllowedValues(baseContext);

      checkAllowedValues(allowedValues, allowedValuesConfig);
      expect(typeof allowedValues[0].value).toBe('string');
    });

    it('Should get folder allowed values', async () => {
      const mailboxes = await getHelpScoutMailboxAllowedValues(baseContext);
      if (mailboxes.length === 0) {
        console.log('No mailboxes found, skipping folder allowed values test');
        return;
      }

      const allowedValues = await getHelpScoutFolderAllowedValues({
        ...baseContext,
        opts: { mailboxId: mailboxes[0].value },
      } as any);

      checkAllowedValues(allowedValues, allowedValuesConfig);
    });

    it('Should get organization allowed values', async () => {
      const allowedValues = await getHelpScoutOrganizationAllowedValues(baseContext);

      checkAllowedValues(allowedValues, allowedValuesConfig);
    });

    it('Should get thread allowed values', async () => {
      const conversations = await getHelpScoutConversationAllowedValues(baseContext);
      if (conversations.length === 0) {
        console.log('No conversations found, skipping thread allowed values test');
        return;
      }

      const allowedValues = await getHelpScoutThreadAllowedValues({
        ...baseContext,
        opts: { conversationId: conversations[0].value },
      } as any);

      checkAllowedValues(allowedValues, allowedValuesConfig);
    });
  });

  describe('Should test actions', () => {
    it('Should list customers', async () => {
      const action = ListHelpScoutCustomers;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          limit: 10,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('Should list customers with sort options', async () => {
      const action = ListHelpScoutCustomers;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          limit: 5,
          sortField: 'createdAt',
          sortOrder: 'desc',
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    describe('Should test conversation actions', () => {
      let createdConversationId: number;

      it('Should list conversations', async () => {
        const action = ListHelpScoutConversations;

        if (!('api_function' in action)) throw new Error('api_function not found in action');

        const result = await action.api_function(
          {
            limit: 10,
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      });

      it('Should list conversations with status filter', async () => {
        const action = ListHelpScoutConversations;

        if (!('api_function' in action)) throw new Error('api_function not found in action');

        const result = await action.api_function(
          {
            limit: 5,
            status: 'all',
            sortField: 'createdAt',
            sortOrder: 'desc',
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      });

      it('Should get a single conversation', async () => {
        const action = GetHelpScoutConversation;

        if (!('api_function' in action)) throw new Error('api_function not found in action');

        const conversations = await getHelpScoutConversationAllowedValues(baseContext);
        if (conversations.length === 0) {
          console.log('No conversations found, skipping get conversation test');
          return;
        }

        const conversationId = conversations[0].value;

        const result = await action.api_function(
          {
            conversationId,
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.subject).toBeDefined();
        expect(result.status).toBeDefined();
      });

      it('Should create a conversation', async () => {
        const action = CreateHelpScoutConversation;

        if (!('api_function' in action)) throw new Error('api_function not found in action');

        const mailboxes = await getHelpScoutMailboxAllowedValues(baseContext);
        if (mailboxes.length === 0) {
          console.log('No mailboxes found, skipping create conversation test');
          return;
        }

        const customers = await getHelpScoutCustomerAllowedValues(baseContext);
        if (customers.length === 0) {
          console.log('No customers found, skipping create conversation test');
          return;
        }

        const result = await action.api_function(
          {
            subject: 'Test Conversation',
            mailboxId: mailboxes[0].value,
            type: 'email',
            status: 'active',
            customerId: customers[0].value,
            threadType: 'customer',
            threadText: 'This is a test conversation created by automated tests.',
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result.conversationId).toBeDefined();
        createdConversationId = result.conversationId;
      });

      it('Should add tags to a conversation', async () => {
        const action = AddHelpScoutTags;

        if (!('api_function' in action)) throw new Error('api_function not found in action');

        const result = await action.api_function(
          {
            conversationId: createdConversationId,
            tags: ['test-tag', 'automated-test'],
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result.conversationId).toBe(createdConversationId);
        expect(result.tags).toBeDefined();
        expect(Array.isArray(result.tags)).toBe(true);
      });

      it('Should add a note to a conversation', async () => {
        const action = AddHelpScoutNote;

        if (!('api_function' in action)) throw new Error('api_function not found in action');

        const result = await action.api_function(
          {
            conversationId: createdConversationId,
            text: 'This is a test note added by automated tests.',
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result.conversationId).toBe(createdConversationId);
        expect(result.note).toBeDefined();
        expect(result.note.text).toBe('This is a test note added by automated tests.');
      });

      it('Should update a conversation', async () => {
        const action = UpdateHelpScoutConversation;

        if (!('api_function' in action)) throw new Error('api_function not found in action');

        const result = await action.api_function(
          {
            conversationId: createdConversationId,
            subject: 'Updated Test Conversation',
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
      });

      it('Should list threads for a conversation', async () => {
        const action = ListHelpScoutThreads;

        if (!('api_function' in action)) throw new Error('api_function not found in action');

        const result = await action.api_function(
          {
            conversationId: createdConversationId,
            limit: 10,
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      });

      it('Should delete a conversation', async () => {
        const action = DeleteHelpScoutConversation;

        if (!('api_function' in action)) throw new Error('api_function not found in action');

        const result = await action.api_function(
          {
            conversationId: createdConversationId,
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result.success).toBe(true);
      });
    });

    it('Should list users', async () => {
      const action = ListHelpScoutUsers;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          limit: 10,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      if (result.length > 0) {
        expect(result[0].id).toBeDefined();
        expect(result[0].email).toBeDefined();
      }
    });

    it('Should find mailbox by name', async () => {
      const action = FindHelpScoutMailbox;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const mailboxes = await getHelpScoutMailboxAllowedValues(baseContext);
      if (mailboxes.length === 0) {
        console.log('No mailboxes found, skipping find mailbox test');
        return;
      }

      const mailboxName = mailboxes[0].display_name;

      const result = await action.api_function(
        {
          name: mailboxName,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBeDefined();
      expect(result.email).toBeDefined();
    });

    describe('Should test customer actions', () => {
      let createdCustomerId: number;

      it('Should get a single customer', async () => {
        const action = GetHelpScoutCustomer;

        if (!('api_function' in action)) throw new Error('api_function not found in action');

        const customers = await getHelpScoutCustomerAllowedValues(baseContext);
        if (customers.length === 0) {
          console.log('No customers found, skipping get customer test');
          return;
        }

        const customerId = customers[0].value;

        const result = await action.api_function(
          {
            customerId,
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
      });

      it('Should search customers', async () => {
        const action = SearchHelpScoutCustomers;

        if (!('api_function' in action)) throw new Error('api_function not found in action');

        const result = await action.api_function(
          {
            query: '(firstName:*)',
            limit: 5,
            sortField: 'createdAt',
            sortOrder: 'desc',
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      });

      it('Should create a customer', async () => {
        const action = createHelpScoutCustomer;

        if (!('api_function' in action)) throw new Error('api_function not found in action');

        const result = await action.api_function(
          {
            firstName: 'Test',
            lastName: 'Customer',
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result.customerId).toBeDefined();
        createdCustomerId = result.customerId;
      });

      it('Should update a customer', async () => {
        const action = UpdateHelpScoutCustomer;

        if (!('api_function' in action)) throw new Error('api_function not found in action');

        const result = await action.api_function(
          {
            customerId: createdCustomerId,
            jobTitle: 'Updated Job Title',
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
      });

      it('Should delete a customer', async () => {
        const action = deleteHelpScoutCustomer;

        if (!('api_function' in action)) throw new Error('api_function not found in action');

        const result = await action.api_function(
          {
            customerId: createdCustomerId,
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
      });
    });

    it('Should list saved replies for a mailbox', async () => {
      const action = ListHelpScoutSavedReplies;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const mailboxes = await getHelpScoutMailboxAllowedValues(baseContext);
      if (mailboxes.length === 0) {
        console.log('No mailboxes found, skipping list saved replies test');
        return;
      }

      const mailboxIdValue = mailboxes[0].value;

      const result = await action.api_function(
        {
          mailboxId: mailboxIdValue,
          limit: 10,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Should test trigger webhook register and deregister', () => {
    const webhookUrl = 'https://example.com/webhook';

    it('Should register and deregister webhook for new customer trigger', async () => {
      const trigger = HelpScoutNewCustomer;

      if (!('webhook_register' in trigger) || !trigger.webhook_register)
        throw new Error('webhook_register not found in trigger');
      if (!('webhook_deregister' in trigger) || !trigger.webhook_deregister)
        throw new Error('webhook_deregister not found in trigger');

      const regInfo = (await trigger.webhook_register(baseContext, webhookUrl)) as {
        webhook_id: string;
      };

      expect(regInfo).toBeDefined();
      expect(regInfo.webhook_id).toBeDefined();

      await trigger.webhook_deregister(baseContext, webhookUrl, regInfo);
    });

    it('Should register and deregister webhook for updated customer trigger', async () => {
      const trigger = HelpScoutUpdatedCustomer;

      if (!('webhook_register' in trigger) || !trigger.webhook_register)
        throw new Error('webhook_register not found in trigger');
      if (!('webhook_deregister' in trigger) || !trigger.webhook_deregister)
        throw new Error('webhook_deregister not found in trigger');

      const regInfo = (await trigger.webhook_register(baseContext, webhookUrl)) as {
        webhook_id: string;
      };

      expect(regInfo).toBeDefined();
      expect(regInfo.webhook_id).toBeDefined();

      await trigger.webhook_deregister(baseContext, webhookUrl, regInfo);
    });

    it('Should register and deregister webhook for new organization trigger', async () => {
      const trigger = HelpScoutNewOrganization;

      if (!('webhook_register' in trigger) || !trigger.webhook_register)
        throw new Error('webhook_register not found in trigger');
      if (!('webhook_deregister' in trigger) || !trigger.webhook_deregister)
        throw new Error('webhook_deregister not found in trigger');

      const regInfo = (await trigger.webhook_register(baseContext, webhookUrl)) as {
        webhook_id: string;
      };

      expect(regInfo).toBeDefined();
      expect(regInfo.webhook_id).toBeDefined();

      await trigger.webhook_deregister(baseContext, webhookUrl, regInfo);
    });

    it('Should register and deregister webhook for new conversation trigger', async () => {
      const trigger = HelpScoutNewConversation;

      if (!('webhook_register' in trigger) || !trigger.webhook_register)
        throw new Error('webhook_register not found in trigger');
      if (!('webhook_deregister' in trigger) || !trigger.webhook_deregister)
        throw new Error('webhook_deregister not found in trigger');

      const contextWithOpts = {
        ...baseContext,
        opts: { mailboxId },
      } as any;

      const regInfo = (await trigger.webhook_register(contextWithOpts, webhookUrl)) as {
        webhook_id: string;
      };

      expect(regInfo).toBeDefined();
      expect(regInfo.webhook_id).toBeDefined();

      await trigger.webhook_deregister(contextWithOpts, webhookUrl, regInfo);
    });

    it('Should register and deregister webhook for assigned conversation trigger', async () => {
      const trigger = HelpScoutAssignedConversation;

      if (!('webhook_register' in trigger) || !trigger.webhook_register)
        throw new Error('webhook_register not found in trigger');
      if (!('webhook_deregister' in trigger) || !trigger.webhook_deregister)
        throw new Error('webhook_deregister not found in trigger');

      const contextWithOpts = {
        ...baseContext,
        opts: { mailboxId },
      } as any;

      const regInfo = (await trigger.webhook_register(contextWithOpts, webhookUrl)) as {
        webhook_id: string;
      };

      expect(regInfo).toBeDefined();
      expect(regInfo.webhook_id).toBeDefined();

      await trigger.webhook_deregister(contextWithOpts, webhookUrl, regInfo);
    });
  });

  describe('Should test triggers event example data', () => {
    it('Should get example event data for new customer trigger', async () => {
      const trigger = HelpScoutNewCustomer;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      const result = await trigger.get_example_event_data(baseContext);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });

    it('Should get example event data for updated customer trigger', async () => {
      const trigger = HelpScoutUpdatedCustomer;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      const result = await trigger.get_example_event_data(baseContext);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });

    it('Should get example event data for new organization trigger', async () => {
      const trigger = HelpScoutNewOrganization;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      const result = await trigger.get_example_event_data(baseContext);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });

    it('Should get example event data for new conversation trigger', async () => {
      const trigger = HelpScoutNewConversation;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      const result = await trigger.get_example_event_data({
        ...baseContext,
        opts: { mailboxId },
      } as any);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });

    it('Should get example event data for assigned conversation trigger', async () => {
      const trigger = HelpScoutAssignedConversation;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      const result = await trigger.get_example_event_data({
        ...baseContext,
        opts: { mailboxId },
      } as any);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });
  });
});
