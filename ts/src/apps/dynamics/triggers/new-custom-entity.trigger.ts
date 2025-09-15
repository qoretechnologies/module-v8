import { EQoreAppActionCode, QoreAppCreator, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { DYNAMICS_APP_NAME, formatDynamicsUrl } from '../constants';
import { getDynamicsCustomEntityAllowedValues } from '../helpers/get-custom-entity-allowed-values';

const DynamicsNewCustomEntityTrigger = QoreAppCreator.createLocalizedTrigger({
  app: DYNAMICS_APP_NAME,
  action: 'new-custom-entity',
  action_code: EQoreAppActionCode.EVENT,
  options: {
    entityName: {
      type: 'string',
      required: true,
      desc: 'The logical name of the custom entity to monitor',
      get_allowed_values: getDynamicsCustomEntityAllowedValues,
    },
  },
  event_function: async (context, update, should_stop) => {
    const token = context.conn_opts?.token;
    const organizationUrl = formatDynamicsUrl(context.conn_opts?.url);
    const entityName = context.opts?.entityName;

    const missingValues: string[] = [];
    if (!token) missingValues.push('token');
    if (!organizationUrl) missingValues.push('organizationUrl');
    if (!entityName) missingValues.push('entityName');

    if (missingValues.length) {
      throw new Error(
        `All of the following ${missingValues.join(', ')}` +
          ` are required to start the new custom entity Dynamics 365 trigger`
      );
    }

    const getItems = () => {
      return getLatestDynamicsCustomEntities(token!, organizationUrl!, entityName!);
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'dynamics_new_custom_entity',
      uniqueField: `${entityName}id`,
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const token = context?.conn_opts?.token;
    const organizationUrl = formatDynamicsUrl(context?.conn_opts?.url);
    const entityName = context?.opts?.entityName;

    if (!token || !organizationUrl || !entityName) {
      throw new Error(
        'Token, organization URL, and entity name are required to get example custom entity data'
      );
    }

    const entities = await getLatestDynamicsCustomEntities(token, organizationUrl, entityName);

    return entities?.length > 0 ? entities[0] : null;
  },
  event_info: {
    desc: 'Dynamics 365 New Custom Entity Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        '@odata.etag': { type: 'string' },
        createdon: { type: 'string' },
        modifiedon: { type: 'string' },
        statecode: { type: 'number' },
        statuscode: { type: 'number' },
        _createdby_value: { type: 'string' },
        _modifiedby_value: { type: 'string' },
        _createdonbehalfby_value: { type: 'string' },
        _modifiedonbehalfby_value: { type: 'string' },
        _ownerid_value: { type: 'string' },
        _owningbusinessunit_value: { type: 'string' },
        _owninguser_value: { type: 'string' },
        _owningteam_value: { type: 'string' },
        versionnumber: { type: 'number' },
      },
    },
  },
});

const getLatestDynamicsCustomEntities = async (
  token: string,
  organizationUrl: string,
  entityName: string
) => {
  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0',
    };

    const response = await QorusRequest.get<{ data: { value: any[] } }>(
      {
        path: `/api/data/v9.1/${entityName}`,
        headers,
        params: {
          $orderby: 'createdon asc',
          $top: DEFAULT_TRIGGER_POLL_ITEM_LIMIT.toString(),
        },
      },
      {
        url: organizationUrl,
        endpointId: 'Dynamics365',
      }
    );

    return response?.data?.value || [];
  } catch (error) {
    throw new Error(
      `Error fetching Dynamics 365 custom entities (${entityName}): ${JSON.stringify(error)}`
    );
  }
};

export default DynamicsNewCustomEntityTrigger;
