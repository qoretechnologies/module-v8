// Copyright 2026 Qore Technologies, s.r.o.
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { fromMicros, getGoogleAdsCustomerFromContext } from './constants';

export const getGoogleAdsBudgetAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  try {
    const { customer } = getGoogleAdsCustomerFromContext(context as any);

    const results = await customer.query(`
      SELECT
        campaign_budget.id,
        campaign_budget.name,
        campaign_budget.amount_micros,
        campaign_budget.status,
        campaign_budget.delivery_method
      FROM campaign_budget
      ORDER BY campaign_budget.name ASC
      LIMIT 1000
    `);

    return results.map(
      (row): IQoreAllowedValue<string> => ({
        value: String(row.campaign_budget?.id),
        display_name: row.campaign_budget?.name || `Budget ${row.campaign_budget?.id}`,
        desc: `Daily: $${fromMicros(Number(row.campaign_budget?.amount_micros || 0)).toFixed(2)}\nDelivery: ${row.campaign_budget?.delivery_method}`,
      })
    );
  } catch {
    return [];
  }
};
