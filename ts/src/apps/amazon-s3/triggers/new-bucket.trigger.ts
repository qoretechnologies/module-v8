import { GetBucketLocationCommand, ListBucketsCommand } from '@aws-sdk/client-s3';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { Debugger } from '../../../utils/Debugger';
import { getAmazonEc2RegionAllowedValues } from '../../amazon-ec2/helpers/get-region-allowed-values';
import { AMAZON_S3_APP_NAME, AmazonS3Error } from '../constants';
import { createS3Client, formatS3Date, getAmazonDefaultRegion } from '../helpers/constants';

const options = {
  region: {
    required: false,
    preselected: true,
    type: 'string',
    allowed_values_creatable: true,
    get_default_value: getAmazonDefaultRegion,
    get_allowed_values: getAmazonEc2RegionAllowedValues,
  },
} satisfies TQoreOptions;

const AmazonS3NewBucketTrigger = QoreAppCreator.createLocalizedTrigger({
  app: AMAZON_S3_APP_NAME,
  action: 'new_bucket',
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { access_key_id, secret_access_key } = getQoreContextRequiredValues({
      context,
      connectionFields: ['access_key_id', 'secret_access_key'],
      ErrorClass: AmazonS3Error,
    });

    const region = context?.opts?.region || context?.conn_opts?.region;

    const getItems = () => {
      return fetchLatestBuckets({
        access_key_id,
        secret_access_key,
        region: region || 'us-east-1',
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'amazon_s3_new_bucket',
      uniqueField: 'bucket_name',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { access_key_id, secret_access_key, region } = getQoreContextRequiredValues({
      context,
      connectionFields: ['access_key_id', 'secret_access_key'],
      optionFields: ['region'],
      ErrorClass: AmazonS3Error,
    });

    const buckets = await fetchLatestBuckets({
      access_key_id,
      secret_access_key,
      region: region || 'us-east-1',
    });

    return buckets?.length > 0 ? buckets[0] : null;
  },
  event_info: {
    desc: 'Amazon S3 New Bucket Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        bucket_name: { type: 'string' },
        creation_date: { type: 'string' },
        region: { type: 'string' },
        s3_url: { type: 'string' },
        console_url: { type: 'string' },
      },
    },
  },
});

export default AmazonS3NewBucketTrigger;

const fetchLatestBuckets = async (options: {
  access_key_id: string;
  secret_access_key: string;
  region: string;
}) => {
  const { access_key_id, secret_access_key, region } = options;

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
        if (bucket.Name && bucket.CreationDate) {
          let bucketRegion = region;

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

          buckets.push({
            bucket_name: bucket.Name,
            creation_date: formatS3Date(bucket.CreationDate),
            region: bucketRegion,
            s3_url: `s3://${bucket.Name}`,
            console_url: `https://console.aws.amazon.com/s3/bucket/${bucket.Name}`,
          });
        }
      }
    }

    return buckets.sort((a, b) => {
      const dateA = new Date(a.creation_date || 0);
      const dateB = new Date(b.creation_date || 0);

      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    throw new AmazonS3Error(`Failed to fetch latest buckets: ${error.message || error}`);
  }
};
