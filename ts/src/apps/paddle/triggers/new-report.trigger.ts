import { ReportStatus } from '@paddle/paddle-node-sdk';
import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { PADDLE_APP_NAME, PADDLE_INSTANCE_TYPE, PaddleError } from '../constants';
import { createPaddleClient } from '../helpers/constants';
import { PaddleReportStatusAllowedValues } from '../helpers/get-report-status-allowed-values';

const PaddleNewReportTrigger = QoreAppCreator.createLocalizedTrigger({
  app: PADDLE_APP_NAME,
  action: 'new_report',
  action_code: EQoreAppActionCode.EVENT,
  options: {
    status: {
      type: {
        type: 'list',
        element_type: 'string',
      },
      required: false,
      element_allowed_values: PaddleReportStatusAllowedValues,
    },
  },
  event_function: async (context, update, should_stop) => {
    const { token, instance_type } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'instance_type'],
      ErrorClass: PaddleError,
    });

    const { status } = context.opts || {};

    const getItems = () => {
      return fetchLatestReports({
        token,
        instance_type,
        status: status as ReportStatus[] | undefined,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'paddle_new_report',
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token, instance_type } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'instance_type'],
      ErrorClass: PaddleError,
    });

    const { status } = context.opts || {};

    const reports = await fetchLatestReports({
      token,
      instance_type,
      status: status as ReportStatus[] | undefined,
    });

    return reports?.length > 0 ? reports[0] : null;
  },
  event_info: {
    desc: 'Paddle New Report Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        type: { type: 'string' },
        status: { type: 'string' },
        rows: { type: 'integer' },
        filters: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                name: { type: 'string' },
                operator: { type: 'string' },
                value: { type: 'any' },
              },
            },
          },
        },
        expires_at: { type: 'string' },
        created_at: { type: 'string' },
        updated_at: { type: 'string' },
      },
    },
  },
});

export default PaddleNewReportTrigger;

const fetchLatestReports = async (options: {
  token: string;
  instance_type: (typeof PADDLE_INSTANCE_TYPE)[keyof typeof PADDLE_INSTANCE_TYPE];
  status?: ReportStatus[];
}) => {
  const { token, instance_type, status } = options;
  const limit = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;

  try {
    const client = createPaddleClient(token, instance_type);

    const reportCollection = await client.reports.list({
      perPage: limit,
      orderBy: 'created_at[DESC]',
      ...(status && { status }),
    });

    const result = await reportCollection.next();

    return result || [];
  } catch (error) {
    throw new PaddleError(`Failed to fetch latest reports: ${error.message || error}`);
  }
};
