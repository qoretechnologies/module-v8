import {
  EQoreAppActionCode,
  QoreAppCreator,
  QorusRequest,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { YOUTUBE_APP_NAME, YouTubeError } from '../constants';
import { YouTubeReportMetricsAllowedValues } from '../helpers/get-metrics-allowed-values';
import { getYouTubeUserChannelsAllowedValues } from '../helpers/get-user-channel-allowed-values';

const action = 'get_report';

const options = {
  startDate: {
    type: 'date',
    required: true,
  },
  endDate: {
    type: 'date',
    required: true,
  },
  metrics: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    element_allowed_values: YouTubeReportMetricsAllowedValues,
    required: true,
  },
  channel: {
    type: 'string',
    required: true,
    get_allowed_values: getYouTubeUserChannelsAllowedValues,
  },
  maxResults: {
    type: 'number',
    default_value: 10,
    required: false,
  },
} satisfies TQoreOptions;

const getReport = QoreAppCreator.createLocalizedAction<typeof options>({
  app: YOUTUBE_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, channel, metrics } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['channel', 'metrics', 'startDate', 'endDate'],
      ErrorClass: YouTubeError,
    });

    const maxResults = obj?.maxResults;
    const startDate = new Date(obj!.startDate).toISOString().split('T')[0];
    const endDate = new Date(obj!.endDate).toISOString().split('T')[0];

    try {
      const response = await QorusRequest.get<{
        data: {
          columnHeaders: { name: string; columnType: string; dataType: string }[];
          rows: Array<Array<any>>;
        };
      }>(
        {
          path: '/v2/reports',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            startDate,
            endDate,
            sort: 'day',
            dimensions: 'day',
            metrics: metrics.join(','),
            ids: `channel==${channel}`,
            ...(maxResults && { maxResults: maxResults.toString() }),
          },
        },
        {
          endpointId: YOUTUBE_APP_NAME,
          url: 'https://youtubeanalytics.googleapis.com',
        }
      );

      const report: Record<string, any>[] = [];

      response?.data.rows.forEach((row) => {
        const dateReport: Record<string, any> = {
          date: row[0],
        };

        for (let index = 1; index < row.length; index++) {
          dateReport[response.data.columnHeaders[index].name] = row[index];
        }

        report.push(dateReport);
      });

      return report;
    } catch (error) {
      throw new YouTubeError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        date: { type: 'string' },
        views: { type: 'number' },
        estimatedMinutesWatched: { type: 'number' },
        averageViewDuration: { type: 'number' },
        averageViewPercentage: { type: 'number' },
        comments: { type: 'number' },
        likes: { type: 'number' },
        dislikes: { type: 'number' },
        shares: { type: 'number' },
        subscribersGained: { type: 'number' },
        subscribersLost: { type: 'number' },
        videosAddedToPlaylists: { type: 'number' },
        videosRemovedFromPlaylists: { type: 'number' },
        annotationImpressions: { type: 'number' },
        annotationClickableImpressions: { type: 'number' },
        annotationClicks: { type: 'number' },
        annotationClickThroughRate: { type: 'number' },
        annotationClosableImpressions: { type: 'number' },
        annotationCloses: { type: 'number' },
        annotationCloseRate: { type: 'number' },
        cardImpressions: { type: 'number' },
        cardClicks: { type: 'number' },
        cardClickRate: { type: 'number' },
        cardTeaserImpressions: { type: 'number' },
        cardTeaserClicks: { type: 'number' },
        cardTeaserClickRate: { type: 'number' },
      },
    },
  },
});

export default getReport;
