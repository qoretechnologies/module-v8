import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { XERO_APP_NAME } from '../constants';
import { fetchXeroData, getTenantIdRequired, getTokenRequired } from '../helpers/constants';
import { getXeroTenantIdAllowedValues } from '../helpers/get-tenant-id-allowed-values';

const getXeroEmployees = async (
  token: string,
  tenantId: string,
  options?: {
    status?: string;
    limit?: number;
  }
) => {
  try {
    let whereClause = '';
    if (options?.status) {
      whereClause = `Status=="${options.status}"`;
    }

    const params: Record<string, string> = {
      order: 'UpdatedDateUTC DESC',
      page: '1',
      pageSize: options?.limit?.toString() || DEFAULT_TRIGGER_POLL_ITEM_LIMIT.toString(),
    };

    if (whereClause) {
      params.where = whereClause;
    }

    const response = await fetchXeroData<{ Employees: Record<string, any>[] }>({
      token,
      tenantId,
      path: 'Employees',
      params,
    });

    return response.Employees || [];
  } catch (error) {
    console.error('Error fetching Xero employees:', error);

    return [];
  }
};

const xeroNewEmployeeTrigger = QoreAppCreator.createLocalizedTrigger({
  app: XERO_APP_NAME,
  action: 'new_employee',
  action_code: EQoreAppActionCode.EVENT,
  options: {
    'xero-tenant-id': {
      type: 'string',
      get_allowed_values: getXeroTenantIdAllowedValues,
      required: true,
    },
    status: {
      type: 'string',
      required: false,
      allowed_values: [
        { display_name: 'All Employees', value: 'ALL' },
        { display_name: 'Active', value: 'ACTIVE' },
        { display_name: 'Terminated', value: 'TERMINATED' },
      ],
      default_value: 'ALL',
    },
  },
  event_function: async (context, update, should_stop) => {
    const token = getTokenRequired(context);
    const tenantId = getTenantIdRequired(context);
    const status = context.opts?.status;

    const statusFilter = status === 'ALL' ? undefined : status;

    const getItems = () => {
      return getXeroEmployees(token, tenantId, {
        status: statusFilter,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'xero_new_employee',
      uniqueField: 'EmployeeID',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const token = getTokenRequired(context);
    const tenantId = getTenantIdRequired(context);
    const status = context.opts?.status;

    const statusFilter = status === 'ALL' ? undefined : status;

    try {
      const employees = await getXeroEmployees(token, tenantId, {
        status: statusFilter,
        limit: 1,
      });

      if (employees.length > 0) {
        return employees[0];
      }

      return null;
    } catch (error) {
      console.error('Error fetching Xero employee example:', error);

      return null;
    }
  },
  event_info: {
    desc: 'Triggered when a new employee is created in Xero',
    type: {
      type: 'hash',
      fields: {
        EmployeeID: { type: 'string' },
        Status: { type: 'string' },
        FirstName: { type: 'string' },
        LastName: { type: 'string' },
      },
    },
  },
});

export default xeroNewEmployeeTrigger;
