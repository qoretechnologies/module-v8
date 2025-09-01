import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { getAmazonEc2RegionAllowedValues } from '../../amazon-ec2/helpers/get-region-allowed-values';
import { AMAZON_S3_APP_NAME, AmazonS3Error } from '../constants';
import {
  createS3Client,
  formatFileSize,
  formatS3Date,
  getAmazonDefaultRegion,
} from '../helpers/constants';
import { getAmazonS3BucketAllowedValues } from '../helpers/get-bucket-allowed-values';

const options = {
  region: {
    required: false,
    preselected: true,
    type: 'string',
    allowed_values_creatable: true,
    get_default_value: getAmazonDefaultRegion,
    get_allowed_values: getAmazonEc2RegionAllowedValues,
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
} satisfies TQoreOptions;

const AmazonS3NewOrUpdatedFileTrigger = QoreAppCreator.createLocalizedTrigger({
  app: AMAZON_S3_APP_NAME,
  action: 'new_or_updated_file',
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { access_key_id, secret_access_key, bucket_name } = getQoreContextRequiredValues({
      context,
      connectionFields: ['access_key_id', 'secret_access_key'],
      optionFields: ['bucket_name'],
      ErrorClass: AmazonS3Error,
    });

    const region = context?.opts?.region || context?.conn_opts?.region;
    const { prefix } = context?.opts || {};

    const getItems = () => {
      return fetchLatestObjects({
        access_key_id,
        secret_access_key,
        region: region || 'us-east-1',
        bucket_name,
        prefix,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'amazon_s3_new_file',
      uniqueField: 'object_key',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { access_key_id, secret_access_key, region, bucket_name } = getQoreContextRequiredValues({
      context,
      connectionFields: ['access_key_id', 'secret_access_key'],
      optionFields: ['region', 'bucket_name'],
      ErrorClass: AmazonS3Error,
    });

    const { prefix } = context?.opts || {};

    const objects = await fetchLatestObjects({
      access_key_id,
      secret_access_key,
      region: region || 'us-east-1',
      bucket_name,
      prefix,
    });

    return objects?.length > 0 ? objects[0] : null;
  },
  event_info: {
    desc: 'Amazon S3 New File Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        object_key: { type: 'string' },
        bucket_name: { type: 'string' },
        size: { type: 'integer' },
        last_modified: { type: 'string' },
        etag: { type: 'string' },
        storage_class: { type: 'string' },
        s3_url: { type: 'string' },
        file_extension: { type: 'string' },
        formatted_size: { type: 'string' },
      },
    },
  },
});

export default AmazonS3NewOrUpdatedFileTrigger;

const S3_OBJECTS_FETCH_LIMIT = 1000;
const S3_OBJECTS_FETCH_MAX_ITERATIONS = 10;

const fetchLatestObjects = async (options: {
  access_key_id: string;
  secret_access_key: string;
  region: string;
  bucket_name: string;
  prefix?: string;
}) => {
  const { access_key_id, secret_access_key, region, bucket_name, prefix } = options;

  try {
    const s3Client = createS3Client({
      access_key_id,
      secret_access_key,
      region,
    });

    const objects: any[] = [];

    let continuationToken: string | undefined;
    for (let i = 0; i < S3_OBJECTS_FETCH_MAX_ITERATIONS; i++) {
      const command = new ListObjectsV2Command({
        Bucket: bucket_name,
        MaxKeys: S3_OBJECTS_FETCH_LIMIT,
        ...(prefix && { Prefix: prefix }),
        ...(continuationToken && { ContinuationToken: continuationToken }),
      });

      const response = await s3Client.send(command);

      continuationToken = response.NextContinuationToken;

      if (response.Contents) {
        for (const object of response.Contents) {
          if (object.Key) {
            const fileExtension = object.Key.split('.').pop() || '';

            objects.push({
              object_key: object.Key,
              bucket_name,
              size: object.Size || 0,
              last_modified: formatS3Date(object.LastModified),
              etag: object.ETag?.replace(/"/g, '') || '',
              storage_class: object.StorageClass || 'STANDARD',
              s3_url: `s3://${bucket_name}/${object.Key}`,
              file_extension: fileExtension,
              formatted_size: formatFileSize(object.Size),
            });
          }
        }
      }

      if (!continuationToken) {
        break;
      }
    }

    return objects.sort(
      (a, b) => new Date(b.last_modified ?? 0).getTime() - new Date(a.last_modified ?? 0).getTime()
    );
  } catch (error) {
    throw new AmazonS3Error(`Failed to fetch latest objects: ${error.message || error}`);
  }
};
