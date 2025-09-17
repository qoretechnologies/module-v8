import { configDotenv } from 'dotenv';
import { ListBrowseAiRobots, ListBrowseAiTasks } from '../apps/browse-ai/actions';
import { getBrowseAiRobotIdAllowedValues } from '../apps/browse-ai/helpers/get-robot-id-allowed-values';
import { mapBrowseAiInputParameterToQoreOptions } from '../apps/browse-ai/helpers/get-robot-input-params';
import { NewBrowseAiTask } from '../apps/browse-ai/triggers';
import { Debugger, DebugLevels } from '../utils/Debugger';

configDotenv({ path: '.env' });
Debugger.level = DebugLevels.Verbose;

describe('Browse AI', () => {
  const base_context = {
    conn_opts: {
      token: '',
    } as any,
  };

  beforeAll(() => {
    const token = process.env.BROWSE_AI_API_KEY;

    if (!token) {
      throw new Error(`Please set the BROWSE_AI_API_KEY environment variable.`);
    }

    base_context.conn_opts.token = token;
  });

  let robotId: string | undefined;
  describe('Should test allowed values', () => {
    it('Should get robot id allowed values', async () => {
      const allowed_values = await getBrowseAiRobotIdAllowedValues(base_context);
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      robotId = allowed_values[0].value;
    });

    it('Should map robot input params to qore options', async () => {
      if (!robotId) {
        throw new Error('Robot ID is not defined');
      }

      const options = await mapBrowseAiInputParameterToQoreOptions({
        robotId,
        token: base_context.conn_opts.token,
      });

      expect(options).toBeDefined();
      expect(options.originUrl).toBeDefined();
    });
  });

  describe('Should test actions', () => {
    it('Should list robots', async () => {
      const action = ListBrowseAiRobots;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({}, undefined, base_context);

      expect(result).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.items.length).toBeGreaterThan(0);
    });

    it('Should list tasks', async () => {
      const action = ListBrowseAiTasks;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({ robot: robotId }, undefined, base_context);

      expect(result).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.items.length).toBeGreaterThan(0);
    });

    // Tokens amount is strictly limited, so we cannot run these tests every time.
    // it('Should run a task', async () => {
    //   const action = RunBrowseAiTask;

    //   if (!('api_function' in action)) throw new Error('api_function not found in action');

    //   if (!robotId) {
    //     throw new Error('Robot ID is not defined');
    //   }

    //   const result = await action.api_function(
    //     { robot: robotId, originUrl: 'https://www.ycombinator.com/companies/airbnb' } as any,
    //     undefined,
    //     base_context
    //   );

    //   expect(result.id).toBeDefined();
    // });

    // it('Should run a bulk task', async () => {
    //   const action = RunBrowseAiBulkTask;

    //   if (!('api_function' in action)) throw new Error('api_function not found in action');

    //   if (!robotId) {
    //     throw new Error('Robot ID is not defined');
    //   }

    //   const result = await action.api_function(
    //     {
    //       robot: robotId,
    //       title: 'Test',
    //       inputParameters: [
    //         {
    //           originUrl: 'https://example.com',
    //         },
    //       ],
    //     } as any,
    //     undefined,
    //     base_context
    //   );

    //   expect(result.id).toBeDefined();
    //   expect(result.title).toBe('Test');
    // });
  });

  describe('Should test triggers event example data', () => {
    it('Should get example event data for new task trigger', async () => {
      const trigger = NewBrowseAiTask;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      if (!robotId) {
        throw new Error('Robot ID is not defined');
      }

      const result = await trigger.get_example_event_data({
        opts: {
          robot: robotId,
          eventType: 'taskFinished',
        },
        ...base_context,
      });
      expect(result).toBeDefined();
      expect(result.task).toBeDefined();
    });
  });
});
