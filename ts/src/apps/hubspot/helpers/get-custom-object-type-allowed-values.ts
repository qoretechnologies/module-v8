import {
  IQoreAllowedValue,
  QorusRequest,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';

type THubspotCustomOjectSchema = {
  labels: {
    singular: string;
    plural: string;
  };
  objectTypeId: string;
};

const mapHubspotCustomObjectType = (
  customObjectType: THubspotCustomOjectSchema
): IQoreAllowedValue<string> => ({
  value: customObjectType.objectTypeId,
  display_name: customObjectType.labels.singular,
  short_desc: customObjectType.labels.plural,
});

export const getHubspotCustomObjectTypeAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('The token is required to get Hubspot custom object type allowed values');
  }

  const customObjectTypes: IQoreAllowedValue<string>[] = [];

  const response = await QorusRequest.get<{
    data: { results: THubspotCustomOjectSchema[] };
  }>(
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      path: `/crm/v3/schemas`,
    },
    {
      url: `https://api.hubapi.com`,
      endpointId: 'Hubspot',
    }
  );

  const responseData = response?.data;

  if (!responseData || !responseData.results) {
    throw new Error('No data found for hubspot custom object types');
  }

  customObjectTypes.push(...responseData.results.map(mapHubspotCustomObjectType));

  return customObjectTypes;
};
