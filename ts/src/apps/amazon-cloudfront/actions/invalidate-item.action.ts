import { CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';
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
  paths: {
    required: true,
    type: {
      type: 'list',
      element_type: 'string',
    },
  },
  caller_reference: {
    required: false,
    type: 'string',
  },
} satisfies TQoreOptions;

const invalidateItem = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AMAZON_CLOUDFRONT_APP_NAME,
  action: 'invalidate_item',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { access_key_id, secret_access_key, distribution_id, paths } =
      getQoreContextRequiredValues({
        context: { ...context, opts: obj },
        connectionFields: ['access_key_id', 'secret_access_key'],
        optionFields: ['distribution_id', 'paths'],
        ErrorClass: AmazonCloudFrontError,
      });

    const { caller_reference } = obj || {};

    if (!paths || paths.length === 0) {
      throw new AmazonCloudFrontError('At least one path must be provided for invalidation');
    }

    const validPaths = paths.map((path: string) => {
      if (!path.startsWith('/')) {
        return `/${path}`;
      }

      return path;
    });

    try {
      const cloudFrontClient = createCloudFrontClient({
        access_key_id,
        secret_access_key,
        region: 'us-east-1',
      });

      const finalCallerReference =
        caller_reference ||
        `invalidation-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

      const command = new CreateInvalidationCommand({
        DistributionId: distribution_id,
        InvalidationBatch: {
          Paths: {
            Quantity: validPaths.length,
            Items: validPaths,
          },
          CallerReference: finalCallerReference,
        },
      });

      const response = await cloudFrontClient.send(command);
      const invalidation = response.Invalidation;

      if (!invalidation) {
        throw new AmazonCloudFrontError('Failed to create invalidation');
      }

      return {
        invalidation_id: invalidation.Id || '',
        distribution_id,
        status: invalidation.Status || '',
        create_time: formatCloudFrontDate(invalidation.CreateTime),
        caller_reference: invalidation.InvalidationBatch?.CallerReference || finalCallerReference,
        paths: validPaths,
        paths_count: validPaths.length,
        location: response.Location || '',
        console_url: `https://console.aws.amazon.com/cloudfront/v3/home#/distributions/${distribution_id}/invalidations`,
        created_at: new Date().toISOString(),
        success: true,
        message: `Invalidation created successfully for ${validPaths.length} path(s)`,
      };
    } catch (error) {
      throw new AmazonCloudFrontError(`Failed to create invalidation: ${error.message || error}`);
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
      paths: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
      paths_count: { type: 'integer' },
      location: { type: 'string' },
      console_url: { type: 'string' },
      created_at: { type: 'string' },
      success: { type: 'boolean' },
      message: { type: 'string' },
    },
  },
});

export default invalidateItem;
