import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreAppActionOption,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_ANALYTICS_APP_NAME, GoogleAnalyticsError } from '../constants';
import { createGoogleAnalyticsDataClient } from '../helpers/constants';
import { GA4_COMMON_DIMENSIONS } from '../helpers/dimensions-allowed-values';
import { getGoogleAnalyticsPropertyIdAllowedValues } from '../helpers/get-property-id-allowed-values';
import { GA4_COMMON_METRICS } from '../helpers/metrics-allowed-values';

const options = {
  property_id: {
    required: true,
    type: 'string',
    get_allowed_values: getGoogleAnalyticsPropertyIdAllowedValues,
  },
  date_ranges: {
    required: true,
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          start_date: {
            type: 'string',
            required: true,
          },
          end_date: {
            type: 'string',
            required: true,
          },
        },
      },
    },
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
            allowed_values: GA4_COMMON_METRICS,
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
            allowed_values: GA4_COMMON_DIMENSIONS,
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
  offset: {
    required: false,
    type: 'integer',
    default_value: 0,
  },
  keep_empty_rows: {
    required: false,
    type: 'bool',
    default_value: false,
  },
  return_property_quota: {
    required: false,
    type: 'bool',
    default_value: false,
  },
} satisfies TQoreOptions;

const runReport = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_ANALYTICS_APP_NAME,
  action: 'run_report',
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

    if (!obj?.date_ranges || obj.date_ranges.length === 0) {
      throw new GoogleAnalyticsError('At least one date range is required');
    }

    if (!obj?.metrics || obj.metrics.length === 0) {
      throw new GoogleAnalyticsError('At least one metric is required');
    }

    try {
      const client = createGoogleAnalyticsDataClient(token);

      const dateRanges = obj.date_ranges.map((range) => ({
        startDate: range.start_date,
        endDate: range.end_date,
      }));

      const metrics = obj.metrics.map((metric) => ({ name: metric.name }));

      const dimensions = obj.dimensions?.map((dim) => ({ name: dim.name })) || [];

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

      const [response] = await client.runReport({
        property: obj.property_id,
        dateRanges,
        metrics,
        dimensions: dimensions.length > 0 ? dimensions : undefined,
        dimensionFilter: obj.dimension_filter || undefined,
        metricFilter: obj.metric_filter || undefined,
        orderBys: orderBys && orderBys.length > 0 ? orderBys : undefined,
        limit: obj.limit || 10000,
        offset: obj.offset ? String(obj.offset) : undefined,
        keepEmptyRows: obj.keep_empty_rows || false,
        returnPropertyQuota: obj.return_property_quota || false,
      });

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

      return {
        row_count: response.rowCount || 0,
        rows,
        metadata: response.metadata
          ? {
              currency_code: response.metadata.currencyCode,
              time_zone: response.metadata.timeZone,
            }
          : undefined,
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
      const message = error instanceof Error ? error.message : String(error);
      throw new GoogleAnalyticsError(`Failed to run report: ${message}`);
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
        metadata: {
          type: {
            type: 'hash',
            fields: {
              currency_code: { type: 'string' },
              time_zone: { type: 'string' },
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
      metadata: {
        type: {
          type: 'hash',
          fields: {
            currency_code: { type: 'string' },
            time_zone: { type: 'string' },
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

export default runReport;
