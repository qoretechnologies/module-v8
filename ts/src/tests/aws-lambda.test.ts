import { configDotenv } from 'dotenv';
import {
  getAWSLambdaFunction,
  getAWSLambdaLayerVersion,
  invokeAWSLambdaFunction,
  listAWSLambdaFunctions,
  listAWSLambdaLayers,
  listAWSLambdaLayerVersions,
} from '../apps/amazon-lambda/actions';
import { getAWSLambdaFunctionAllowedValues } from '../apps/amazon-lambda/helpers/get-function-allowed-values';
import {
  getAWSLambdaLayerAllowedValues,
  getAWSLambdaLayerVersionAllowedValues,
} from '../apps/amazon-lambda/helpers/get-layer-allowed-values';
import {
  AWSLambdaNewFunctionTrigger,
  AWSLambdaNewLayerVersionTrigger,
} from '../apps/amazon-lambda/triggers';
import { Debugger, DebugLevels } from '../utils/Debugger';

configDotenv({ path: '.env' });
Debugger.level = DebugLevels.Verbose;

describe('AWS Lambda', () => {
  const base_context = {
    conn_opts: {} as any,
  };

  beforeAll(() => {
    const accessKey = process.env.AMAZON_ACCESS_KEY_ID;
    const secretKey = process.env.AMAZON_SECRET_ACCESS_KEY;

    if (!accessKey || !secretKey) {
      throw new Error(`
        Please set the AMAZON_ACCESS_KEY_ID and AMAZON_SECRET_ACCESS_KEY environment variables.
      `);
    }

    base_context.conn_opts = {
      access_key_id: accessKey,
      secret_access_key: secretKey,
    };
  });

  const region = 'eu-north-1';

  let layer: string | undefined;
  let version: number | undefined;
  let functionName: string | undefined;

  layer = 'qoreTestingLayer';
  version = 1;
  functionName = 'testing_for_qore';

  describe('Should test allowed values', () => {
    it('Should get function allowed values', async () => {
      const allowed_values = await getAWSLambdaFunctionAllowedValues({
        ...base_context,
        opts: {
          region,
        },
      });

      expect(allowed_values).toBeDefined();
      expect(Array.isArray(allowed_values)).toBe(true);

      functionName = allowed_values[0].value;
    });

    it('Should get layer allowed values', async () => {
      const allowed_values = await getAWSLambdaLayerAllowedValues({
        ...base_context,
        opts: {
          region,
        },
      });

      expect(allowed_values).toBeDefined();
      expect(Array.isArray(allowed_values)).toBe(true);

      layer = allowed_values[0].value;
    });

    it('Should get layer version allowed values if layers exist', async () => {
      const allowed_values = await getAWSLambdaLayerVersionAllowedValues({
        ...base_context,
        opts: {
          region,
          layer_name: layer,
        },
      });

      expect(allowed_values).toBeDefined();
      expect(Array.isArray(allowed_values)).toBe(true);

      version = allowed_values[0].value;
    });
  });

  describe('Should test actions', () => {
    it('Should list functions', async () => {
      const action = listAWSLambdaFunctions;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          region,
          max_items: 10,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.functions).toBeDefined();
      expect(Array.isArray(result.functions)).toBe(true);
      expect(result.function_count).toBeDefined();
      expect(typeof result.function_count).toBe('number');
    });

    it('Should list layers', async () => {
      const action = listAWSLambdaLayers;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          region,
          max_items: 10,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.layers).toBeDefined();
      expect(Array.isArray(result.layers)).toBe(true);
      expect(result.layer_count).toBeDefined();
      expect(typeof result.layer_count).toBe('number');
    });

    it('Should list layer versions if layers exist', async () => {
      const action = listAWSLambdaLayerVersions;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          region,
          layer_name: layer,
          max_items: 5,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.layer_name).toBe(layer);
      expect(result.layer_versions).toBeDefined();
      expect(Array.isArray(result.layer_versions)).toBe(true);
      expect(result.version_count).toBeDefined();
    });

    it('Should get function details if functions exist', async () => {
      const action = getAWSLambdaFunction;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          region,
          function_name: functionName,
          qualifier: '$LATEST',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.configuration).toBeDefined();
      expect(result.configuration.function_name).toBe(functionName);
      expect(result.configuration.function_arn).toBeDefined();
    });

    it('Should get layer version details if layers exist', async () => {
      const action = getAWSLambdaLayerVersion;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          region,
          layer_name: layer,
          version_number: version,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.layer_name).toBe(layer);
      expect(result.version).toBe(version);
      expect(result.layer_version_arn).toBeDefined();
    });

    it('Should invoke function if functions exist', async () => {
      const action = invokeAWSLambdaFunction;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          region,
          function_name: functionName,
          invocation_type: 'RequestResponse',
          log_type: 'Tail',
          payload: JSON.stringify({ test: 'data', timestamp: new Date().toISOString() }),
          qualifier: '$LATEST',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.function_name).toBe(functionName);
      expect(result.status_code).toBeDefined();
      expect(typeof result.status_code).toBe('number');
      expect(result.invoked_at).toBeDefined();
    });
  });

  describe('Should test triggers event example data', () => {
    it('Should get example event data for new function trigger', async () => {
      const trigger = AWSLambdaNewFunctionTrigger;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      const result = await trigger.get_example_event_data({
        ...base_context,
        opts: { region },
      });

      expect(result.function_name).toBeDefined();
      expect(result.function_arn).toBeDefined();
      expect(result.runtime).toBeDefined();
    });

    it('Should get example event data for new layer version trigger', async () => {
      const trigger = AWSLambdaNewLayerVersionTrigger;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      const result = await trigger.get_example_event_data({
        ...base_context,
        opts: { region },
      });

      expect(result.layer_name).toBeDefined();
      expect(result.layer_version_arn).toBeDefined();
      expect(result.version).toBeDefined();
    });
  });
});
