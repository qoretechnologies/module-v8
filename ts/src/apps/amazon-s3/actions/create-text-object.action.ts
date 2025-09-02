import { PutObjectCommand } from '@aws-sdk/client-s3';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import {
  getAmazonDefaultRegion,
  getAWSRegionAllowedValues,
} from '../../../global/helpers/get-amazon-region-allowed-values';
import { AMAZON_S3_APP_NAME, AmazonS3Error, S3_STORAGE_CLASSES } from '../constants';
import { createS3Client, formatFileSize } from '../helpers/constants';
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
  object_key: {
    required: true,
    type: 'string',
  },
  content: {
    required: true,
    type: 'string',
  },
  content_type: {
    required: false,
    type: 'string',
    default_value: 'text/plain',
    allowed_values: [
      { value: 'text/plain', display_name: 'Plain Text' },
      { value: 'text/html', display_name: 'HTML' },
      { value: 'text/css', display_name: 'CSS' },
      { value: 'text/javascript', display_name: 'JavaScript' },
      { value: 'application/json', display_name: 'JSON' },
      { value: 'application/xml', display_name: 'XML' },
      { value: 'text/markdown', display_name: 'Markdown' },
      { value: 'text/csv', display_name: 'CSV' },
    ],
  },
  storage_class: {
    required: false,
    type: 'string',
    default_value: 'STANDARD',
    allowed_values: S3_STORAGE_CLASSES,
  },
  metadata: {
    required: false,
    type: 'hash',
  },
  tags: {
    required: false,
    type: 'hash',
  },
} satisfies TQoreOptions;

const createTextObject = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AMAZON_S3_APP_NAME,
  action: 'create_text_object',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { access_key_id, secret_access_key, bucket_name, object_key, content } =
      getQoreContextRequiredValues({
        context: { ...context, opts: obj },
        connectionFields: ['access_key_id', 'secret_access_key'],
        optionFields: ['bucket_name', 'object_key', 'content'],
        ErrorClass: AmazonS3Error,
      });

    const region = obj?.region || context?.conn_opts?.region;
    const { content_type, storage_class, metadata, tags } = obj || {};

    try {
      const s3Client = createS3Client({
        access_key_id,
        secret_access_key,
        region: region || 'us-east-1',
      });

      const buffer = Buffer.from(content, 'utf-8');

      const putObjectParams: any = {
        Bucket: bucket_name,
        Key: object_key,
        Body: buffer,
        ContentType: content_type || 'text/plain',
        ContentLength: buffer.length,
        ...(storage_class && { StorageClass: storage_class }),
        ...(metadata && { Metadata: metadata }),
      };

      if (tags && Object.keys(tags).length > 0) {
        const tagString = Object.entries(tags)
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
          .join('&');
        putObjectParams.Tagging = tagString;
      }

      const command = new PutObjectCommand(putObjectParams);
      const response = await s3Client.send(command);

      return {
        bucket_name,
        object_key,
        s3_url: `s3://${bucket_name}/${object_key}`,
        public_url: `https://${bucket_name}.s3.${region}.amazonaws.com/${object_key}`,
        console_url: `https://console.aws.amazon.com/s3/object/${bucket_name}/${object_key}`,
        etag: response.ETag?.replace(/"/g, '') || '',
        version_id: response.VersionId || '',
        size: buffer.length,
        formatted_size: formatFileSize(buffer.length),
        content_type: content_type || 'text/plain',
        storage_class: storage_class || 'STANDARD',
        uploaded_at: new Date().toISOString(),
        metadata: metadata || {},
        tags: tags || {},
      };
    } catch (error) {
      throw new AmazonS3Error(`Failed to create text object: ${error.message || error}`);
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
      etag: { type: 'string' },
      version_id: { type: 'string' },
      size: { type: 'integer' },
      formatted_size: { type: 'string' },
      content_type: { type: 'string' },
      storage_class: { type: 'string' },
      uploaded_at: { type: 'string' },
      metadata: {
        type: {
          type: 'hash',
        },
      },
      tags: {
        type: {
          type: 'hash',
        },
      },
    },
  },
});

export default createTextObject;
