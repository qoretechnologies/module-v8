import {
  IQoreAllowedValue,
  QorusRequest,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';

type THubspotObjectProperty = {
  name: 'string';
  label: 'string';
  description: 'string';
};

export type TFetchHubspotObjectPropertiesOptions = {
  token?: string;
  object?: string;
};

const mapHubspotObjectProperty = (property: THubspotObjectProperty): IQoreAllowedValue<string> => ({
  value: property.name,
  display_name: property.label,
  short_desc: property.description,
});

export const fetchHubspotObjectProperties = async (
  options: TFetchHubspotObjectPropertiesOptions
): Promise<IQoreAllowedValue<string>[]> => {
  const token = options.token;
  const object = options.object;

  if (!token || !object) {
    throw new Error(`The token and object are required to fetch Hubspot object properties`);
  }

  const response = await QorusRequest.get<{
    data: { results: THubspotObjectProperty[] };
  }>(
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      path: `/crm/v3/properties/${object}`,
    },
    {
      url: `https://api.hubapi.com`,
      endpointId: 'Hubspot',
    }
  );

  const responseData = response?.data;

  if (!responseData || !responseData.results) {
    throw new Error('No data found for hubspot object properties');
  }

  return responseData.results.map(mapHubspotObjectProperty);
};

export const getHubspotCompanyPropertiesAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  return await fetchHubspotObjectProperties({ token, object: 'companies' });
};

export const getHubspotContactPropertiesAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  return await fetchHubspotObjectProperties({ token, object: 'contacts' });
};

export const getHubspotDealPropertiesAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  return await fetchHubspotObjectProperties({ token, object: 'deals' });
};

export const getHubspotLeadPropertiesAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  return await fetchHubspotObjectProperties({ token, object: 'leads' });
};

export const getHubspotProductPropertiesAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  return await fetchHubspotObjectProperties({ token, object: 'products' });
};

export const getHubspotTicketPropertiesAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  return await fetchHubspotObjectProperties({ token, object: 'tickets' });
};

export const getHubspotUserPropertiesAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  return await fetchHubspotObjectProperties({ token, object: 'users' });
};

export const getHubspotCustomObjectPropertiesAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;
  const object = context?.opts?.object || context?.opts?.objectType;

  return await fetchHubspotObjectProperties({ token, object });
};
