import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { FRESHDESK_CONN_OPTIONS } from '../constants';
import { fetchFreshdeskAllowedValues } from './constants';

type TFreshdeskSchema = {
  id: number;
  description: string;
  name: string;
};

const mapFreshdeskSchema = (schema: TFreshdeskSchema): IQoreAllowedValue => ({
  value: schema.id.toString(),
  display_name: schema.name,
  desc: `ID: ${schema.id}\n\nName: ${schema.name}\n\nDescription: ${schema.description}`,
});

export const getFreshdeskSchemaIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof FRESHDESK_CONN_OPTIONS
> = async (context): Promise<IQoreAllowedValue[]> => {
  const {
    conn_opts: { token, subdomain },
  } = context;

  const companies = await fetchFreshdeskAllowedValues<TFreshdeskSchema>({
    subdomain,
    token,
    path: '/api/v2/custom_objects/schemas',
    mapItemToAllowedValue: mapFreshdeskSchema,
  });

  return companies;
};
