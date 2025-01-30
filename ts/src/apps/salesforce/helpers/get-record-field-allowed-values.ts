import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { SALESFORCE_API_VERSION, SALESFORCE_CONN_OPTIONS } from '../constants';

export const getSalesforceRecordFieldAllowedValues: TQoreGetAllowedValuesFunction<
  typeof SALESFORCE_CONN_OPTIONS
> = async (context): Promise<IQoreAllowedValue[]> => {
  const {
    conn_opts: { token, instance_url },
    opts: { object },
  } = context;

  const objectFields: IQoreAllowedValue[] = [];

  const {
    data: { fields },
  } = await QorusRequest.get<{
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

  objectFields.push(
    ...fields.map(
      (field): IQoreAllowedValue => ({
        value: field.name,
        display_name: field.label,
      })
    )
  );

  return objectFields;
};
