import { IQoreAllowedValue, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { delay } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';
import { Client } from '@hubspot/api-client';

export const HUBSPOT_ALLOWED_VALUES_TIMEOUT = 60_000;
export const HUBSPOT_ALLOWED_VALUES_FETCH_DELAY = 300;

export type TFetchHubspotAllowedValuesOptions<ItemType = unknown> = {
  token: string;
  object: string;
  properties?: string[];
  limit?: number;
  maxResults?: number;
  sort?: {
    propertyName: string;
    direction: 'ASCENDING' | 'DESCENDING';
  };
  mapItemToAllowedValue: (item: ItemType) => IQoreAllowedValue<string>;
};

type THubspotObjectsResponse<ItemType = unknown> = {
  results: ItemType[];
  paging?: { next: { after: string } };
};

type THubspotTicketPipeline = {
  label: string;
  id: string;
  stages: {
    id: string;
    label: string;
    metadata: Record<string, any>;
  }[];
};

export const fetchHubspotAllowedValues = async <ItemType = unknown>(
  options: TFetchHubspotAllowedValuesOptions<ItemType>
): Promise<IQoreAllowedValue<string>[]> => {
  const items = await fetchHubspotRecords(options);

  return items.map(options.mapItemToAllowedValue);
};

const mapHubspotPipeline = (pipeline: THubspotTicketPipeline): IQoreAllowedValue<string> => ({
  display_name: pipeline.label,
  value: pipeline.id,
  desc: `Stages:\n${pipeline.stages.map((stage) => `  - ${stage.label}`).join('\n')}`,
});

export const getHubspotPipelineAllowedValues = async (
  token: string,
  object: string
): Promise<IQoreAllowedValue<string>[]> => {
  const response = await QorusRequest.get<{ data: { results: THubspotTicketPipeline[] } }>(
    {
      path: `/crm/v3/pipelines/${object}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    { endpointId: 'hubspot', url: 'https://api.hubapi.com' }
  );

  const responseData = response?.data;

  if (!responseData) {
    Debugger.log(`Failed to get Hubspot ${object} pipeline allowed values`);

    return [];
  }

  const pipelines = responseData.results.map(mapHubspotPipeline);

  return pipelines;
};

export const getHubspotPipelineStageAllowedValues = async (
  token: string,
  object: string,
  pipelineId: string,
  mapStage: (stage: Record<string, any>) => IQoreAllowedValue<string>
): Promise<IQoreAllowedValue<string>[]> => {
  const response = await QorusRequest.get<{ data: THubspotTicketPipeline }>(
    {
      path: `/crm/v3/pipelines/${object}/${pipelineId}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    { endpointId: 'hubspot', url: 'https://api.hubapi.com' }
  );

  const responseData = response?.data;

  if (!responseData) {
    Debugger.log(`Failed to get Hubspot ${object} pipeline stages allowed values`);

    return [];
  }

  return responseData.stages.map(mapStage);
};

export const fetchHubspotRecords = async <ItemType = unknown>(
  options: Omit<TFetchHubspotAllowedValuesOptions<ItemType>, 'mapItemToAllowedValue'>
): Promise<ItemType[]> => {
  const { object, token } = options;

  const items: ItemType[] = [];
  let after: string | undefined = undefined;
  const startTime = Date.now();
  const maxResults = options.maxResults || 200;
  const limit = options.limit || 100;

  try {
    do {
      if (Date.now() - startTime > HUBSPOT_ALLOWED_VALUES_TIMEOUT) {
        Debugger.log(`Timeout fetching hubspot allowed values for ${object}`);
        break;
      }

      if (items.length >= maxResults) {
        break;
      }

      const body: Record<string, any> = {
        limit: limit.toString(),
      };

      if (options.properties?.length) {
        body.properties = options.properties;
      }

      if (after) {
        body.after = after;
      }

      if (options.sort) {
        body.sorts = [options.sort];
      }

      const response = await QorusRequest.post<{
        data: THubspotObjectsResponse<ItemType>;
      }>(
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          path: `/crm/v3/objects/${object}/search`,
          data: body,
        },
        {
          url: `https://api.hubapi.com`,
          endpointId: 'Hubspot',
        }
      );

      const responseData: THubspotObjectsResponse<ItemType> | undefined = response?.data;

      if (!responseData?.results?.length) {
        break;
      }

      after = responseData?.paging?.next.after;

      items.push(...responseData.results);

      if (after) {
        await delay(HUBSPOT_ALLOWED_VALUES_FETCH_DELAY);
      }
    } while (after);
  } catch (error) {
    console.error(error);
    Debugger.log(`Error fetching hubspot records for ${object}`, error);

    return items;
  }

  return items;
};

export const createHubspotClient = (token: string) => {
  return new Client({ accessToken: token });
};
