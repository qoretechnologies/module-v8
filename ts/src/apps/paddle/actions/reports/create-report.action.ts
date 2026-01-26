import { IReportFilters } from '@paddle/paddle-node-sdk';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { PADDLE_APP_NAME, PaddleError } from '../../constants';
import { createPaddleClient } from '../../helpers/constants';
import {
  getPaddleReportFilterAllowedValues,
  PaddleReportTypeAllowedValues,
} from '../../helpers/get-paddle-report-type-allowed-values';

const options = {
  type: {
    type: 'string',
    required: true,
    allowed_values: PaddleReportTypeAllowedValues,
    on_change: ['refetch'],
  },
  filters: {
    required: false,
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          name: {
            type: 'string',
            required: true,
            get_allowed_values: getPaddleReportFilterAllowedValues,
          },
          operator: {
            required: false,
            type: 'string',
            allowed_values: [
              { value: 'LT', display_name: 'Less than' },
              { value: 'GTE', display_name: 'Greater than or equal to' },
            ],
          },
          value: {
            required: true,
            type: 'any',
          },
        },
      },
    },
  },
} satisfies TQoreOptions;

const createReport = QoreAppCreator.createLocalizedAction<typeof options>({
  app: PADDLE_APP_NAME,
  action: 'create_report',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, instance_type, type } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['type'],
      connectionFields: ['token', 'instance_type'],
      ErrorClass: PaddleError,
    });

    const filters = obj?.filters as IReportFilters[] | undefined;

    try {
      const client = createPaddleClient(token, instance_type);

      const report = await client.reports.create({
        type,
        ...(filters && { filters }),
      });

      return report;
    } catch (error) {
      throw new PaddleError(`Failed to create report: ${error.message || error}`);
    }
  },
  response_type: {
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
});

export default createReport;
