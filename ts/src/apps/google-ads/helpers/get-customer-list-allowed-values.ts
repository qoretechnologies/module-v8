// Copyright 2026 Qore Technologies, s.r.o.
import { IQoreAllowedValue, TCustomConnOptions, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getGoogleAdsCustomerFromContext } from './constants';

export const getGoogleAdsCustomerListAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  try {
    const { customer } = getGoogleAdsCustomerFromContext(context as any);

    const results = await customer.query(`
      SELECT
        user_list.id,
        user_list.name,
        user_list.description,
        user_list.membership_status,
        user_list.size_for_display,
        user_list.size_for_search
      FROM user_list
      WHERE user_list.membership_status = 'OPEN'
      ORDER BY user_list.name ASC
      LIMIT 1000
    `);

    return results.map(
      (row): IQoreAllowedValue<string> => ({
        value: String(row.user_list?.id),
        display_name: row.user_list?.name || `List ${row.user_list?.id}`,
        desc: row.user_list?.description
          ? `${row.user_list.description}\nDisplay size: ${row.user_list?.size_for_display || 'N/A'}`
          : `Display size: ${row.user_list?.size_for_display || 'N/A'}`,
      })
    );
  } catch {
    return [];
  }
};
