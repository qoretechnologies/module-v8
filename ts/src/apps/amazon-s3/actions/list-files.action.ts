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
  file_extensions: {
    required: false,
    type: {
      type: 'list',
      element_type: 'string',
    },
  },
  continuation_token: {
    required: false,
    type: 'string',
  },
} satisfies TQoreOptions;

const listFiles = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AMAZON_S3_APP_NAME,
  action: 'list_files',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { access_key_id, secret_access_key, region, bucket_name } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['access_key_id', 'secret_access_key'],
      optionFields: ['region', 'bucket_name'],
      ErrorClass: AmazonS3Error,
    });

    const { prefix, max_keys, file_extensions, continuation_token } = obj || {};

    try {
      const s3Client = createS3Client({
        access_key_id,
        secret_access_key,
        region: region || 'us-east-1',
      });

      const command = new ListObjectsV2Command({
        Bucket: bucket_name,
        MaxKeys: max_keys || 100,
        ...(prefix && { Prefix: prefix }),
        ...(continuation_token && { ContinuationToken: continuation_token }),
      });

      const response = await s3Client.send(command);

      const files = (response.Contents || [])
        .filter((obj) => {
          if (obj.Key?.endsWith('/')) {
            return false;
          }

          if (file_extensions && file_extensions.length > 0 && obj.Key) {
            const fileExtension = obj.Key.split('.').pop()?.toLowerCase() || '';

            return file_extensions.some((ext) => ext.toLowerCase() === fileExtension);
          }

          return true;
        })
        .map((obj) => {
          const fileName = obj.Key?.split('/').pop() || obj.Key || '';
          const fileExtension = fileName.split('.').pop() || '';

          return {
            name: fileName,
            full_path: obj.Key || '',
            size: obj.Size || 0,
            formatted_size: formatFileSize(obj.Size),
            last_modified: formatS3Date(obj.LastModified),
            etag: obj.ETag?.replace(/"/g, '') || '',
            storage_class: obj.StorageClass || 'STANDARD',
            s3_url: `s3://${bucket_name}/${obj.Key}`,
            public_url: `https://${bucket_name}.s3.${region}.amazonaws.com/${obj.Key}`,
            file_extension: fileExtension,
            mime_type: getMimeTypeFromExtension(fileExtension),
          };
        });

      return {
        bucket_name,
        prefix: prefix || '',
        file_count: files.length,
        total_size: files.reduce((sum, file) => sum + file.size, 0),
        total_formatted_size: formatFileSize(files.reduce((sum, file) => sum + file.size, 0)),
        file_extensions_filter: file_extensions || [],
        files,
        retrieved_at: new Date().toISOString(),
        continuation_token: response.NextContinuationToken || '',
      };
    } catch (error) {
      throw new AmazonS3Error(`Failed to list files: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      continuation_token: { type: 'string' },
      bucket_name: { type: 'string' },
      prefix: { type: 'string' },
      file_count: { type: 'integer' },
      total_size: { type: 'integer' },
      total_formatted_size: { type: 'string' },
      file_extensions_filter: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
      files: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              name: { type: 'string' },
              full_path: { type: 'string' },
              size: { type: 'integer' },
              formatted_size: { type: 'string' },
              last_modified: { type: 'string' },
              etag: { type: 'string' },
              storage_class: { type: 'string' },
              s3_url: { type: 'string' },
              public_url: { type: 'string' },
              file_extension: { type: 'string' },
              mime_type: { type: 'string' },
            },
          },
        },
      },
      retrieved_at: { type: 'string' },
    },
  },
});

const getMimeTypeFromExtension = (extension: string): string => {
  const mimeTypes: Record<string, string> = {
    txt: 'text/plain',
    html: 'text/html',
    htm: 'text/html',
    css: 'text/css',
    js: 'text/javascript',
    json: 'application/json',
    xml: 'application/xml',
    csv: 'text/csv',
    md: 'text/markdown',

    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    ico: 'image/x-icon',
    webp: 'image/webp',

    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',

    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
    tar: 'application/x-tar',
    gz: 'application/gzip',

    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    mp4: 'video/mp4',
    avi: 'video/x-msvideo',
    mov: 'video/quicktime',
  };

  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
};

export default listFiles;
