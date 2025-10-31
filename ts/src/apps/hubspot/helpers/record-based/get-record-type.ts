import { TQoreGetRecordTypeFunction, TQoreTypeObject } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { HubspotError } from '../../constants';
import {
  getHubspotCompanyPropertiesType,
  getHubspotContactPropertiesType,
  getHubspotCustomObjectPropertiesType,
  getHubspotDealPropertiesType,
  getHubspotLeadPropertiesType,
  getHubspotProductPropertiesType,
  getHubspotPropertyOptionFunction,
  getHubspotTicketPropertiesType,
  getHubspotUserPropertiesTypeOptional,
} from '../get-object-properties';
import { getHubspotCustomObjectNameToIdMap } from './constants';
import { HubspotTableList } from './get-table-list';
import { capitalize } from 'lodash';

type HubspotTable = (typeof HubspotTableList)[number] | (string & {});

export const getHubspotRecordType: TQoreGetRecordTypeFunction = async (
  context,
  tableName: HubspotTable
) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: HubspotError,
  });

  try {
    let type;

    switch (tableName) {
      case 'companies':
        type = await getHubspotCompanyPropertiesType(context);
        break;
      case 'contacts':
        type = await getHubspotContactPropertiesType(context);
        break;
      case 'deals':
        type = await getHubspotDealPropertiesType(context);
        break;
      case 'leads':
        type = await getHubspotLeadPropertiesType(context);
        break;
      case 'products':
        type = await getHubspotProductPropertiesType(context);
        break;
      case 'tickets':
        type = await getHubspotTicketPropertiesType(context);
        break;
      case 'users':
        type = await getHubspotUserPropertiesTypeOptional(context);
        break;
      default: {
        const tableNameToObjectIdMap = await getHubspotCustomObjectNameToIdMap(token);
        const objectId = tableNameToObjectIdMap[tableName];

        if (objectId) {
          type = await getHubspotCustomObjectPropertiesType({
            ...context,
            opts: { objectType: objectId },
          });
        } else {
          const pluralTableName = tableName.endsWith('s') ? tableName : `${tableName}s`;
          const properties = await getHubspotPropertyOptionFunction({
            object: capitalize(pluralTableName.toLowerCase()),
            defaultProperties: {},
          })(context);

          type = properties;
        }
      }
    }

    return type as TQoreTypeObject;
  } catch (error) {
    if (error instanceof HubspotError) {
      throw error;
    }

    throw new HubspotError(`Failed to fetch Hubspot tables: ${error?.message || error}`);
  }
};
