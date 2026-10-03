// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT

import {
  IQoreAllowedValue,
  QorusRequest,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { delay } from '../../../global/helpers';
import { HUBSPOT_ALLOWED_VALUES_FETCH_DELAY, HUBSPOT_ALLOWED_VALUES_TIMEOUT } from './constants';

export type THubspotFormSummary = {
  id: string;
  name: string;
  formType: string;
  createdAt?: string;
  updatedAt?: string;
  archived?: boolean;
};

type THubspotFormsListResponse = {
  results: THubspotFormSummary[];
  paging?: { next?: { after?: string } };
};

const FORMS_PAGE_SIZE = 100;
const FORMS_MAX_RESULTS = 1000;

export const fetchHubspotForms = async (token: string): Promise<THubspotFormSummary[]> => {
  const items: THubspotFormSummary[] = [];
  let after: string | undefined = undefined;
  const startTime = Date.now();

  do {
    if (Date.now() - startTime >= HUBSPOT_ALLOWED_VALUES_TIMEOUT) {
      throw new Error('Timeout fetching hubspot forms allowed values');
    }

    if (items.length >= FORMS_MAX_RESULTS) {
      break;
    }

    const params: Record<string, string | number> = { limit: FORMS_PAGE_SIZE };

    if (after) {
      params.after = after;
    }

    const response = await QorusRequest.get<{ data: THubspotFormsListResponse }>(
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        path: '/marketing/v3/forms',
        params,
      },
      {
        url: 'https://api.hubapi.com',
        endpointId: 'Hubspot',
      }
    );
    if (Date.now() - startTime >= HUBSPOT_ALLOWED_VALUES_TIMEOUT) {
      throw new Error('Timeout fetching hubspot forms allowed values');
    }

    const responseData = response?.data;

    if (!responseData?.results?.length) {
      break;
    }

    items.push(...responseData.results);

    after = responseData.paging?.next?.after;

    if (after) {
      await delay(HUBSPOT_ALLOWED_VALUES_FETCH_DELAY);
    }
  } while (after);

  return items;
};

const mapHubspotForm = (form: THubspotFormSummary): IQoreAllowedValue<string> => ({
  value: form.id,
  display_name: form.name,
  desc: `Form type: ${form.formType}${form.archived ? ' (archived)' : ''}`,
});

export const getHubspotFormAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    return [];
  }

  const forms = await fetchHubspotForms(token);

  return forms.map(mapHubspotForm);
};
