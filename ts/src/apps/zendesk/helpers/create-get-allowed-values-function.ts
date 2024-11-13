import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { ZENDESK_CONN_OPTIONS } from '..';
import { IQoreAllowedValue, IQoreSharedObject, TQoreType } from '../../../global/models/qore';

export const CreateZendeskGetAllowedValuesFunction = (
  entity: string,
  displayNameField = 'name',
  additionalParams: Record<string, string> = {}
): IQoreSharedObject<TQoreType, unknown, typeof ZENDESK_CONN_OPTIONS>['get_allowed_values'] => {
  return async (context): Promise<IQoreAllowedValue[]> => {
    const {
      conn_opts: { token, subdomain },
    } = context;

    const values: IQoreAllowedValue[] = [];
    let page: string | null = null;

    do {
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
          value: entity.id,
          display_name: entity[displayNameField],
        })
      );

      values.push(...additionalValues);

      page = data.next_page ? new URL(data.next_page).searchParams.get('page') : null;
    } while (page);

    return values;
  };
};
