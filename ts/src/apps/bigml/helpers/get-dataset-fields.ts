import { TQoreAnyType, TQoreOptions, TQoreType } from '@qoretechnologies/ts-toolkit';
import { bigMlApiClient } from './constants';

export const BigMlFieldTypeToQoreType: Record<string, TQoreType> = {
  int8: 'integer',
  int16: 'integer',
  int32: 'integer',
  int64: 'integer',
  double: 'number',
  float: 'number',
  string: 'string',
  boolean: 'boolean',
  datetime: 'string',
  time: 'string',
  categorical: 'string',
  text: 'string',
  items: 'string',
};

type TGetBigMlDatasetFieldsOptions = {
  username: string;
  token: string;
  dataset: string;
};

type TBigMlField = {
  name: string;
  datatype: string;
  auto_generated: boolean;
};

export const getBigMlDatasetFields = async (
  options: TGetBigMlDatasetFieldsOptions
): Promise<TBigMlField[]> => {
  const { username, token, dataset } = options;

  const datasetResponse = await bigMlApiClient<{ fields: Record<string, TBigMlField> }>({
    token,
    username,
    method: 'GET',
    path: dataset,
  });

  return Object.values(datasetResponse.fields);
};

export const mapBigMlDatasetFieldsToQoreOptions = async (
  options: TGetBigMlDatasetFieldsOptions
): Promise<TQoreOptions> => {
  const datasetResponse = await getBigMlDatasetFields(options);

  const qoreOptions: TQoreOptions = {};

  datasetResponse
    .filter((field) => !field.auto_generated)
    .forEach((field: TBigMlField) => {
      const qoreType = (BigMlFieldTypeToQoreType[field.datatype] || 'softstring') as TQoreAnyType;
      qoreOptions[field.name] = { type: qoreType, display_name: field.name };
    });

  return qoreOptions;
};
