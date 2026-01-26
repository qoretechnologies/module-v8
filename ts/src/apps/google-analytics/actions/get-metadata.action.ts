import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_ANALYTICS_APP_NAME, GoogleAnalyticsError } from '../constants';
import { createGoogleAnalyticsDataClient } from '../helpers/constants';
import { getGoogleAnalyticsPropertyIdAllowedValues } from '../helpers/get-property-id-allowed-values';

const options = {
  property_id: {
    required: true,
    type: 'string',
    get_allowed_values: getGoogleAnalyticsPropertyIdAllowedValues,
  },
} satisfies TQoreOptions;

const getMetadata = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_ANALYTICS_APP_NAME,
  action: 'get_metadata',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues<{ token: string }>({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: GoogleAnalyticsError,
    });

    if (!obj?.property_id) {
      throw new GoogleAnalyticsError('Property ID is required');
    }

    try {
      const client = createGoogleAnalyticsDataClient(token);

      const [response] = await client.getMetadata({
        name: `${obj.property_id}/metadata`,
      });

      const dimensions =
        response.dimensions?.map((dim) => ({
          api_name: dim.apiName,
          ui_name: dim.uiName,
          description: dim.description,
          category: dim.category,
          custom_definition: dim.customDefinition || false,
          deprecated_api_names: dim.deprecatedApiNames || [],
        })) || [];

      const metrics =
        response.metrics?.map((metric) => ({
          api_name: metric.apiName,
          ui_name: metric.uiName,
          description: metric.description,
          category: metric.category,
          type: metric.type,
          custom_definition: metric.customDefinition || false,
          deprecated_api_names: metric.deprecatedApiNames || [],
          expression: metric.expression,
        })) || [];

      return {
        name: response.name,
        dimensions,
        metrics,
        dimension_count: dimensions.length,
        metric_count: metrics.length,
      };
    } catch (error) {
      throw new GoogleAnalyticsError(`Failed to get metadata: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      name: { type: 'string' },
      dimension_count: { type: 'integer' },
      metric_count: { type: 'integer' },
      dimensions: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              api_name: { type: 'string' },
              ui_name: { type: 'string' },
              description: { type: 'string' },
              category: { type: 'string' },
              custom_definition: { type: 'bool' },
              deprecated_api_names: {
                type: {
                  type: 'list',
                  element_type: 'string',
                },
              },
            },
          },
        },
      },
      metrics: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              api_name: { type: 'string' },
              ui_name: { type: 'string' },
              description: { type: 'string' },
              category: { type: 'string' },
              type: { type: 'string' },
              custom_definition: { type: 'bool' },
              deprecated_api_names: {
                type: {
                  type: 'list',
                  element_type: 'string',
                },
              },
              expression: { type: 'string' },
            },
          },
        },
      },
    },
  },
});

export default getMetadata;
