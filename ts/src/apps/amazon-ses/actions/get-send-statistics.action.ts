import { GetSendStatisticsCommand } from '@aws-sdk/client-ses';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import {
  getAmazonDefaultRegion,
  getAWSRegionAllowedValues,
} from '../../../global/helpers/get-amazon-region-allowed-values';
import { AMAZON_SES_APP_NAME, AmazonSESError } from '../constants';
import { createSESClient, formatSESDate } from '../helpers/constants';

const options = {
  region: {
    required: false,
    preselected: true,
    type: 'string',
    allowed_values_creatable: true,
    get_default_value: getAmazonDefaultRegion,
    get_allowed_values: getAWSRegionAllowedValues,
  },
} satisfies TQoreOptions;

const getSendStatistics = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AMAZON_SES_APP_NAME,
  action: 'get_send_statistics',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { access_key_id, secret_access_key } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['access_key_id', 'secret_access_key'],
      ErrorClass: AmazonSESError,
    });

    const region = obj?.region || context?.conn_opts?.region;

    try {
      const sesClient = createSESClient({
        access_key_id,
        secret_access_key,
        region: region || 'us-east-1',
      });

      const command = new GetSendStatisticsCommand({});
      const response = await sesClient.send(command);

      const sendDataPoints = (response.SendDataPoints || []).map((dataPoint) => ({
        timestamp: formatSESDate(dataPoint.Timestamp),
        delivery_attempts: dataPoint.DeliveryAttempts || 0,
        bounces: dataPoint.Bounces || 0,
        complaints: dataPoint.Complaints || 0,
        rejects: dataPoint.Rejects || 0,
        bounce_rate: dataPoint.DeliveryAttempts
          ? (((dataPoint.Bounces || 0) / dataPoint.DeliveryAttempts) * 100).toFixed(2)
          : '0.00',
        complaint_rate: dataPoint.DeliveryAttempts
          ? (((dataPoint.Complaints || 0) / dataPoint.DeliveryAttempts) * 100).toFixed(2)
          : '0.00',
        reject_rate: dataPoint.DeliveryAttempts
          ? (((dataPoint.Rejects || 0) / dataPoint.DeliveryAttempts) * 100).toFixed(2)
          : '0.00',
      }));

      // Calculate totals
      const totals = sendDataPoints.reduce(
        (acc, point) => ({
          total_delivery_attempts: acc.total_delivery_attempts + point.delivery_attempts,
          total_bounces: acc.total_bounces + point.bounces,
          total_complaints: acc.total_complaints + point.complaints,
          total_rejects: acc.total_rejects + point.rejects,
        }),
        {
          total_delivery_attempts: 0,
          total_bounces: 0,
          total_complaints: 0,
          total_rejects: 0,
        }
      );

      const overallBounceRate = totals.total_delivery_attempts
        ? ((totals.total_bounces / totals.total_delivery_attempts) * 100).toFixed(2)
        : '0.00';

      const overallComplaintRate = totals.total_delivery_attempts
        ? ((totals.total_complaints / totals.total_delivery_attempts) * 100).toFixed(2)
        : '0.00';

      const overallRejectRate = totals.total_delivery_attempts
        ? ((totals.total_rejects / totals.total_delivery_attempts) * 100).toFixed(2)
        : '0.00';

      return {
        region: region || 'us-east-1',
        data_points_count: sendDataPoints.length,
        send_data_points: sendDataPoints,
        summary: {
          ...totals,
          overall_bounce_rate: `${overallBounceRate}%`,
          overall_complaint_rate: `${overallComplaintRate}%`,
          overall_reject_rate: `${overallRejectRate}%`,
        },
        retrieved_at: new Date().toISOString(),
        success: true,
      };
    } catch (error) {
      throw new AmazonSESError(`Failed to get send statistics: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      region: { type: 'string' },
      data_points_count: { type: 'integer' },
      send_data_points: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              timestamp: { type: 'string' },
              delivery_attempts: { type: 'integer' },
              bounces: { type: 'integer' },
              complaints: { type: 'integer' },
              rejects: { type: 'integer' },
              bounce_rate: { type: 'string' },
              complaint_rate: { type: 'string' },
              reject_rate: { type: 'string' },
            },
          },
        },
      },
      summary: {
        type: {
          type: 'hash',
          fields: {
            total_delivery_attempts: { type: 'integer' },
            total_bounces: { type: 'integer' },
            total_complaints: { type: 'integer' },
            total_rejects: { type: 'integer' },
            overall_bounce_rate: { type: 'string' },
            overall_complaint_rate: { type: 'string' },
            overall_reject_rate: { type: 'string' },
          },
        },
      },
      retrieved_at: { type: 'string' },
      success: { type: 'boolean' },
    },
  },
});

export default getSendStatistics;
