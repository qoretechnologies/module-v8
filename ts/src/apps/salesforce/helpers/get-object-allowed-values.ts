import {
  IQoreAllowedValue,
  QorusRequest,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { SALESFORCE_API_VERSION, SALESFORCE_CONN_OPTIONS } from '../constants';

export const getSalesforceObjectAllowedValues: TQoreGetAllowedValuesFunction<
  typeof SALESFORCE_CONN_OPTIONS
> = async (context): Promise<IQoreAllowedValue[]> => {
  const token = context?.conn_opts?.token;
  const instance_url = context?.conn_opts?.instance_url;

  if (!token || !instance_url) {
    throw new Error(
      'The token and instance_url is required to get Salesforce object allowed values'
    );
  }

  const objectTypes: IQoreAllowedValue[] = [];

  const response = await QorusRequest.get<{
    data: { sobjects: { name: string; label: string }[] };
  }>(
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      path: `/services/data/${SALESFORCE_API_VERSION}/sobjects`,
    },
    {
      url: instance_url,
      endpointId: 'Salesforce',
    }
  );

  const responseData = response?.data;

  if (!responseData) return objectTypes;

  objectTypes.push(
    ...responseData.sobjects.map(
      (object): IQoreAllowedValue => ({
        value: object.name,
        display_name: object.label,
      })
    )
  );

  return objectTypes;
};
