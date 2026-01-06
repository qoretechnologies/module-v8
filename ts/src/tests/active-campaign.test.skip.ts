import { configDotenv } from 'dotenv';
import {
  AddActiveCampaignContactNote,
  AddActiveCampaignDealNote,
  AddActiveCampaignTagToContact,
  CreateActiveCampaignAccount,
  CreateActiveCampaignContact,
  CreateActiveCampaignDeal,
  GetActiveCampaignAccount,
  GetActiveCampaignCampaign,
  GetActiveCampaignContact,
  GetActiveCampaignDeal,
  GetActiveCampaignForm,
  GetActiveCampaignList,
  GetActiveCampaignTask,
  GetActiveCampaignUser,
  ListActiveCampaignAccounts,
  ListActiveCampaignCampaigns,
  ListActiveCampaignContacts,
  ListActiveCampaignDeals,
  ListActiveCampaignDealStages,
  ListActiveCampaignForms,
  ListActiveCampaignLists,
  ListActiveCampaignTags,
  ListActiveCampaignTasks,
  ListActiveCampaignUsers,
  RemoveActiveCampaignTagFromContact,
  UpdateActiveCampaignAccount,
  UpdateActiveCampaignContact,
  UpdateActiveCampaignDeal,
} from '../apps/active-campaign/actions';
import { activeCampaignClient } from '../apps/active-campaign/helpers/constants';
import { getActiveCampaignAccountAllowedValues } from '../apps/active-campaign/helpers/get-account-id-allowed-values';
import { getActiveCampaignCampaignAllowedValues } from '../apps/active-campaign/helpers/get-campaign-allowed-values';
import { getActiveCampaignContactAllowedValues } from '../apps/active-campaign/helpers/get-contact-id-allowed-values';
import {
  mapActiveCampaignAccountCustomFieldsToQoreOptions,
  mapActiveCampaignContactCustomFieldsToQoreOptions,
} from '../apps/active-campaign/helpers/get-custom-field-type';
import { getActiveCampaignDealAllowedValues } from '../apps/active-campaign/helpers/get-deal-id-allowed-values';
import { getActiveCampaignFormAllowedValues } from '../apps/active-campaign/helpers/get-form-id-allowed-values';
import { getActiveCampaignGroupAllowedValues } from '../apps/active-campaign/helpers/get-group-allowed-values';
import { getActiveCampaignListAllowedValues } from '../apps/active-campaign/helpers/get-list-id-allowed-values';
import { getActiveCampaignDealStageAllowedValues } from '../apps/active-campaign/helpers/get-stage-id-allowed-values';
import {
  getActiveCampaignContactTagAllowedValues,
  getActiveCampaignTagAllowedValues,
} from '../apps/active-campaign/helpers/get-tag-allowed-values';
import { getActiveCampaignTaskAllowedValues } from '../apps/active-campaign/helpers/get-task-id-allowed-values';
import { getActiveCampaignUserAllowedValues } from '../apps/active-campaign/helpers/get-user-id-allowed-values';
import { Debugger, DebugLevels } from '../utils/Debugger';

configDotenv({ path: '.env' });
Debugger.level = DebugLevels.Verbose;

