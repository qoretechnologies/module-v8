/* eslint-disable max-len */
const GoogleAnalyticsAppEn = {
  displayName: 'Google Analytics',
  groups: ['Analytics & Reporting', 'Google Workspace Suite'],
  shortDesc: 'Connect with Google Analytics 4 to access your website and app analytics data',
  longDesc:
    'Integrate with Google Analytics 4 (GA4) to run reports, access real-time data, and analyze metrics and dimensions. This integration supports standard reports, real-time analytics, metadata discovery, batch reporting, and compatibility checks for your analytics properties.',
  actions: {
    run_report: {
      displayName: 'Run Report',
      shortDesc: 'Execute a standard Google Analytics 4 report',
      longDesc:
        'Run a customized analytics report with specified metrics, dimensions, date ranges, and filters. Supports pagination for large result sets and various sorting options.',
      options: {
        property_id: {
          displayName: 'Property',
          shortDesc: 'The Google Analytics 4 property to query',
          longDesc: 'Select the GA4 property from which to retrieve analytics data.',
        },
        date_ranges: {
          displayName: 'Date Ranges',
          shortDesc: 'The date ranges for the report',
          longDesc:
            'Specify one or more date ranges for the report. Dates can be in YYYY-MM-DD format or relative values like "7daysAgo", "yesterday", "today".',
          type: {
            element_type: {
              fields: {
                start_date: {
                  displayName: 'Start Date',
                  shortDesc: 'The start date of the range',
                  longDesc:
                    'The inclusive start date for the query in YYYY-MM-DD format, or relative date like "7daysAgo", "yesterday".',
                },
                end_date: {
                  displayName: 'End Date',
                  shortDesc: 'The end date of the range',
                  longDesc:
                    'The inclusive end date for the query in YYYY-MM-DD format, or relative date like "today", "yesterday".',
                },
              },
            },
          },
        },
        metrics: {
          displayName: 'Metrics',
          shortDesc: 'The metrics to include in the report',
          longDesc:
            'Select the quantitative measurements to include (e.g., activeUsers, sessions, pageViews). You can include up to 10 metrics per report.',
          type: {
            element_type: {
              fields: {
                name: {
                  displayName: 'Metric Name',
                  shortDesc: 'The API name of the metric',
                  longDesc: 'The API name of the metric to include in the report.',
                },
              },
            },
          },
        },
        dimensions: {
          displayName: 'Dimensions',
          shortDesc: 'The dimensions to segment the report by',
          longDesc:
            'Select the attributes to segment your data by (e.g., country, browser, pagePath). Dimensions are optional and allow you to break down metrics by specific categories.',
          type: {
            element_type: {
              fields: {
                name: {
                  displayName: 'Dimension Name',
                  shortDesc: 'The API name of the dimension',
                  longDesc: 'The API name of the dimension to include in the report.',
                },
              },
            },
          },
        },
        dimension_filter: {
          displayName: 'Dimension Filter',
          shortDesc: 'Filter expression for dimensions',
          longDesc:
            'An advanced filter expression to filter report data based on dimension values. Use the GA4 filter expression syntax.',
        },
        metric_filter: {
          displayName: 'Metric Filter',
          shortDesc: 'Filter expression for metrics',
          longDesc:
            'An advanced filter expression to filter report data based on metric values. Use the GA4 filter expression syntax.',
        },
        order_bys: {
          displayName: 'Order By',
          shortDesc: 'Sorting specification for the report',
          longDesc: 'Specify how to sort the report results by dimension or metric values.',
          type: {
            element_type: {
              fields: {
                field_name: {
                  displayName: 'Field Name',
                  shortDesc: 'The dimension or metric name to sort by',
                  longDesc: 'The name of the dimension or metric to use for sorting.',
                },
                desc: {
                  displayName: 'Descending',
                  shortDesc: 'Sort in descending order',
                  longDesc: 'If true, sorts in descending order. If false, sorts in ascending order.',
                },
                order_type: {
                  displayName: 'Order Type',
                  shortDesc: 'Whether to sort by dimension or metric',
                  longDesc: 'Specify whether the field is a dimension or metric for proper sorting.',
                },
              },
            },
          },
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of rows to return',
          longDesc: 'The maximum number of rows to return in the report. Default is 10,000, maximum is 100,000.',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Number of rows to skip',
          longDesc: 'The number of rows to skip before returning results. Used for pagination.',
        },
        keep_empty_rows: {
          displayName: 'Keep Empty Rows',
          shortDesc: 'Include rows with all zero metric values',
          longDesc:
            'If true, includes rows where all metrics have zero values. If false (default), such rows are excluded.',
        },
        return_property_quota: {
          displayName: 'Return Property Quota',
          shortDesc: 'Include API quota information in response',
          longDesc:
            'If true, returns information about API quota usage for this property in the response.',
        },
      },
    },
    run_realtime_report: {
      displayName: 'Run Real-time Report',
      shortDesc: 'Get live analytics data from the last 30 minutes',
      longDesc:
        'Retrieve real-time analytics data showing current activity on your property. Events appear within seconds of being sent to Google Analytics. Data is available for the last 30 minutes (or 60 minutes for Google Analytics 360 properties).',
      options: {
        property_id: {
          displayName: 'Property',
          shortDesc: 'The Google Analytics 4 property to query',
          longDesc: 'Select the GA4 property from which to retrieve real-time analytics data.',
        },
        metrics: {
          displayName: 'Metrics',
          shortDesc: 'The real-time metrics to include',
          longDesc:
            'Select the real-time metrics to include in the report (e.g., activeUsers, screenPageViews, eventCount).',
          type: {
            element_type: {
              fields: {
                name: {
                  displayName: 'Metric Name',
                  shortDesc: 'The API name of the metric',
                  longDesc: 'The API name of the real-time metric to include.',
                },
              },
            },
          },
        },
        dimensions: {
          displayName: 'Dimensions',
          shortDesc: 'The real-time dimensions to segment by',
          longDesc:
            'Select the real-time dimensions to segment your data by (e.g., country, city, deviceCategory, unifiedScreenName).',
          type: {
            element_type: {
              fields: {
                name: {
                  displayName: 'Dimension Name',
                  shortDesc: 'The API name of the dimension',
                  longDesc: 'The API name of the real-time dimension to include.',
                },
              },
            },
          },
        },
        minute_ranges: {
          displayName: 'Minute Ranges',
          shortDesc: 'Custom time ranges within the last 30 minutes',
          longDesc:
            'Specify custom time ranges for the real-time data. By default, data from the last 30 minutes is returned.',
          type: {
            element_type: {
              fields: {
                name: {
                  displayName: 'Range Name',
                  shortDesc: 'A name for this time range',
                  longDesc: 'An optional name to identify this time range in the response.',
                },
                start_minutes_ago: {
                  displayName: 'Start Minutes Ago',
                  shortDesc: 'Start of the range in minutes ago',
                  longDesc: 'The start of the minute range, expressed as minutes ago (e.g., 29 for 29 minutes ago).',
                },
                end_minutes_ago: {
                  displayName: 'End Minutes Ago',
                  shortDesc: 'End of the range in minutes ago',
                  longDesc: 'The end of the minute range, expressed as minutes ago (e.g., 0 for current minute).',
                },
              },
            },
          },
        },
        dimension_filter: {
          displayName: 'Dimension Filter',
          shortDesc: 'Filter expression for dimensions',
          longDesc: 'An advanced filter expression to filter real-time data based on dimension values.',
        },
        metric_filter: {
          displayName: 'Metric Filter',
          shortDesc: 'Filter expression for metrics',
          longDesc: 'An advanced filter expression to filter real-time data based on metric values.',
        },
        order_bys: {
          displayName: 'Order By',
          shortDesc: 'Sorting specification for the report',
          longDesc: 'Specify how to sort the real-time report results.',
          type: {
            element_type: {
              fields: {
                field_name: {
                  displayName: 'Field Name',
                  shortDesc: 'The dimension or metric name to sort by',
                  longDesc: 'The name of the dimension or metric to use for sorting.',
                },
                desc: {
                  displayName: 'Descending',
                  shortDesc: 'Sort in descending order',
                  longDesc: 'If true, sorts in descending order.',
                },
                order_type: {
                  displayName: 'Order Type',
                  shortDesc: 'Whether to sort by dimension or metric',
                  longDesc: 'Specify whether the field is a dimension or metric.',
                },
              },
            },
          },
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of rows to return',
          longDesc: 'The maximum number of rows to return. Default is 10,000.',
        },
      },
    },
    get_metadata: {
      displayName: 'Get Metadata',
      shortDesc: 'Discover available dimensions and metrics for a property',
      longDesc:
        'Retrieve the list of dimensions and metrics available for a Google Analytics property, including custom definitions. Use this to explore what data is available before building reports.',
      options: {
        property_id: {
          displayName: 'Property',
          shortDesc: 'The Google Analytics 4 property',
          longDesc:
            'Select the GA4 property to retrieve metadata for. The response will include both standard and custom dimensions/metrics.',
        },
      },
    },
    batch_run_reports: {
      displayName: 'Batch Run Reports',
      shortDesc: 'Run multiple reports in a single API call',
      longDesc:
        'Execute multiple report requests efficiently in one API call. This is ideal for dashboards or scenarios where you need several different reports. You can include up to 5 individual report requests per batch.',
      options: {
        property_id: {
          displayName: 'Property',
          shortDesc: 'The Google Analytics 4 property to query',
          longDesc: 'Select the GA4 property from which to retrieve analytics data for all reports.',
        },
        requests: {
          displayName: 'Report Requests',
          shortDesc: 'The individual report configurations',
          longDesc:
            'An array of report request configurations. Each request can have its own date ranges, metrics, dimensions, and limits. Maximum 5 requests per batch.',
          type: {
            element_type: {
              fields: {
                date_ranges: {
                  displayName: 'Date Ranges',
                  shortDesc: 'The date ranges for this report',
                  longDesc: 'The date ranges for this specific report in the batch.',
                  type: {
                    element_type: {
                      fields: {
                        start_date: {
                          displayName: 'Start Date',
                          shortDesc: 'The start date of the range',
                          longDesc: 'The start date in YYYY-MM-DD format or relative format.',
                        },
                        end_date: {
                          displayName: 'End Date',
                          shortDesc: 'The end date of the range',
                          longDesc: 'The end date in YYYY-MM-DD format or relative format.',
                        },
                      },
                    },
                  },
                },
                metrics: {
                  displayName: 'Metrics',
                  shortDesc: 'The metrics for this report',
                  longDesc: 'The metrics to include in this specific report.',
                  type: {
                    element_type: {
                      fields: {
                        name: {
                          displayName: 'Metric Name',
                          shortDesc: 'The API name of the metric',
                          longDesc: 'The metric name.',
                        },
                      },
                    },
                  },
                },
                dimensions: {
                  displayName: 'Dimensions',
                  shortDesc: 'The dimensions for this report',
                  longDesc: 'The dimensions to include in this specific report.',
                  type: {
                    element_type: {
                      fields: {
                        name: {
                          displayName: 'Dimension Name',
                          shortDesc: 'The API name of the dimension',
                          longDesc: 'The dimension name.',
                        },
                      },
                    },
                  },
                },
                limit: {
                  displayName: 'Limit',
                  shortDesc: 'Maximum rows for this report',
                  longDesc: 'The maximum number of rows to return for this specific report.',
                },
              },
            },
          },
        },
      },
    },
    check_compatibility: {
      displayName: 'Check Compatibility',
      shortDesc: 'Validate dimension and metric combinations',
      longDesc:
        'Check if specified dimensions and metrics are compatible before running a report. This helps avoid errors caused by incompatible combinations. Reports will fail if incompatible dimensions or metrics are requested together.',
      options: {
        property_id: {
          displayName: 'Property',
          shortDesc: 'The Google Analytics 4 property',
          longDesc: 'Select the GA4 property to check compatibility for.',
        },
        dimensions: {
          displayName: 'Dimensions',
          shortDesc: 'The dimensions to check',
          longDesc: 'The dimensions you want to verify can be used together.',
          type: {
            element_type: {
              fields: {
                name: {
                  displayName: 'Dimension Name',
                  shortDesc: 'The API name of the dimension',
                  longDesc: 'The dimension name to check compatibility for.',
                },
              },
            },
          },
        },
        metrics: {
          displayName: 'Metrics',
          shortDesc: 'The metrics to check',
          longDesc: 'The metrics you want to verify can be used together.',
          type: {
            element_type: {
              fields: {
                name: {
                  displayName: 'Metric Name',
                  shortDesc: 'The API name of the metric',
                  longDesc: 'The metric name to check compatibility for.',
                },
              },
            },
          },
        },
        compatibility_filter: {
          displayName: 'Compatibility Filter',
          shortDesc: 'Filter results by compatibility status',
          longDesc:
            'Optionally filter the results to show only compatible or only incompatible dimensions and metrics.',
        },
      },
    },
  },
};

export default GoogleAnalyticsAppEn;
