import { TCustomConnOptions, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { BrevoError, extractBrevoError } from '../constants';
import { createBrevoClient } from './constants';

export const getBrevoCompanyAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: BrevoError,
  });

  const client = createBrevoClient(token);

  try {
    const response = await client.companiesClient.companiesGet(
      undefined,
      undefined,
      undefined,
      undefined,
      1000
    );

    return (
      response.body.items?.map((company: { id: string; attributes: Record<string, any> }) => ({
        value: company.id,
        display_name: company.attributes?.name || company.id,
      })) || []
    );
  } catch (error) {
    throw new BrevoError(`Failed to get companies: ${extractBrevoError(error)}`);
  }
};
