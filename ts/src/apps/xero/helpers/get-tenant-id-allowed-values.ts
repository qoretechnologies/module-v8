import {
  QorusRequest,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { TXeroConnections, XeroError } from '../constants';

export const getXeroTenantIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new XeroError('Token is required to fetch Xero tenant IDs');
  }

  try {
    const response = await QorusRequest.get<{
      data: TXeroConnections[];
    }>(
      { path: '/connections', headers: { Authorization: `Bearer ${token}` } },
      {
        url: 'https://api.xero.com',
        endpointId: 'xero',
      }
    );

    const data = response?.data;

    if (!data || !data.length) {
      throw new Error('No data returned from Xero API for connections');
    }

    return data.map((conn) => ({
      value: conn.tenantId,
      display_name: conn.tenantName,
    }));
  } catch (error) {
    throw new XeroError(`Couldn't fetch Xero tenant IDs: ${error}`);
  }
};
