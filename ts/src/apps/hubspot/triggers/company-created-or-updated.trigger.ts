import { EQoreAppActionCode, QoreAppCreator, TQoreTypeObject } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import {
  pollCreatedItemsForTrigger,
  pollUpdatedItemsForTrigger,
} from '../../../global/helpers/event-triggers';
import { HUBSPOT_APP_NAME } from '../constants';
import { fetchHubspotRecords } from '../helpers/constants';
import {
  createHubspotGetDynamicEventInfoType,
  hubspotBaseEventInfoType,
} from '../helpers/get-event-info-type';
import { getHubspotCompanyPropertiesAllowedValues } from '../helpers/object-properties-allowed-values';
import {
  EHubspotTriggerCriteria,
  getHubspotTriggerOptions,
  hubspotTriggerCriteria,
} from './constants';

const triggerName = 'hubspot_company_created_or_updated_trigger';

const hubspotObjectDefaultProperties = {
  type: 'hash',
  fields: {
    createdate: {
      type: 'string',
    },
    email: {
      type: 'string',
    },
    firstname: {
      type: 'string',
    },
    lastmodifieddate: {
      type: 'string',
    },
    hs_object_id: {
      type: 'string',
    },
    lastname: {
      type: 'string',
    },
  },
} satisfies TQoreTypeObject;

const hubspotCompanyCreatedOrUpdatedTrigger = QoreAppCreator.createLocalizedTrigger({
  app: HUBSPOT_APP_NAME,
  action: triggerName,
  action_code: EQoreAppActionCode.EVENT,
  options: getHubspotTriggerOptions(getHubspotCompanyPropertiesAllowedValues),
  event_function: async (context, update, should_stop) => {
    const activationCriteria = context.opts?.activationCriteria;
    const token = context.conn_opts?.token;

    if (!token || !activationCriteria) {
      throw new Error(
        `The token and activationCriteria are required to start the Hubspot ${triggerName} trigger`
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
  get_dynamic_type: createHubspotGetDynamicEventInfoType({
    object: 'companies',
    defaultProperties: hubspotObjectDefaultProperties,
  }),
  event_info: {
    desc: 'Hubspot Company Created Or Updated Trigger Event Info',
    type: hubspotBaseEventInfoType,
  },
});

const getLastCreatedRecords = async (token: string, properties?: string[]): Promise<any> => {
  const companies = await fetchHubspotRecords({
    object: 'companies',
    token,
    limit: DEFAULT_TRIGGER_POLL_ITEM_LIMIT,
    maxResults: DEFAULT_TRIGGER_POLL_ITEM_LIMIT,
    properties,
    sort: {
      direction: 'DESCENDING',
      propertyName: 'createdate',
    },
  });

  return companies;
};

const getLastUpdatedRecords = async (token: string, properties?: string[]): Promise<any> => {
  const companies = await fetchHubspotRecords({
    object: 'companies',
    token,
    limit: DEFAULT_TRIGGER_POLL_ITEM_LIMIT,
    maxResults: DEFAULT_TRIGGER_POLL_ITEM_LIMIT,
    properties,
    sort: {
      direction: 'DESCENDING',
      propertyName: 'hs_lastmodifieddate',
    },
  });

  return companies;
};

export default hubspotCompanyCreatedOrUpdatedTrigger;
