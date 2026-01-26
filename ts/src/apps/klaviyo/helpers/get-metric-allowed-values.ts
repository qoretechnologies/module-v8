import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { KlaviyoError } from '../constants';
import { getKlaviyoApis } from './constants';

type ItemType = {
  id: string;
  attributes: {
    name?: string;
    integration: { name: string };
  };
};

const mapKlaviyoItemToAllowedValue = (item: ItemType): IQoreAllowedValue<string> => {
  const name =
    item.attributes.name && item.attributes.integration.name
      ? `${item.attributes.name} (${item.attributes.integration.name})`
      : 'Unknown Metric';

  return {
    value: item.attributes.name!,
    display_name: name,
  };
};

const mapKlaviyoItemToIdAllowedValue = (item: ItemType): IQoreAllowedValue<string> => {
  const name =
    item.attributes.name && item.attributes.integration.name
      ? `${item.attributes.name} (${item.attributes.integration.name})`
      : 'Unknown Metric';

  return {
    value: item.id,
    display_name: name,
  };
};

export const getKlaviyoMetricAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: KlaviyoError,
  });

  const { metricsApi } = getKlaviyoApis(token);

  const items: ItemType[] = [];
  let pageCursor = undefined;

  try {
    do {
      const response = await metricsApi.getMetrics({
        ...(pageCursor && { pageCursor }),
      });

      items.push(...(response.body.data as ItemType[]));
      pageCursor = response.body.links?.next;
    } while (pageCursor);
  } catch (error) {
    console.error(`Failed to fetch metrics: ${error}`);
  }

  return items.map(mapKlaviyoItemToAllowedValue);
};

export const getKlaviyoMetricIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: KlaviyoError,
  });

  const { metricsApi } = getKlaviyoApis(token);

  const items: ItemType[] = [];
  let pageCursor = undefined;

  try {
    do {
      const response = await metricsApi.getMetrics({
        ...(pageCursor && { pageCursor }),
      });

      items.push(...(response.body.data as ItemType[]));
      pageCursor = response.body.links?.next;
    } while (pageCursor);
  } catch (error) {
    console.error(`Failed to fetch metrics: ${error}`);
  }

  return items.map(mapKlaviyoItemToIdAllowedValue);
};
