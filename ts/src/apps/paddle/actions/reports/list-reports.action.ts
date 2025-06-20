import { ReportStatus } from '@paddle/paddle-node-sdk';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { PADDLE_APP_NAME, PaddleError } from '../../constants';
import { createPaddleClient } from '../../helpers/constants';
import { PaddleReportStatusAllowedValues } from '../../helpers/get-report-status-allowed-values';

const options = {
  after: {
    type: 'string',
    required: false,
  },
  order: {
    type: {
      type: 'hash',
      fields: {
        field: {
          type: 'string',
          allowed_values: [
            {
              value: 'created_at',
              display_name: 'Created At',
            },
            {
              value: 'id',
              display_name: 'ID',
            },
          ],
        },
        direction: {
          type: 'string',
          allowed_values: [
            { value: 'ASC', display_name: 'Ascending' },
            { value: 'DESC', display_name: 'Descending' },
          ],
        },
      },
    },
  },
  per_page: {
    type: 'integer',
    default_value: 50,
    required: false,
  },
  status: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    element_allowed_values: PaddleReportStatusAllowedValues,
  },
} satisfies TQoreOptions;

const listReports = QoreAppCreator.createLocalizedAction<typeof options>({
  app: PADDLE_APP_NAME,
  action: 'list_reports',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, instance_type } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'instance_type'],
      ErrorClass: PaddleError,
    });

    const after = obj?.after;
    const status = obj?.status as ReportStatus[] | undefined;
    const perPage = obj?.per_page ? Math.min(obj.per_page, 200) : 50;
    const sortOrder = obj?.order?.direction || 'ASC';
    const sortField = obj?.order?.field || 'created_at';

    try {
      const client = createPaddleClient(token, instance_type);

      const reportCollection = await client.reports.list({
        perPage,
        orderBy: `${sortField}[${sortOrder}]`,
        ...(after && { after }),
        ...(status && { status }),
      });

      return await reportCollection.next();
    } catch (error) {
      throw new PaddleError(`Failed to list reports: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'list',
    element_type: {
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

export default listReports;
