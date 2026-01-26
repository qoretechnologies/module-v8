import { ListInvalidationsCommand } from '@aws-sdk/client-cloudfront';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { AMAZON_CLOUDFRONT_APP_NAME, AmazonCloudFrontError } from '../constants';
import { createCloudFrontClient, formatCloudFrontDate } from '../helpers/constants';
import { getAmazonCloudFrontDistributionAllowedValues } from '../helpers/get-distribution-allowed-values';

const options = {
  distribution_id: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getAmazonCloudFrontDistributionAllowedValues,
  },
} satisfies TQoreOptions;

const AmazonCloudFrontNewInvalidationTrigger = QoreAppCreator.createLocalizedTrigger({
  app: AMAZON_CLOUDFRONT_APP_NAME,
  action: 'new_invalidation',
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { access_key_id, secret_access_key, distribution_id } = getQoreContextRequiredValues({
      context,
      connectionFields: ['access_key_id', 'secret_access_key'],
      optionFields: ['distribution_id'],
      ErrorClass: AmazonCloudFrontError,
    });

    const getItems = () => {
      return fetchLatestInvalidations({
        access_key_id,
        secret_access_key,
        distribution_id,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'amazon_cloudfront_new_invalidation',
      uniqueField: 'invalidation_id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { access_key_id, secret_access_key, distribution_id } = getQoreContextRequiredValues({
      context,
      connectionFields: ['access_key_id', 'secret_access_key'],
      optionFields: ['distribution_id'],
      ErrorClass: AmazonCloudFrontError,
    });

    const invalidations = await fetchLatestInvalidations({
      access_key_id,
      secret_access_key,
      distribution_id,
    });

    return invalidations?.length > 0 ? invalidations[0] : null;
  },
  event_info: {
    desc: 'Amazon CloudFront New Invalidation Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        invalidation_id: { type: 'string' },
        distribution_id: { type: 'string' },
        status: { type: 'string' },
        create_time: { type: 'string' },
        console_url: { type: 'string' },
      },
    },
  },
});

export default AmazonCloudFrontNewInvalidationTrigger;

const fetchLatestInvalidations = async (options: {
  access_key_id: string;
  secret_access_key: string;
  distribution_id: string;
}) => {
  const { access_key_id, secret_access_key, distribution_id } = options;

  try {
    const cloudFrontClient = createCloudFrontClient({
      access_key_id,
      secret_access_key,
      region: 'us-east-1',
    });

    const command = new ListInvalidationsCommand({
      DistributionId: distribution_id,
      MaxItems: 100,
    });

    const response = await cloudFrontClient.send(command);

    const invalidations: any[] = [];

    if (response.InvalidationList && response.InvalidationList.Items) {
      for (const invalidation of response.InvalidationList.Items) {
        if (invalidation.Id) {
          invalidations.push({
            invalidation_id: invalidation.Id,
            distribution_id,
            status: invalidation.Status || '',
            create_time: formatCloudFrontDate(invalidation.CreateTime),
            console_url: `https://console.aws.amazon.com/cloudfront/v3/home#/distributions/${distribution_id}/invalidations`,
          });
        }
      }
    }

    return invalidations.sort((a, b) => {
      const dateA = new Date(a.create_time || 0);
      const dateB = new Date(b.create_time || 0);

      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    throw new AmazonCloudFrontError(
      `Failed to fetch latest invalidations: ${error.message || error}`
    );
  }
};
