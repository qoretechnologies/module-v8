// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT

import {
  IQoreAllowedValue,
  QorusRequest,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { ZENDESK_CONN_OPTIONS } from '../app-constants';
import { delay } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';
import { ZENDESK_ALLOWED_VALUES_FETCH_DELAY, ZENDESK_ALLOWED_VALUES_TIMEOUT } from './constants';

type TEntityData = {
  [displayNameField: string]: string;
} & { id: number };

interface IZendeskResponseBase {
  next_page: string;
}

type IZendeskResponseData = IZendeskResponseBase & {
  [entity: string]: TEntityData[];
};

export const CreateZendeskGetAllowedValuesFunction = (
  entity: string,
  displayNameField = 'name',
  additionalParams: Record<string, string> = {},
  composeDescription?: (entity: unknown) => string
): TQoreGetAllowedValuesFunction<typeof ZENDESK_CONN_OPTIONS, number> => {
  return async (context): Promise<IQoreAllowedValue<number>[]> => {
    const token = context?.conn_opts?.token;
    const subdomain = context?.conn_opts?.subdomain;

    if (!token || !subdomain) {
      throw new Error('The token and subdomain are required to get Zendesk allowed values');
    }

    const values: IQoreAllowedValue<number>[] = [];
    const startTime = Date.now();
    let page: string | null = null;

    do {
      if (Date.now() - startTime >= ZENDESK_ALLOWED_VALUES_TIMEOUT) {
        throw new Error(`Timeout fetching Zendesk ${entity}`);
      }

      const params: Record<string, string> = {
        ...additionalParams,
        ...(page && { page }),
      };

      const response: { data: IZendeskResponseData } | undefined = await QorusRequest.get<{
        data: IZendeskResponseData;
      }>(
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          path: `/api/v2/${entity}`,
          params,
        },
        { url: `https://${subdomain}.zendesk.com`, endpointId: 'Zendesk' }
      );
      if (Date.now() - startTime >= ZENDESK_ALLOWED_VALUES_TIMEOUT) {
        throw new Error(`Timeout fetching Zendesk ${entity}`);
      }

      const responseData: IZendeskResponseData | undefined = response?.data;

      if (!responseData) {
        Debugger.log(`No data found for ${entity}`);
        break;
      }

      const additionalValues: IQoreAllowedValue<number>[] = responseData[entity].map(
        (entity: TEntityData): IQoreAllowedValue<number> => ({
          value: entity.id,
          display_name: entity[displayNameField],
          ...(composeDescription && { desc: composeDescription(entity) }),
        })
      );

      values.push(...additionalValues);

      page = responseData.next_page
        ? new URL(responseData.next_page).searchParams.get('page')
        : null;

      if (page) {
        await delay(ZENDESK_ALLOWED_VALUES_FETCH_DELAY);
      }
    } while (page);

    return values;
  };
};
