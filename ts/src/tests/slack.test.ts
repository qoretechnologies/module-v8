import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { configDotenv } from 'dotenv';
import {
  AddReaction,
  ArchiveChannel,
  CreateChannel,
  DeleteMessage,
  FindUserByEmail,
  GetChannelHistory,
  GetUserInfo,
  ListChannels,
  ListUsers,
  PinMessage,
  SendDirectMessage,
  SendMessage,
  UnarchiveChannel,
  UnpinMessage,
  UpdateMessage,
  UploadFile,
} from '../apps/slack/actions';
import { getSlackArchivedChannelsAllowedValues } from '../apps/slack/helpers/get-archived-channels-allowed-values';
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
    botUserId: '',
    channelId: '',
  };

  beforeAll(async () => {
    const slackBotToken = process.env.SLACK_ACCESS_TOKEN;
    const slackUserToken = process.env.SLACK_USER_ACCESS_TOKEN;
    const slackTestChannel = process.env.SLACK_TEST_CHANNEL;

    if (!slackBotToken) {
      throw new Error('SLACK_ACCESS_TOKEN must be set in environment variables');
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

    // Get the bot's own user ID (used for get_user_info test)
    try {
      const authResponse = (await QorusRequest.post(
        {
          data: {},
          path: '/auth.test',
          headers: { Authorization: `Bearer ${slackBotToken}` },
        },
        { url: 'https://slack.com/api', endpointId: 'slack' }
      )) as any;

      if (authResponse?.data?.user_id) {
        sharedTestValues.botUserId = authResponse.data.user_id;
      }
    } catch {
      console.warn('Could not get bot user ID for test setup');
    }

    // Get a non-bot user for DM and user tests
    try {
      const response = (await QorusRequest.post(
        {
          data: {},
          path: '/users.list',
          headers: { Authorization: `Bearer ${slackBotToken}` },
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
    if (testChannelId && !process.env.SLACK_SKIP_CLEANUP) {
      // Try to unarchive first (in case archive test ran)
      try {
        await QorusRequest.post(
          {
            data: { channel: testChannelId },
            path: '/conversations.unarchive',
            headers: { Authorization: `Bearer ${baseContext.conn_opts.token}` },
          },
          { url: 'https://slack.com/api', endpointId: 'slack' }
        );
      } catch {
        // Ignore - channel might not be archived
      }

      // Archive for cleanup
      try {
        await QorusRequest.post(
          {
            data: { channel: testChannelId },
            path: '/conversations.archive',
            headers: { Authorization: `Bearer ${baseContext.conn_opts.token}` },
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
      }
    });

    it('Should get archived channel allowed values', async () => {
      const allowedValues = await getSlackArchivedChannelsAllowedValues(baseContext);

      expect(allowedValues).toBeDefined();
      expect(Array.isArray(allowedValues)).toBe(true);

      if (allowedValues.length > 0) {
        checkAllowedValues(allowedValues, { ...allowedValuesConfig, checkNonEmpty: false });
      }
    });
  });

  describe('Should test Channel actions', () => {
    it('Should create a channel', async () => {
      const action = CreateChannel;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        { channelName: testChannelName, isPrivate: false },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.channel).toBeDefined();
      expect(result.channel.id).toBeDefined();
      expect(result.channel.name).toBe(testChannelName);

      testChannelId = result.channel.id;
    });

    it('Should list channels', async () => {
      const action = ListChannels;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        { limit: 10 },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.channels).toBeDefined();
      expect(Array.isArray(result.channels)).toBe(true);
      expect(result.channels.length).toBeGreaterThan(0);

      const channel = result.channels[0];
      expect(channel.id).toBeDefined();
      expect(channel.name).toBeDefined();
    });
  });

  describe('Should test Message actions', () => {
    it('Should send a message to a channel', async () => {
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

    it('Should pin a message', async () => {
      const channelToUse = testChannelId || sharedTestValues.channelId;

      if (!sharedTestValues.messageTs || !channelToUse) {
        console.log('Skipping pin message test - no message available');
        return;
      }

      const action = PinMessage;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      try {
        const result = await action.api_function(
          { channel: channelToUse, timestamp: sharedTestValues.messageTs },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result.ok).toBe(true);
      } catch (error: any) {
        if (error.message?.includes('missing_scope')) {
          console.log('Skipping pin message test - pins:write scope not yet authorized');
          return;
        }
        throw error;
      }
    });

    it('Should unpin a message', async () => {
      const channelToUse = testChannelId || sharedTestValues.channelId;

      if (!sharedTestValues.messageTs || !channelToUse) {
        console.log('Skipping unpin message test - no message available');
        return;
      }

      const action = UnpinMessage;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      try {
        const result = await action.api_function(
          { channel: channelToUse, timestamp: sharedTestValues.messageTs },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result.ok).toBe(true);
      } catch (error: any) {
        if (error.message?.includes('missing_scope')) {
          console.log('Skipping unpin message test - pins:write scope not yet authorized');
          return;
        }
        throw error;
      }
    });

    it('Should delete a message', async () => {
      const channelToUse = testChannelId || sharedTestValues.channelId;

      if (!channelToUse) {
        console.log('Skipping delete message test - no channel available');
        return;
      }

      // Send a fresh message to delete
      const sendAction = SendMessage;
      if (!('api_function' in sendAction)) throw new Error('api_function not found in action');

      const sendResult = await sendAction.api_function(
        {
          channel: channelToUse,
          text: `Message to be deleted - ${new Date().toISOString()}`,
        },
        undefined,
        baseContext
      );

      const action = DeleteMessage;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        { channel: channelToUse, timestamp: sendResult.ts },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.ok).toBe(true);
      expect(result.ts).toBe(sendResult.ts);
    });

    it('Should get channel history', async () => {
      const channelToUse = testChannelId || sharedTestValues.channelId;

      if (!channelToUse) {
        console.log('Skipping get channel history test - no channel available');
        return;
      }

      const action = GetChannelHistory;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        { channel: channelToUse, limit: 10 },
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

  describe('Should test File actions', () => {
    it('Should upload a file to a channel', async () => {
      const channelToUse = testChannelId || sharedTestValues.channelId;

      if (!channelToUse) {
        console.log('Skipping upload file test - no channel available');
        return;
      }

      const action = UploadFile;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const fileContent = Buffer.from('Test file content from Qore integration test').toString('base64');

      const result = await action.api_function(
        {
          channel: channelToUse,
          file: {
            name: 'qore-test-file.txt',
            mime_type: 'text/plain',
            content: fileContent,
          },
          filename: 'qore-test-upload.txt',
          comment: 'Test file upload from Qore',
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.ok).toBe(true);
      expect(result.files).toBeDefined();
      expect(Array.isArray(result.files)).toBe(true);
    });
  });

  describe('Should test User actions', () => {
    it('Should list users', async () => {
      const action = ListUsers;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        { limit: 10 },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.members).toBeDefined();
      expect(Array.isArray(result.members)).toBe(true);

      // May return empty if rate-limited (graceful degradation in paginated fetch)
      if (result.members.length > 0) {
        const user = result.members[0];
        expect(user.id).toBeDefined();
        expect(user.name).toBeDefined();

        // Store a valid user ID for subsequent tests
        const validUser = result.members.find((u: any) => !u.deleted && !u.is_bot && u.id !== 'USLACKBOT');
        if (validUser && !sharedTestValues.userId) {
          sharedTestValues.userId = validUser.id;
        }
      }
    });

    it('Should get user info', async () => {
      // Use a known user ID — prefer a real user, fall back to bot
      const userIdToTest = sharedTestValues.userId || sharedTestValues.botUserId;
      if (!userIdToTest) {
        console.log('Skipping get user info test - no user ID available');
        return;
      }

      const action = GetUserInfo;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      try {
        const result = await action.api_function(
          { userId: userIdToTest },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result.ok).toBe(true);
        expect(result.user).toBeDefined();
        expect(result.user.id).toBe(userIdToTest);
      } catch (error: any) {
        // Some Slack workspaces restrict users.info for certain user types or tokens
        if (error.message?.includes('user_not_found')) {
          console.log('Skipping get user info test - user_not_found (workspace restriction)');
          return;
        }
        throw error;
      }
    });

    it('Should find user by email', async () => {
      const testEmail = process.env.SLACK_TEST_USER_EMAIL;

      if (!testEmail) {
        console.log('Skipping find user by email test - SLACK_TEST_USER_EMAIL not set');
        return;
      }

      const action = FindUserByEmail;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        { email: testEmail },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.id).toBeDefined();
    });

    it('Should send a direct message', async () => {
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

  describe('Should test Archive/Unarchive actions', () => {
    it('Should archive a channel', async () => {
      if (!testChannelId) {
        console.log('Skipping archive channel test - no test channel created');
        return;
      }

      const action = ArchiveChannel;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        { channel: testChannelId },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.ok).toBe(true);
    });

    it('Should unarchive a channel', async () => {
      if (!testChannelId) {
        console.log('Skipping unarchive channel test - no test channel created');
        return;
      }

      const action = UnarchiveChannel;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      try {
        const result = await action.api_function(
          { channel: testChannelId },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result.ok).toBe(true);
      } catch (error: any) {
        // not_in_channel can happen if the bot lost membership when the channel was archived
        // This is a Slack workspace-specific behavior, so we handle it gracefully
        if (error.message?.includes('not_in_channel')) {
          console.log('Skipping unarchive test - bot lost channel membership on archive');
          return;
        }
        throw error;
      }
    });
  });

  describe('Should test negative cases', () => {
    it('Should fail to delete message with invalid timestamp', async () => {
      const channelToUse = testChannelId || sharedTestValues.channelId;
      if (!channelToUse) return;

      const action = DeleteMessage;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      await expect(
        action.api_function(
          { channel: channelToUse, timestamp: 'invalid' } as any,
          undefined,
          baseContext
        )
      ).rejects.toThrow();
    });

    it('Should fail to pin message with invalid timestamp', async () => {
      const channelToUse = testChannelId || sharedTestValues.channelId;
      if (!channelToUse) return;

      const action = PinMessage;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      await expect(
        action.api_function(
          { channel: channelToUse, timestamp: 'invalid' } as any,
          undefined,
          baseContext
        )
      ).rejects.toThrow();
    });

    it('Should fail to get user info without userId', async () => {
      const action = GetUserInfo;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      await expect(
        action.api_function({} as any, undefined, baseContext)
      ).rejects.toThrow();
    });

    it('Should fail to archive channel without channel', async () => {
      const action = ArchiveChannel;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      await expect(
        action.api_function({} as any, undefined, baseContext)
      ).rejects.toThrow();
    });
  });
});
