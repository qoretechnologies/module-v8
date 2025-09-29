import { TQoreAppActionWithWebhook } from '@qoretechnologies/ts-toolkit';
import {
  GetPatreonCampaign,
  ListPatreonCampaignMembers,
  ListPatreonCampaigns,
  ListPatreonPosts,
} from '../apps/patreon/actions';
import { getPatreonCampaignAllowedValues } from '../apps/patreon/helpers/get-campaign-allowed-values';
import { getPatreonMemberAllowedValues } from '../apps/patreon/helpers/get-member-allowed-values';
import {
  PatreonMemberTrigger,
  PatreonPledgeTrigger,
  PatreonPostTrigger,
} from '../apps/patreon/triggers';
import { getPatreonPostAllowedValues } from '../apps/patreon/helpers/get-post-allowed-values';
import { configDotenv } from 'dotenv';

configDotenv({ path: '.env' });
describe('Patreon', () => {
  const baseContext = {
    conn_opts: {
      token: '',
    },
  };

  let campaignId: string | undefined;

  beforeAll(() => {
    const token = process.env.PATREON_TOKEN;

    if (!token) throw new Error('No PATREON_TOKEN env variable found');

    baseContext.conn_opts.token = token;
  });

  describe('Should test allowed values', () => {
    it('Should get campaign allowed values', async () => {
      const result = await getPatreonCampaignAllowedValues(baseContext);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].value).toBeDefined();

      campaignId = result[0].value;
    });

    it('Should get member allowed values', async () => {
      const result = await getPatreonMemberAllowedValues({ ...baseContext, opts: { campaignId } });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('Should get post allowed values', async () => {
      const result = await getPatreonPostAllowedValues({ ...baseContext, opts: { campaignId } });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Should test actions', () => {
    it('Should list campaigns', async () => {
      const action = ListPatreonCampaigns;

      if (!('api_function' in action) || !action?.api_function)
        throw new Error('No api_function found in action');

      const result = await action.api_function({}, undefined, baseContext);

      expect(result).toBeDefined();
      expect(Array.isArray(result.campaigns)).toBe(true);
    });

    it('Should list campaign members', async () => {
      const action = ListPatreonCampaignMembers;

      if (!('api_function' in action) || !action?.api_function)
        throw new Error('No api_function found in action');

      const result = await action.api_function(
        {
          campaignId,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result.members)).toBe(true);
    });

    it('Should get a campaign', async () => {
      const action = GetPatreonCampaign;

      if (!('api_function' in action) || !action?.api_function)
        throw new Error('No api_function found in action');

      const result = await action.api_function(
        {
          campaignId,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(campaignId);
    });

    it('Should list campaign posts', async () => {
      const action = ListPatreonPosts;

      if (!('api_function' in action) || !action?.api_function)
        throw new Error('No api_function found in action');

      const result = await action.api_function(
        {
          campaignId,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result.posts)).toBe(true);
    });
  });

  describe('Should test triggers', () => {
    const url = 'https://example.com/webhook';
    describe('Post Trigger', () => {
      let regInfo: Record<string, any> | undefined | void;

      it('Should register trigger', async () => {
        const trigger = PatreonPostTrigger;

        if (!('webhook_register' in trigger))
          throw new Error('webhook_register not found in trigger');

        regInfo = await trigger.webhook_register(
          { ...baseContext, opts: { trigger: 'posts:publish', campaignId } },
          url
        );

        expect(regInfo).toBeDefined();
        expect(regInfo?.webhookId).toBeDefined();
      });

      it('Should deregister trigger', async () => {
        const trigger = PatreonPostTrigger as TQoreAppActionWithWebhook;
        await trigger.webhook_deregister(baseContext, url, regInfo!);
        regInfo = undefined;
      });
    });
    describe('Pledge Trigger', () => {
      let regInfo: Record<string, any> | undefined | void;

      it('Should register trigger', async () => {
        const trigger = PatreonPledgeTrigger;

        if (!('webhook_register' in trigger))
          throw new Error('webhook_register not found in trigger');

        regInfo = await trigger.webhook_register(
          { ...baseContext, opts: { trigger: 'members:pledge:update', campaignId } },
          url
        );

        expect(regInfo).toBeDefined();
        expect(regInfo?.webhookId).toBeDefined();
      });

      it('Should deregister trigger', async () => {
        const trigger = PatreonPledgeTrigger as TQoreAppActionWithWebhook;
        await trigger.webhook_deregister(baseContext, url, regInfo!);
        regInfo = undefined;
      });
    });
    describe('Member Trigger', () => {
      let regInfo: Record<string, any> | undefined | void;

      it('Should register trigger', async () => {
        const trigger = PatreonMemberTrigger;

        if (!('webhook_register' in trigger))
          throw new Error('webhook_register not found in trigger');

        regInfo = await trigger.webhook_register(
          { ...baseContext, opts: { trigger: 'members:delete', campaignId } },
          url
        );

        expect(regInfo).toBeDefined();
        expect(regInfo?.webhookId).toBeDefined();
      });

      it('Should deregister trigger', async () => {
        const trigger = PatreonMemberTrigger as TQoreAppActionWithWebhook;
        await trigger.webhook_deregister(baseContext, url, regInfo!);
        regInfo = undefined;
      });
    });
  });
});
