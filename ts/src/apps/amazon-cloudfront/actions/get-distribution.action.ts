import { GetDistributionCommand } from '@aws-sdk/client-cloudfront';
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
} satisfies TQoreOptions;

const getDistribution = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AMAZON_CLOUDFRONT_APP_NAME,
  action: 'get_distribution',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { access_key_id, secret_access_key, distribution_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['access_key_id', 'secret_access_key'],
      optionFields: ['distribution_id'],
      ErrorClass: AmazonCloudFrontError,
    });

    try {
      const cloudFrontClient = createCloudFrontClient({
        access_key_id,
        secret_access_key,
        region: 'us-east-1',
      });

      const command = new GetDistributionCommand({
        Id: distribution_id,
      });

      const response = await cloudFrontClient.send(command);
      const distribution = response.Distribution;

      if (!distribution) {
        throw new AmazonCloudFrontError('Distribution not found');
      }

      const origins = (distribution.DistributionConfig?.Origins?.Items || []).map((origin) => ({
        id: origin.Id || '',
        domain_name: origin.DomainName || '',
        origin_path: origin.OriginPath || '',
        custom_origin_config: origin.CustomOriginConfig
          ? {
              http_port: origin.CustomOriginConfig.HTTPPort || 80,
              https_port: origin.CustomOriginConfig.HTTPSPort || 443,
              origin_protocol_policy: origin.CustomOriginConfig.OriginProtocolPolicy || '',
            }
          : null,
        s3_origin_config: origin.S3OriginConfig
          ? {
              origin_access_identity: origin.S3OriginConfig.OriginAccessIdentity || '',
            }
          : null,
      }));

      const cacheBehaviors = (distribution.DistributionConfig?.CacheBehaviors?.Items || []).map(
        (behavior) => ({
          path_pattern: behavior.PathPattern || '',
          target_origin_id: behavior.TargetOriginId || '',
          viewer_protocol_policy: behavior.ViewerProtocolPolicy || '',
          min_ttl: behavior.MinTTL || 0,
          default_ttl: behavior.DefaultTTL || 0,
          max_ttl: behavior.MaxTTL || 0,
          compress: behavior.Compress || false,
        })
      );

      return {
        id: distribution.Id || '',
        arn: distribution.ARN || '',
        domain_name: distribution.DomainName || '',
        status: formatCloudFrontStatus(distribution.Status || ''),
        last_modified_time: formatCloudFrontDate(distribution.LastModifiedTime),
        in_progress_invalidation_batches: distribution.InProgressInvalidationBatches || 0,
        distribution_config: {
          comment: distribution.DistributionConfig?.Comment || '',
          enabled: distribution.DistributionConfig?.Enabled || false,
          price_class: distribution.DistributionConfig?.PriceClass || '',
          http_version: distribution.DistributionConfig?.HttpVersion || '',
          is_ipv6_enabled: distribution.DistributionConfig?.IsIPV6Enabled || false,
          default_root_object: distribution.DistributionConfig?.DefaultRootObject || '',
          web_acl_id: distribution.DistributionConfig?.WebACLId || '',
          aliases: distribution.DistributionConfig?.Aliases?.Items || [],
          origins,
          cache_behaviors: cacheBehaviors,
          default_cache_behavior: distribution.DistributionConfig?.DefaultCacheBehavior
            ? {
                target_origin_id:
                  distribution.DistributionConfig.DefaultCacheBehavior.TargetOriginId || '',
                viewer_protocol_policy:
                  distribution.DistributionConfig.DefaultCacheBehavior.ViewerProtocolPolicy || '',
                min_ttl: distribution.DistributionConfig.DefaultCacheBehavior.MinTTL || 0,
                default_ttl: distribution.DistributionConfig.DefaultCacheBehavior.DefaultTTL || 0,
                max_ttl: distribution.DistributionConfig.DefaultCacheBehavior.MaxTTL || 0,
                compress: distribution.DistributionConfig.DefaultCacheBehavior.Compress || false,
              }
            : null,
        },
        cloudfront_url: `https://${distribution.DomainName}`,
        console_url: `https://console.aws.amazon.com/cloudfront/v3/home#/distributions/${distribution.Id}`,
        etag: response.ETag || '',
        retrieved_at: new Date().toISOString(),
      };
    } catch (error) {
      throw new AmazonCloudFrontError(`Failed to get distribution: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      arn: { type: 'string' },
      domain_name: { type: 'string' },
      status: { type: 'string' },
      last_modified_time: { type: 'string' },
      in_progress_invalidation_batches: { type: 'integer' },
      distribution_config: {
        type: {
          type: 'hash',
          fields: {
            comment: { type: 'string' },
            enabled: { type: 'boolean' },
            price_class: { type: 'string' },
            http_version: { type: 'string' },
            is_ipv6_enabled: { type: 'boolean' },
            default_root_object: { type: 'string' },
            web_acl_id: { type: 'string' },
            aliases: {
              type: {
                type: 'list',
                element_type: 'string',
              },
            },
            origins: {
              type: {
                type: 'list',
                element_type: {
                  type: 'hash',
                  fields: {
                    id: { type: 'string' },
                    domain_name: { type: 'string' },
                    origin_path: { type: 'string' },
                    custom_origin_config: {
                      type: {
                        type: 'hash',
                        fields: {
                          http_port: { type: 'integer' },
                          https_port: { type: 'integer' },
                          origin_protocol_policy: { type: 'string' },
                        },
                      },
                    },
                    s3_origin_config: {
                      type: {
                        type: 'hash',
                        fields: {
                          origin_access_identity: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
            cache_behaviors: {
              type: {
                type: 'list',
                element_type: {
                  type: 'hash',
                  fields: {
                    path_pattern: { type: 'string' },
                    target_origin_id: { type: 'string' },
                    viewer_protocol_policy: { type: 'string' },
                    min_ttl: { type: 'integer' },
                    default_ttl: { type: 'integer' },
                    max_ttl: { type: 'integer' },
                    compress: { type: 'boolean' },
                  },
                },
              },
            },
            default_cache_behavior: {
              type: {
                type: 'hash',
                fields: {
                  target_origin_id: { type: 'string' },
                  viewer_protocol_policy: { type: 'string' },
                  min_ttl: { type: 'integer' },
                  default_ttl: { type: 'integer' },
                  max_ttl: { type: 'integer' },
                  compress: { type: 'boolean' },
                },
              },
            },
          },
        },
      },
      cloudfront_url: { type: 'string' },
      console_url: { type: 'string' },
      etag: { type: 'string' },
      retrieved_at: { type: 'string' },
    },
  },
});

export default getDistribution;
