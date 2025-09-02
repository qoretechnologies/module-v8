import { ListBucketsCommand } from '@aws-sdk/client-s3';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { AmazonS3Error } from '../constants';
import { createS3Client } from './constants';

export const getAmazonS3BucketAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { access_key_id, secret_access_key } = getQoreContextRequiredValues({
    context,
    connectionFields: ['access_key_id', 'secret_access_key'],
    ErrorClass: AmazonS3Error,
  });

  const region = context?.opts?.region || context?.conn_opts?.region;

  try {
    const s3Client = createS3Client({
      access_key_id,
      secret_access_key,
      region,
    });

    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);

    const allowedValues: IQoreAllowedValue<string>[] = [];

    if (response.Buckets) {
      for (const bucket of response.Buckets) {
        if (bucket.Name) {
          allowedValues.push({
            value: bucket.Name,
            display_name: bucket.Name,
          });
        }
      }
    }

    return allowedValues;
  } catch (error) {
    throw new AmazonS3Error(`Failed to fetch bucket names: ${error.message || error}`);
  }
};
