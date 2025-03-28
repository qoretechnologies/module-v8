import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { NETSUITE_CONN_OPTIONS } from '../constants';
import { fetchNetsuiteAllowedValues } from './constants';

type TNetsuiteEmployeeData = {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
};

const fieldsToFetch = ['id', 'firstname', 'lastname', 'email'];

const mapNetSuiteEmployee = (employee: TNetsuiteEmployeeData): IQoreAllowedValue => ({
  value: employee.id,
  display_name: `${employee.firstname} ${employee.lastname}`,
  desc: `ID: ${employee.id}\n\nName: ${employee.firstname} ${employee.lastname}\n\nEmail: ${employee.email}`,
});

const mapNetSuiteEmployeeObject = (employee: TNetsuiteEmployeeData): IQoreAllowedValue => ({
  value: { id: employee.id },
  display_name: `${employee.firstname} ${employee.lastname}`,
  desc: `ID: ${employee.id}\n\nName: ${employee.firstname} ${employee.lastname}\n\nEmail: ${employee.email}`,
});

const createGetNetsuiteEmployeeIdAllowedValuesFunction = (
  type: 'string' | 'object'
): TQoreGetAllowedValuesFunction<typeof NETSUITE_CONN_OPTIONS, any> => {
  return async (context): Promise<IQoreAllowedValue[]> => {
    const token = context?.conn_opts?.token;
    const account_id = context?.conn_opts?.account_id;

    if (!token || !account_id) {
      throw new Error(
        'The token and account_id are required to get NetSuite employee allowed values'
      );
    }

    const employees = await fetchNetsuiteAllowedValues({
      account_id,
      token,
      mapItemToAllowedValue: type === 'string' ? mapNetSuiteEmployee : mapNetSuiteEmployeeObject,
      query: `SELECT ${fieldsToFetch.join(',')} FROM employee ORDER BY employee.datecreated DESC`,
    });

    return employees;
  };
};

export const getNetsuiteEmployeeIdAllowedValues =
  createGetNetsuiteEmployeeIdAllowedValuesFunction('string');

export const getNetsuiteEmployeeObjectAllowedValues =
  createGetNetsuiteEmployeeIdAllowedValuesFunction('object');
