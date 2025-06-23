import { Report } from '@paddle/paddle-node-sdk';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { PaddleError } from '../constants';
import { createPaddleClient } from './constants';

const mapPaddleItemToAllowedValue = (item: Report): IQoreAllowedValue<string> => {
  const date = new Date(item.createdAt);
  const formattedDate = date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return {
    value: item.id,
    display_name: `${formattedDate} - ${item.type} - ${item.status}`,
    desc:
      `Id: ${item.id}\n` +
      `Status: ${item.status}\n` +
      `Type: ${item.type}\n` +
      `Rows: ${item.rows}\n`,
  };
};

export const getPaddleReportIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, instance_type } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'instance_type'],
    ErrorClass: PaddleError,
  });

  const client = createPaddleClient(token, instance_type);

  const allReports: Report[] = [];
  const reportCollection = client.reports.list();

  try {
    for await (const report of reportCollection) {
      allReports.push(report);
    }
  } catch (error) {
    console.error(`Failed to fetch reports: ${error}`);
  }

  return allReports.map(mapPaddleItemToAllowedValue);
};
