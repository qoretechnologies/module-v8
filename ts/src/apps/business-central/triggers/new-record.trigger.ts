import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { BUSINESS_CENTRAL_APP_NAME, BusinessCentralError } from '../constants';
import { fetchBusinessCentralRecords } from '../helpers/constants';
import { getBusinessCentralObjectAllowedValues } from '../helpers/get-object-allowed-values';
import { BusinessCentralFilterOperatorAllowedValues } from '../helpers/get-filter-operator-allowed-values';

const BusinessCentralNewRecordTrigger = QoreAppCreator.createLocalizedTrigger({
  app: BUSINESS_CENTRAL_APP_NAME,
  action: 'new_record',
  action_code: EQoreAppActionCode.EVENT,
  options: {
    object: {
      type: 'string',
      required: true,
      get_allowed_values: getBusinessCentralObjectAllowedValues,
    },
    filter: {
      required: false,
      type: {
        type: 'hash',
        fields: {
          field: { type: 'string', required: true },
          operator: {
            type: 'string',
            required: true,
            allowed_values: BusinessCentralFilterOperatorAllowedValues,
          },
          value: { type: 'softstring', required: true },
        },
      },
    },
  },
  event_function: async (context, update, should_stop) => {
    const { token, instance_type, object } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'instance_type'],
      optionFields: ['object'],
      ErrorClass: BusinessCentralError,
    });

    const { filter } = context.opts || {};

    const getItems = () => {
      return fetchLatestRecords({
        token,
        instance_type,
        filter,
        object,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'business_central_new_record',
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token, instance_type, object } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'instance_type'],
      optionFields: ['object'],
      ErrorClass: BusinessCentralError,
    });

    const { filter } = context.opts || {};

    const records = await fetchLatestRecords({
      token,
      instance_type,
      filter,
      object,
    });

    return records?.length > 0 ? records[0] : null;
  },
  event_info: {
    desc: 'Business Central New Record Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        systemCreatedAt: { type: 'string' },
        systemModifiedAt: { type: 'string' },
        systemCreatedBy: { type: 'string' },
        systemModifiedBy: { type: 'string' },
      },
    },
  },
});

export default BusinessCentralNewRecordTrigger;

const fetchLatestRecords = async (options: {
  token: string;
  instance_type: string;
  filter?: { field: string; operator: string; value: string };
  object: string;
}) => {
  const { token, instance_type, filter, object } = options;
  const limit = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;

  try {
    const data = await fetchBusinessCentralRecords<any>({
      token,
      dynamics_env: instance_type,
      object,
      limit,
      orderBy: 'SystemCreatedAt',
      sortOrder: 'desc',
      ...(filter && { filter }),
    });

    return data || [];
  } catch (error) {
    throw new BusinessCentralError(
      `Failed to fetch latest records for ${object}: ${error.message || error}`
    );
  }
};
