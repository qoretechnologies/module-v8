import {
  IQoreAllowedValue,
  QorusRequest,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';

type THubspotOjectSchema = {
  labels: {
    singular: string;
    plural: string;
  };
  objectTypeId: string;
  description?: string;
};

const makeRequest = (token: string, path: string): Promise<any> => {
  return QorusRequest.get<{
    data: { results: THubspotOjectSchema[] };
  }>(
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      path,
    },
    {
      url: `https://api.hubapi.com`,
      endpointId: 'Hubspot',
    }
  );
};

const mapHubspotObjectType = (objectType: THubspotOjectSchema): IQoreAllowedValue<string> => ({
  value: objectType.objectTypeId,
  display_name: objectType.labels.singular,
  short_desc: objectType.description,
});

export const getHubspotObjectTypeAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('The token is required to get Hubspot object type allowed values');
  }

  const customObjectTypes: IQoreAllowedValue<string>[] = [];

  const [
    customObjectsResponse,
    contactResponse,
    companyResponse,
    dealResponse,
    ticketResponse,
    leadResponse,
  ] = await Promise.all([
    makeRequest(token, '/crm/v3/schemas'),
    makeRequest(token, '/crm/v3/schemas/contacts'),
    makeRequest(token, '/crm/v3/schemas/companies'),
    makeRequest(token, '/crm/v3/schemas/deals'),
    makeRequest(token, '/crm/v3/schemas/tickets'),
    makeRequest(token, '/crm/v3/schemas/leads'),
  ]);

  const objects = [
    ...customObjectsResponse.data.results,
    contactResponse.data,
    companyResponse.data,
    dealResponse.data,
    ticketResponse.data,
    leadResponse.data,
  ];

  if (!objects || objects.length === 0) {
    throw new Error('No data found for hubspot custom object types');
  }

  customObjectTypes.push(...objects.map(mapHubspotObjectType));

  return customObjectTypes;
};
