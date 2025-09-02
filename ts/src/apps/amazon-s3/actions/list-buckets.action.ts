import { GetBucketLocationCommand, ListBucketsCommand } from '@aws-sdk/client-s3';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';
import {
  getAmazonDefaultRegion,
  getAWSRegionAllowedValues,
} from '../../../global/helpers/get-amazon-region-allowed-values';
import { AMAZON_S3_APP_NAME, AmazonS3Error } from '../constants';
import { createS3Client, formatS3Date } from '../helpers/constants';

const options = {
  region: {
    required: false,
    preselected: true,
    type: 'string',
    allowed_values_creatable: true,
    get_default_value: getAmazonDefaultRegion,
    get_allowed_values: getAWSRegionAllowedValues,
  },
  include_location: {
    required: false,
    type: 'boolean',
    default_value: true,
  },
} satisfies TQoreOptions;

const listBuckets = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AMAZON_S3_APP_NAME,
  action: 'list_buckets',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { access_key_id, secret_access_key, include_location } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['access_key_id', 'secret_access_key'],
      ErrorClass: AmazonS3Error,
    });

    const region = obj?.region || context?.conn_opts?.region;

    try {
      const s3Client = createS3Client({
        access_key_id,
        secret_access_key,
        region,
      });

      const command = new ListBucketsCommand({});
      const response = await s3Client.send(command);

      const buckets: any[] = [];

      if (response.Buckets) {
        for (const bucket of response.Buckets) {
          if (bucket.Name) {
            let bucketRegion = 'us-east-1';

            if (include_location) {
              try {
                const locationCommand = new GetBucketLocationCommand({
                  Bucket: bucket.Name,
                });
                const locationResponse = await s3Client.send(locationCommand);
                bucketRegion = locationResponse.LocationConstraint || 'us-east-1';
              } catch (locationError) {
                Debugger.log(
                  `Could not get location for bucket ${bucket.Name}: ${locationError.message || locationError}`
                );
              }
            }

            buckets.push({
              name: bucket.Name,
              creation_date: formatS3Date(bucket.CreationDate),
              region: bucketRegion,
              s3_url: `s3://${bucket.Name}`,
              console_url: `https://console.aws.amazon.com/s3/bucket/${bucket.Name}`,
              public_url: `https://${bucket.Name}.s3.amazonaws.com/`,
              website_url: `https://${bucket.Name}.s3-website-${bucketRegion}.amazonaws.com/`,
            });
          }
        }
      }

      buckets.sort((a, b) => {
        const dateA = new Date(a.creation_date || 0);
        const dateB = new Date(b.creation_date || 0);

        return dateB.getTime() - dateA.getTime();
      });

      return {
        bucket_count: buckets.length,
        owner: {
          id: response.Owner?.ID || '',
          display_name: response.Owner?.DisplayName || '',
        },
        buckets,
        include_location: include_location || true,
        retrieved_at: new Date().toISOString(),
      };
    } catch (error) {
      throw new AmazonS3Error(`Failed to list buckets: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      bucket_count: { type: 'integer' },
      owner: {
        type: {
          type: 'hash',
          fields: {
            id: { type: 'string' },
            display_name: { type: 'string' },
          },
        },
      },
      buckets: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              name: { type: 'string' },
              creation_date: { type: 'string' },
              region: { type: 'string' },
              s3_url: { type: 'string' },
              console_url: { type: 'string' },
              public_url: { type: 'string' },
              website_url: { type: 'string' },
            },
          },
        },
      },
      include_location: { type: 'boolean' },
      retrieved_at: { type: 'string' },
    },
  },
});

export default listBuckets;
