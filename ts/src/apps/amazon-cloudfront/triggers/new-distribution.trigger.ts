import { ListDistributionsCommand } from '@aws-sdk/client-cloudfront';
import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';

import { AMAZON_CLOUDFRONT_APP_NAME, AmazonCloudFrontError } from '../constants';
import {
  createCloudFrontClient,
  formatCloudFrontDate,
  formatCloudFrontStatus,
} from '../helpers/constants';

const AmazonCloudFrontNewDistributionTrigger = QoreAppCreator.createLocalizedTrigger({
  app: AMAZON_CLOUDFRONT_APP_NAME,
  action: 'new_distribution',
  action_code: EQoreAppActionCode.EVENT,
  event_function: async (context, update, should_stop) => {
    const { access_key_id, secret_access_key } = getQoreContextRequiredValues({
      context,
      connectionFields: ['access_key_id', 'secret_access_key'],
      ErrorClass: AmazonCloudFrontError,
    });

    const getItems = () => {
      return fetchLatestDistributions({
        access_key_id,
        secret_access_key,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'amazon_cloudfront_new_distribution',
      uniqueField: 'distribution_id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { access_key_id, secret_access_key } = getQoreContextRequiredValues({
      context,
      connectionFields: ['access_key_id', 'secret_access_key'],
      ErrorClass: AmazonCloudFrontError,
    });

    const distributions = await fetchLatestDistributions({
      access_key_id,
      secret_access_key,
    });

    return distributions?.length > 0 ? distributions[0] : null;
  },
  event_info: {
    desc: 'Amazon CloudFront New Distribution Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        distribution_id: { type: 'string' },
        domain_name: { type: 'string' },
        comment: { type: 'string' },
        status: { type: 'string' },
        enabled: { type: 'bool' },
        last_modified_time: { type: 'string' },
        price_class: { type: 'string' },
        origins_count: { type: 'integer' },
        cloudfront_url: { type: 'string' },
        console_url: { type: 'string' },
      },
    },
  },
});

export default AmazonCloudFrontNewDistributionTrigger;

const fetchLatestDistributions = async (options: {
  access_key_id: string;
  secret_access_key: string;
}) => {
  const { access_key_id, secret_access_key } = options;

  try {
    const cloudFrontClient = createCloudFrontClient({
      access_key_id,
      secret_access_key,
      region: 'us-east-1',
    });

    const command = new ListDistributionsCommand({});
    const response = await cloudFrontClient.send(command);

    const distributions: any[] = [];

    if (response.DistributionList && response.DistributionList.Items) {
      for (const distribution of response.DistributionList.Items) {
        if (distribution.Id && distribution.DomainName) {
          distributions.push({
            distribution_id: distribution.Id,
            domain_name: distribution.DomainName,
            comment: distribution.Comment || '',
            status: formatCloudFrontStatus(distribution.Status || ''),
            enabled: distribution.Enabled || false,
            last_modified_time: formatCloudFrontDate(distribution.LastModifiedTime),
            price_class: distribution.PriceClass || 'PriceClass_All',
            origins_count: distribution.Origins?.Items?.length || 0,
            cloudfront_url: `https://${distribution.DomainName}`,
            console_url: `https://console.aws.amazon.com/cloudfront/v3/home#/distributions/${distribution.Id}`,
          });
        }
      }
    }

    return distributions.sort((a, b) => {
      const dateA = new Date(a.last_modified_time || 0);
      const dateB = new Date(b.last_modified_time || 0);

      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    throw new AmazonCloudFrontError(
      `Failed to fetch latest distributions: ${error.message || error}`
    );
  }
};
