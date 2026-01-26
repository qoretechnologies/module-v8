import {
  QorusRequest,
  TCustomConnOptions,
  TQoreGetDefaultValueFunction,
} from '@qoretechnologies/ts-toolkit';
import { ATTIO_APP_API_URL, ATTIO_APP_NAME, AttioError } from '../constants';

export const getListParentObjectDefaultValue: TQoreGetDefaultValueFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const list = context?.opts?.list;
  const token = context?.conn_opts?.token;

  if (!list) {
    throw new AttioError('List is required to get parent object default value');
  }

  try {
    const response = await QorusRequest.get<{ data: { data: { parent_object: string[] } } }>(
      {
        path: `/v2/lists/${list}`,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
      {
        url: ATTIO_APP_API_URL,
        endpointId: ATTIO_APP_NAME,
      }
    );

    const responseData = response?.data?.data;

    if (!responseData) throw new AttioError('Failed to fetch list data');

    const parentObject = responseData.parent_object[0];

    if (!parentObject) {
      throw new AttioError('Parent object is not defined for the list');
    }

    return parentObject;
  } catch (error) {
    throw new AttioError(`Failed to get Attio list parent object default value: ${error}`);
  }
};
