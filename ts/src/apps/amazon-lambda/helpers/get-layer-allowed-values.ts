import { ListLayersCommand, ListLayerVersionsCommand } from '@aws-sdk/client-lambda';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { AmazonLambdaError } from '../constants';
import { createLambdaClient } from './constants';

export const getAWSLambdaLayerAllowedValues: TQoreGetAllowedValuesFunction<
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

    const command = new ListLayersCommand({
      MaxItems: 50,
    });
    const response = await lambdaClient.send(command);

    const allowedValues: IQoreAllowedValue<string>[] = [];

    if (response.Layers) {
      for (const layer of response.Layers) {
        if (layer.LayerName) {
          const latestVersion = layer.LatestMatchingVersion;
          allowedValues.push({
            value: layer.LayerName,
            display_name: layer.LayerName,
            desc:
              `Latest Version: ${latestVersion?.Version || 'Unknown'}\n` +
              `Compatible Runtimes: ${latestVersion?.CompatibleRuntimes?.join(', ') || 'Unknown'}\n` +
              `Description: ${latestVersion?.Description || 'No description'}`,
          });
        }
      }
    }

    return allowedValues;
  } catch (error) {
    throw new AmazonLambdaError(`Failed to fetch layer names: ${error.message || error}`);
  }
};

export const getAWSLambdaLayerVersionAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  number
> = async (context) => {
  const { access_key_id, secret_access_key, layer_name } = getQoreContextRequiredValues({
    context,
    connectionFields: ['access_key_id', 'secret_access_key'],
    optionFields: ['layer_name'],
    ErrorClass: AmazonLambdaError,
  });

  const region = context?.opts?.region || context?.conn_opts?.region;

  try {
    const lambdaClient = createLambdaClient({
      access_key_id,
      secret_access_key,
      region,
    });

    const command = new ListLayerVersionsCommand({
      LayerName: layer_name,
      MaxItems: 50,
    });
    const response = await lambdaClient.send(command);

    const allowedValues: IQoreAllowedValue<number>[] = [];

    if (response.LayerVersions) {
      for (const version of response.LayerVersions) {
        if (version.Version !== undefined) {
          allowedValues.push({
            value: version.Version,
            display_name: `Version ${version.Version}`,
            desc:
              `Compatible Runtimes: ${version.CompatibleRuntimes?.join(', ') || 'Unknown'}\n` +
              `Created: ${version.CreatedDate || 'Unknown'}\n` +
              `Description: ${version.Description || 'No description'}`,
          });
        }
      }
    }

    return allowedValues.sort((a, b) => b.value - a.value);
  } catch (error) {
    throw new AmazonLambdaError(`Failed to fetch layer versions: ${error.message || error}`);
  }
};
