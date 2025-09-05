import { ListInvalidationsCommand } from '@aws-sdk/client-cloudfront';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
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

const listInvalidations = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AMAZON_CLOUDFRONT_APP_NAME,
  action: 'list_invalidations',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { access_key_id, secret_access_key, distribution_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['access_key_id', 'secret_access_key'],
      optionFields: ['distribution_id'],
      ErrorClass: AmazonCloudFrontError,
    });

    const { max_items, marker } = obj || {};

    try {
      const cloudFrontClient = createCloudFrontClient({
        access_key_id,
        secret_access_key,
        region: 'us-east-1',
      });

      const command = new ListInvalidationsCommand({
        DistributionId: distribution_id,
        MaxItems: max_items || 100,
        ...(marker && { Marker: marker }),
      });

      const response = await cloudFrontClient.send(command);

      const invalidations = (response.InvalidationList?.Items || []).map((invalidation) => {
        return {
          id: invalidation.Id || '',
          status: invalidation.Status || '',
          create_time: formatCloudFrontDate(invalidation.CreateTime),
        };
      });

      return {
        distribution_id,
        invalidation_count: invalidations.length,
        is_truncated: response.InvalidationList?.IsTruncated || false,
        max_items: response.InvalidationList?.MaxItems || 0,
        next_marker: response.InvalidationList?.NextMarker || '',
        invalidations,
        console_url: `https://console.aws.amazon.com/cloudfront/v3/home#/distributions/${distribution_id}/invalidations`,
        retrieved_at: new Date().toISOString(),
      };
    } catch (error) {
      throw new AmazonCloudFrontError(`Failed to list invalidations: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      distribution_id: { type: 'string' },
      invalidation_count: { type: 'integer' },
      is_truncated: { type: 'boolean' },
      max_items: { type: 'integer' },
      next_marker: { type: 'string' },
      invalidations: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              status: { type: 'string' },
              create_time: { type: 'string' },
            },
          },
        },
      },
      console_url: { type: 'string' },
      retrieved_at: { type: 'string' },
    },
  },
});

export default listInvalidations;
