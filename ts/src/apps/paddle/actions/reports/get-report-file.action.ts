import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { PADDLE_APP_NAME, PaddleError } from '../../constants';
import { createPaddleClient } from '../../helpers/constants';
import { getPaddleReportIdAllowedValues } from '../../helpers/get-report-id-allowed-values';

const options = {
  report_id: {
    type: 'string',
    required: true,
    get_allowed_values: getPaddleReportIdAllowedValues,
  },
} satisfies TQoreOptions;

const getReportFile = QoreAppCreator.createLocalizedAction<typeof options>({
  app: PADDLE_APP_NAME,
  action: 'get_report_file',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, instance_type, report_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['report_id'],
      connectionFields: ['token', 'instance_type'],
      ErrorClass: PaddleError,
    });

    try {
      const client = createPaddleClient(token, instance_type);

      const report = await client.reports.getReportCsv(report_id);

      return report;
    } catch (error) {
      throw new PaddleError(`Failed to get report: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      url: { type: 'string' },
    },
  },
});

export default getReportFile;
