import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { NETSUITE_CONN_OPTIONS } from '../constants';
import { fetchNetsuiteAllowedValues } from './constants';

export const getNetsuiteRecordTypesAllowedValues: TQoreGetAllowedValuesFunction<
  typeof NETSUITE_CONN_OPTIONS,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;
  const account_id = context?.conn_opts?.account_id;

  if (!token || !account_id) {
    throw new Error('The token and account_id are required to get NetSuite record types');
  }

  try {
    const customTypes = await fetchNetsuiteAllowedValues({
      account_id,
      token,
      mapItemToAllowedValue: (item: any): IQoreAllowedValue<string> => ({
        value: item.scriptid || `customrecord_${item.internalid}`,
        display_name: item.name,
        desc:
          `Custom record type\n\n` +
          `ID: ${item.internalid || 'N/A'}${item.scriptid ? `\n\nScript ID: ${item.scriptid}` : ''}`,
      }),
      query: 'SELECT internalid, name, scriptid FROM customrecordtype ORDER BY name',
    });

    return [...standardRecordTypes, ...customTypes] as IQoreAllowedValue<string>[];
  } catch (error) {
    return standardRecordTypes;
  }
};

const standardRecordTypes: IQoreAllowedValue<string>[] = [
  {
    value: 'account',
    display_name: 'Account',
    short_desc: 'Chart of accounts and financial ledgers.',
  },
  {
    value: 'customer',
    display_name: 'Customer',
    short_desc: 'Customer records.',
  },
  {
    value: 'vendor',
    display_name: 'Vendor',
    short_desc: 'Vendor records.',
  },
  {
    value: 'employee',
    display_name: 'Employee',
    short_desc: 'Employee records.',
  },
  {
    value: 'contact',
    display_name: 'Contact',
    short_desc: 'Contact records.',
  },
  {
    value: 'item',
    display_name: 'Item',
    short_desc: 'Inventory and non-inventory item records.',
  },
  {
    value: 'location',
    display_name: 'Location',
    short_desc: 'Business location records.',
  },
  {
    value: 'department',
    display_name: 'Department',
    short_desc: 'Organizational departments.',
  },
  {
    value: 'class',
    display_name: 'Class',
    short_desc: 'Classification records used for financial reporting.',
  },
  {
    value: 'subsidiary',
    display_name: 'Subsidiary',
    short_desc: 'Subsidiary records for multi‑subsidiary environments.',
  },
  {
    value: 'opportunity',
    display_name: 'Opportunity',
    short_desc: 'Sales opportunity records.',
  },
  {
    value: 'partner',
    display_name: 'Partner',
    short_desc: 'Partner records.',
  },
  {
    value: 'campaign',
    display_name: 'Campaign',
    short_desc: 'Marketing campaign records.',
  },
  {
    value: 'campaignresponse',
    display_name: 'Campaign Response',
    short_desc: 'Responses to marketing campaigns.',
  },
  {
    value: 'project',
    display_name: 'Project',
    short_desc: 'Project records (if enabled in your account).',
  },
  {
    value: 'activity',
    display_name: 'Activity',
    short_desc: 'Activities such as tasks, phone calls, and events.',
  },
  {
    value: 'bankaccount',
    display_name: 'Bank Account',
    short_desc: 'Bank account records.',
  },
  {
    value: 'accountingperiod',
    display_name: 'Accounting Period',
    short_desc: 'Accounting period records.',
  },
  {
    value: 'transaction',
    display_name: 'Transaction',
    short_desc: 'Consolidated table for all transaction records. ',
  },
  {
    value: 'notetype',
    display_name: 'Note Type',
    short_desc: 'Standard record type for note types.',
  },
  {
    value: 'website',
    display_name: 'Website',
    short_desc: 'Website records.',
  },
  {
    value: 'timebill',
    display_name: 'Time Bill',
    short_desc: 'Time bill records.',
  },
  {
    value: 'vendorcategory',
    display_name: 'Vendor Category',
    short_desc: 'Vendor category records.',
  },
  {
    value: 'term',
    display_name: 'Term',
    short_desc: 'Payment term records.',
  },
  {
    value: 'message',
    display_name: 'Message',
    short_desc: 'Message records.',
  },
  {
    value: 'vendorsubsidiaryrelationship',
    display_name: 'Vendor Subsidiary Relationship',
    short_desc: 'Vendor subsidiary relationship records.',
  },
] satisfies IQoreAllowedValue<string>[];
