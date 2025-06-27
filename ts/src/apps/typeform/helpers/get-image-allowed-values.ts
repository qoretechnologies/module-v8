import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { createClient, Typeform } from '@typeform/api-client';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { TypeformError } from '../constants';

type Image = Typeform.Image;

const mapTypeformItemToAllowedValue = (item: Image): IQoreAllowedValue<string> => ({
  value: item.id!,
  display_name: item.file_name,
  desc: `Id: ${item.id}\nMedia Type: ${item.media_type}\n`,
});

export const getTypeformImageIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: TypeformError,
  });

  const client = createClient({ token });

  const items: Image[] = [];

  try {
    const images = await client.images.list();
    items.push(...images);
  } catch (error) {
    console.error(`Failed to fetch images: ${error}`);
  }

  return items.map(mapTypeformItemToAllowedValue);
};
