import { Model } from '@google/genai';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GEMINI_CONN_OPTIONS } from '../constants';
import { createGeminiClient } from './constants';

const mapGeminiItemToAllowedValue = (item: Model): IQoreAllowedValue<string> => ({
  value: item.name!.replace('models/', ''),
  display_name: item.displayName ?? item.name!,
  ...(item.description && { desc: item.description }),
});

export const getGeminiModelAllowedValues: TQoreGetAllowedValuesFunction<
  typeof GEMINI_CONN_OPTIONS,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
  });

  const client = createGeminiClient(token);
  const asyncIterable = await client.models.list();

  const models: Model[] = [];
  for await (const m of asyncIterable) {
    models.push(m);
  }

  return models.map(mapGeminiItemToAllowedValue);
};
