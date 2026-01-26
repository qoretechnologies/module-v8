import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { XeroError } from '../constants';
import { getTenantIdRequired, getTokenRequired, getXeroAllowedValues } from './constants';

type XeroEmployee = {
  EmployeeID: string;
  FirstName: string;
  LastName: string;
  Email?: string;
  Status?: string;
  DateOfBirth?: string;
  HomeAddress?: {
    AddressLine1?: string;
    City?: string;
    Region?: string;
    PostalCode?: string;
    Country?: string;
  };
  Phone?: string;
  StartDate?: string;
  TerminationDate?: string;
  JobTitle?: string;
};

const mapXeroEmployeeToAllowedValue = (employee: XeroEmployee): IQoreAllowedValue<string> => ({
  display_name: `${employee.FirstName} ${employee.LastName}`,
  value: employee.EmployeeID,
  desc:
    `Status: ${employee.Status || 'Active'}\n\n` +
    `Email: ${employee.Email || 'N/A'}\n\n` +
    `Job Title: ${employee.JobTitle || 'N/A'}\n\n` +
    `Start Date: ${employee.StartDate || 'N/A'}\n\n` +
    `Phone: ${employee.Phone || 'N/A'}\n\n`,
});

export const getXeroEmployeeIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  try {
    const token = getTokenRequired(context);
    const tenantId = getTenantIdRequired(context);

    return await getXeroAllowedValues({
      token,
      tenantId,
      path: 'Employees',
      dataPath: 'Employees',
      mapItemToAllowedValue: mapXeroEmployeeToAllowedValue,
    });
  } catch (error) {
    throw new XeroError(`Couldn't fetch Xero employee IDs: ${error}`);
  }
};
