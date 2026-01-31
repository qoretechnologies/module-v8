import { IQoreAllowedValue, QorusRequest } from '@qoretechnologies/ts-toolkit';

interface IFetchTrelloDataOptions {
  token: string;
  key: string;
  path: string;
  params?: Record<string, string>;
}

interface IGetTrelloAllowedValuesOptions<ItemType, TAllowedValue> extends IFetchTrelloDataOptions {
  mapItemToAllowedValue: (item: ItemType) => IQoreAllowedValue<TAllowedValue>;
}

export class TrelloError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TrelloError';
  }
}

export const fetchTrelloData = async <DataType = unknown>(
  options: IFetchTrelloDataOptions
): Promise<DataType> => {
  const { token, key, path, params } = options;

  try {
    const response = await QorusRequest.get<{ data: DataType }>(
      { path, params: { ...params, key, token } },
      { endpointId: 'Trello', url: 'https://api.trello.com/1' }
    );

    const responseData = response?.data;

    if (!responseData) {
      throw new Error('No data found in the response');
    }

    return responseData;
  } catch (error) {
    throw new TrelloError(
      `Failed to fetch data for ${path}: ${error?.message || JSON.stringify(error)}`
    );
  }
};

export const getTrelloAllowedValues = async <ItemType, TAllowedValue>(
  options: IGetTrelloAllowedValuesOptions<ItemType, TAllowedValue>
): Promise<IQoreAllowedValue<TAllowedValue>[]> => {
  const { token, key, mapItemToAllowedValue, path } = options;

  try {
    const items = await fetchTrelloData<ItemType[]>({
      token,
      key,
      path,
    });

    const allowedValues: IQoreAllowedValue<TAllowedValue>[] = items.map(mapItemToAllowedValue);

    return allowedValues;
  } catch (error) {
    throw new TrelloError(
      `Failed to get Trello allowed values for ${path}: ${error?.message || JSON.stringify(error)}`
    );
  }
};
