
import { configDotenv } from 'dotenv';
import {
  PushPushoverNotification,
  PushPushoverEmergencyNotification,
  ValidatePushoverUser,
} from '../apps/pushover/actions';
import { getPushoverDeviceAllowedValues } from '../apps/pushover/helpers';
import { Debugger, DebugLevels } from '../utils/Debugger';

configDotenv({ path: '.env' });

describe.skip('Should test Pushover app', () => {
  Debugger.level = DebugLevels.Verbose;

  const token = process.env.PUSHOVER_APP_TOKEN;
  const user = process.env.PUSHOVER_USER_KEY;

  const baseContext: Record<string, any> = {
    conn_opts: {
      token,
      user,
    },
  };

  beforeAll(() => {
    if (!token || !user) {
      throw new Error(
        'PUSHOVER_APP_TOKEN and PUSHOVER_USER_KEY must be set in .env file to run tests'
      );
    }
  });

  describe('Should test Pushover validate user action', () => {
    it('Should validate user credentials', async () => {
      const action = ValidatePushoverUser;

      if (!('api_function' in action) || !action.api_function) {
        throw new Error('Action does not have an api_function');
      }

      const result = await action.api_function({}, undefined, baseContext);

      expect(result).toBeDefined();
      expect(result.valid).toBe(true);
      expect(result.request_id).toBeDefined();
      expect(Array.isArray(result.devices)).toBe(true);
      expect(typeof result.device_count).toBe('number');

      console.log('Validate User Result:', {
        valid: result.valid,
        devices: result.devices,
        device_count: result.device_count,
      });
    });

    it('Should validate specific device if available', async () => {
      const action = ValidatePushoverUser;

      if (!('api_function' in action) || !action.api_function) {
        throw new Error('Action does not have an api_function');
      }

      // First get devices
      const devices = await action.api_function({}, undefined, baseContext);

      if (devices.devices.length === 0) {
        console.log('Skipping: No devices available to validate');
        return;
      }

      const deviceName = devices.devices[0];

      const result = await action.api_function({ device: deviceName }, undefined, baseContext);

      expect(result).toBeDefined();
      expect(result.valid).toBe(true);

      console.log('Validate Device Result:', { device: deviceName, valid: result.valid });
    });
  });

  describe('Should test Pushover push notification action', () => {
    it('Should send a basic notification', async () => {
      const action = PushPushoverNotification;

      if (!('api_function' in action) || !action.api_function) {
        throw new Error('Action does not have an api_function');
      }

      const result = await action.api_function(
        {
          message: 'Test notification from automated tests',
          title: 'Test Title',
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.request_id).toBeDefined();

      console.log('Push Notification Result:', result);
    });

    it('Should send notification with all options', async () => {
      const action = PushPushoverNotification;

      if (!('api_function' in action) || !action.api_function) {
        throw new Error('Action does not have an api_function');
      }

      const result = await action.api_function(
        {
          message: 'Full options test notification',
          title: 'Full Test',
          priority: 1,
          sound: 'cosmic',
          format: 'html',
          url: 'https://example.com',
          url_title: 'Example Link',
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.priority).toBe(1);

      console.log('Push Notification (full options) Result:', result);
    });

    it('Should send notification with lowest priority', async () => {
      const action = PushPushoverNotification;

      if (!('api_function' in action) || !action.api_function) {
        throw new Error('Action does not have an api_function');
      }

      const result = await action.api_function(
        {
          message: 'Lowest priority test - no alert',
          title: 'Silent Test',
          priority: -2,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.priority).toBe(-2);

      console.log('Push Notification (lowest priority) Result:', result);
    });
  });

  describe('Should test Pushover emergency notification action', () => {
    // Note: Emergency notifications are persistent and annoying
    // Skip by default to avoid spamming during regular test runs
    it.skip('Should send an emergency notification', async () => {
      const action = PushPushoverEmergencyNotification;

      if (!('api_function' in action) || !action.api_function) {
        throw new Error('Action does not have an api_function');
      }

      const result = await action.api_function(
        {
          message: 'Test emergency notification - please acknowledge',
          title: 'Test Emergency',
          retry: 30,
          expire: 60, // Short expire for testing
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.receipt).toBeDefined();

      console.log('Emergency Notification Result:', result);
    });
  });

  describe('Should test device allowed values helper', () => {
    it('Should fetch device allowed values', async () => {
      const result = await getPushoverDeviceAllowedValues(baseContext);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      // Each device should have proper structure
      for (const device of result) {
        expect(device.value).toBeDefined();
        expect(typeof device.value).toBe('string');
        expect(device.display_name).toBeDefined();
        expect(device.short_desc).toBeDefined();
      }

      console.log('Device Allowed Values:', result);
    });

    it('Should return empty array when credentials are missing', async () => {
      const result = await getPushoverDeviceAllowedValues({});

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('Should return empty array when token is missing', async () => {
      const result = await getPushoverDeviceAllowedValues({
        conn_opts: { user },
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('Should return empty array when user is missing', async () => {
      const result = await getPushoverDeviceAllowedValues({
        conn_opts: { token },
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe('Should test error handling', () => {
    it('Should fail with missing required message field', async () => {
      const action = PushPushoverNotification;

      if (!('api_function' in action) || !action.api_function) {
        throw new Error('Action does not have an api_function');
      }

      await expect(action.api_function({}, undefined, baseContext)).rejects.toThrow();
    });

    it('Should fail with invalid retry interval for emergency', async () => {
      const action = PushPushoverEmergencyNotification;

      if (!('api_function' in action) || !action.api_function) {
        throw new Error('Action does not have an api_function');
      }

      await expect(
        action.api_function(
          {
            message: 'Test',
            retry: 10, // Below minimum of 30
            expire: 60,
          },
          undefined,
          baseContext
        )
      ).rejects.toThrow('Retry interval must be at least 30 seconds');
    });

    it('Should fail with invalid expire time for emergency', async () => {
      const action = PushPushoverEmergencyNotification;

      if (!('api_function' in action) || !action.api_function) {
        throw new Error('Action does not have an api_function');
      }

      await expect(
        action.api_function(
          {
            message: 'Test',
            retry: 30,
            expire: 20000, // Above maximum of 10800
          },
          undefined,
          baseContext
        )
      ).rejects.toThrow('Expiration time cannot exceed 10800 seconds');
    });
  });
});
