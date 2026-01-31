import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { TRELLO_APP_NAME } from '../constants';
import { getTrelloBoardIdAllowedValues } from '../helpers/get-board-id-allowed-values';
import { fetchTrelloData, TrelloError } from '../helpers/constants';
import { Debugger } from '../../../utils/Debugger';

interface TrelloList {
  id: string;
  name: string;
  closed: boolean;
  idBoard: string;
  pos: number;
  subscribed: boolean;
  softLimit: number | null;
  status: string | null;
  creationMethod: string | null;
  limits: Record<string, unknown>;
  boardName?: string;
}

const options = {
  boardId: {
    type: 'string',
    required: true,
    on_change: ['refetch'],
    get_allowed_values: getTrelloBoardIdAllowedValues,
  },
  includeArchivedLists: {
    type: 'bool',
    required: false,
    default_value: false,
  },
} satisfies TQoreOptions;

const TrelloNewListTrigger = QoreAppCreator.createLocalizedTrigger<typeof options>({
  app: TRELLO_APP_NAME,
  action: 'new-list',
  options,
  action_code: EQoreAppActionCode.EVENT,
  event_function: async (context, update, should_stop) => {
    const token = context.conn_opts?.token;
    const key = context.conn_opts?.key;
    const boardId = context.opts?.boardId;
    const includeArchivedLists = context.opts?.includeArchivedLists || false;

    const missingValues: string[] = [];

    if (!token) missingValues.push('token');
    if (!key) missingValues.push('key');
    if (!boardId) missingValues.push('boardId');

    if (missingValues.length) {
      throw new TrelloError(
        `All of the following ${missingValues.join(', ')} are required to start the Trello new list trigger`
      );
    }

    const getItems = async () => {
      return await getTrelloBoardLists(token!, key!, boardId!, includeArchivedLists);
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'trello_new_list',
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const token = context?.conn_opts?.token;
    const key = context?.conn_opts?.key;
    const boardId = context.opts?.boardId;
    const includeArchivedLists = context.opts?.includeArchivedLists || false;

    if (!token) {
      throw new TrelloError('The token is required to get the new list example data');
    }

    if (!key) {
      throw new TrelloError('The key is required to get the new list example data');
    }

    if (!boardId) {
      throw new TrelloError('boardId is required for this trigger');
    }

    const lists = await getTrelloBoardLists(token, key, boardId, includeArchivedLists);

    return lists.length > 0 ? lists[0] : null;
  },
  event_info: {
    desc: 'Trello New List Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        name: { type: 'string' },
        closed: { type: 'bool' },
        idBoard: { type: 'string' },
        pos: { type: 'number' },
        subscribed: { type: 'bool' },
        softLimit: { type: 'integer', required: false },
        status: { type: 'string', required: false },
        creationMethod: { type: 'string', required: false },
        limits: { type: 'hash' },
        boardName: { type: 'string', required: false },
      },
    },
  },
});

const getTrelloBoardLists = async (
  token: string,
  key: string,
  boardId: string,
  includeArchivedLists: boolean = false
): Promise<TrelloList[]> => {
  try {
    let boardName = '';
    try {
      const boardInfo = await fetchTrelloData<{ name: string }>({
        token,
        key,
        path: `/boards/${boardId}`,
      });
      boardName = boardInfo.name || '';
    } catch (boardError) {
      Debugger.log(`Could not fetch board name: ${boardError}`);
    }

    const path = `/boards/${boardId}/lists`;
    const params: Record<string, string> = {};

    params.filter = includeArchivedLists ? 'all' : 'open';

    const lists = await fetchTrelloData<TrelloList[]>({
      token,
      key,
      path,
      params,
    });

    return lists.map((list) => ({
      ...list,
      boardName,
    }));
  } catch (error) {
    throw new TrelloError(`Failed to fetch Trello board lists: ${error.message}`);
  }
};

export default TrelloNewListTrigger;
