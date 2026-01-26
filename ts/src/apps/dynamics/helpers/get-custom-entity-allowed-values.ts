import {
  IQoreAllowedValue,
  QorusRequest,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { Debugger } from '../../../utils/Debugger';
import { formatDynamicsUrl } from '../constants';

export const getDynamicsCustomEntityAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;
  const organizationUrl = formatDynamicsUrl(context?.conn_opts?.url);

  const missingValues: string[] = [];
  if (!token) missingValues.push('token');
  if (!organizationUrl) missingValues.push('organizationUrl');

  if (missingValues.length) {
    throw new Error(
      `All of the following ${missingValues.join(', ')} are required to get Dynamics custom entity allowed values`
    );
  }

  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0',
    };

    const response = await QorusRequest.get<{ data: { value: any[] } }>(
      {
        path: '/api/data/v9.1/EntityDefinitions',
        headers,
        params: {
          $select:
            'LogicalName,DisplayName,SchemaName,IsCustomEntity,IsCustomizable,ObjectTypeCode',
          $filter: 'IsCustomEntity eq true',
        },
      },
      {
        url: organizationUrl!,
        endpointId: 'Dynamics',
      }
    );

    const entityDefinitions = response?.data?.value || [];

    return entityDefinitions.map((entity) => {
      const displayName = entity.DisplayName?.UserLocalizedLabel?.Label || entity.LogicalName;

      return {
        value: entity.LogicalName,
        display_name: displayName,
        desc: `Entity Schema Name: ${entity.SchemaName}\nObject Type Code: ${entity.ObjectTypeCode}${
          entity.IsCustomizable?.Value
            ? '\nThis entity is customizable'
            : '\nThis entity is not customizable'
        }`,
      };
    });
  } catch (error) {
    Debugger.log('Error fetching Dynamics custom entities:', error);
    throw new Error(`Failed to get Dynamics custom entities: ${JSON.stringify(error)}`);
  }
};
