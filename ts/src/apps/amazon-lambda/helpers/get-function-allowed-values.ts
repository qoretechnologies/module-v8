import { ListFunctionsCommand } from '@aws-sdk/client-lambda';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { AmazonLambdaError } from '../constants';
import { createLambdaClient, formatMemorySize, formatTimeout } from './constants';

export const getAWSLambdaFunctionAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { access_key_id, secret_access_key } = getQoreContextRequiredValues({
    context,
    connectionFields: ['access_key_id', 'secret_access_key'],
    ErrorClass: AmazonLambdaError,
  });

  const region = context?.opts?.region || context?.conn_opts?.region;

  try {
    const lambdaClient = createLambdaClient({
      access_key_id,
      secret_access_key,
      region,
    });

    const command = new ListFunctionsCommand({
      MaxItems: 100,
    });
    const response = await lambdaClient.send(command);

    const allowedValues: IQoreAllowedValue<string>[] = [];

    if (response.Functions) {
      for (const func of response.Functions) {
        if (func.FunctionName) {
          allowedValues.push({
            value: func.FunctionName,
            display_name: func.FunctionName,
            desc:
              `Runtime: ${func.Runtime || 'Unknown'}\n` +
              `Memory: ${formatMemorySize(func.MemorySize)}\n` +
              `Timeout: ${formatTimeout(func.Timeout)}\n` +
              `Description: ${func.Description || 'No description'}`,
          });
        }
      }
    }

    return allowedValues;
  } catch (error) {
    throw new AmazonLambdaError(`Failed to fetch function names: ${error.message || error}`);
  }
};
