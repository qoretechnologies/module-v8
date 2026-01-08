import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { protos } from '@google-analytics/data';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_ANALYTICS_APP_NAME, GoogleAnalyticsError } from '../constants';
import { createGoogleAnalyticsDataClient } from '../helpers/constants';
import { GA4_COMMON_DIMENSIONS } from '../helpers/dimensions-allowed-values';
import { getGoogleAnalyticsPropertyIdAllowedValues } from '../helpers/get-property-id-allowed-values';
import { GA4_COMMON_METRICS } from '../helpers/metrics-allowed-values';

type IDimensionCompatibility = protos.google.analytics.data.v1beta.IDimensionCompatibility;
type IMetricCompatibility = protos.google.analytics.data.v1beta.IMetricCompatibility;

const options = {
  property_id: {
    required: true,
    type: 'string',
    get_allowed_values: getGoogleAnalyticsPropertyIdAllowedValues,
  },
  dimensions: {
    required: false,
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          name: {
            type: 'string',
            required: true,
            allowed_values_creatable: true,
            allowed_values: GA4_COMMON_DIMENSIONS,
          },
        },
      },
    },
  },
  metrics: {
    required: false,
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          name: {
            type: 'string',
            required: true,
            allowed_values_creatable: true,
            allowed_values: GA4_COMMON_METRICS,
          },
        },
      },
    },
  },
  compatibility_filter: {
    required: false,
    type: 'string',
    allowed_values: [
      { value: 'COMPATIBLE', display_name: 'Compatible Only' },
      { value: 'INCOMPATIBLE', display_name: 'Incompatible Only' },
    ],
  },
} satisfies TQoreOptions;

const checkCompatibility = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_ANALYTICS_APP_NAME,
  action: 'check_compatibility',
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

    if ((!obj?.dimensions || obj.dimensions.length === 0) && (!obj?.metrics || obj.metrics.length === 0)) {
      throw new GoogleAnalyticsError('At least one dimension or metric is required');
    }

    try {
      const client = createGoogleAnalyticsDataClient(token);

      const dimensions = obj.dimensions?.map((dim) => ({ name: dim.name })) || [];
      const metrics = obj.metrics?.map((metric) => ({ name: metric.name })) || [];

      const response = await client.checkCompatibility({
        property: obj.property_id,
        dimensions: dimensions.length > 0 ? dimensions : undefined,
        metrics: metrics.length > 0 ? metrics : undefined,
        compatibilityFilter:
          (obj.compatibility_filter as 'COMPATIBLE' | 'INCOMPATIBLE' | undefined) || undefined,
      });

      const dimensionCompatibilities =
        response[0].dimensionCompatibilities?.map((dc: IDimensionCompatibility) => ({
          dimension: {
            api_name: dc.dimensionMetadata?.apiName,
            ui_name: dc.dimensionMetadata?.uiName,
            description: dc.dimensionMetadata?.description,
          },
          compatibility: dc.compatibility,
        })) || [];

      const metricCompatibilities =
        response[0].metricCompatibilities?.map((mc: IMetricCompatibility) => ({
          metric: {
            api_name: mc.metricMetadata?.apiName,
            ui_name: mc.metricMetadata?.uiName,
            description: mc.metricMetadata?.description,
          },
          compatibility: mc.compatibility,
        })) || [];

      type CompatibilityResult = { compatibility: string | number | null | undefined };
      const compatibleDimensions = dimensionCompatibilities.filter(
        (d: CompatibilityResult) => d.compatibility === 'COMPATIBLE'
      );
      const incompatibleDimensions = dimensionCompatibilities.filter(
        (d: CompatibilityResult) => d.compatibility === 'INCOMPATIBLE'
      );
      const compatibleMetrics = metricCompatibilities.filter(
        (m: CompatibilityResult) => m.compatibility === 'COMPATIBLE'
      );
      const incompatibleMetrics = metricCompatibilities.filter(
        (m: CompatibilityResult) => m.compatibility === 'INCOMPATIBLE'
      );

      return {
        dimension_compatibilities: dimensionCompatibilities,
        metric_compatibilities: metricCompatibilities,
        summary: {
          total_dimensions: dimensionCompatibilities.length,
          compatible_dimensions: compatibleDimensions.length,
          incompatible_dimensions: incompatibleDimensions.length,
          total_metrics: metricCompatibilities.length,
          compatible_metrics: compatibleMetrics.length,
          incompatible_metrics: incompatibleMetrics.length,
          all_compatible:
            incompatibleDimensions.length === 0 && incompatibleMetrics.length === 0,
        },
      };
    } catch (error) {
      throw new GoogleAnalyticsError(`Failed to check compatibility: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      dimension_compatibilities: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              dimension: {
                type: {
                  type: 'hash',
                  fields: {
                    api_name: { type: 'string' },
                    ui_name: { type: 'string' },
                    description: { type: 'string' },
                  },
                },
              },
              compatibility: { type: 'string' },
            },
          },
        },
      },
      metric_compatibilities: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              metric: {
                type: {
                  type: 'hash',
                  fields: {
                    api_name: { type: 'string' },
                    ui_name: { type: 'string' },
                    description: { type: 'string' },
                  },
                },
              },
              compatibility: { type: 'string' },
            },
          },
        },
      },
      summary: {
        type: {
          type: 'hash',
          fields: {
            total_dimensions: { type: 'integer' },
            compatible_dimensions: { type: 'integer' },
            incompatible_dimensions: { type: 'integer' },
            total_metrics: { type: 'integer' },
            compatible_metrics: { type: 'integer' },
            incompatible_metrics: { type: 'integer' },
            all_compatible: { type: 'bool' },
          },
        },
      },
    },
  },
});

export default checkCompatibility;
