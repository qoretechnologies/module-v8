import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { AmazonS3Error } from '../constants';
import { createS3Client, formatFileSize, formatS3Date } from './constants';

export const getAmazonS3ObjectAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { access_key_id, secret_access_key, bucket_name } = getQoreContextRequiredValues({
    context,
    connectionFields: ['access_key_id', 'secret_access_key'],
    optionFields: ['bucket_name'],
    ErrorClass: AmazonS3Error,
  });

  const region = context?.opts?.region || context?.conn_opts?.region;
  const prefix = context?.opts?.prefix;

  try {
    const s3Client = createS3Client({
      access_key_id,
      secret_access_key,
      region,
    });

    const command = new ListObjectsV2Command({
      Bucket: bucket_name,
      MaxKeys: 100,
      ...(prefix && { Prefix: prefix }),
    });

    const response = await s3Client.send(command);
    const allowedValues: IQoreAllowedValue<string>[] = [];

    if (response.Contents) {
      for (const object of response.Contents) {
        if (object.Key) {
          allowedValues.push({
            value: object.Key,
            display_name: object.Key,
            desc:
              `Size: ${formatFileSize(object.Size)}\n` +
              `Last Modified: ${formatS3Date(object.LastModified)}\n` +
              `Storage Class: ${object.StorageClass || 'STANDARD'}`,
          });
        }
      }
    }

    return allowedValues;
  } catch (error) {
    throw new AmazonS3Error(`Failed to fetch object keys: ${error.message || error}`);
  }
};
