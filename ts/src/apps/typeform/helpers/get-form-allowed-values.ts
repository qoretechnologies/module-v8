import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { createClient, Typeform } from '@typeform/api-client';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { TypeformError } from '../constants';

type Form = Typeform.API.Forms.List['items'][number];

const mapTypeformItemToAllowedValue = (item: Form): IQoreAllowedValue<string> => ({
  value: item.id!,
  display_name: item.title,
  desc: `Id: ${item.id}\nType: ${item.type}\n`,
});

export const getTypeformFormIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: TypeformError,
  });

  const client = createClient({ token });

  const items: Form[] = [];
  let page = 1;
  let totalPages = 1;

  try {
    while (page <= totalPages) {
      const response = await client.forms.list({ page });
      items.push(...response.items);
      totalPages = response.page_count;
      page++;
    }
  } catch (error) {
    console.error(`Failed to fetch forms: ${error}`);
  }

  return items.map(mapTypeformItemToAllowedValue);
};
