import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
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
  requests: {
    required: true,
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          date_ranges: {
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
            required: true,
          },
          metrics: {
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
            required: true,
          },
          dimensions: {
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
            required: false,
          },
          limit: {
            type: 'integer',
            required: false,
            default_value: 10000,
          },
        },
      },
    },
  },
} satisfies TQoreOptions;

const batchRunReports = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_ANALYTICS_APP_NAME,
  action: 'batch_run_reports',
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

    if (!obj?.requests || obj.requests.length === 0) {
      throw new GoogleAnalyticsError('At least one report request is required');
    }

    if (obj.requests.length > 5) {
      throw new GoogleAnalyticsError('Maximum of 5 report requests allowed per batch');
    }

    try {
      const client = createGoogleAnalyticsDataClient(token);

      const requests = obj.requests.map((req) => ({
        dateRanges: req.date_ranges.map((range) => ({
          startDate: range.start_date,
          endDate: range.end_date,
        })),
        metrics: req.metrics.map((metric) => ({ name: metric.name })),
        dimensions: req.dimensions?.map((dim) => ({ name: dim.name })) || undefined,
        limit: req.limit || 10000,
      }));

      const [response] = await client.batchRunReports({
        property: obj.property_id,
        requests,
      });

      const reports =
        response.reports?.map((report) => ({
          row_count: report.rowCount || 0,
          dimension_headers:
            report.dimensionHeaders?.map((header) => ({
              name: header.name,
            })) || [],
          metric_headers:
            report.metricHeaders?.map((header) => ({
              name: header.name,
              type: header.type,
            })) || [],
          rows:
            report.rows?.map((row) => ({
              dimension_values: row.dimensionValues?.map((dv) => ({ value: dv.value })) || [],
              metric_values: row.metricValues?.map((mv) => ({ value: mv.value })) || [],
            })) || [],
          metadata: report.metadata
            ? {
                currency_code: report.metadata.currencyCode,
                time_zone: report.metadata.timeZone,
              }
            : undefined,
        })) || [];

      return {
        reports,
        report_count: reports.length,
      };
    } catch (error) {
      throw new GoogleAnalyticsError(`Failed to run batch reports: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      report_count: { type: 'integer' },
      reports: {
        type: {
          type: 'list',
          element_type: {
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
              metadata: {
                type: {
                  type: 'hash',
                  fields: {
                    currency_code: { type: 'string' },
                    time_zone: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
});

export default batchRunReports;
