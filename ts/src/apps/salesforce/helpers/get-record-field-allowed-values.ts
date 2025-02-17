import {
  IQoreAllowedValue,
  QorusRequest,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { SALESFORCE_API_VERSION, SALESFORCE_CONN_OPTIONS } from '../constants';

export const getSalesforceRecordFieldAllowedValues: TQoreGetAllowedValuesFunction<
  typeof SALESFORCE_CONN_OPTIONS
> = async (context): Promise<IQoreAllowedValue[]> => {
  const token = context?.conn_opts?.token;
  const instance_url = context?.conn_opts?.instance_url;
  const object = context?.opts?.object;

  if (!token || !instance_url || !object) {
    throw new Error(
      'The token, instance_url, and object are required to get Salesforce record field allowed values'
    );
  }

  const objectFields: IQoreAllowedValue[] = [];

  const response = await QorusRequest.get<{
    data: { fields: { name: string; label: string }[] };
  }>(
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      path: `/services/data/${SALESFORCE_API_VERSION}/sobjects/${object}/describe`,
    },
    {
      url: instance_url,
      endpointId: 'Salesforce',
    }
  );

  const responseData = response?.data;

  if (!responseData) return objectFields;

  objectFields.push(
    ...responseData.fields.map(
      (field): IQoreAllowedValue => ({
        value: field.name,
        display_name: field.label,
      })
    )
  );

  return objectFields;
};
