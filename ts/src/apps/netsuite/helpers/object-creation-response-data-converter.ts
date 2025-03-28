import {
  QorusRequest,
  TCustomConnOptions,
  TQoreOptions,
  TQoreResponseDataConverterFunction,
} from '@qoretechnologies/ts-toolkit';
import { Debugger } from '../../../utils/Debugger';

export const netsuiteObjectCreationResponseDataConverter: TQoreResponseDataConverterFunction<
  TCustomConnOptions,
  TQoreOptions
> = async (res, context) => {
  const token = context?.conn_opts?.token;
  const account_id = context?.conn_opts?.account_id;

  const location = res?.headers?.Location;

  const missingValues: string[] = [];

  if (!token) missingValues.push('token');
  if (!account_id) missingValues.push('account_id');
  if (!location) missingValues.push('headers.Location');

  if (missingValues.length) {
    throw new Error(
      `All of the following values are required: ${missingValues.join(', ')}` +
        ` to convert the netsuite customer response`
    );
  }

  const objectId = location.split('/').pop();
  try {
    const response = await QorusRequest.get<{ data: any }>(
      {
        path: ``,
        headers: {
          Authorization: `Bearer ${token}`,
          Prefer: 'transient',
        },
      },
      {
        endpointId: 'NetSuite',
        url: location,
      }
    );

    const responseData = response?.data;

    if (!responseData) {
      Debugger.log('NetSuite customer response data is empty');

      return {
        ...res,
        location,
        id: objectId,
      };
    }

    return responseData;
  } catch (error) {
    Debugger.log('Error in netsuiteObjectCreationResponseDataConverter', error);

    return {
      ...res,
      location,
      id: objectId,
    };
  }
};
