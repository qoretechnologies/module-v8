// Copyright 2026 Qore Technologies, s.r.o.
import { IQoreAllowedValue, TCustomConnOptions, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getGoogleAdsCustomerFromContext } from './constants';

export const getGoogleAdsConversionActionAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  try {
    const { customer } = getGoogleAdsCustomerFromContext(context as any);

    const results = await customer.query(`
      SELECT
        conversion_action.id,
        conversion_action.name,
        conversion_action.type,
        conversion_action.status
      FROM conversion_action
      WHERE conversion_action.status = 'ENABLED'
      ORDER BY conversion_action.name ASC
      LIMIT 1000
    `);

    return results.map(
      (row): IQoreAllowedValue<string> => ({
        value: String(row.conversion_action?.id),
        display_name: row.conversion_action?.name || `Action ${row.conversion_action?.id}`,
        desc: `Type: ${row.conversion_action?.type}\nStatus: ${row.conversion_action?.status}`,
      })
    );
  } catch {
    return [];
  }
};
