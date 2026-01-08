import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_ANALYTICS_APP_NAME, GoogleAnalyticsError } from '../constants';
import { createGoogleAnalyticsDataClient } from '../helpers/constants';
import { getGoogleAnalyticsPropertyIdAllowedValues } from '../helpers/get-property-id-allowed-values';
import { GA4_REALTIME_DIMENSIONS, GA4_REALTIME_METRICS } from '../helpers/metrics-allowed-values';

const options = {
  property_id: {
    required: true,
    type: 'string',
    get_allowed_values: getGoogleAnalyticsPropertyIdAllowedValues,
  },
  metrics: {
    required: true,
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          name: {
            type: 'string',
            required: true,
            allowed_values_creatable: true,
            allowed_values: GA4_REALTIME_METRICS,
          },
        },
      },
    },
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
            allowed_values: GA4_REALTIME_DIMENSIONS,
          },
        },
      },
    },
  },
  minute_ranges: {
    required: false,
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          name: {
            type: 'string',
            required: false,
          },
          start_minutes_ago: {
            type: 'integer',
            required: false,
            default_value: 29,
          },
          end_minutes_ago: {
            type: 'integer',
            required: false,
            default_value: 0,
          },
        },
      },
    },
  },
  dimension_filter: {
    required: false,
    type: 'auto',
  },
  metric_filter: {
    required: false,
    type: 'auto',
  },
  order_bys: {
    required: false,
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          field_name: {
            type: 'string',
            required: true,
          },
          desc: {
            type: 'bool',
            required: false,
            default_value: false,
          },
          order_type: {
            type: 'string',
            required: false,
            default_value: 'dimension',
            allowed_values: [
              { value: 'dimension', display_name: 'Dimension' },
              { value: 'metric', display_name: 'Metric' },
            ],
          },
        },
      },
    },
  },
  limit: {
    required: false,
    type: 'integer',
    default_value: 10000,
  },
} satisfies TQoreOptions;

const runRealtimeReport = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_ANALYTICS_APP_NAME,
  action: 'run_realtime_report',
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

    if (!obj?.metrics || obj.metrics.length === 0) {
      throw new GoogleAnalyticsError('At least one metric is required');
    }

    try {
      const client = createGoogleAnalyticsDataClient(token);

      const metrics = obj.metrics.map((metric) => ({ name: metric.name }));

      const dimensions = obj.dimensions?.map((dim) => ({ name: dim.name })) || [];

      const minuteRanges = obj.minute_ranges?.map((range) => ({
        name: range.name,
        startMinutesAgo: range.start_minutes_ago,
        endMinutesAgo: range.end_minutes_ago,
      }));

      const orderBys = obj.order_bys?.map((order) => {
        if (order.order_type === 'metric') {
          return {
            metric: { metricName: order.field_name },
            desc: order.desc || false,
          };
        }
        return {
          dimension: { dimensionName: order.field_name },
          desc: order.desc || false,
        };
      });

      const [response] = await client.runRealtimeReport({
        property: obj.property_id,
        metrics,
        dimensions: dimensions.length > 0 ? dimensions : undefined,
        minuteRanges: minuteRanges && minuteRanges.length > 0 ? minuteRanges : undefined,
        dimensionFilter: obj.dimension_filter || undefined,
        metricFilter: obj.metric_filter || undefined,
        orderBys: orderBys && orderBys.length > 0 ? orderBys : undefined,
        limit: obj.limit || 10000,
      });

      const dimensionHeaders =
        response.dimensionHeaders?.map((header) => ({
          name: header.name,
        })) || [];

      const metricHeaders =
        response.metricHeaders?.map((header) => ({
          name: header.name,
          type: header.type,
        })) || [];

      const rows =
        response.rows?.map((row) => ({
          dimension_values: row.dimensionValues?.map((dv) => ({ value: dv.value })) || [],
          metric_values: row.metricValues?.map((mv) => ({ value: mv.value })) || [],
        })) || [];

      return {
        row_count: response.rowCount || 0,
        dimension_headers: dimensionHeaders,
        metric_headers: metricHeaders,
        rows,
        property_quota: response.propertyQuota
          ? {
              tokens_per_day: response.propertyQuota.tokensPerDay,
              tokens_per_hour: response.propertyQuota.tokensPerHour,
              concurrent_requests: response.propertyQuota.concurrentRequests,
              server_errors_per_project_per_hour: response.propertyQuota.serverErrorsPerProjectPerHour,
            }
          : undefined,
      };
    } catch (error) {
      throw new GoogleAnalyticsError(`Failed to run real-time report: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      row_count: { type: 'integer' },
      dimension_headers: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              name: { type: 'string' },
            },
          },
        },
      },
      metric_headers: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              name: { type: 'string' },
              type: { type: 'string' },
            },
          },
        },
      },
      rows: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              dimension_values: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      value: { type: 'string' },
                    },
                  },
                },
              },
              metric_values: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      value: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      property_quota: {
        type: {
          type: 'hash',
          fields: {
            tokens_per_day: { type: 'auto' },
            tokens_per_hour: { type: 'auto' },
            concurrent_requests: { type: 'auto' },
            server_errors_per_project_per_hour: { type: 'auto' },
          },
        },
      },
    },
  },
});

export default runRealtimeReport;
