import {
  GetDistributionConfigCommand,
  UpdateDistributionCommand,
} from '@aws-sdk/client-cloudfront';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { AMAZON_CLOUDFRONT_APP_NAME, AmazonCloudFrontError } from '../constants';
import {
  createCloudFrontClient,
  formatCloudFrontDate,
  formatCloudFrontStatus,
} from '../helpers/constants';
import { getAmazonCloudFrontDistributionAllowedValues } from '../helpers/get-distribution-allowed-values';

const options = {
  distribution_id: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getAmazonCloudFrontDistributionAllowedValues,
  },
  enabled: {
    required: true,
    type: 'boolean',
    preselected: true,
    display_name: 'Enable Distribution',
    short_desc: 'Set to true to enable the distribution, false to disable it',
  },
} satisfies TQoreOptions;

const updateDistributionStatus = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AMAZON_CLOUDFRONT_APP_NAME,
  action: 'update_distribution_status',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { access_key_id, secret_access_key, distribution_id, enabled } =
      getQoreContextRequiredValues({
        context: { ...context, opts: obj },
        connectionFields: ['access_key_id', 'secret_access_key'],
        optionFields: ['distribution_id', 'enabled'],
        ErrorClass: AmazonCloudFrontError,
      });

    try {
      const cloudFrontClient = createCloudFrontClient({
        access_key_id,
        secret_access_key,
        region: 'us-east-1',
      });

      const getConfigCommand = new GetDistributionConfigCommand({
        Id: distribution_id,
      });

      const configResponse = await cloudFrontClient.send(getConfigCommand);

      if (!configResponse.DistributionConfig || !configResponse.ETag) {
        throw new AmazonCloudFrontError('Failed to retrieve distribution configuration');
      }

      const updatedConfig = {
        ...configResponse.DistributionConfig,
        Enabled: enabled,
      };

      const updateCommand = new UpdateDistributionCommand({
        Id: distribution_id,
        DistributionConfig: updatedConfig,
        IfMatch: configResponse.ETag,
      });

      const response = await cloudFrontClient.send(updateCommand);
      const distribution = response.Distribution;

      if (!distribution) {
        throw new AmazonCloudFrontError('Failed to update distribution');
      }

      return {
        distribution_id: distribution.Id || '',
        domain_name: distribution.DomainName || '',
        status: formatCloudFrontStatus(distribution.Status || ''),
        enabled: distribution.DistributionConfig?.Enabled || false,
        last_modified_time: formatCloudFrontDate(distribution.LastModifiedTime),
        cloudfront_url: `https://${distribution.DomainName}`,
        console_url: `https://console.aws.amazon.com/cloudfront/v3/home#/distributions/${distribution.Id}`,
        etag: response.ETag || '',
        updated_at: new Date().toISOString(),
        success: true,
        message: `Distribution ${enabled ? 'enabled' : 'disabled'} successfully. Changes are being deployed.`,
      };
    } catch (error) {
      throw new AmazonCloudFrontError(
        `Failed to update distribution status: ${error.message || error}`
      );
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      distribution_id: { type: 'string' },
      domain_name: { type: 'string' },
      status: { type: 'string' },
      enabled: { type: 'boolean' },
      last_modified_time: { type: 'string' },
      cloudfront_url: { type: 'string' },
      console_url: { type: 'string' },
      etag: { type: 'string' },
      updated_at: { type: 'string' },
      success: { type: 'boolean' },
      message: { type: 'string' },
    },
  },
});

export default updateDistributionStatus;
