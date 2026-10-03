// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT

import { TCustomConnOptions, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getContentfulScopedClient } from '../client';

export const getContentfulFieldAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const spaceId = context?.opts?.space_id;
  const environmentId = context?.opts?.environment_id || 'master';
  const contentTypeId = context?.opts?.content_type_id;

  if (!context?.conn_opts?.token || !spaceId || !contentTypeId) {
    return [];
  }

  const client = getContentfulScopedClient(context, spaceId, environmentId);
  const contentType = await client.contentType.get({ contentTypeId });

  return contentType.fields.map((field) => ({
    value: field.id,
    display_name: field.name,
  }));
};
