// Copyright 2026 Qore Technologies, s.r.o.
import { IQoreAllowedValue, TCustomConnOptions, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getGoogleAdsCustomerFromContext } from './constants';

export const getGoogleAdsAdGroupAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  try {
    const { customer } = getGoogleAdsCustomerFromContext(context as any);
    const campaignId = (context as any)?.opts?.campaign_id;

    let query = `
      SELECT ad_group.id, ad_group.name, ad_group.status, campaign.name
      FROM ad_group
      WHERE ad_group.status != 'REMOVED'
    `;

    if (campaignId) {
      query += ` AND campaign.id = ${campaignId}`;
    }

    query += ` ORDER BY ad_group.name ASC LIMIT 1000`;

    const results = await customer.query(query);

    return results.map(
      (row): IQoreAllowedValue<string> => ({
        value: String(row.ad_group?.id),
        display_name: row.ad_group?.name || `Ad Group ${row.ad_group?.id}`,
        desc: `Campaign: ${row.campaign?.name}\nStatus: ${row.ad_group?.status}`,
      })
    );
  } catch {
    return [];
  }
};
