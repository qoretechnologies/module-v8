import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { BREVO_APP_NAME, BrevoError } from '../constants';
import { createBrevoClient } from '../helpers/constants';

const BrevoNewListTrigger = QoreAppCreator.createLocalizedTrigger({
  app: BREVO_APP_NAME,
  action: 'new_list',
  action_code: EQoreAppActionCode.EVENT,
  event_function: async (context, update, should_stop) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: BrevoError,
    });

    const getItems = () => {
      return fetchLatestLists(token);
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'brevo_new_list',
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: BrevoError,
    });

    const lists = await fetchLatestLists(token);

    return lists?.length > 0 ? lists[0] : null;
  },
  event_info: {
    desc: 'Brevo New List Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        id: { type: 'number' },
        name: { type: 'string' },
        totalBlacklisted: { type: 'number' },
        totalSubscribers: { type: 'number' },
        folderId: { type: 'number' },
        createdAt: { type: 'string' },
        dynamicList: { type: 'bool' },
      },
    },
  },
});

const fetchLatestLists = async (token: string) => {
  const limit = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;

  try {
    const client = createBrevoClient(token);

    const response = await client.contactsClient.getLists(limit, 0, 'desc');

    return response.body.lists || [];
  } catch (error) {
    throw new BrevoError(`Failed to fetch latest lists: ${error.message || error}`);
  }
};

export default BrevoNewListTrigger;
