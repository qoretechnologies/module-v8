import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import {
  getAmazonDefaultRegion,
  getAWSRegionAllowedValues,
} from '../../../global/helpers/get-amazon-region-allowed-values';
import { AMAZON_S3_APP_NAME, AmazonS3Error } from '../constants';
import { createS3Client, formatFileSize, formatS3Date } from '../helpers/constants';
import { getAmazonS3BucketAllowedValues } from '../helpers/get-bucket-allowed-values';

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
  bucket_name: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getAmazonS3BucketAllowedValues,
    depends_on: ['region'],
  },
  prefix: {
    required: false,
    type: 'string',
  },
  max_keys: {
    required: false,
    type: 'integer',
    default_value: 100,
  },
  continuation_token: {
    required: false,
    type: 'string',
  },
  delimiter: {
    required: false,
    type: 'string',
  },
  start_after: {
    required: false,
    type: 'string',
  },
} satisfies TQoreOptions;

const listObjects = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AMAZON_S3_APP_NAME,
  action: 'list_objects',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { access_key_id, secret_access_key, bucket_name } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['access_key_id', 'secret_access_key'],
      optionFields: ['bucket_name'],
      ErrorClass: AmazonS3Error,
    });

    const { prefix, max_keys, continuation_token, delimiter, start_after } = obj || {};
    const region = obj?.region || context?.conn_opts?.region;

    try {
      const s3Client = createS3Client({
        access_key_id,
        secret_access_key,
        region,
      });

      const command = new ListObjectsV2Command({
        Bucket: bucket_name,
        MaxKeys: max_keys || 100,
        ...(prefix && { Prefix: prefix }),
        ...(continuation_token && { ContinuationToken: continuation_token }),
        ...(delimiter && { Delimiter: delimiter }),
        ...(start_after && { StartAfter: start_after }),
      });

      const response = await s3Client.send(command);

      const objects = (response.Contents || []).map((obj) => {
        const fileExtension = obj.Key?.split('.').pop() || '';

        return {
          object_key: obj.Key || '',
          size: obj.Size || 0,
          formatted_size: formatFileSize(obj.Size),
          last_modified: formatS3Date(obj.LastModified),
          etag: obj.ETag?.replace(/"/g, '') || '',
          storage_class: obj.StorageClass || 'STANDARD',
          owner: obj.Owner
            ? {
                display_name: obj.Owner.DisplayName || '',
                id: obj.Owner.ID || '',
              }
            : null,
          s3_url: `s3://${bucket_name}/${obj.Key}`,
          public_url: `https://${bucket_name}.s3.${region}.amazonaws.com/${obj.Key}`,
          file_extension: fileExtension,
        };
      });

      const commonPrefixes = (response.CommonPrefixes || []).map((cp) => ({
        prefix: cp.Prefix || '',
        s3_url: `s3://${bucket_name}/${cp.Prefix}`,
      }));

      return {
        bucket_name,
        prefix: prefix || '',
        max_keys: max_keys || 100,
        is_truncated: response.IsTruncated || false,
        key_count: response.KeyCount || 0,
        continuation_token: response.ContinuationToken || '',
        next_continuation_token: response.NextContinuationToken || '',
        start_after: start_after || '',
        delimiter: delimiter || '',
        objects,
        common_prefixes: commonPrefixes,
        retrieved_at: new Date().toISOString(),
      };
    } catch (error) {
      throw new AmazonS3Error(`Failed to list objects: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      bucket_name: { type: 'string' },
      prefix: { type: 'string' },
      max_keys: { type: 'integer' },
      is_truncated: { type: 'boolean' },
      key_count: { type: 'integer' },
      continuation_token: { type: 'string' },
      next_continuation_token: { type: 'string' },
      start_after: { type: 'string' },
      delimiter: { type: 'string' },
      objects: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              object_key: { type: 'string' },
              size: { type: 'integer' },
              formatted_size: { type: 'string' },
              last_modified: { type: 'string' },
              etag: { type: 'string' },
              storage_class: { type: 'string' },
              owner: {
                type: {
                  type: 'hash',
                  fields: {
                    display_name: { type: 'string' },
                    id: { type: 'string' },
                  },
                },
              },
              s3_url: { type: 'string' },
              public_url: { type: 'string' },
              file_extension: { type: 'string' },
            },
          },
        },
      },
      common_prefixes: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              prefix: { type: 'string' },
              s3_url: { type: 'string' },
            },
          },
        },
      },
      retrieved_at: { type: 'string' },
    },
  },
});

export default listObjects;
