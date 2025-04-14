import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { TRELLO_APP_NAME } from '../constants';
import { getTrelloBoardIdAllowedValues } from '../helpers/get-board-id-allowed-values';
import { fetchTrelloData, TrelloError } from '../helpers/constants';
import { Debugger } from '../../../utils/Debugger';

interface TrelloLabel {
  id: string;
  idBoard: string;
  name: string;
  color: string;
  uses: number;
  boardName?: string;
}

const options = {
  boardId: {
    type: 'string',
    required: true,
    on_change: ['refetch'],
    get_allowed_values: getTrelloBoardIdAllowedValues,
  },
} satisfies TQoreOptions;

const TrelloNewLabelTrigger = QoreAppCreator.createLocalizedTrigger<typeof options>({
  app: TRELLO_APP_NAME,
  action: 'new-label',
  options,
  action_code: EQoreAppActionCode.EVENT,
  event_function: async (context, update, should_stop) => {
    const token = context.conn_opts?.token;
    const key = context.conn_opts?.key;
    const boardId = context.opts?.boardId;

    const missingValues: string[] = [];

    if (!token) missingValues.push('token');
    if (!key) missingValues.push('key');
    if (!boardId) missingValues.push('boardId');

    if (missingValues.length) {
      throw new TrelloError(
        `All of the following ${missingValues.join(', ')} are required to start the Trello new label trigger`
      );
    }

    const getItems = async () => {
      return await getTrelloBoardLabels(token!, key!, boardId!);
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'trello_new_label',
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

    if (!token) {
      throw new TrelloError('The token is required to get the new label example data');
    }

    if (!key) {
      throw new TrelloError('The key is required to get the new label example data');
    }

    if (!boardId) {
      throw new TrelloError('boardId is required for this trigger');
    }

    const labels = await getTrelloBoardLabels(token, key, boardId);

    return labels.length > 0 ? labels[0] : null;
  },
  event_info: {
    desc: 'Trello New Label Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        idBoard: { type: 'string' },
        name: { type: 'string' },
        color: { type: 'string' },
        uses: { type: 'integer' },
        boardName: { type: 'string', required: false },
      },
    },
  },
});

const getTrelloBoardLabels = async (
  token: string,
  key: string,
  boardId: string
): Promise<TrelloLabel[]> => {
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

    const path = `/boards/${boardId}/labels`;
    const params: Record<string, string> = {
      fields: 'all',
    };

    const labels = await fetchTrelloData<TrelloLabel[]>({
      token,
      key,
      path,
      params,
    });

    return labels.map((label) => ({
      ...label,
      boardName,
    }));
  } catch (error) {
    throw new TrelloError(`Failed to fetch Trello board labels: ${error.message}`);
  }
};

export default TrelloNewLabelTrigger;
