import { configDotenv } from 'dotenv';
import {
  ChangeSensiboDeviceProperty,
  CreateSensiboSchedule,
  DeleteSensiboDeviceTimer,
  DeleteSensiboSchedule,
  EnableSensiboClimateReact,
  GetSensiboAcStates,
  GetSensiboClimateReactSettings,
  GetSensiboCurrentTimer,
  GetSensiboDevice,
  GetSensiboDevices,
  GetSensiboHistoricalMeasurements,
  GetSensiboSchedule,
  GetSensiboSchedules,
  SetSensiboClimateReactConfiguration,
  SetSensiboDeviceState,
  SetSensiboDeviceTimer,
  ToggleSensiboSchedule,
} from '../apps/sensibo/actions';
import { getSensiboDeviceAllowedValues } from '../apps/sensibo/helpers/get-device-allowed-values';
import { Debugger, DebugLevels } from '../utils/Debugger';

Debugger.level = DebugLevels.Verbose;

configDotenv({ path: '.env' });

describe('Sensibo', () => {
  const base_context = {
    conn_opts: {
      token: '',
    } as any,
  };

  beforeAll(() => {
    const token = process.env.SENSIBO_API_KEY;

    if (!token) {
      throw new Error('SENSIBO_API_KEY environment variable is not set');
    }

    base_context.conn_opts.token = token;
  });

  describe('Should test allowed values', () => {
    it('Should get sensibo device allowed values', async () => {
      const allowed_values = await getSensiboDeviceAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(Array.isArray(allowed_values)).toBe(true);
    });
  });

  describe('Sensibo Actions Tests', () => {
    it('Should change device property', async () => {
      const action = ChangeSensiboDeviceProperty;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          device: 'test_device_id',
          property: 'on',
          value: true,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
    });

    it('Should create schedule', async () => {
      const action = CreateSensiboSchedule;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          device: 'test_device_id',
          targetTimeLocale: '08:00',
          timezone: 'UTC',
          acState: {
            on: true,
            mode: 'cool',
            fanLevel: 'auto',
            targetTemperature: 22,
            temperatureUnit: 'C',
            swing: 'stopped',
          },
          recurOnDaysOfWeek: 'monday,tuesday,wednesday,thursday,friday',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
    });

    it('Should delete device timer', async () => {
      const action = DeleteSensiboDeviceTimer;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          device: 'test_device_id',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
    });

    it('Should delete schedule', async () => {
      const action = DeleteSensiboSchedule;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          device: 'test_device_id',
          schedule: 'test_schedule_id',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
    });

    it('Should enable climate react', async () => {
      const action = EnableSensiboClimateReact;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          device: 'test_device_id',
          enable: true,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
    });

    it('Should get AC states', async () => {
      const action = GetSensiboAcStates;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          device: 'test_device_id',
          limit: 10,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
    });

    it('Should get devices', async () => {
      const action = GetSensiboDevices;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({}, undefined, base_context);

      expect(result).toBeDefined();
      expect(result.result).toBeDefined();
    });

    it('Should get climate react settings', async () => {
      const action = GetSensiboClimateReactSettings;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          device: 'test_device_id',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
    });

    it('Should get current timer', async () => {
      const action = GetSensiboCurrentTimer;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          device: 'test_device_id',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
    });

    it('Should get device', async () => {
      const action = GetSensiboDevice;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          device: 'test_device_id',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
    });

    it('Should get historical measurements', async () => {
      const action = GetSensiboHistoricalMeasurements;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          device: 'test_device_id',
          days: 7,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
    });

    it('Should get schedule', async () => {
      const action = GetSensiboSchedule;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          device: 'test_device_id',
          schedule: 'test_schedule_id',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
    });

    it('Should get schedules', async () => {
      const action = GetSensiboSchedules;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          device: 'test_device_id',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
    });

    it('Should set climate react configuration', async () => {
      const action = SetSensiboClimateReactConfiguration;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          device: 'test_device_id',
          enabled: true,
          lowTemperatureThreshold: 18,
          lowTemperatureState: {
            on: false,
          },
          highTemperatureThreshold: 26,
          highTemperatureState: {
            on: true,
            mode: 'cool',
          },
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
    });

    it('Should set device state', async () => {
      const action = SetSensiboDeviceState;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          device: 'test_device_id',
          on: true,
          mode: 'cool',
          fanLevel: 'auto',
          targetTemperature: 22,
          temperatureUnit: 'C',
          swing: 'stopped',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
    });

    it('Should set device timer', async () => {
      const action = SetSensiboDeviceTimer;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          device: 'test_device_id',
          minutesFromNow: 60,
          acState: {
            on: false,
            mode: 'cool',
            fanLevel: 'auto',
            targetTemperature: 22,
            temperatureUnit: 'C',
            swing: 'stopped',
          },
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
    });

    it('Should toggle schedule', async () => {
      const action = ToggleSensiboSchedule;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          device: 'test_device_id',
          schedule: 'test_schedule_id',
          isEnabled: false,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
    });
  });
});
