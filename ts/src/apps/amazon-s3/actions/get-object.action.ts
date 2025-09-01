import { GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { getAmazonEc2RegionAllowedValues } from '../../amazon-ec2/helpers/get-region-allowed-values';
import { AMAZON_S3_APP_NAME, AmazonS3Error } from '../constants';
import {
  createS3Client,
  formatFileSize,
  formatS3Date,
  getAmazonDefaultRegion,
} from '../helpers/constants';
import { getAmazonS3BucketAllowedValues } from '../helpers/get-bucket-allowed-values';
import { getAmazonS3ObjectAllowedValues } from '../helpers/get-object-allowed-values';

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
  include_content: {
    required: false,
    type: 'boolean',
    default_value: true,
  },
  version_id: {
    required: false,
    type: 'string',
  },
} satisfies TQoreOptions;

const getObject = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AMAZON_S3_APP_NAME,
  action: 'get_object',
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

    const { include_content, version_id } = obj || {};
    const region = obj?.region || context?.conn_opts?.region;

    try {
      const s3Client = createS3Client({
        access_key_id,
        secret_access_key,
        region: region || 'us-east-1',
      });

      const headCommand = new HeadObjectCommand({
        Bucket: bucket_name,
        Key: object_key,
        ...(version_id && { VersionId: version_id }),
      });

      const headResponse = await s3Client.send(headCommand);

      let content: string | null = null;
      let content_encoding = 'base64';

      if (include_content) {
        const getCommand = new GetObjectCommand({
          Bucket: bucket_name,
          Key: object_key,
          ...(version_id && { VersionId: version_id }),
        });

        const getResponse = await s3Client.send(getCommand);

        if (getResponse.Body) {
          const chunks = [];
          for await (const chunk of getResponse.Body as any) {
            chunks.push(chunk);
          }
          const buffer = Buffer.concat(chunks);
          content = buffer.toString('base64');

          const contentType = headResponse.ContentType || '';
          if (
            contentType.startsWith('text/') ||
            contentType.includes('json') ||
            contentType.includes('xml') ||
            contentType.includes('javascript')
          ) {
            const textContent = buffer.toString('utf-8');
            content = textContent;
            content_encoding = 'utf-8';
          }
        }
      }

      const fileExtension = object_key.split('.').pop() || '';

      return {
        bucket_name,
        object_key,
        s3_url: `s3://${bucket_name}/${object_key}`,
        public_url: `https://${bucket_name}.s3.${region}.amazonaws.com/${object_key}`,
        console_url: `https://console.aws.amazon.com/s3/object/${bucket_name}/${object_key}`,
        size: headResponse.ContentLength || 0,
        formatted_size: formatFileSize(headResponse.ContentLength),
        content_type: headResponse.ContentType || 'unknown',
        etag: headResponse.ETag?.replace(/"/g, '') || '',
        last_modified: formatS3Date(headResponse.LastModified),
        version_id: headResponse.VersionId || '',
        storage_class: headResponse.StorageClass || 'STANDARD',
        metadata: headResponse.Metadata || {},
        cache_control: headResponse.CacheControl || '',
        content_disposition: headResponse.ContentDisposition || '',
        content_language: headResponse.ContentLanguage || '',
        expires: formatS3Date(headResponse.ExpiresString),
        file_extension: fileExtension,
        content,
        content_encoding: content_encoding,
        server_side_encryption: headResponse.ServerSideEncryption || '',
        retrieved_at: new Date().toISOString(),
      };
    } catch (error) {
      throw new AmazonS3Error(`Failed to get object: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      bucket_name: { type: 'string' },
      object_key: { type: 'string' },
      s3_url: { type: 'string' },
      public_url: { type: 'string' },
      console_url: { type: 'string' },
      size: { type: 'integer' },
      formatted_size: { type: 'string' },
      content_type: { type: 'string' },
      etag: { type: 'string' },
      last_modified: { type: 'string' },
      version_id: { type: 'string' },
      storage_class: { type: 'string' },
      metadata: {
        type: {
          type: 'hash',
        },
      },
      cache_control: { type: 'string' },
      content_disposition: { type: 'string' },
      content_language: { type: 'string' },
      expires: { type: 'string' },
      file_extension: { type: 'string' },
      content: { type: 'string' },
      content_encoding: { type: 'string' },
      server_side_encryption: { type: 'string' },
      retrieved_at: { type: 'string' },
    },
  },
});

export default getObject;
