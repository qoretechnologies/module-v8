import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GEMINI_CONN_OPTIONS } from '../constants';
import { createGeminiClient } from './constants';

const mapGeminiItemToAllowedValue = (item: {
  name: string;
  displayName: string;
  mimeType: string;
  sizeBytes: string;
}): IQoreAllowedValue<string> => ({
  value: item.name,
  display_name: item.displayName,
  desc: `Size: ${item.sizeBytes} bytes\n` + `Mime Type: ${item.mimeType}`,
});

export const getGeminiFileAllowedValues: TQoreGetAllowedValuesFunction<
  typeof GEMINI_CONN_OPTIONS,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
  });

  const client = createGeminiClient(token);
  const asyncIterable = await client.files.list();

  const files: Record<string, any>[] = [];
  for await (const m of asyncIterable) {
    files.push(m);
  }

  return files.map(mapGeminiItemToAllowedValue);
};
