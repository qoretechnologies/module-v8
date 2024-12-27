import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { ZENDESK_CONN_OPTIONS } from '..';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { Debugger } from '../../../utils/Debugger';
import { delay } from '../../../global/helpers';
import { ZENDESK_ALLOWED_VALUES_FETCH_DELAY, ZENDESK_ALLOWED_VALUES_TIMEOUT } from './constants';

export const CreateZendeskGetAllowedValuesFunction = (
  entity: string,
  displayNameField = 'name',
  additionalParams: Record<string, string> = {},
  composeDescription?: (entity: any) => string
): TQoreGetAllowedValuesFunction<typeof ZENDESK_CONN_OPTIONS> => {
  return async (context): Promise<IQoreAllowedValue[]> => {
    const {
      conn_opts: { token, subdomain },
    } = context;

    const values: IQoreAllowedValue[] = [];
    const startTime = Date.now();
    let page: string | null = null;

    try {
      do {
        if (Date.now() - startTime > ZENDESK_ALLOWED_VALUES_TIMEOUT) {
          Debugger.log(`Timeout fetching Zendesk ${entity}`);
          break;
        }

        const { data } = await QorusRequest.get<any>(
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            path: `/api/v2/${entity}`,
            params: {
              ...additionalParams,
              ...(page && { page }),
            },
          },
          { url: `https://${subdomain}.zendesk.com`, endpointId: 'Zendesk' }
        );

        const additionalValues: IQoreAllowedValue[] = data[entity].map(
          (entity: { [x: string]: string; id: string }): IQoreAllowedValue => ({
            value: entity.id.toString(),
            display_name: entity[displayNameField],
            ...(composeDescription && { desc: composeDescription(entity) }),
          })
        );

        values.push(...additionalValues);

        page = data.next_page ? new URL(data.next_page).searchParams.get('page') : null;

        if (page) {
          await delay(ZENDESK_ALLOWED_VALUES_FETCH_DELAY);
        }
      } while (page);
    } catch (error) {
      Debugger.log(`Error fetching allowed values for ${entity}`, error);

      return values;
    }

    return values;
  };
};
