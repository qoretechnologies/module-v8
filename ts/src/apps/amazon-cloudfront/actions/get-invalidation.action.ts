import { GetInvalidationCommand } from '@aws-sdk/client-cloudfront';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { AMAZON_CLOUDFRONT_APP_NAME, AmazonCloudFrontError } from '../constants';
import { createCloudFrontClient, formatCloudFrontDate } from '../helpers/constants';
import { getAmazonCloudFrontDistributionAllowedValues } from '../helpers/get-distribution-allowed-values';
import { getAmazonCloudFrontInvalidationAllowedValues } from '../helpers/get-invalidation-allowed-values';

const options = {
  distribution_id: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getAmazonCloudFrontDistributionAllowedValues,
    on_change: ['refetch'],
  },
  invalidation_id: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getAmazonCloudFrontInvalidationAllowedValues,
    depends_on: ['distribution_id'],
  },
} satisfies TQoreOptions;

const getInvalidation = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AMAZON_CLOUDFRONT_APP_NAME,
  action: 'get_invalidation',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { access_key_id, secret_access_key, distribution_id, invalidation_id } =
      getQoreContextRequiredValues({
        context: { ...context, opts: obj },
        connectionFields: ['access_key_id', 'secret_access_key'],
        optionFields: ['distribution_id', 'invalidation_id'],
        ErrorClass: AmazonCloudFrontError,
      });

    try {
      const cloudFrontClient = createCloudFrontClient({
        access_key_id,
        secret_access_key,
        region: 'us-east-1',
      });

      const command = new GetInvalidationCommand({
        DistributionId: distribution_id,
        Id: invalidation_id,
      });

      const response = await cloudFrontClient.send(command);
      const invalidation = response.Invalidation;

      if (!invalidation) {
        throw new AmazonCloudFrontError('Invalidation not found');
      }

      const paths = invalidation.InvalidationBatch?.Paths?.Items || [];
      const callerReference = invalidation.InvalidationBatch?.CallerReference || '';

      return {
        invalidation_id: invalidation.Id || '',
        distribution_id,
        status: invalidation.Status || '',
        create_time: formatCloudFrontDate(invalidation.CreateTime),
        caller_reference: callerReference,
        invalidation_batch: {
          paths: {
            quantity: invalidation.InvalidationBatch?.Paths?.Quantity || 0,
            items: paths,
          },
          caller_reference: callerReference,
        },
        paths_count: paths.length,
        paths_summary:
          paths.length > 0
            ? paths.slice(0, 5).join(', ') + (paths.length > 5 ? '...' : '')
            : 'No paths',
        console_url: `https://console.aws.amazon.com/cloudfront/v3/home#/distributions/${distribution_id}/invalidations`,
        retrieved_at: new Date().toISOString(),
      };
    } catch (error) {
      throw new AmazonCloudFrontError(`Failed to get invalidation: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      invalidation_id: { type: 'string' },
      distribution_id: { type: 'string' },
      status: { type: 'string' },
      create_time: { type: 'string' },
      caller_reference: { type: 'string' },
      invalidation_batch: {
        type: {
          type: 'hash',
          fields: {
            paths: {
              type: {
                type: 'hash',
                fields: {
                  quantity: { type: 'integer' },
                  items: {
                    type: {
                      type: 'list',
                      element_type: 'string',
                    },
                  },
                },
              },
            },
            caller_reference: { type: 'string' },
          },
        },
      },
      paths_count: { type: 'integer' },
      paths_summary: { type: 'string' },
      console_url: { type: 'string' },
      retrieved_at: { type: 'string' },
    },
  },
});

export default getInvalidation;
