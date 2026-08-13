// Copyright 2026 Qore Technologies, s.r.o.
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getGoogleAdsCustomerFromContext } from './constants';

export const getGoogleAdsBiddingStrategyAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  try {
    const { customer } = getGoogleAdsCustomerFromContext(context as any);

    const results = await customer.query(`
      SELECT
        bidding_strategy.id,
        bidding_strategy.name,
        bidding_strategy.type,
        bidding_strategy.status
      FROM bidding_strategy
      ORDER BY bidding_strategy.name ASC
      LIMIT 1000
    `);

    return results.map(
      (row): IQoreAllowedValue<string> => ({
        value: String(row.bidding_strategy?.id),
        display_name: row.bidding_strategy?.name || `Strategy ${row.bidding_strategy?.id}`,
        desc: `Type: ${row.bidding_strategy?.type}\nStatus: ${row.bidding_strategy?.status}`,
      })
    );
  } catch {
    return [];
  }
};
