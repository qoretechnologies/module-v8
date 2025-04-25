import {
  EQoreAppActionCode,
  QoreAppCreator,
  TCustomConnOptions,
  TQoreAppActionFunctionContext,
} from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { MAGENTO_APP_NAME } from '../constants';
import { fetchMagentoData } from '../helpers/constants';
import { magentoOrderEventInfo } from './event-info/order.event-info';

const triggerName = 'order-created';

const getContextValues = (context?: TQoreAppActionFunctionContext<TCustomConnOptions>) => {
  const token = context?.conn_opts?.token;
  const url = context?.conn_opts?.url;

  const missingValues: string[] = [];

  if (!url) missingValues.push('url');
  if (!token) missingValues.push('token');

  if (missingValues.length) {
    throw new Error(
      `All of the following values are required: ${missingValues.join(', ')}` +
        ` to start the magento ${triggerName}`
    );
  }

  return {
    token: token!,
    url: url!,
  };
};

const magentoOrderCreatedTrigger = QoreAppCreator.createLocalizedTrigger({
  app: MAGENTO_APP_NAME,
  action: triggerName,
  action_code: EQoreAppActionCode.EVENT,
  event_function: async (context, update, should_stop) => {
    const { token, url } = getContextValues(
      context as TQoreAppActionFunctionContext<TCustomConnOptions>
    );

    await pollCreatedItemsForTrigger({
      trigger_name: triggerName,
      uniqueField: 'entity_id',
      getItems: () => getLastCreatedRecords(token, url),
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token, url } = getContextValues(
      context as TQoreAppActionFunctionContext<TCustomConnOptions>
    );

    const records = await getLastCreatedRecords(token, url);

    return records?.length > 0 ? records[0] : null;
  },
  event_info: magentoOrderEventInfo,
});

const getLastCreatedRecords = async (token: string, url: string): Promise<any> => {
  const { data } = await fetchMagentoData({
    token,
    url,
    path: '/V1/orders',
    limit: DEFAULT_TRIGGER_POLL_ITEM_LIMIT,
    params: {
      'searchCriteria[sortOrders][0][field]': 'created_at',
      'searchCriteria[sortOrders][0][direction]': 'DESC',
    },
  });

  return data;
};

export default magentoOrderCreatedTrigger;
