// Copyright 2026 Qore Technologies, s.r.o.
import { IQoreAllowedValue, TCustomConnOptions, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getGoogleAdsCustomerFromContext } from './constants';

export const getGoogleAdsAdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  try {
    const { customer } = getGoogleAdsCustomerFromContext(context as any);
    const adGroupId = (context as any)?.opts?.ad_group_id;

    let query = `
      SELECT
        ad_group_ad.ad.id,
        ad_group_ad.ad.type,
        ad_group_ad.ad.final_urls,
        ad_group_ad.status,
        ad_group.name
      FROM ad_group_ad
      WHERE ad_group_ad.status != 'REMOVED'
    `;

    if (adGroupId) {
      query += ` AND ad_group.id = ${adGroupId}`;
    }

    query += ` ORDER BY ad_group_ad.ad.id ASC LIMIT 1000`;

    const results = await customer.query(query);

    return results.map(
      (row): IQoreAllowedValue<string> => ({
        value: String(row.ad_group_ad?.ad?.id),
        display_name: `Ad ${row.ad_group_ad?.ad?.id} (${row.ad_group_ad?.ad?.type ?? 'Unknown'})`,
        desc: `Ad Group: ${row.ad_group?.name ?? 'N/A'}\nURLs: ${(row.ad_group_ad?.ad?.final_urls ?? []).join(', ') || 'N/A'}\nStatus: ${row.ad_group_ad?.status}`,
      })
    );
  } catch {
    return [];
  }
};
