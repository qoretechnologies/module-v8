import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreAppActionFunctionContext,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import {
  pollCreatedItemsForTrigger,
  pollUpdatedItemsForTrigger,
} from '../../../global/helpers/event-triggers';
import { MAGENTO_APP_NAME, MAGENTO_CONN_OPTIONS } from '../constants';
import { fetchMagentoData } from '../helpers/constants';
import { EMagentoTriggerCriteria, magentoTriggerCriteria } from './constants';
import { magentoCustomerEventInfo } from './event-info/customer.event-info';

const options = {
  activationCriteria: {
    type: 'string',
    required: true,
    default_value: magentoTriggerCriteria[EMagentoTriggerCriteria.CREATED].value,
    allowed_values: [
      {
        value: 'created',
        desc: 'Created',
      },
      {
        value: 'updated',
        desc: 'Updated',
      },
    ],
  },
} satisfies TQoreOptions;

const triggerName = 'customer-created-or-updated';

const getContextValues = (context?: TQoreAppActionFunctionContext<typeof MAGENTO_CONN_OPTIONS>) => {
  const token = context?.conn_opts?.token;
  const url = context?.conn_opts?.url;
  const activationCriteria = context?.opts?.activationCriteria;

  const missingValues: string[] = [];

  if (!url) missingValues.push('url');
  if (!token) missingValues.push('token');
  if (!activationCriteria) missingValues.push('activationCriteria');

  if (missingValues.length) {
    throw new Error(
      `All of the following values are required: ${missingValues.join(', ')}` +
        ` to start the magento ${triggerName}`
    );
  }

  return {
    token: token!,
    url: url!,
    activationCriteria: activationCriteria!,
  };
};

const magentoCustomerCreatedOrUpdatedTrigger = QoreAppCreator.createLocalizedTrigger({
  app: MAGENTO_APP_NAME,
  action: triggerName,
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { token, url, activationCriteria } = getContextValues(
      context as TQoreAppActionFunctionContext<typeof MAGENTO_CONN_OPTIONS>
    );

    const isUpdatedCriteria =
      activationCriteria === magentoTriggerCriteria[EMagentoTriggerCriteria.UPDATED].value;

    const getRecords = isUpdatedCriteria
      ? () => {
          return getLastUpdatedRecords(token, url);
        }
      : () => {
          return getLastCreatedRecords(token, url);
        };

    if (isUpdatedCriteria) {
      await pollUpdatedItemsForTrigger({
        trigger_name: triggerName,
        updatedDateField: 'updated_at',
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
    const { token, url } = getContextValues(
      context as TQoreAppActionFunctionContext<typeof MAGENTO_CONN_OPTIONS>
    );

    const records = await getLastCreatedRecords(token, url);

    return records?.length > 0 ? records[0] : null;
  },
  event_info: magentoCustomerEventInfo,
});

const getLastCreatedRecords = async (token: string, url: string): Promise<any> => {
  const { data } = await fetchMagentoData({
    token,
    url,
    path: '/V1/customers/search',
    limit: DEFAULT_TRIGGER_POLL_ITEM_LIMIT,
    params: {
      'searchCriteria[sortOrders][0][field]': 'created_at',
      'searchCriteria[sortOrders][0][direction]': 'DESC',
    },
  });

  return data;
};

const getLastUpdatedRecords = async (token: string, url: string): Promise<any> => {
  const { data } = await fetchMagentoData({
    token,
    url,
    path: 'V1/customers/search',
    limit: DEFAULT_TRIGGER_POLL_ITEM_LIMIT,
    params: {
      'searchCriteria[sortOrders][0][field]': 'updated_at',
      'searchCriteria[sortOrders][0][direction]': 'DESC',
    },
  });

  return data;
};

export default magentoCustomerCreatedOrUpdatedTrigger;
