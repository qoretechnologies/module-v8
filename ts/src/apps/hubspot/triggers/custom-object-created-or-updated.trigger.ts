import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import {
  pollCreatedItemsForTrigger,
  pollUpdatedItemsForTrigger,
} from '../../../global/helpers/event-triggers';
import { HUBSPOT_APP_NAME } from '../constants';
import { fetchHubspotRecords } from '../helpers/constants';
import { getHubspotCustomObjectTypeAllowedValues } from '../helpers/get-custom-object-type-allowed-values';
import { getHubspotCustomObjectPropertiesAllowedValues } from '../helpers/object-properties-allowed-values';
import { EHubspotTriggerCriteria, hubspotTriggerCriteria } from './constants';

const triggerName = 'hubspot_custom_object_created_or_updated_trigger';

const hubspotCustomObjectCreatedOrUpdatedTrigger = QoreAppCreator.createLocalizedTrigger({
  app: HUBSPOT_APP_NAME,
  action: triggerName,
  action_code: EQoreAppActionCode.EVENT,
  options: {
    activationCriteria: {
      type: 'string',
      required: true,
      default_value: hubspotTriggerCriteria[EHubspotTriggerCriteria.CREATED].value,
      allowed_values: Object.values(hubspotTriggerCriteria),
    },
    object: {
      type: 'string',
      required: true,
      allowed_values_creatable: true,
      on_change: ['refetch'],
      get_allowed_values: getHubspotCustomObjectTypeAllowedValues,
    },
    additionalProperties: {
      type: {
        type: 'list',
        element_type: 'string',
        required: false,
      },
      allowed_values_creatable: true,
      depends_on: ['object'],
      get_allowed_values: getHubspotCustomObjectPropertiesAllowedValues,
    },
  },
  event_function: async (context, update, should_stop) => {
    const activationCriteria = context.opts?.activationCriteria;
    const token = context.conn_opts?.token;
    const object = context.opts?.object;

    if (!token || !activationCriteria || !object) {
      throw new Error(
        `The token and activationCriteria are required to start the Hubspot ${triggerName}`
      );
    }

    const isUpdatedCriteria =
      activationCriteria === hubspotTriggerCriteria[EHubspotTriggerCriteria.UPDATED].value;

    const getRecords = isUpdatedCriteria
      ? () => {
          return getLastUpdatedRecords(token, object, context.opts?.additionalProperties);
        }
      : () => {
          return getLastCreatedRecords(token, object, context.opts?.additionalProperties);
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
    const object = context.opts?.object;
    const properties = context.opts?.additionalProperties;

    if (!token || !object) {
      throw new Error(
        `The token and object are required to get the example event data for the Hubspot ${triggerName}`
      );
    }
    const records = await getLastCreatedRecords(token, object, properties);

    return records?.length > 0 ? records[0] : null;
  },
  event_info: {
    desc: 'Hubspot Custom Object Created Or Updated Trigger Event Info',
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
            },
          },
        },
      },
    },
  },
});

const getLastCreatedRecords = async (
  token: string,
  object: string,
  properties?: string[]
): Promise<any> => {
  const records = await fetchHubspotRecords({
    object,
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

const getLastUpdatedRecords = async (
  token: string,
  object: string,
  properties?: string[]
): Promise<any> => {
  const records = await fetchHubspotRecords({
    object,
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

export default hubspotCustomObjectCreatedOrUpdatedTrigger;
