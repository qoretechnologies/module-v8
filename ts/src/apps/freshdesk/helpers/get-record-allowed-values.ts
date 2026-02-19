import {
  IQoreAllowedValue,
  TQoreGetAllowedValuesFunction,
  TQoreGetDefaultValueFunction,
} from '@qoretechnologies/ts-toolkit';
import { Debugger } from '../../../utils/Debugger';
import { freshdeskClient } from '../client';
import { FRESHDESK_CONN_OPTIONS } from '../conn-options';

export const getFreshdeskRecordCurrentValue: TQoreGetDefaultValueFunction<
  typeof FRESHDESK_CONN_OPTIONS
> = async (context): Promise<any> => {
  const token = context?.conn_opts?.token;
  const subdomain = context?.conn_opts?.subdomain;
  const schemaId = context?.opts?.schemaId;
  const id = context?.opts?.id;

  const missingOptions = [];

  if (!token) missingOptions.push('token');
  if (!subdomain) missingOptions.push('subdomain');
  if (!schemaId) missingOptions.push('schemaId');
  if (!id) missingOptions.push('id');

  if (missingOptions.length > 0) {
    Debugger.log(
      `The following options are required to get Freshdesk record current value: ${missingOptions.join(', ')}`
    );

    return FreshdeskRecordDefaultValue;
  }

  try {
    const data = await freshdeskClient.get<{ data: unknown }>(
      `/api/v2/custom_objects/schemas/${schemaId}/records/${id}`,
      {
        token,
        connectionOptions: { subdomain },
      }
    );

    if (!data) {
      return FreshdeskRecordDefaultValue;
    }

    return data.data;
  } catch (error) {
    Debugger.log('Error while trying to get the current value of record:', error);

    return FreshdeskRecordDefaultValue;
  }
};

export const getFreshdeskRecordVersion: TQoreGetDefaultValueFunction<
  typeof FRESHDESK_CONN_OPTIONS
> = async (context): Promise<any> => {
  const token = context?.conn_opts?.token;
  const subdomain = context?.conn_opts?.subdomain;
  const schemaId = context?.opts?.schemaId;
  const id = context?.opts?.id;

  const missingOptions = [];

  if (!token) missingOptions.push('token');
  if (!subdomain) missingOptions.push('subdomain');
  if (!schemaId) missingOptions.push('schemaId');
  if (!id) missingOptions.push('id');

  if (missingOptions.length > 0) {
    Debugger.log(
      `The following options are required to get Freshdesk record version value: ${missingOptions.join(', ')}`
    );

    return FreshdeskRecordDefaultValue;
  }

  try {
    const data = await freshdeskClient.get<{ data: unknown; version: number }>(
      `/api/v2/custom_objects/schemas/${schemaId}/records/${id}`,
      {
        token,
        connectionOptions: { subdomain },
      }
    );

    if (!data) {
      return FreshdeskRecordDefaultValue.version;
    }

    return data.version;
  } catch (error) {
    Debugger.log('Error while trying to get the current value of record:', error);

    return FreshdeskRecordDefaultValue.version;
  }
};

export const getFreshdeskSchemaRecordValue: TQoreGetDefaultValueFunction<
  typeof FRESHDESK_CONN_OPTIONS
> = async (context): Promise<any> => {
  const token = context?.conn_opts?.token;
  const subdomain = context?.conn_opts?.subdomain;
  const schemaId = context?.opts?.schemaId;

  const missingOptions = [];

  if (!token) missingOptions.push('token');
  if (!subdomain) missingOptions.push('subdomain');
  if (!schemaId) missingOptions.push('schemaId');

  if (missingOptions.length > 0) {
    Debugger.log(
      `The following options are required to get Freshdesk record current value: ${missingOptions.join(', ')}`
    );

    return FreshdeskRecordDefaultValue;
  }

  try {
    const data = await freshdeskClient.get<{ records: unknown[] }>(
      `/api/v2/custom_objects/schemas/${schemaId}/records`,
      {
        token,
        connectionOptions: { subdomain },
      }
    );

    if (!data) {
      return FreshdeskRecordDefaultValue;
    }

    return data.records[0] ? data.records[0] : FreshdeskRecordDefaultValue;
  } catch (error) {
    Debugger.log('Error while trying to get the current value of record:', error);

    return FreshdeskRecordDefaultValue;
  }
};

export const getFreshdeskRecordIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof FRESHDESK_CONN_OPTIONS
> = async (context): Promise<IQoreAllowedValue[]> => {
  const token = context?.conn_opts?.token;
  const subdomain = context?.conn_opts?.subdomain;
  const schemaId = context?.opts?.schemaId;

  const missingOptions = [];

  if (!token) missingOptions.push('token');
  if (!subdomain) missingOptions.push('subdomain');
  if (!schemaId) missingOptions.push('schemaId');

  if (missingOptions.length > 0) {
    Debugger.log(
      `The following options are required to get Freshdesk record id allowed values: ${missingOptions.join(', ')}`
    );

    return [];
  }

  try {
    const data = await freshdeskClient.get<{ records: { display_id: string }[] }>(
      `/api/v2/custom_objects/schemas/${schemaId}/records`,
      {
        token,
        connectionOptions: { subdomain },
        params: { page_size: '100' },
      }
    );

    if (!data) {
      return [];
    }

    return data.records.map(
      (record): IQoreAllowedValue => ({
        value: record.display_id,
        display_name: record.display_id,
      })
    );
  } catch {
    return [];
  }
};

export const FreshdeskRecordDefaultValue = {
  display_id: 'your id here',
  created_time: 1738170048041,
  updated_time: 1738170385757,
  data: {},
  version: 3,
};
