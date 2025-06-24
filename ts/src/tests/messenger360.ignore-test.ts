import { configDotenv } from 'dotenv';
import {
  getMessenger360Chats,
  getMessenger360Contacts,
  getMessenger360Groups,
  sendMessenger360TextMessage,
  sendMessenger360TextMessageToGroup,
} from '../apps/messenger360/actions';
import { getMessenger360ContactNumberAllowedValues } from '../apps/messenger360/helpers/get-contact-number-allowed-values';
import { getMessenger360GroupIdAllowedValues } from '../apps/messenger360/helpers/get-group-id-allowed-values';

configDotenv({ path: '.env' });

describe('Test Messenger360 Actions', () => {
  const base_context = {
    conn_opts: {
      token: '',
    } as any,
  };

  let phonenumber: string | undefined;
  let groupId: string | undefined;

  beforeAll(() => {
    const token = process.env.MESSENGER360_API_KEY;
    phonenumber = process.env.MESSENGER360_TEST_PHONENUMBER;
    groupId = process.env.MESSENGER360_TEST_GROUP_ID;

    if (!token || !phonenumber || !groupId) {
      throw new Error(
        `Please set the` +
          `MESSENGER360_API_KEY, MESSENGER360_TEST_PHONENUMBER, MESSENGER360_TEST_GROUP_ID` +
          `environment variables.`
      );
    }

    base_context.conn_opts.token = token;
  });

  describe('Should test Messenger360 allowed values', () => {
    it('Should get contact numbers allowed values', async () => {
      const allowed_values = await getMessenger360ContactNumberAllowedValues(base_context);
      expect(allowed_values).toBeDefined();
      expect(Array.isArray(allowed_values)).toBe(true);
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get group id allowed values', async () => {
      const allowed_values = await getMessenger360GroupIdAllowedValues(base_context);
      expect(allowed_values).toBeDefined();
      expect(Array.isArray(allowed_values)).toBe(true);
    });
  });

  describe('Should test Messenger360 actions', () => {
    it('Should get contacts', async () => {
      const action = getMessenger360Contacts;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({}, undefined, base_context);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('Should get chats', async () => {
      const action = getMessenger360Chats;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({}, undefined, base_context);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('Should get groups', async () => {
      const action = getMessenger360Groups;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({}, undefined, base_context);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('Should send text message', async () => {
      const action = sendMessenger360TextMessage;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          phonenumber,
          text: 'Hello from Qore!',
          url: 'https://example.com', // Optional URL
          delay: new Date(Date.now() + 60000).toISOString(), // Optional delay
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('Should send text message to group', async () => {
      const action = sendMessenger360TextMessageToGroup;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          groupId,
          text: 'Hello from Qore!',
          url: 'https://example.com', // Optional URL
          delay: new Date(Date.now() + 60000).toISOString(), // Optional delay
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });
});
