import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { configDotenv } from 'dotenv';
import {
  AddReaction,
  CreateChannel,
  FindUserByEmail,
  GetChannelHistory,
  SendDirectMessage,
  SendMessage,
  UpdateMessage,
} from '../apps/slack/actions';
import { getSlackChannelsAllowedValues } from '../apps/slack/helpers/get-channels-allowed-values';
import { getSlackUsersAllowedValues } from '../apps/slack/helpers/get-users-allowed-values';
import { Debugger, DebugLevels } from '../utils/Debugger';
import { checkAllowedValues } from './utils';

configDotenv({ path: '.env' });

const allowedValuesConfig = {
  logSingleValue: false,
  logAllValues: false,
  checkNonEmpty: true,
};

describe('Should test Slack', () => {
  Debugger.level = DebugLevels.Verbose;

  // Test channel name should be unique per test run
  const testChannelName = `qore-test-channel-${Date.now()}`;
  let testChannelId = '';

  const baseContext = {
    conn_opts: {
      token: '',
      authed_user: {
        access_token: '',
      },
    } as any,
  };

  const sharedTestValues = {
    messageTs: '',
    userId: '',
    channelId: '',
  };

  beforeAll(async () => {
    const slackBotToken = process.env.SLACK_BOT_TOKEN;
    const slackUserToken = process.env.SLACK_USER_TOKEN;
    const slackTestChannel = process.env.SLACK_TEST_CHANNEL;

    if (!slackBotToken) {
      throw new Error('SLACK_BOT_TOKEN must be set in environment variables');
    }

    baseContext.conn_opts.token = slackBotToken;

    if (slackUserToken) {
      baseContext.conn_opts.authed_user = {
        access_token: slackUserToken,
      };
    }

    if (slackTestChannel) {
      sharedTestValues.channelId = slackTestChannel;
    }

    // Get a test user if not set
    try {
      const response = (await QorusRequest.post(
        {
          body: {},
          path: '/users.list',
          headers: {
            Authorization: `Bearer ${slackBotToken}`,
          },
        },
        { url: 'https://slack.com/api', endpointId: 'slack' }
      )) as any;

      if (response?.data?.members?.length > 0) {
        const nonBotUser = response.data.members.find(
          (u: any) => !u.is_bot && !u.deleted && u.id !== 'USLACKBOT'
        );
        if (nonBotUser) {
          sharedTestValues.userId = nonBotUser.id;
        }
      }
    } catch {
      console.warn('Could not fetch user list for test setup');
    }
  });

  afterAll(async () => {
    // Archive test channel if created
    if (testChannelId) {
      try {
        await QorusRequest.post(
          {
            body: { channel: testChannelId },
            path: '/conversations.archive',
            headers: {
              Authorization: `Bearer ${baseContext.conn_opts.token}`,
            },
          },
          { url: 'https://slack.com/api', endpointId: 'slack' }
        );
      } catch {
        // Ignore cleanup errors
      }
    }
  });

  describe('Should test allowed values helpers', () => {
    it('Should get channel allowed values', async () => {
      const allowedValues = await getSlackChannelsAllowedValues(baseContext);

      expect(allowedValues).toBeDefined();
      expect(Array.isArray(allowedValues)).toBe(true);

      if (allowedValues.length > 0) {
        checkAllowedValues(allowedValues, allowedValuesConfig);

        // Use first channel for tests if no test channel specified
        if (!sharedTestValues.channelId) {
          sharedTestValues.channelId = allowedValues[0].value;
        }
      }
    });

    it('Should get user allowed values', async () => {
      const allowedValues = await getSlackUsersAllowedValues(baseContext);

      expect(allowedValues).toBeDefined();
      expect(Array.isArray(allowedValues)).toBe(true);

      if (allowedValues.length > 0) {
        checkAllowedValues(allowedValues, allowedValuesConfig);

        // Use first user for tests if not already set
        if (!sharedTestValues.userId) {
          sharedTestValues.userId = allowedValues[0].value;
        }
      }
    });
  });

  describe('Should test Channel actions', () => {
    it('Should create a channel', async () => {
      const action = CreateChannel;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          channelName: testChannelName,
          isPrivate: false,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.channel).toBeDefined();
      expect(result.channel.id).toBeDefined();
      expect(result.channel.name).toBe(testChannelName);

      testChannelId = result.channel.id;
    });
  });

  describe('Should test Message actions', () => {
    it('Should send a message to a channel', async () => {
      // Skip if no channel available
      if (!sharedTestValues.channelId && !testChannelId) {
        console.log('Skipping send message test - no channel available');
        return;
      }

      const action = SendMessage;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const channelToUse = testChannelId || sharedTestValues.channelId;

      const result = await action.api_function(
        {
          channel: channelToUse,
          text: `Test message from Qore - ${new Date().toISOString()}`,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.ts).toBeDefined();
      expect(result.channel).toBe(channelToUse);

      sharedTestValues.messageTs = result.ts;
    });

    it('Should update a message', async () => {
      const channelToUse = testChannelId || sharedTestValues.channelId;

      // Skip if no message to update
      if (!sharedTestValues.messageTs || !channelToUse) {
        console.log('Skipping update message test - no message available');
        return;
      }

      const action = UpdateMessage;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          channel: channelToUse,
          timestamp: sharedTestValues.messageTs,
          text: `Updated message from Qore - ${new Date().toISOString()}`,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.ts).toBeDefined();
    });

    it('Should get channel history', async () => {
      const channelToUse = testChannelId || sharedTestValues.channelId;

      // Skip if no channel available
      if (!channelToUse) {
        console.log('Skipping get channel history test - no channel available');
        return;
      }

      const action = GetChannelHistory;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          channel: channelToUse,
          limit: 10,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.messages).toBeDefined();
      expect(Array.isArray(result.messages)).toBe(true);
    });
  });

  describe('Should test Reaction actions', () => {
    it('Should add a reaction to a message', async () => {
      const channelToUse = testChannelId || sharedTestValues.channelId;

      // Skip if no message to react to
      if (!sharedTestValues.messageTs || !channelToUse) {
        console.log('Skipping add reaction test - no message available');
        return;
      }

      const action = AddReaction;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          channel: channelToUse,
          timestamp: sharedTestValues.messageTs,
          reaction: 'thumbsup',
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.ok).toBe(true);
    });
  });

  describe('Should test User actions', () => {
    it('Should find user by email', async () => {
      // This test requires knowing a valid email in the workspace
      // We'll make it optional
      const testEmail = process.env.SLACK_TEST_USER_EMAIL;

      if (!testEmail) {
        console.log('Skipping find user by email test - SLACK_TEST_USER_EMAIL not set');
        return;
      }

      const action = FindUserByEmail;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          email: testEmail,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.id).toBeDefined();
    });

    it('Should send a direct message', async () => {
      // Skip if no user available
      if (!sharedTestValues.userId) {
        console.log('Skipping send DM test - no user available');
        return;
      }

      const action = SendDirectMessage;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          userId: sharedTestValues.userId,
          text: `Test DM from Qore - ${new Date().toISOString()}`,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.ts).toBeDefined();
      expect(result.channel).toBeDefined();
    });
  });
});
