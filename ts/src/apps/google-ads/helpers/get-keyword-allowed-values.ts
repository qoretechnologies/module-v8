// Copyright 2026 Qore Technologies, s.r.o.
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getGoogleAdsCustomerFromContext } from './constants';

export const getGoogleAdsKeywordAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  try {
    const { customer } = getGoogleAdsCustomerFromContext(context as any);
    const adGroupId = (context as any)?.opts?.ad_group_id;

    let query = `
      SELECT
        ad_group_criterion.criterion_id,
        ad_group_criterion.keyword.text,
        ad_group_criterion.keyword.match_type,
        ad_group_criterion.status,
        ad_group.name
      FROM ad_group_criterion
      WHERE ad_group_criterion.status != 'REMOVED'
        AND ad_group_criterion.type = 'KEYWORD'
    `;

    if (adGroupId) {
      query += ` AND ad_group.id = ${adGroupId}`;
    }

    query += ` ORDER BY ad_group_criterion.keyword.text ASC LIMIT 1000`;

    const results = await customer.query(query);

    return results.map(
      (row): IQoreAllowedValue<string> => ({
        value: String(row.ad_group_criterion?.criterion_id),
        display_name:
          row.ad_group_criterion?.keyword?.text ||
          `Keyword ${row.ad_group_criterion?.criterion_id}`,
        desc: `Match: ${row.ad_group_criterion?.keyword?.match_type ?? 'N/A'}\nAd Group: ${row.ad_group?.name ?? 'N/A'}\nStatus: ${row.ad_group_criterion?.status}`,
      })
    );
  } catch {
    return [];
  }
};
