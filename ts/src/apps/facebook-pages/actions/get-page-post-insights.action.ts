import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { FacebookAdsApi, Page, Post } from 'facebook-nodejs-business-sdk';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { FACEBOOK_PAGES_APP_NAME, FacebookPagesError } from '../constants';
import { getFacebookPageIdAllowedValues } from '../helpers/get-page-id-allowed-values';
import { getFacebookPostIdAllowedValues } from '../helpers/get-post-id-allowed-values';
import { FacebookPostMetricsAllowedValues } from '../helpers/get-post-metrics-allowed-values';
import { FacebookPostInsightsPeriodAllowedValues } from '../helpers/get-post-insights-period-allowed-values';

const options = {
  page_id: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getFacebookPageIdAllowedValues,
    on_change: ['refetch'],
  },
  post_id: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getFacebookPostIdAllowedValues,
    depends_on: ['page_id'],
  },
  metrics: {
    required: true,
    type: {
      type: 'list',
      element_type: 'string',
    },
    default_value: ['post_impressions', 'post_clicks'],
    element_allowed_values_creatable: true,
    element_allowed_values: FacebookPostMetricsAllowedValues,
  },
  period: {
    required: false,
    type: 'string',
    default_value: 'lifetime',
    allowed_values: FacebookPostInsightsPeriodAllowedValues,
  },
} satisfies TQoreOptions;

const getPagePostInsights = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FACEBOOK_PAGES_APP_NAME,
  action: 'get_page_post_insights',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, page_id, post_id, metrics } = getQoreContextRequiredValues<{
      token: string;
      page_id: string;
      post_id: string;
      metrics: string[];
      period?: string;
      since?: string;
      until?: string;
    }>({
      context: { ...context, opts: obj },
      optionFields: ['page_id', 'post_id', 'metrics'],
      connectionFields: ['token'],
      ErrorClass: FacebookPagesError,
    });

    const period = obj?.period || 'lifetime';

    if (!metrics || metrics.length === 0) {
      throw new FacebookPagesError('At least one metric must be specified');
    }

    try {
      let fb = FacebookAdsApi.init(token);
      const page = new Page(page_id);
      const pageInfo = await page.read(['id', 'name', 'access_token']);
      fb = FacebookAdsApi.init(pageInfo._data.access_token);
      const post = new Post(post_id, undefined, undefined, fb);
      const postInfo = await post.read([
        'id',
        'message',
        'created_time',
        'via',
        'permalink_url',
        'is_popular',
        'is_published',
        'is_hidden',
      ]);

      const params: Record<string, any> = {
        metric: metrics.join(','),
        period: period || 'lifetime',
        access_token: pageInfo._data.access_token,
      };

      const response = await post.getInsights([], params);

      const insightsData = (response as any)?.data || [];

      const insights: Record<string, any> = {};
      const timeSeriesData: Record<string, any[]> = {};

      insightsData.forEach((insight: any) => {
        const metricName = insight.name;
        const values = insight.values || [];

        if (period === 'lifetime' && values.length > 0) {
          insights[metricName] = values[values.length - 1]?.value || 0;
        } else {
          timeSeriesData[metricName] = values.map((value: any) => ({
            value: value.value || 0,
            end_time: value.end_time,
          }));

          const totalValue = values.reduce((sum: number, value: any) => {
            return sum + (typeof value.value === 'number' ? value.value : 0);
          }, 0);
          insights[metricName] = totalValue;
        }
      });

      return {
        success: true,
        post_id,
        page_id,
        post_info: postInfo._data,
        period,
        metrics_requested: metrics,
        insights,
        time_series_data: Object.keys(timeSeriesData).length > 0 ? timeSeriesData : undefined,
        generated_at: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof FacebookPagesError) {
        throw error;
      }
      throw new FacebookPagesError(`Failed to get page post insights: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      success: {
        type: 'boolean',
        display_name: 'Success',
        short_desc: 'Whether the request was successful',
      },
      post_id: {
        type: 'string',
        display_name: 'Post ID',
        short_desc: 'The ID of the post',
      },
      page_id: {
        type: 'string',
        display_name: 'Page ID',
        short_desc: 'The ID of the page',
      },
      post_info: {
        type: {
          type: 'hash',
          fields: {
            id: { type: 'string' },
            message: { type: 'string' },
            created_time: { type: 'string' },
            type: { type: 'string' },
            permalink_url: { type: 'string' },
          },
        },
        display_name: 'Post Information',
        short_desc: 'Basic information about the post',
      },
      period: {
        type: 'string',
        display_name: 'Period',
        short_desc: 'The period used for insights',
      },
      metrics_requested: {
        type: {
          type: 'list',
          element_type: 'string',
        },
        display_name: 'Metrics Requested',
        short_desc: 'The metrics that were requested',
      },
      insights: {
        type: {
          type: 'hash',
        },
        display_name: 'Insights Data',
        short_desc: 'The insights metrics and their values',
      },
      time_series_data: {
        type: {
          type: 'hash',
        },
        display_name: 'Time Series Data',
        short_desc: 'Time-series breakdown of metrics (when applicable)',
      },
      date_range: {
        type: {
          type: 'hash',
          fields: {
            since: { type: 'string' },
            until: { type: 'string' },
          },
        },
        display_name: 'Date Range',
        short_desc: 'The date range used for the insights',
      },
      generated_at: {
        type: 'string',
        display_name: 'Generated At',
        short_desc: 'When the insights were generated',
      },
    },
  },
});

export default getPagePostInsights;
