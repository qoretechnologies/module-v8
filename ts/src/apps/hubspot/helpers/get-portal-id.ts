import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { Debugger } from '../../../utils/Debugger';

const portalIdCache = new Map<string, number>();

type TIntegrationsMeResponse = {
  portalId: number;
  timeZone?: string;
  currency?: string;
};

export const getHubspotPortalId = async (token: string): Promise<number | undefined> => {
  if (!token) {
    return undefined;
  }

  const cached = portalIdCache.get(token);

  if (cached !== undefined) {
    return cached;
  }

  try {
    const response = await QorusRequest.get<{ data: TIntegrationsMeResponse }>(
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        path: '/integrations/v1/me',
      },
      {
        url: 'https://api.hubapi.com',
        endpointId: 'Hubspot',
      }
    );

    const portalId = response?.data?.portalId;

    if (typeof portalId !== 'number') {
      Debugger.log('Hubspot /integrations/v1/me returned no portalId');

      return undefined;
    }

    portalIdCache.set(token, portalId);

    return portalId;
  } catch (error) {
    Debugger.log('Failed to fetch Hubspot portalId from /integrations/v1/me', error);

    return undefined;
  }
};
