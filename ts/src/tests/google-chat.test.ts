import { configDotenv } from 'dotenv';
import {
  DeleteGoogleChatMessage,
  GetGoogleChatMember,
  GetGoogleChatMessage,
  GetGoogleChatSpace,
  ListGoogleChatMembers,
  ListGoogleChatMessages,
  ListGoogleChatSpaces,
  SendGoogleChatMessage,
} from '../apps/google-chat/actions';
import { getGoogleChatMemberIdAllowedValues } from '../apps/google-chat/helpers/get-member-id-allowed-values';
import { getGoogleChatMessageIdAllowedValues } from '../apps/google-chat/helpers/get-message-id-allowed-values';
import { getGoogleChatSpaceIdAllowedValues } from '../apps/google-chat/helpers/get-space-id-allowed-values';
import { NewGoogleChatMessage } from '../apps/google-chat/triggers';
import { Debugger, DebugLevels } from '../utils/Debugger';

Debugger.level = DebugLevels.Verbose;

configDotenv({ path: '.env' });

describe('Google Chat', () => {
  const base_context = {
    conn_opts: {
      token: '',
    } as any,
  };

  beforeAll(async () => {
    const refreshToken = process.env.GOOGLE_INTEGRATIONS_REFRESH_TOKEN;
    const clientId = process.env.GOOGLE_INTEGRATIONS_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_INTEGRATIONS_CLIENT_SECRET;

    if (!refreshToken || !clientId || !clientSecret) {
      throw new Error(`
        Please set the GOOGLE_INTEGRATIONS_REFRESH_TOKEN, GOOGLE_INTEGRATIONS_CLIENT_ID, 
        and GOOGLE_INTEGRATIONS_CLIENT_SECRET environment variables.
      `);
    }

    const data = {
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    };

    const formBody = Object.keys(data)
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key as keyof typeof data])}`
      )
      .join('&');

    const response = await fetch('https://oauth2.googleapis.com/token', {
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

    base_context.conn_opts.token = responseData.access_token;
  });

  let memberId: string | undefined;
  let spaceId: string | undefined;
  let messageId: string | undefined;
  let createdMessageId: string | undefined;
  describe('Should test google chat allowed values', () => {
    it('Should get space id allowed values', async () => {
      const allowed_values = await getGoogleChatSpaceIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();

      spaceId = allowed_values.find((space) => space.display_name === 'Just a test')?.value;
    });

    it('Should get member id allowed values', async () => {
      if (!spaceId) throw new Error('Space ID is not defined');

      const allowed_values = await getGoogleChatMemberIdAllowedValues({
        ...base_context,
        opts: { spaceId },
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      memberId = allowed_values[0].value;
    });

    it('Should get message id allowed values', async () => {
      if (!spaceId) throw new Error('Space ID is not defined');

      const allowed_values = await getGoogleChatMessageIdAllowedValues({
        ...base_context,
        opts: { spaceId },
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      messageId = allowed_values[0].value;
    });
  });

  describe('Should test google chat actions', () => {
    it('Should list chat spaces', async () => {
      const action = ListGoogleChatSpaces;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          spaceType: 'SPACE',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.spaces).toBeDefined();
      expect(result.spaces.length).toBeGreaterThan(0);
    });

    it('Should get the space by id', async () => {
      const action = GetGoogleChatSpace;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      if (!spaceId) throw new Error('Space ID is not defined');

      const result = await action.api_function(
        {
          id: spaceId,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.name).toBeDefined();
      expect(result.name).toBe(spaceId);
    });

    it('Should list members of the space', async () => {
      const action = ListGoogleChatMembers;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          spaceId: spaceId,
          showGroups: true,
          showInvited: true,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.memberships).toBeDefined();
      expect(result.memberships.length).toBeGreaterThan(0);
    });

    it('Should get member by id', async () => {
      const action = GetGoogleChatMember;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      if (!memberId) throw new Error('Member ID is not defined');

      const result = await action.api_function(
        {
          memberId,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.name).toBeDefined();
      expect(result.name).toBe(memberId);
    });

    it('Should list messages in the space', async () => {
      const action = ListGoogleChatMessages;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      if (!spaceId) throw new Error('Space ID is not defined');

      const result = await action.api_function(
        {
          spaceId,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.messages).toBeDefined();
      expect(result.messages.length).toBeGreaterThan(0);
    });

    it('Should get message by id', async () => {
      const action = GetGoogleChatMessage;

      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!messageId) throw new Error('Message ID is not defined');

      const result = await action.api_function(
        {
          messageId,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.name).toBe(messageId);
    });

    it('Should send a message to the space', async () => {
      const action = SendGoogleChatMessage;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          spaceId,
          text: 'Hello, world!',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.name).toBeDefined();

      createdMessageId = result.name;
    });

    it('Should delete the message from the space', async () => {
      const action = DeleteGoogleChatMessage;

      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!createdMessageId) throw new Error('Created Message ID is not defined');

      await action.api_function(
        {
          messageId: createdMessageId,
        },
        undefined,
        base_context
      );
    });

    it('Should get example event data for new message trigger', async () => {
      const trigger = NewGoogleChatMessage;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      if (!spaceId) throw new Error('Space ID is not defined');

      const result = await trigger.get_example_event_data({ ...base_context, opts: { spaceId } });
      expect(result).toBeDefined();
      expect(result.name).toBeDefined();
    });
  });
});
