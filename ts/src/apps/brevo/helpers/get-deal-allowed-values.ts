import { TCustomConnOptions, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { BrevoError, extractBrevoError } from '../constants';
import { createBrevoClient } from './constants';

export const getBrevoDealAllowedValues: TQoreGetAllowedValuesFunction<
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
    const response = await client.dealsClient.crmDealsGet(
      undefined,
      undefined,
      undefined,
      undefined,
      1000
    );

    return (
      response.body.items?.map((deal: { id: string; attributes: Record<string, any> }) => ({
        value: deal.id,
        display_name: deal.attributes?.deal_name || deal.id,
        desc: `Amount: ${deal.attributes?.amount || 0}`,
      })) || []
    );
  } catch (error) {
    throw new BrevoError(`Failed to get deals: ${extractBrevoError(error)}`);
  }
};
