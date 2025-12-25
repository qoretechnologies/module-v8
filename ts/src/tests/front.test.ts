import { configDotenv } from 'dotenv';
import {
  AddFrontContactNote,
  AddFrontContactsToContactList,
  AddFrontContactToAccount,
  AddFrontConversationComment,
  AddFrontConversationFollowers,
  AddFrontConversationTag,
  CreateFrontAccount,
  CreateFrontContact,
  CreateFrontContactList,
  DeleteFrontAccount,
  DeleteFrontContact,
  DeleteFrontContactList,
  GetFrontAccount,
  GetFrontContact,
  GetFrontConversation,
  GetFrontMessage,
  ListFrontAccountContacts,
  ListFrontAccounts,
  ListFrontContactConversations,
  ListFrontContactLists,
  ListFrontContactNotes,
  ListFrontContacts,
  ListFrontContactsInContactList,
  ListFrontConversationComments,
  ListFrontConversationMessages,
  ListFrontConversations,
  RemoveFrontContactFromAccount,
  RemoveFrontContactsFromContactList,
  RemoveFrontConversationTag,
  SearchFrontConversations,
  UpdateFrontAccount,
  UpdateFrontContact,
  UpdateFrontConversation,
  UpdateFrontConversationAssignee,
} from '../apps/front/actions';
import { getFrontAccountAllowedValues } from '../apps/front/helpers/get-account-allowed-values';
import { getFrontContactAllowedValues } from '../apps/front/helpers/get-contact-allowed-values';
import { getFrontContactListAllowedValues } from '../apps/front/helpers/get-contact-list-allowed-values';
import { getFrontConversationAllowedValues } from '../apps/front/helpers/get-conversation-allowed-values';
import {
  getFrontAccountCustomFieldDynamicType,
  getFrontContactCustomFieldDynamicType,
  getFrontConversationCustomFieldDynamicType,
} from '../apps/front/helpers/get-custom-fields';
import { getFrontInboxAllowedValues } from '../apps/front/helpers/get-inbox-allowed-values';
import { getFrontTagAllowedValues } from '../apps/front/helpers/get-tag-allowed-values';
import { getFrontTeammateAllowedValues } from '../apps/front/helpers/get-teammate-allowed-values';
import { Debugger, DebugLevels } from '../utils/Debugger';
import { checkAllowedValues } from './utils';

configDotenv({ path: '.env' });

const allowedValuesConfig = {
  logSingleValue: false,
  logAllValues: false,
  checkNonEmpty: true,
};

