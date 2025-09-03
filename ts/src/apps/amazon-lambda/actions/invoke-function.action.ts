import { InvocationType, InvokeCommand, LogType } from '@aws-sdk/client-lambda';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import {
  getAmazonDefaultRegion,
  getAWSRegionAllowedValues,
} from '../../../global/helpers/get-amazon-region-allowed-values';
import {
  AMAZON_LAMBDA_APP_NAME,
  AmazonLambdaError,
  LAMBDA_INVOCATION_TYPE_OPTIONS,
  LAMBDA_LOG_TYPE_OPTIONS,
} from '../constants';
import { createLambdaClient } from '../helpers/constants';
import { getAWSLambdaFunctionAllowedValues } from '../helpers/get-function-allowed-values';

const options = {
  region: {
    required: false,
    preselected: true,
    type: 'string',
    allowed_values_creatable: true,
    get_default_value: getAmazonDefaultRegion,
    get_allowed_values: getAWSRegionAllowedValues,
    on_change: ['refetch'],
  },
  function_name: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getAWSLambdaFunctionAllowedValues,
    depends_on: ['region'],
  },
  invocation_type: {
    required: false,
    type: 'string',
    default_value: 'RequestResponse',
    allowed_values: LAMBDA_INVOCATION_TYPE_OPTIONS,
  },
  log_type: {
    required: false,
    type: 'string',
    default_value: 'None',
    allowed_values: LAMBDA_LOG_TYPE_OPTIONS,
  },
  payload: {
    required: false,
    type: 'string',
    default_value: '{}',
  },
  qualifier: {
    required: false,
    type: 'string',
    default_value: '$LATEST',
  },
} satisfies TQoreOptions;

const invokeFunction = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AMAZON_LAMBDA_APP_NAME,
  action: 'invoke_function',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { access_key_id, secret_access_key, function_name } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['access_key_id', 'secret_access_key'],
      optionFields: ['function_name'],
      ErrorClass: AmazonLambdaError,
    });

    const region = obj?.region || context?.conn_opts?.region;
    const { invocation_type, log_type, payload, qualifier } = obj || {};

    try {
      const lambdaClient = createLambdaClient({
        access_key_id,
        secret_access_key,
        region: region || 'us-east-1',
      });

      let payloadBuffer: Uint8Array;
      try {
        const payloadString = payload || '{}';
        JSON.parse(payloadString);
        payloadBuffer = new TextEncoder().encode(payloadString);
      } catch (error) {
        throw new AmazonLambdaError(`Invalid JSON payload: ${error.message || error}`);
      }

      const command = new InvokeCommand({
        FunctionName: function_name,
        InvocationType: (invocation_type || 'RequestResponse') as InvocationType,
        LogType: (log_type || 'None') as LogType,
        Payload: payloadBuffer,
        Qualifier: qualifier || '$LATEST',
      });

      const response = await lambdaClient.send(command);

      let responsePayload: any = null;
      if (response.Payload) {
        try {
          const payloadString = new TextDecoder().decode(response.Payload);
          responsePayload = JSON.parse(payloadString);
        } catch (error) {
          responsePayload = new TextDecoder().decode(response.Payload);
        }
      }

      let logs: string | null = null;
      if (response.LogResult) {
        try {
          logs = Buffer.from(response.LogResult, 'base64').toString('utf-8');
        } catch (error) {
          logs = response.LogResult;
        }
      }

      return {
        function_name,
        qualifier: qualifier || '$LATEST',
        invocation_type: invocation_type || 'RequestResponse',
        log_type: log_type || 'None',
        status_code: response.StatusCode || 0,
        function_error: response.FunctionError || '',
        executed_version: response.ExecutedVersion || '',
        payload: responsePayload,
        logs,
        request_payload: payload || '{}',
        invoked_at: new Date().toISOString(),
      };
    } catch (error) {
      throw new AmazonLambdaError(`Failed to invoke function: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      function_name: { type: 'string' },
      qualifier: { type: 'string' },
      invocation_type: { type: 'string' },
      log_type: { type: 'string' },
      status_code: { type: 'integer' },
      function_error: { type: 'string' },
      executed_version: { type: 'string' },
      payload: {
        type: {
          type: 'hash',
        },
      },
      logs: { type: 'string' },
      request_payload: { type: 'string' },
      invoked_at: { type: 'string' },
    },
  },
});

export default invokeFunction;
