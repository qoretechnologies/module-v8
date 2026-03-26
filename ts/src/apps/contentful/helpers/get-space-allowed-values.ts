import { IQoreAllowedValue, TCustomConnOptions, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getContentfulClient } from '../client';

export const getContentfulSpaceAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  if (!context?.conn_opts?.token) {
    return [];
  }

  try {
    const client = getContentfulClient(context);

    // First try the direct /spaces endpoint
    const spaces = await client.space.getMany({ query: { limit: 100 } });
    if (spaces.items.length > 0) {
      return spaces.items.map((space) => ({
        value: space.sys.id,
        display_name: space.name,
      }));
    }

    // If no spaces found, try via organizations (org-scoped tokens)
    const orgs = await client.organization.getAll({});
    const results: IQoreAllowedValue<string>[] = [];

    for (const org of orgs.items) {
      const orgSpaces = await client.space.getManyForOrganization({
        organizationId: org.sys.id,
        query: { limit: 100 },
      });
      for (const space of orgSpaces.items) {
        results.push({
          value: space.sys.id,
          display_name: space.name,
        });
      }
    }

    return results;
  } catch {
    return [];
  }
};