describe('Should test Front', () => {
  Debugger.level = DebugLevels.Verbose;
  const token = process.env.FRONT_TOKEN || '';

  const baseContext = {
    conn_opts: {
      token,
    } as any,
  };

  const sharedTestValues = {
    conversationId: '',
    teammateId: '',
    tagId: '',
  };

  beforeAll(async () => {
    if (!token) {
      throw new Error('FRONT_TOKEN is not set in environment variables');
    }
  });

  describe('Should test allowed values', () => {
    it('Should get contact allowed values', async () => {
      const allowedValues = await getFrontContactAllowedValues(baseContext);

      checkAllowedValues(allowedValues, allowedValuesConfig);
    });

    it('Should get account allowed values', async () => {
      const allowedValues = await getFrontAccountAllowedValues(baseContext);

      checkAllowedValues(allowedValues, allowedValuesConfig);
    });

    it('Should get contact list allowed values', async () => {
      const allowedValues = await getFrontContactListAllowedValues(baseContext);

      checkAllowedValues(allowedValues, allowedValuesConfig);
    });

    it('Should get conversation allowed values', async () => {
      const allowedValues = await getFrontConversationAllowedValues(baseContext);

      checkAllowedValues(allowedValues, allowedValuesConfig);

      if (allowedValues.length > 0) {
        sharedTestValues.conversationId = allowedValues[0].value;
      }
    });

    it('Should get teammate allowed values', async () => {
      const allowedValues = await getFrontTeammateAllowedValues(baseContext);

      checkAllowedValues(allowedValues, allowedValuesConfig);

      if (allowedValues.length > 0) {
        sharedTestValues.teammateId = allowedValues[0].value;
      }
    });

    it('Should get inbox allowed values', async () => {
      const allowedValues = await getFrontInboxAllowedValues(baseContext);

      checkAllowedValues(allowedValues, allowedValuesConfig);
    });

    it('Should get tag allowed values', async () => {
      const allowedValues = await getFrontTagAllowedValues(baseContext);

      checkAllowedValues(allowedValues, allowedValuesConfig);

      if (allowedValues.length > 0) {
        sharedTestValues.tagId = allowedValues[0].value;
      }
    });
  });

  describe('Should test custom field dynamic types', () => {
    it('Should get account custom field dynamic type', async () => {
      const dynamicType = (await getFrontAccountCustomFieldDynamicType(baseContext)) as {
        type: string;
        fields?: Record<string, any>;
      };

      expect(dynamicType).toBeDefined();
      expect(dynamicType.type).toBe('hash');
      expect(dynamicType.fields).toBeDefined();

      if (allowedValuesConfig.logAllValues) {
        console.log('Account custom fields:', Object.keys(dynamicType.fields || {}));
      }
    });

    it('Should get contact custom field dynamic type', async () => {
      const dynamicType = (await getFrontContactCustomFieldDynamicType(baseContext)) as {
        type: string;
        fields?: Record<string, any>;
      };

      expect(dynamicType).toBeDefined();
      expect(dynamicType.type).toBe('hash');
      expect(dynamicType.fields).toBeDefined();

      if (allowedValuesConfig.logAllValues) {
        console.log('Contact custom fields:', Object.keys(dynamicType.fields || {}));
      }
    });

    it('Should get conversation custom field dynamic type', async () => {
      const dynamicType = (await getFrontConversationCustomFieldDynamicType(baseContext)) as {
        type: string;
        fields?: Record<string, any>;
      };

      expect(dynamicType).toBeDefined();
      expect(dynamicType.type).toBe('hash');
      expect(dynamicType.fields).toBeDefined();

      if (allowedValuesConfig.logAllValues) {
        console.log('Conversation custom fields:', Object.keys(dynamicType.fields || {}));
      }
    });
  });

  describe('Should test Account actions', () => {
    let createdAccountId: string;

    it('Should list accounts', async () => {
      const action = ListFrontAccounts;

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

    it('Should create an account', async () => {
      const action = CreateFrontAccount;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          name: `Test Account ${Date.now()}`,
          description: 'Test account created by automated tests',
          domains: ['test-domain.com'],
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      createdAccountId = result.id;
    });

    it('Should get an account', async () => {
      const action = GetFrontAccount;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          accountId: createdAccountId,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(createdAccountId);
      expect(result.name).toBeDefined();
    });

    it('Should update an account', async () => {
      const action = UpdateFrontAccount;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          accountId: createdAccountId,
          description: 'Updated description by automated tests',
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.accountId).toBe(createdAccountId);
    });

    it('Should delete an account', async () => {
      const action = DeleteFrontAccount;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          accountId: createdAccountId,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.accountId).toBe(createdAccountId);
    });
  });

  describe('Should test Account-Contact actions', () => {
    let testAccountId: string;
    let testContactId: string;

    beforeAll(async () => {
      const createAccountAction = CreateFrontAccount;
      if (!('api_function' in createAccountAction))
        throw new Error('api_function not found in action');

      const accountResult = await createAccountAction.api_function(
        {
          name: `Test Account for Contacts ${Date.now()}`,
          description: 'Test account for contact association tests',
        },
        undefined,
        baseContext
      );
      testAccountId = accountResult.id;

      const contacts = await getFrontContactAllowedValues(baseContext);
      if (contacts.length > 0) {
        testContactId = contacts[0].value;
      }
    });

    afterAll(async () => {
      if (testAccountId) {
        const deleteAccountAction = DeleteFrontAccount;
        if ('api_function' in deleteAccountAction) {
          await deleteAccountAction.api_function(
            { accountId: testAccountId },
            undefined,
            baseContext
          );
        }
      }
    });

    it('Should list account contacts', async () => {
      const action = ListFrontAccountContacts;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          accountId: testAccountId,
          limit: 10,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('Should add contact to account', async () => {
      if (!testContactId) {
        console.log('No contacts found, skipping add contact to account test');
        return;
      }

      const action = AddFrontContactToAccount;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          accountId: testAccountId,
          contactIds: [testContactId],
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.accountId).toBe(testAccountId);
    });

    it('Should remove contact from account', async () => {
      if (!testContactId) {
        console.log('No contacts found, skipping remove contact from account test');
        return;
      }

      const action = RemoveFrontContactFromAccount;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          accountId: testAccountId,
          contactIds: [testContactId],
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.accountId).toBe(testAccountId);
    });
  });

  describe('Should test Contact actions', () => {
    let createdContactId: string;
    const testEmail = `test-${Date.now()}@automation-test.example.com`;

    it('Should create a contact', async () => {
      const action = CreateFrontContact;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          name: 'Automation Test Contact',
          description: 'Created by automated tests',
          handles: [{ handle: testEmail, source: 'email' }],
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.id).toMatch(/^crd_/);
      createdContactId = result.id;
    });

    it('Should list contacts', async () => {
      const action = ListFrontContacts;

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

    it('Should list contacts with sort options', async () => {
      const action = ListFrontContacts;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          limit: 5,
          sortBy: 'updated_at',
          sortOrder: 'desc',
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('Should get a contact', async () => {
      expect(createdContactId).toBeDefined();

      const action = GetFrontContact;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          contactId: createdContactId,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(createdContactId);
    });

    it('Should update a contact', async () => {
      expect(createdContactId).toBeDefined();

      const action = UpdateFrontContact;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          contactId: createdContactId,
          description: `Updated by automated tests at ${new Date().toISOString()}`,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.contactId).toBe(createdContactId);
    });

    it('Should list contact conversations', async () => {
      expect(createdContactId).toBeDefined();

      const action = ListFrontContactConversations;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          contactId: createdContactId,
          limit: 10,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('Should delete a contact', async () => {
      expect(createdContactId).toBeDefined();

      const action = DeleteFrontContact;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          contactId: createdContactId,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.contactId).toBe(createdContactId);
    });
  });

  describe('Should test Contact Notes actions', () => {
    let createdContactId: string;
    const testEmail = `test-notes-${Date.now()}@automation-test.example.com`;

    beforeAll(async () => {
      const action = CreateFrontContact;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          name: 'Automation Test Contact for Notes',
          handles: [{ handle: testEmail, source: 'email' }],
        },
        undefined,
        baseContext
      );
      createdContactId = result.id;
    });

    afterAll(async () => {
      if (createdContactId) {
        const action = DeleteFrontContact;
        if ('api_function' in action) {
          await action.api_function({ contactId: createdContactId }, undefined, baseContext);
        }
      }
    });

    it('Should list contact notes', async () => {
      expect(createdContactId).toBeDefined();

      const action = ListFrontContactNotes;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          contactId: createdContactId,
          limit: 10,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('Should add a note to a contact', async () => {
      expect(createdContactId).toBeDefined();

      const action = AddFrontContactNote;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          contactId: createdContactId,
          authorId: sharedTestValues.teammateId,
          body: `Test note created by automated tests at ${new Date().toISOString()}`,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.body).toBeDefined();
    });
  });

  describe('Should test Contact Lists actions', () => {
    let createdContactListId: string;
    let createdContactId: string;
    const testEmail = `test-lists-${Date.now()}@automation-test.example.com`;

    beforeAll(async () => {
      const action = CreateFrontContact;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          name: 'Automation Test Contact for Lists',
          handles: [{ handle: testEmail, source: 'email' }],
        },
        undefined,
        baseContext
      );
      createdContactId = result.id;
    });

    afterAll(async () => {
      if (createdContactId) {
        const action = DeleteFrontContact;
        if ('api_function' in action) {
          await action.api_function({ contactId: createdContactId }, undefined, baseContext);
        }
      }
    });

    it('Should list contact lists', async () => {
      const action = ListFrontContactLists;

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

    it('Should create a contact list', async () => {
      const action = CreateFrontContactList;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          name: `Test Contact List ${Date.now()}`,
          description: 'Test contact list created by automated tests',
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBeDefined();
      createdContactListId = result.id;
    });

    it('Should list contacts in a contact list', async () => {
      expect(createdContactListId).toBeDefined();

      const action = ListFrontContactsInContactList;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          contactListId: createdContactListId,
          limit: 10,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('Should add contacts to a contact list', async () => {
      expect(createdContactListId).toBeDefined();
      expect(createdContactId).toBeDefined();

      const action = AddFrontContactsToContactList;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          contactListId: createdContactListId,
          contactIds: [createdContactId],
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.contactListId).toBe(createdContactListId);
    });

    it('Should remove contacts from a contact list', async () => {
      expect(createdContactListId).toBeDefined();
      expect(createdContactId).toBeDefined();

      const action = RemoveFrontContactsFromContactList;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          contactListId: createdContactListId,
          contactIds: [createdContactId],
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.contactListId).toBe(createdContactListId);
    });

    it('Should delete a contact list', async () => {
      expect(createdContactListId).toBeDefined();

      const action = DeleteFrontContactList;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          contactListId: createdContactListId,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.contactListId).toBe(createdContactListId);
    });
  });

  describe('Should test Conversation actions', () => {
    let testMessageId: string;

    it('Should list conversations', async () => {
      const action = ListFrontConversations;

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
      const action = ListFrontConversations;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          limit: 5,
          status: 'open',
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('Should get a conversation', async () => {
      if (!sharedTestValues.conversationId) {
        console.log('No conversations found, skipping get conversation test');
        return;
      }

      const action = GetFrontConversation;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          conversationId: sharedTestValues.conversationId,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(sharedTestValues.conversationId);
    });

    it('Should search conversations', async () => {
      const action = SearchFrontConversations;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          query: 'test',
          limit: 10,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.total).toBeDefined();
      expect(Array.isArray(result.conversations)).toBe(true);
    });

    it('Should update a conversation', async () => {
      if (!sharedTestValues.conversationId) {
        console.log('No conversations found, skipping update conversation test');
        return;
      }

      const action = UpdateFrontConversation;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          conversationId: sharedTestValues.conversationId,
          status: 'open',
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.conversationId).toBe(sharedTestValues.conversationId);
    });

    it('Should update conversation assignee', async () => {
      if (!sharedTestValues.conversationId) {
        console.log('No conversations found, skipping update conversation assignee test');
        return;
      }

      const action = UpdateFrontConversationAssignee;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          conversationId: sharedTestValues.conversationId,
          assigneeId: sharedTestValues.teammateId,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.conversationId).toBe(sharedTestValues.conversationId);
    });

    it('Should add tag to conversation', async () => {
      if (!sharedTestValues.conversationId) {
        console.log('No conversations found, skipping add conversation tag test');
        return;
      }

      if (!sharedTestValues.tagId) {
        console.log('No tags found, skipping add conversation tag test');
        return;
      }

      const action = AddFrontConversationTag;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          conversationId: sharedTestValues.conversationId,
          tagIds: [sharedTestValues.tagId],
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.conversationId).toBe(sharedTestValues.conversationId);
    });

    it('Should remove tag from conversation', async () => {
      if (!sharedTestValues.conversationId) {
        console.log('No conversations found, skipping remove conversation tag test');
        return;
      }

      if (!sharedTestValues.tagId) {
        console.log('No tags found, skipping remove conversation tag test');
        return;
      }

      const action = RemoveFrontConversationTag;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          conversationId: sharedTestValues.conversationId,
          tagIds: [sharedTestValues.tagId],
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.conversationId).toBe(sharedTestValues.conversationId);
    });

    it('Should add followers to conversation', async () => {
      if (!sharedTestValues.conversationId) {
        console.log('No conversations found, skipping add conversation followers test');
        return;
      }

      if (!sharedTestValues.teammateId) {
        console.log('No teammates found, skipping add conversation followers test');
        return;
      }

      const action = AddFrontConversationFollowers;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          conversationId: sharedTestValues.conversationId,
          teammateIds: [sharedTestValues.teammateId],
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.conversationId).toBe(sharedTestValues.conversationId);
    });

    it('Should list conversation messages', async () => {
      if (!sharedTestValues.conversationId) {
        console.log('No conversations found, skipping list conversation messages test');
        return;
      }

      const action = ListFrontConversationMessages;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          conversationId: sharedTestValues.conversationId,
          limit: 10,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      if (result.length > 0) {
        testMessageId = result[0].id;
      }
    });

    it('Should get a message', async () => {
      if (!testMessageId) {
        console.log('No messages found, skipping get message test');
        return;
      }

      const action = GetFrontMessage;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          messageId: testMessageId,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(testMessageId);
    });

    it('Should list conversation comments', async () => {
      if (!sharedTestValues.conversationId) {
        console.log('No conversations found, skipping list conversation comments test');
        return;
      }

      const action = ListFrontConversationComments;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          conversationId: sharedTestValues.conversationId,
          limit: 10,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('Should add a comment to conversation', async () => {
      if (!sharedTestValues.conversationId) {
        console.log('No conversations found, skipping add conversation comment test');
        return;
      }

      const action = AddFrontConversationComment;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          conversationId: sharedTestValues.conversationId,
          body: `Test comment created by automated tests at ${new Date().toISOString()}`,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.body).toBeDefined();
    });
  });
});
