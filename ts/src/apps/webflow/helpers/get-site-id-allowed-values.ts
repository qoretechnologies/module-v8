// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT

import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { Site } from 'webflow-api/api';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { WebflowError } from '../constants';
import { createWebflowClient } from './constants';

const mapWebflowItemToAllowedValue = (item: Site): IQoreAllowedValue<string> => ({
  value: item.id!,
  display_name: item.displayName,
});

export const getWebflowSiteIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: WebflowError,
  });

  const client = createWebflowClient(token);

  const items: Site[] = [];

  const response = await client.sites.list();

  if (response.sites) {
    items.push(...response.sites);
  }

  return items.map(mapWebflowItemToAllowedValue);
};
