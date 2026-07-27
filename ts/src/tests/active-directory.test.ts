import { configDotenv } from 'dotenv';
import {
  CreateActiveDirectoryGroup,
  DeleteActiveDirectoryGroup,
  GetActiveDirectoryGroup,
  GetActiveDirectoryUser,
  ListActiveDirectoryGroups,
  ListActiveDirectoryUsers,
  UpdateActiveDirectoryGroup,
} from '../apps/active-directory/actions';
import { getActiveDirectoryGroupAllowedValues } from '../apps/active-directory/helpers/get-group-allowed-values';
import { getActiveDirectoryGroupUserAllowedValues } from '../apps/active-directory/helpers/get-group-user-allowed-values';
import { getActiveDirectoryUserAllowedValues } from '../apps/active-directory/helpers/get-user-allowed-values';
import { NewActiveDirectoryGroup, NewActiveDirectoryUser } from '../apps/active-directory/triggers';
import { Debugger, DebugLevels } from '../utils/Debugger';
configDotenv({ path: '.env' });

describe('Should test Azure Active Directory actions', () => {
  Debugger.level = DebugLevels.Verbose;
  const refreshToken = process.env.AZURE_AD_REFRESH_TOKEN;
  const clientId = process.env.AZURE_AD_CLIENT_ID;
  const clientSecret = process.env.AZURE_AD_CLIENT_SECRET;

  const base_context = {
    conn_opts: {
      token: '',
    } as any,
  };

  // Every test here hits the live Microsoft Graph API. Fetch an access token once so the integration
  // tests self-skip when the credentials are absent OR present-but-invalid (e.g. an expired refresh
  // token returns AADSTS700082), instead of failing the whole suite.
  let credentialsUsable = false;

  // Wraps a test so its body only runs when a valid access token was obtained.
  const itIntegration = (name: string, fn: () => Promise<void>, timeout?: number): void => {
    it(
      name,
      async () => {
        if (!credentialsUsable) {
          return;
        }
        await fn();
      },
      timeout
    );
  };

  beforeAll(async () => {
    if (!refreshToken || !clientId || !clientSecret) {
      console.warn('Active Directory credentials not set; skipping integration tests.');
      return;
    }

    const data: {
      client_id: string;
      client_secret: string;
      refresh_token: string;
      grant_type: string;
    } = {
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    };

    const formBody = Object.keys(data)
      .map(
        (key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key as keyof typeof data])
      )
      .join('&');

    try {
      const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formBody,
      });

      const responseData = await response.json();
      if (!responseData?.access_token) {
        console.warn(
          `Failed to get Active Directory access token (HTTP ${response.status}); ` +
            'skipping integration tests.'
        );
        return;
      }

      base_context.conn_opts.token = responseData.access_token;
      credentialsUsable = true;
    } catch (error) {
      console.warn(
        `Active Directory access token fetch failed (${error}); skipping integration tests.`
      );
    }
  });

  let group_id: string | undefined;
  let user_id: string | undefined;

  describe('Should test allowed values', () => {
    itIntegration('Should get group allowed values', async () => {
      const allowed_values = await getActiveDirectoryGroupAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();

      group_id = allowed_values[0].value;
    });

    itIntegration('Should get user allowed values', async () => {
      const allowed_values = await getActiveDirectoryUserAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();

      user_id = allowed_values[0].value;
    });

    itIntegration('Should get group user allowed values', async () => {
      const allowed_values = await getActiveDirectoryGroupUserAllowedValues({
        ...base_context,
        opts: { group_id },
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();
    });
  });

  describe('Should test actions', () => {
    let created_group_id: string | undefined;

    itIntegration('Should list users', async () => {
      const action = ListActiveDirectoryUsers;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          limit: 1,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.users).toBeDefined();
      expect(result.users.length).toBeGreaterThan(0);
      expect(result.count).toBeGreaterThan(0);
    });

    itIntegration('Should list groups', async () => {
      const action = ListActiveDirectoryGroups;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({ limit: 3 }, undefined, base_context);

      expect(result).toBeDefined();
      expect(result.groups).toBeDefined();
      expect(result.groups.length).toBeGreaterThan(0);
      expect(result.count).toBeGreaterThan(0);
    });

    itIntegration('Should get group', async () => {
      const action = GetActiveDirectoryGroup;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const group = await action.api_function(
        {
          group_id,
        },
        undefined,
        base_context
      );

      expect(group).toBeDefined();
      expect(group.id).toBe(group_id);
    });

    itIntegration('Should get user', async () => {
      const action = GetActiveDirectoryUser;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const user = await action.api_function(
        {
          user_id,
        },
        undefined,
        base_context
      );

      expect(user).toBeDefined();
      expect(user.id).toBe(user_id);
    });

    itIntegration('Should create a group', async () => {
      const action = CreateActiveDirectoryGroup;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          displayName: 'Test Development Team',
          description: 'Test security group for development team members',
          mailEnabled: false,
          mailNickname: 'test-dev-team',
          securityEnabled: true,
          visibility: 'Private',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      created_group_id = result.id;
    });

    itIntegration('Should update a group', async () => {
      const action = UpdateActiveDirectoryGroup;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      if (!created_group_id) throw new Error('created_group_id is not defined');

      const result = await action.api_function(
        {
          group_id: created_group_id,
          displayName: 'Test Updated Group Name',
          description: 'Test Updated group description',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(created_group_id);
      expect(result.displayName).toBe('Test Updated Group Name');
      expect(result.description).toBe('Test Updated group description');
    });

    itIntegration('Should delete a group', async () => {
      const action = DeleteActiveDirectoryGroup;

      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!created_group_id) throw new Error('created_group_id is not defined');

      const result = await action.api_function(
        {
          group_id: created_group_id,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    describe('Should test triggers event example data', () => {
      itIntegration('Should get example event data for new user trigger', async () => {
        const trigger = NewActiveDirectoryUser;

        if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
          throw new Error('get_example_event_data not found in trigger');

        const result = await trigger.get_example_event_data({
          ...base_context,
        });

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
      });

      itIntegration('Should get example event data for new group trigger', async () => {
        const trigger = NewActiveDirectoryGroup;

        if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
          throw new Error('get_example_event_data not found in trigger');

        const result = await trigger.get_example_event_data({
          ...base_context,
        });

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
      });
    });
  });
});
