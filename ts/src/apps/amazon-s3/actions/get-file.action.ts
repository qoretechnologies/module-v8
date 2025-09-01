import { GetObjectCommand } from '@aws-sdk/client-s3';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { AMAZON_S3_APP_NAME, AmazonS3Error } from '../constants';
import { createS3Client, getAmazonDefaultRegion } from '../helpers/constants';
import { getAmazonS3BucketAllowedValues } from '../helpers/get-bucket-allowed-values';
import { getAmazonS3ObjectAllowedValues } from '../helpers/get-object-allowed-values';
import { getAmazonEc2RegionAllowedValues } from '../../amazon-ec2/helpers/get-region-allowed-values';

const options = {
  region: {
    required: false,
    preselected: true,
    type: 'string',
    allowed_values_creatable: true,
    get_default_value: getAmazonDefaultRegion,
    get_allowed_values: getAmazonEc2RegionAllowedValues,
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
} satisfies TQoreOptions;

const getFile = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AMAZON_S3_APP_NAME,
  action: 'get_file',
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

    const { version_id } = obj || {};
    const region = obj?.region || context?.conn_opts?.region;

    try {
      const s3Client = createS3Client({
        access_key_id,
        secret_access_key,
        region: region || 'us-east-1',
      });

      const command = new GetObjectCommand({
        Bucket: bucket_name,
        Key: object_key,
        ...(version_id && { VersionId: version_id }),
      });

      const response = await s3Client.send(command);

      if (!response.Body) {
        throw new AmazonS3Error('No content received from S3 object');
      }

      const chunks = [];
      for await (const chunk of response.Body as any) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      const content = buffer.toString('base64');

      const fileName = object_key.split('/').pop() || object_key;

      return {
        name: fileName,
        mime_type: response.ContentType || 'application/octet-stream',
        content: content,
      };
    } catch (error) {
      throw new AmazonS3Error(`Failed to get file: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      name: {
        type: 'string',
      },
      mime_type: {
        type: 'string',
      },
      content: {
        type: 'string',
      },
    },
  },
});

export default getFile;