describe('Active Campaign', () => {
  const base_context = {
    conn_opts: {
      token: '',
      instance_url: '',
    } as any,
  };

  beforeAll(() => {
    const token = process.env.ACTIVE_CAMPAIGN_TOKEN;
    const instance_url = process.env.ACTIVE_CAMPAIGN_INSTANCE_URL;

    if (!token) {
      throw new Error(`Please set the ACTIVE_CAMPAIGN_TOKEN environment variable.`);
    }

    if (!instance_url) {
      throw new Error(`Please set the ACTIVE_CAMPAIGN_INSTANCE_URL environment variable.`);
    }

    base_context.conn_opts.token = token;
    base_context.conn_opts.instance_url = instance_url;
  });

  let accountId: string | undefined;
  let contactId: string | undefined;
  let dealId: string | undefined;
  let formId: string | undefined;
  let listId: string | undefined;
  let taskId: string | undefined;
  let userId: string | undefined;
  let tagId: string | undefined;
  let campaignId: string | undefined;
  let createdAccountId: string | undefined;
  let createdContactId: string | undefined;
  let createdDealId: string | undefined;

  describe('Should test allowed values', () => {
    it('Should get form id allowed values', async () => {
      const allowed_values = await getActiveCampaignFormAllowedValues(base_context);
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      formId = allowed_values[0].value;
    });

    it('Should get list id allowed values', async () => {
      const allowed_values = await getActiveCampaignListAllowedValues(base_context);
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      listId = allowed_values[0].value;
    });

    it('Should get contact id allowed values', async () => {
      const allowed_values = await getActiveCampaignContactAllowedValues(base_context);
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      contactId = allowed_values[0].value;
    });
    it('Should get user id allowed values', async () => {
      const allowed_values = await getActiveCampaignUserAllowedValues(base_context);
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      userId = allowed_values[0].value;
    });

    it('Should get account id allowed values', async () => {
      const allowed_values = await getActiveCampaignAccountAllowedValues(base_context);
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      accountId = allowed_values[0].value;
    });
    it('Should get deal id allowed values', async () => {
      const allowed_values = await getActiveCampaignDealAllowedValues(base_context);
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      dealId = allowed_values[0].value;
    });

    it('Should get task id allowed values', async () => {
      const allowed_values = await getActiveCampaignTaskAllowedValues(base_context);
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      taskId = allowed_values[0].value;
    });

    it('Should get campaign allowed values', async () => {
      const allowed_values = await getActiveCampaignCampaignAllowedValues(base_context);
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should test options mapping for account custom fields', async () => {
      const fields = await mapActiveCampaignAccountCustomFieldsToQoreOptions({
        token: base_context.conn_opts.token,
        url: base_context.conn_opts.instance_url,
      });

      expect(fields['1']).toBeDefined();
    });
    it('Should test options mapping for contact custom fields', async () => {
      const fields = await mapActiveCampaignContactCustomFieldsToQoreOptions({
        token: base_context.conn_opts.token,
        url: base_context.conn_opts.instance_url,
      });

      expect(fields['1']).toBeDefined();
    });

    it('Should get tag allowed values', async () => {
      const allowed_values = await getActiveCampaignTagAllowedValues(base_context);
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      tagId = allowed_values[0].value;
    });

    it('Should get deal stage allowed values', async () => {
      const allowed_values = await getActiveCampaignDealStageAllowedValues(base_context);
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get group allowed values', async () => {
      const allowed_values = await getActiveCampaignGroupAllowedValues(base_context);
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });
  });

  describe('Should test actions', () => {
    it('Should list accounts', async () => {
      const action = ListActiveCampaignAccounts;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({}, undefined, base_context);

      expect(result).toBeDefined();
      expect(Array.isArray(result.accounts)).toBe(true);
      expect(result.accounts.length).toBeGreaterThan(0);
    });

    it('Should list users', async () => {
      const action = ListActiveCampaignUsers;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({}, undefined, base_context);

      expect(result).toBeDefined();
      expect(Array.isArray(result.users)).toBe(true);
      expect(result.users.length).toBeGreaterThan(0);
    });

    it('Should list forms', async () => {
      const action = ListActiveCampaignForms;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({}, undefined, base_context);

      expect(result).toBeDefined();
      expect(Array.isArray(result.forms)).toBe(true);
      expect(result.forms.length).toBeGreaterThan(0);
    });

    it('Should list lists', async () => {
      const action = ListActiveCampaignLists;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({}, undefined, base_context);

      expect(result).toBeDefined();
      expect(Array.isArray(result.lists)).toBe(true);
      expect(result.lists.length).toBeGreaterThan(0);
    });

    it('Should list contacts', async () => {
      const action = ListActiveCampaignContacts;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({}, undefined, base_context);
      expect(result).toBeDefined();
      expect(Array.isArray(result.contacts)).toBe(true);
      expect(result.contacts.length).toBeGreaterThan(0);
    });

    it('Should list deals', async () => {
      const action = ListActiveCampaignDeals;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({}, undefined, base_context);

      expect(result).toBeDefined();
      expect(Array.isArray(result.deals)).toBe(true);
      expect(result.deals.length).toBeGreaterThan(0);
    });

    it('Should list tasks', async () => {
      const action = ListActiveCampaignTasks;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({}, undefined, base_context);

      expect(result).toBeDefined();
      expect(Array.isArray(result.dealTasks)).toBe(true);
      expect(result.dealTasks.length).toBeGreaterThan(0);
    });

    it('Should get a single account', async () => {
      const action = GetActiveCampaignAccount;

      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!accountId) throw new Error('No account ID found for testing');

      const result = await action.api_function({ id: accountId }, undefined, base_context);

      expect(result).toBeDefined();
      expect(result.id).toBe(accountId);
    });

    it('Should get a single user', async () => {
      const action = GetActiveCampaignUser;

      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!userId) throw new Error('No user ID found for testing');

      const result = await action.api_function({ id: userId }, undefined, base_context);

      expect(result).toBeDefined();
      expect(result.id).toBe(userId);
    });

    it('Should get a single form', async () => {
      const action = GetActiveCampaignForm;

      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!formId) throw new Error('No form ID found for testing');

      const result = await action.api_function({ id: formId }, undefined, base_context);

      expect(result).toBeDefined();
      expect(result.id).toBe(formId);
    });

    it('Should get a single list', async () => {
      const action = GetActiveCampaignList;

      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!listId) throw new Error('No list ID found for testing');

      const result = await action.api_function({ id: listId }, undefined, base_context);

      expect(result).toBeDefined();
      expect(result.id).toBe(listId);
    });

    it('Should get a single contact', async () => {
      const action = GetActiveCampaignContact;

      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!contactId) throw new Error('No contact ID found for testing');

      const result = await action.api_function({ id: contactId }, undefined, base_context);

      expect(result).toBeDefined();
      expect(result.contact).toBeDefined();
      expect(result.contact.id).toBe(contactId);
    });

    it('Should get a single deal', async () => {
      const action = GetActiveCampaignDeal;

      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!dealId) throw new Error('No deal ID found for testing');

      const result = await action.api_function({ id: dealId }, undefined, base_context);

      expect(result).toBeDefined();
      expect(result.id).toBe(dealId);
    });

    it('Should get a single task', async () => {
      const action = GetActiveCampaignTask;

      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!taskId) throw new Error('No task ID found for testing');

      const result = await action.api_function({ id: taskId }, undefined, base_context);

      expect(result).toBeDefined();
      expect(result.id).toBe(taskId);
    });

    it('Should create an account', async () => {
      const action = CreateActiveCampaignAccount;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          name: 'Test Account Created From Qore',
          fieldOptions: {
            1: 'Custom Description',
          } as any,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();

      createdAccountId = result.id;
    });

    it('Should update an account', async () => {
      const action = UpdateActiveCampaignAccount;

      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!createdAccountId) throw new Error('No account ID found for testing');

      const result = await action.api_function(
        { id: createdAccountId, name: 'Updated Name' },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(createdAccountId);
    });

    it('Should list campaigns', async () => {
      const action = ListActiveCampaignCampaigns;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({}, undefined, base_context);

      expect(result).toBeDefined();
      expect(Array.isArray(result.campaigns)).toBe(true);
      expect(result.campaigns.length).toBeGreaterThan(0);

      campaignId = result.campaigns[0].id;
    });

    it('Should get a single campaign', async () => {
      const action = GetActiveCampaignCampaign;

      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!campaignId) throw new Error('No campaign ID found for testing');

      const result = await action.api_function({ id: campaignId }, undefined, base_context);

      expect(result).toBeDefined();
      expect(result.id).toBe(campaignId);
    });

    it('Should add a contact note', async () => {
      const action = AddActiveCampaignContactNote;

      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!contactId) throw new Error('No contact ID found for testing');

      const result = await action.api_function(
        { note: 'This is a test note from Qore', contact: contactId },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });

    it('Should list tags', async () => {
      const action = ListActiveCampaignTags;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({}, undefined, base_context);

      expect(result).toBeDefined();
      expect(Array.isArray(result.tags)).toBe(true);
      expect(result.tags.length).toBeGreaterThan(0);
    });

    it('Should add a tag to a contact', async () => {
      const action = AddActiveCampaignTagToContact;

      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!contactId) throw new Error('No contact ID found for testing');
      if (!tagId) throw new Error('No tag ID found for testing');

      const result = await action.api_function(
        { tag: tagId, contact: contactId },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });

    it('Should remove a tag from a contact', async () => {
      const action = RemoveActiveCampaignTagFromContact;

      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!contactId) throw new Error('No contact ID found for testing');
      if (!tagId) throw new Error('No tag ID found for testing');

      const tags = await getActiveCampaignContactTagAllowedValues({
        ...base_context,
        opts: { contact: contactId },
      });

      const tag = tags[0].value;
      if (!tag) throw new Error('No tag found for testing');

      await action.api_function({ tag, contact: contactId }, undefined, base_context);
    });

    it('Should create a contact', async () => {
      const action = CreateActiveCampaignContact;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          email: 'example@example.com',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.contact.id).toBeDefined();

      createdContactId = result.contact.id;
    });

    it('Should update a contact', async () => {
      const action = UpdateActiveCampaignContact;

      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!createdContactId) throw new Error('No contact ID found for testing');

      const result = await action.api_function(
        { id: createdContactId, email: 'updated@example.com' },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.contact.id).toBe(createdContactId);
    });

    it('Should list deal stages', async () => {
      const action = ListActiveCampaignDealStages;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({}, undefined, base_context);

      expect(result).toBeDefined();
      expect(Array.isArray(result.dealStages)).toBe(true);
      expect(result.dealStages.length).toBeGreaterThan(0);
    });

    it('Should create a deal', async () => {
      const action = CreateActiveCampaignDeal;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          title: 'Test Deal Created From Qore',
          value: 1000,
          currency: 'USD',
          contact: contactId,
          stage: '1',
          owner: userId,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();

      createdDealId = result.id;
    });

    it('Should update a deal', async () => {
      const action = UpdateActiveCampaignDeal;

      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!createdDealId) throw new Error('No deal ID found for testing');

      const result = await action.api_function(
        {
          id: createdDealId,
          title: 'Updated Deal Title',
          value: 1500,
          currency: 'USD',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(createdDealId);
    });

    it('Should add a note to a deal', async () => {
      const action = AddActiveCampaignDealNote;

      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!createdDealId) throw new Error('No deal ID found for testing');

      const result = await action.api_function(
        { note: 'This is a test note for the deal', deal: createdDealId },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
    });
  });

  describe('Should clean up', () => {
    it('Should delete the created account', async () => {
      await activeCampaignClient.delete(`accounts/${createdAccountId}`, {
        token: base_context.conn_opts.token,
        baseUrl: base_context.conn_opts.instance_url,
      });
    });

    it('Should delete the created contact', async () => {
      await activeCampaignClient.delete(`contacts/${createdContactId}`, {
        token: base_context.conn_opts.token,
        baseUrl: base_context.conn_opts.instance_url,
      });
    });

    it('Should delete the created deal', async () => {
      await activeCampaignClient.delete(`deals/${createdDealId}`, {
        token: base_context.conn_opts.token,
        baseUrl: base_context.conn_opts.instance_url,
      });
    });
  });
});
