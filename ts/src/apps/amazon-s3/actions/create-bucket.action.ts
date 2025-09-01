import { CreateBucketCommand } from '@aws-sdk/client-s3';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { getAmazonEc2RegionAllowedValues } from '../../amazon-ec2/helpers/get-region-allowed-values';
import { AMAZON_S3_APP_NAME, AmazonS3Error } from '../constants';
import { createS3Client, getAmazonDefaultRegion } from '../helpers/constants';

const options = {
  bucket_name: {
    required: true,
    type: 'string',
  },
  region: {
    required: false,
    preselected: true,
    type: 'string',
    allowed_values_creatable: true,
    get_default_value: getAmazonDefaultRegion,
    get_allowed_values: getAmazonEc2RegionAllowedValues,
  },
  acl: {
    required: false,
    type: 'string',
    default_value: 'private',
    allowed_values: [
      { value: 'private', display_name: 'Private' },
      { value: 'public-read', display_name: 'Public Read' },
      { value: 'public-read-write', display_name: 'Public Read Write' },
      { value: 'authenticated-read', display_name: 'Authenticated Read' },
    ],
  },
  object_lock_enabled: {
    required: false,
    type: 'boolean',
    default_value: false,
  },
} satisfies TQoreOptions;

const createBucket = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AMAZON_S3_APP_NAME,
  action: 'create_bucket',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { access_key_id, secret_access_key, bucket_name } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['access_key_id', 'secret_access_key'],
      optionFields: ['bucket_name'],
      ErrorClass: AmazonS3Error,
    });

    const region = obj?.region || context?.conn_opts?.region;
    const { acl, object_lock_enabled } = obj || {};

    try {
      const s3Client = createS3Client({
        access_key_id,
        secret_access_key,
        region: region,
      });

      const createBucketParams: any = {
        Bucket: bucket_name,
        ...(acl && { ACL: acl }),
        ...(object_lock_enabled && { ObjectLockEnabledForBucket: object_lock_enabled }),
        ...(region !== 'us-east-1' && {
          CreateBucketConfiguration: {
            LocationConstraint: region,
          },
        }),
      };

      const command = new CreateBucketCommand(createBucketParams);
      const response = await s3Client.send(command);

      return {
        bucket_name,
        region,
        location: response.Location || `https://${bucket_name}.s3.amazonaws.com/`,
        s3_url: `s3://${bucket_name}`,
        console_url: `https://console.aws.amazon.com/s3/bucket/${bucket_name}`,
        acl: acl || 'private',
        object_lock_enabled: object_lock_enabled || false,
        created_at: new Date().toISOString(),
      };
    } catch (error) {
      throw new AmazonS3Error(`Failed to create bucket: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      bucket_name: { type: 'string' },
      region: { type: 'string' },
      location: { type: 'string' },
      s3_url: { type: 'string' },
      console_url: { type: 'string' },
      acl: { type: 'string' },
      object_lock_enabled: { type: 'boolean' },
      created_at: { type: 'string' },
    },
  },
});

export default createBucket;
