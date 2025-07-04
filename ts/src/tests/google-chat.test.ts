import { configDotenv } from 'dotenv';
import {
  GetGoogleChatMember,
  GetGoogleChatSpace,
  ListGoogleChatMembers,
  ListGoogleChatSpaces,
} from '../apps/google-chat/actions';
import { getGoogleChatMemberIdAllowedValues } from '../apps/google-chat/helpers/get-member-id-allowed-values';
import { getGoogleChatSpaceIdAllowedValues } from '../apps/google-chat/helpers/get-space-id-allowed-values';
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
    const refreshToken = process.env.GOOGLE_CHAT_REFRESH_TOKEN;
    const clientId = process.env.GOOGLE_CHAT_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CHAT_CLIENT_SECRET;

    if (!refreshToken || !clientId || !clientSecret) {
      throw new Error(`
        Please set the GOOGLE_CHAT_REFRESH_TOKEN, GOOGLE_CHAT_CLIENT_ID, 
        and GOOGLE_CHAT_CLIENT_SECRET environment variables.
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

      memberId = allowed_values[0].value;
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

      console.dir(result, { depth: null });

      expect(result).toBeDefined();
      expect(result.name).toBeDefined();
      expect(result.name).toBe(memberId);
    });
  });
});
