// Copyright 2026 Qore Technologies, s.r.o.
import { IQoreAllowedValue, TCustomConnOptions, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getGoogleAdsCustomerFromContext } from './constants';

export const getGoogleAdsCampaignAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  try {
    const { customer } = getGoogleAdsCustomerFromContext(context as any);

    const results = await customer.query(`
      SELECT campaign.id, campaign.name, campaign.status
      FROM campaign
      WHERE campaign.status != 'REMOVED'
      ORDER BY campaign.name ASC
      LIMIT 1000
    `);

    return results.map(
      (row): IQoreAllowedValue<string> => ({
        value: String(row.campaign?.id),
        display_name: row.campaign?.name || `Campaign ${row.campaign?.id}`,
        desc: `Status: ${row.campaign?.status}`,
      })
    );
  } catch {
    return [];
  }
};
