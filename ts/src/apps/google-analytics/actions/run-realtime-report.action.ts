import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreAppActionOption,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
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

      console.log('run_realtime_report - Raw API response:');
      console.dir({
        rowCount: response.rowCount,
        dimensionHeaders: response.dimensionHeaders,
        metricHeaders: response.metricHeaders,
        rows: response.rows,
      }, { depth: null });

      // Build dimension and metric header maps for name lookup
      const dimHeaders = response.dimensionHeaders || dimensions.map((d) => ({ name: d.name }));
      const metHeaders =
        response.metricHeaders || metrics.map((m) => ({ name: m.name, type: 'TYPE_INTEGER' }));

      // Transform rows to user-friendly objects with named fields
      const rows =
        response.rows?.map((row) => {
          const rowObj: Record<string, string | number> = {};

          // Add dimensions as named fields
          row.dimensionValues?.forEach((dv, i) => {
            const name = dimHeaders[i]?.name;
            if (name) {
              rowObj[name] = dv.value || '';
            }
          });

          // Add metrics as named fields with type conversion
          row.metricValues?.forEach((mv, i) => {
            const header = metHeaders[i];
            const name = header?.name;
            if (name) {
              // Convert to number for integer/float types
              const type = String(header?.type || 'TYPE_INTEGER');
              rowObj[name] =
                type.includes('INTEGER') || type.includes('FLOAT')
                  ? Number(mv.value)
                  : mv.value || '';
            }
          });

          return rowObj;
        }) || [];

      const result = {
        row_count: response.rowCount || 0,
        rows,
      };

      console.log('run_realtime_report - Transformed result:');
      console.dir(result, { depth: null });

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new GoogleAnalyticsError(`Failed to run real-time report: ${message}`);
    }
  },
  get_dynamic_response_type: async (context) => {
    const metrics = (context?.opts?.metrics as Array<{ name: string }>) || [];
    const dimensions = (context?.opts?.dimensions as Array<{ name: string }>) || [];

    const rowFields: Record<string, TQoreAppActionOption> = {};

    // Add dimension fields as strings
    dimensions.forEach((dim) => {
      if (dim.name) {
        rowFields[dim.name] = { type: 'string' };
      }
    });

    // Add metric fields as numbers
    metrics.forEach((metric) => {
      if (metric.name) {
        rowFields[metric.name] = { type: 'number' };
      }
    });

    return {
      type: 'hash',
      fields: {
        row_count: { type: 'integer' },
        rows: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: rowFields,
            },
          },
        },
      },
    };
  },
  response_type: {
    type: 'hash',
    fields: {
      row_count: { type: 'integer' },
      rows: {
        type: {
          type: 'list',
          element_type: 'auto',
        },
      },
    },
  },
});

export default runRealtimeReport;
