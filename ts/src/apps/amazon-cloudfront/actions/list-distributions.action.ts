import { ListDistributionsCommand } from '@aws-sdk/client-cloudfront';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { AMAZON_CLOUDFRONT_APP_NAME, AmazonCloudFrontError } from '../constants';
import {
  createCloudFrontClient,
  formatCloudFrontDate,
  formatCloudFrontStatus,
} from '../helpers/constants';

const options = {
  max_items: {
    required: false,
    type: 'integer',
    default_value: 100,
  },
  marker: {
    required: false,
    type: 'string',
  },
} satisfies TQoreOptions;

const listDistributions = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AMAZON_CLOUDFRONT_APP_NAME,
  action: 'list_distributions',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { access_key_id, secret_access_key } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['access_key_id', 'secret_access_key'],
      ErrorClass: AmazonCloudFrontError,
    });

    const { max_items, marker } = obj || {};

    try {
      const cloudFrontClient = createCloudFrontClient({
        access_key_id,
        secret_access_key,
        region: 'us-east-1',
      });

      const command = new ListDistributionsCommand({
        MaxItems: max_items || 100,
        ...(marker && { Marker: marker }),
      });

      const response = await cloudFrontClient.send(command);

      const distributions = (response.DistributionList?.Items || []).map((distribution) => ({
        id: distribution.Id || '',
        arn: distribution.ARN || '',
        domain_name: distribution.DomainName || '',
        comment: distribution.Comment || '',
        status: formatCloudFrontStatus(distribution.Status || ''),
        enabled: distribution.Enabled || false,
        last_modified_time: formatCloudFrontDate(distribution.LastModifiedTime),
        price_class: distribution.PriceClass || '',
        http_version: distribution.HttpVersion || '',
        web_acl_id: distribution.WebACLId || '',
        origins_count: distribution.Origins?.Quantity || 0,
        aliases_count: distribution.Aliases?.Quantity || 0,
        aliases: distribution.Aliases?.Items || [],
        cloudfront_url: `https://${distribution.DomainName}`,
        console_url: `https://console.aws.amazon.com/cloudfront/v3/home#/distributions/${distribution.Id}`,
      }));

      return {
        distribution_count: distributions.length,
        is_truncated: response.DistributionList?.IsTruncated || false,
        max_items: response.DistributionList?.MaxItems || 0,
        next_marker: response.DistributionList?.NextMarker || '',
        distributions,
        retrieved_at: new Date().toISOString(),
      };
    } catch (error) {
      throw new AmazonCloudFrontError(`Failed to list distributions: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      distribution_count: { type: 'integer' },
      is_truncated: { type: 'boolean' },
      max_items: { type: 'integer' },
      next_marker: { type: 'string' },
      distributions: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              arn: { type: 'string' },
              domain_name: { type: 'string' },
              comment: { type: 'string' },
              status: { type: 'string' },
              enabled: { type: 'boolean' },
              last_modified_time: { type: 'string' },
              price_class: { type: 'string' },
              http_version: { type: 'string' },
              web_acl_id: { type: 'string' },
              origins_count: { type: 'integer' },
              aliases_count: { type: 'integer' },
              aliases: {
                type: {
                  type: 'list',
                  element_type: 'string',
                },
              },
              default_root_object: { type: 'string' },
              cloudfront_url: { type: 'string' },
              console_url: { type: 'string' },
            },
          },
        },
      },
      retrieved_at: { type: 'string' },
    },
  },
});

export default listDistributions;
