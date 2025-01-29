import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import {
  IQoreAllowedValue,
  TQoreGetAllowedValuesFunction,
  TQoreGetDefaultValueFunction,
} from '../../../global/models/qore';
import { FRESHDESK_CONN_OPTIONS } from '../constants';
import { Debugger } from '../../../utils/Debugger';
export const getFreshdeskRecordCurrentValue: TQoreGetDefaultValueFunction<
  typeof FRESHDESK_CONN_OPTIONS
> = async (context): Promise<any> => {
  const {
    conn_opts: { subdomain, token },
    opts: { schemaId, id },
  } = context;
  try {
    const { data } = await QorusRequest.get<{ data: { data: unknown } }>(
      {
        path: `/api/v2/custom_objects/schemas/${schemaId}/records/${id}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      { url: `https://${subdomain}.freshdesk.com`, endpointId: 'Freshdesk' }
    );

    return data.data;
  } catch (error) {
    Debugger.log('Error while trying to get the current value of record:', error);

    return FreshdeskRecordDefaultValue;
  }
};

export const getFreshdeskRecordVersion: TQoreGetDefaultValueFunction<
  typeof FRESHDESK_CONN_OPTIONS
> = async (context): Promise<any> => {
  const {
    conn_opts: { subdomain, token },
    opts: { schemaId, id },
  } = context;
  try {
    const { data } = await QorusRequest.get<{ data: { data: unknown; version: number } }>(
      {
        path: `/api/v2/custom_objects/schemas/${schemaId}/records/${id}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      { url: `https://${subdomain}.freshdesk.com`, endpointId: 'Freshdesk' }
    );

    return data.version;
  } catch (error) {
    Debugger.log('Error while trying to get the current value of record:', error);

    return FreshdeskRecordDefaultValue;
  }
};

export const getFreshdeskSchemaRecordValue: TQoreGetDefaultValueFunction<
  typeof FRESHDESK_CONN_OPTIONS
> = async (context): Promise<any> => {
  const {
    conn_opts: { subdomain, token },
    opts: { schemaId },
  } = context;
  try {
    const { data } = await QorusRequest.get<{ data: { records: unknown[] } }>(
      {
        path: `/api/v2/custom_objects/schemas/${schemaId}/records`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      { url: `https://${subdomain}.freshdesk.com`, endpointId: 'Freshdesk' }
    );

    return data.records[0] ? data.records[0] : FreshdeskRecordDefaultValue;
  } catch (error) {
    Debugger.log('Error while trying to get the current value of record:', error);

    return FreshdeskRecordDefaultValue;
  }
};

export const getFreshdeskRecordIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof FRESHDESK_CONN_OPTIONS
> = async (context): Promise<IQoreAllowedValue[]> => {
  const {
    conn_opts: { subdomain, token },
    opts: { schemaId },
  } = context;
  const { data } = await QorusRequest.get<{ data: { records: { display_id: string }[] } }>(
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

  return data.records.map(
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
