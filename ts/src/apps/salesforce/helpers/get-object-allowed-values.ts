import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { SALESFORCE_API_VERSION, SALESFORCE_CONN_OPTIONS } from '../constants';

export const getSalesforceObjectAllowedValues: TQoreGetAllowedValuesFunction<
  typeof SALESFORCE_CONN_OPTIONS
> = async (context): Promise<IQoreAllowedValue[]> => {
  const {
    conn_opts: { token, instance_url },
  } = context;

  const objectTypes: IQoreAllowedValue[] = [];

  const {
    data: { sobjects },
  } = await QorusRequest.get<{
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

  objectTypes.push(
    ...sobjects.map(
      (object): IQoreAllowedValue => ({
        value: object.name,
        display_name: object.label,
      })
    )
  );

  return objectTypes;
};
