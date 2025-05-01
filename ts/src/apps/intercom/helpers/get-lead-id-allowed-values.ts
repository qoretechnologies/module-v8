import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getIntercomAllowedValues } from '.';

interface IntercomLead {
  type: string;
  id: string;
  name?: string;
  email: string;
  phone?: string;
  created_at: number;
  updated_at: number;
  last_seen_at?: number;
  external_id: string;
  location?: {
    country?: string;
    city?: string;
    region?: string;
  };
  social_profiles?: {
    type: string;
    data: Array<{
      type: string;
      name: string;
      url: string;
    }>;
  };
  companies?: {
    type: string;
    data: Array<{
      id: string;
      name: string;
    }>;
  };
  custom_attributes?: Record<string, any>;
}

const getIntercomMapLeadToAllowedValueFunction = (valueField: 'id' | 'email' | 'external_id') => {
  return (lead: IntercomLead): IQoreAllowedValue<string> => {
    let displayName = lead.id;
    if (lead.name) {
      displayName = lead.name;
      if (lead.email) {
        displayName += ` (${lead.email})`;
      }
    } else if (lead.email) {
      displayName = lead.email;
    }

    const companyName = lead.companies?.data?.[0]?.name;

    const location = lead.location
      ? [lead.location.city, lead.location.region, lead.location.country].filter(Boolean).join(', ')
      : 'Unknown';

    let value = lead.id;
    if (valueField === 'email') {
      value = lead.email;
    } else if (valueField === 'external_id') {
      value = lead.external_id;
    }

    return {
      display_name: displayName,
      value,
      desc:
        `ID: ${lead.id}\n\n` +
        `Name: ${lead.name || 'Not provided'}\n\n` +
        `Email: ${lead.email || 'Not provided'}\n\n` +
        `Phone: ${lead.phone || 'Not provided'}\n\n` +
        `Company: ${companyName || 'Not associated'}\n\n` +
        `Location: ${location}\n\n` +
        `Created at: ${new Date(lead.created_at * 1000).toISOString()}\n\n` +
        `Last seen at: ${lead.last_seen_at ? new Date(lead.last_seen_at * 1000).toISOString() : 'Never'}`,
    };
  };
};

export const getIntercomLeadIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('Token is required to fetch Intercom leads');
  }

  return await getIntercomAllowedValues<IntercomLead>({
    token,
    method: 'POST',
    body: {
      query: {
        field: 'role',
        operator: '=',
        value: 'contact',
      },
    },
    path: '/contacts/search',
    dataPath: 'data',
    mapFn: getIntercomMapLeadToAllowedValueFunction('id'),
  });
};

export const getIntercomUserIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('Token is required to fetch Intercom leads');
  }

  return await getIntercomAllowedValues<IntercomLead>({
    token,
    method: 'POST',
    body: {
      query: {
        field: 'role',
        operator: '=',
        value: 'user',
      },
    },
    path: '/contacts/search',
    dataPath: 'data',
    mapFn: getIntercomMapLeadToAllowedValueFunction('id'),
  });
};

export const getIntercomUserEmailAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('Token is required to fetch Intercom leads');
  }

  const allowedValues = await getIntercomAllowedValues<IntercomLead>({
    token,
    method: 'POST',
    body: {
      query: {
        field: 'role',
        operator: '=',
        value: 'user',
      },
    },
    path: '/contacts/search',
    dataPath: 'data',
    mapFn: getIntercomMapLeadToAllowedValueFunction('email'),
  });

  return allowedValues.filter((value) => value.value);
};

export const getIntercomUserExternalIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('Token is required to fetch Intercom leads');
  }

  const allowedValues = await getIntercomAllowedValues<IntercomLead>({
    token,
    method: 'POST',
    body: {
      query: {
        field: 'role',
        operator: '=',
        value: 'user',
      },
    },
    path: '/contacts/search',
    dataPath: 'data',
    mapFn: getIntercomMapLeadToAllowedValueFunction('external_id'),
  });

  return allowedValues.filter((value) => value.value);
};
