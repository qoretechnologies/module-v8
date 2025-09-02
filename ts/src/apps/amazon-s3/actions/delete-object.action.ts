import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import {
  getAmazonDefaultRegion,
  getAWSRegionAllowedValues,
} from '../../../global/helpers/get-amazon-region-allowed-values';
import { AMAZON_S3_APP_NAME, AmazonS3Error } from '../constants';
import { createS3Client } from '../helpers/constants';
import { getAmazonS3BucketAllowedValues } from '../helpers/get-bucket-allowed-values';
import { getAmazonS3ObjectAllowedValues } from '../helpers/get-object-allowed-values';

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
    on_change: ['refetch'],
  },
  object_key: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getAmazonS3ObjectAllowedValues,
    depends_on: ['region', 'bucket_name'],
  },
  version_id: {
    required: false,
    type: 'string',
  },
  bypass_governance_retention: {
    required: false,
    type: 'boolean',
    default_value: false,
  },
} satisfies TQoreOptions;

const deleteObject = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AMAZON_S3_APP_NAME,
  action: 'delete_object',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { access_key_id, secret_access_key, bucket_name, object_key } =
      getQoreContextRequiredValues({
        context: { ...context, opts: obj },
        connectionFields: ['access_key_id', 'secret_access_key'],
        optionFields: ['bucket_name', 'object_key'],
        ErrorClass: AmazonS3Error,
      });

    const { version_id, bypass_governance_retention } = obj || {};
    const region = obj?.region || context?.conn_opts?.region;

    try {
      const s3Client = createS3Client({
        access_key_id,
        secret_access_key,
        region: region || 'us-east-1',
      });

      const deleteParams: any = {
        Bucket: bucket_name,
        Key: object_key,
        ...(version_id && { VersionId: version_id }),
        ...(bypass_governance_retention && {
          BypassGovernanceRetention: bypass_governance_retention,
        }),
      };

      const command = new DeleteObjectCommand(deleteParams);
      const response = await s3Client.send(command);

      return {
        bucket_name,
        object_key,
        s3_url: `s3://${bucket_name}/${object_key}`,
        version_id: response.VersionId || version_id || '',
        delete_marker: response.DeleteMarker || false,
        request_charged: response.RequestCharged || '',
        deleted_at: new Date().toISOString(),
        success: true,
        message: `Successfully deleted object '${object_key}' from bucket '${bucket_name}'`,
      };
    } catch (error) {
      throw new AmazonS3Error(`Failed to delete object: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      bucket_name: { type: 'string' },
      object_key: { type: 'string' },
      s3_url: { type: 'string' },
      version_id: { type: 'string' },
      delete_marker: { type: 'boolean' },
      request_charged: { type: 'string' },
      deleted_at: { type: 'string' },
      success: { type: 'boolean' },
      message: { type: 'string' },
    },
  },
});

export default deleteObject;
