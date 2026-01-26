import {
  IQoreAllowedValue,
  QorusRequest,
  TQoreGetAllowedValuesFunction,
  TQoreGetDefaultValueFunction,
} from '@qoretechnologies/ts-toolkit';
import { Debugger } from '../../../utils/Debugger';
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
    const response = await QorusRequest.get<{ data: { data: unknown } }>(
      {
        path: `/api/v2/custom_objects/schemas/${schemaId}/records/${id}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      { url: `https://${subdomain}.freshdesk.com`, endpointId: 'Freshdesk' }
    );

    const responseData = response?.data;
    if (!responseData) return FreshdeskRecordDefaultValue;

    return responseData.data;
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
    const response = await QorusRequest.get<{ data: { data: unknown; version: number } }>(
      {
        path: `/api/v2/custom_objects/schemas/${schemaId}/records/${id}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      { url: `https://${subdomain}.freshdesk.com`, endpointId: 'Freshdesk' }
    );

    const responseData = response?.data;
    if (!responseData) return FreshdeskRecordDefaultValue.version;

    return responseData.version;
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
    const response = await QorusRequest.get<{ data: { records: unknown[] } }>(
      {
        path: `/api/v2/custom_objects/schemas/${schemaId}/records`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      { url: `https://${subdomain}.freshdesk.com`, endpointId: 'Freshdesk' }
    );

    const responseData = response?.data;
    if (!responseData) return FreshdeskRecordDefaultValue;

    return responseData.records[0] ? responseData.records[0] : FreshdeskRecordDefaultValue;
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

  const response = await QorusRequest.get<{ data: { records: { display_id: string }[] } }>(
    {
      path: `/api/v2/custom_objects/schemas/${schemaId}/records`,
      params: {
        page_size: '100',
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    { url: `https://${subdomain}.freshdesk.com`, endpointId: 'Freshdesk' }
  );

  const responseData = response?.data;

  if (!responseData) {
    return [];
  }

  return responseData.records.map(
    (record): IQoreAllowedValue => ({
      value: record.display_id,
      display_name: record.display_id,
    })
  );
};

export const FreshdeskRecordDefaultValue = {
  display_id: 'your id here',
  created_time: 1738170048041,
  updated_time: 1738170385757,
  data: {},
  version: 3,
};
