import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { fetchHubspotObjectProperties } from './object-properties-allowed-values';

export const getHubspotCompanyIdPropertyAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  return await fetchHubspotObjectProperties({
    token,
    object: 'companies',
    filter: {
      hasUniqueValue: true,
    },
  });
};

export const getHubspotContactIdPropertyAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  return await fetchHubspotObjectProperties({
    token,
    object: 'contacts',
    filter: {
      hasUniqueValue: true,
    },
  });
};

export const getHubspotDealIdPropertyAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  return await fetchHubspotObjectProperties({
    token,
    object: 'deals',
    filter: {
      hasUniqueValue: true,
    },
  });
};

export const getHubspotLeadIdPropertyAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  return await fetchHubspotObjectProperties({
    token,
    object: 'leads',
    filter: {
      hasUniqueValue: true,
    },
  });
};

export const getHubspotProductIdPropertyAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  return await fetchHubspotObjectProperties({
    token,
    object: 'products',
    filter: {
      hasUniqueValue: true,
    },
  });
};

export const getHubspotTicketIdPropertyAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  return await fetchHubspotObjectProperties({
    token,
    object: 'tickets',
    filter: {
      hasUniqueValue: true,
    },
  });
};

export const getHubspotUserIdPropertyAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  return await fetchHubspotObjectProperties({
    token,
    object: 'users',
    filter: {
      hasUniqueValue: true,
    },
  });
};

export const getHubspotCustomObjectIdPropertyAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;
  const object = context?.opts?.object || context?.opts?.objectType;

  return await fetchHubspotObjectProperties({ token, object, filter: { hasUniqueValue: true } });
};
