import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import {
  pollCreatedItemsForTrigger,
  pollUpdatedItemsForTrigger,
} from '../../../global/helpers/event-triggers';
import { HUBSPOT_APP_NAME } from '../constants';
import { fetchHubspotRecords } from '../helpers/constants';
import { getHubspotUserPropertiesAllowedValues } from '../helpers/object-properties-allowed-values';
import {
  EHubspotTriggerCriteria,
  getHubspotTriggerOptions,
  hubspotTriggerCriteria,
} from './constants';

const triggerName = 'hubspot_user_created_or_updated_trigger';

const hubspotUserCreatedOrUpdatedTrigger = QoreAppCreator.createLocalizedTrigger({
  app: HUBSPOT_APP_NAME,
  action: triggerName,
  action_code: EQoreAppActionCode.EVENT,
  options: getHubspotTriggerOptions(getHubspotUserPropertiesAllowedValues),
  event_function: async (context, update, should_stop) => {
    const activationCriteria = context.opts?.activationCriteria;
    const token = context.conn_opts?.token;

    if (!token || !activationCriteria) {
      throw new Error(
        `The token and activationCriteria are required to start the Hubspot ${triggerName}`
      );
    }

    const isUpdatedCriteria =
      activationCriteria === hubspotTriggerCriteria[EHubspotTriggerCriteria.UPDATED].value;

    const getRecords = isUpdatedCriteria
      ? () => {
          return getLastUpdatedRecords(token, context.opts?.additionalProperties);
        }
      : () => {
          return getLastCreatedRecords(token, context.opts?.additionalProperties);
        };

    if (isUpdatedCriteria) {
      await pollUpdatedItemsForTrigger({
        trigger_name: triggerName,
        updatedDateField: 'updatedAt',
        uniqueField: 'id',
        getItems: getRecords,
        update,
        should_stop,
      });
    } else {
      await pollCreatedItemsForTrigger({
        trigger_name: triggerName,
        uniqueField: 'id',
        getItems: getRecords,
        update,
        should_stop,
      });
    }
  },
  get_example_event_data: async (context) => {
    const token = context.conn_opts?.token;
    const properties = context.opts?.additionalProperties;

    if (!token) {
      throw new Error(
        `The token and object are required to get the example event data for the Hubspot ${triggerName}`
      );
    }
    const records = await getLastCreatedRecords(token, properties);

    return records?.length > 0 ? records[0] : null;
  },
  event_info: {
    desc: 'Hubspot User Created Or Updated Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
        archived: { type: 'boolean' },
        properties: {
          type: {
            type: 'hash',
            fields: {
              hs_createdate: { type: 'string' },
              hs_lastmodifieddate: { type: 'string' },
              hs_object_id: { type: 'string' },
              hs_searchable_calculated_name: { type: 'string' },
            },
          },
        },
      },
    },
  },
});

const getLastCreatedRecords = async (token: string, properties?: string[]): Promise<any> => {
  const records = await fetchHubspotRecords({
    object: 'users',
    token,
    limit: DEFAULT_TRIGGER_POLL_ITEM_LIMIT,
    maxResults: DEFAULT_TRIGGER_POLL_ITEM_LIMIT,
    properties,
    sort: {
      direction: 'DESCENDING',
      propertyName: 'hs_createdate',
    },
  });

  return records;
};

const getLastUpdatedRecords = async (token: string, properties?: string[]): Promise<any> => {
  const records = await fetchHubspotRecords({
    object: 'users',
    token,
    limit: DEFAULT_TRIGGER_POLL_ITEM_LIMIT,
    maxResults: DEFAULT_TRIGGER_POLL_ITEM_LIMIT,
    properties,
    sort: {
      direction: 'DESCENDING',
      propertyName: 'hs_lastmodifieddate',
    },
  });

  return records;
};

export default hubspotUserCreatedOrUpdatedTrigger;
