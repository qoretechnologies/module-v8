import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { TRELLO_APP_NAME } from '../constants';
import { getTrelloBoardIdAllowedValues } from '../helpers/get-board-id-allowed-values';
import { getTrelloBoardListsIdAllowedValues } from '../helpers/get-list-id-allowed-values';
import { fetchTrelloData, TrelloError } from '../helpers/constants';
import { Debugger } from '../../../utils/Debugger';

interface TrelloCard {
  id: string;
  name: string;
  desc: string;
  due: string | null;
  dueComplete: boolean;
  idList: string;
  idBoard: string;
  idMembers: string[];
  labels: TrelloLabel[];
  url: string;
  shortUrl: string;
  dateLastActivity: string;
}

interface TrelloLabel {
  id: string;
  name: string;
  color: string;
}

export enum TrelloCardSourceOption {
  Board = 'board',
  List = 'list',
}

const options = {
  source: {
    type: 'string',
    required: true,
    allowed_values: Object.values(TrelloCardSourceOption).map((value) => ({
      value,
      display_name: value,
    })),
    default_value: TrelloCardSourceOption.Board,
  },
  boardId: {
    type: 'string',
    required: true,
    on_change: ['refetch'],
    get_allowed_values: getTrelloBoardIdAllowedValues,
  },
  listId: {
    type: 'string',
    required: false,
    get_allowed_values: getTrelloBoardListsIdAllowedValues,
  },
  includeDueComplete: {
    type: 'bool',
    required: false,
    default_value: false,
  },
} satisfies TQoreOptions;

const TrelloCardDueTrigger = QoreAppCreator.createLocalizedTrigger<typeof options>({
  app: TRELLO_APP_NAME,
  action: 'card-due',
  options,
  action_code: EQoreAppActionCode.EVENT,
  event_function: async (context, update, should_stop) => {
    const token = context.conn_opts?.token;
    const key = context.conn_opts?.key;
    const source = context.opts?.source || TrelloCardSourceOption.Board;
    const boardId = context.opts?.boardId;
    const listId = context.opts?.listId;
    const includeDueComplete = context.opts?.includeDueComplete || false;

    const missingValues: string[] = [];

    if (!token) missingValues.push('token');
    if (!key) missingValues.push('key');
    if (!boardId) missingValues.push('boardId');
    if (source === TrelloCardSourceOption.List && !listId) {
      missingValues.push('listId');
    }

    if (missingValues.length) {
      throw new TrelloError(
        `All of the following ${missingValues.join(', ')} are required to start the Trello card due trigger`
      );
    }

    const getItems = async () => {
      return await getTrelloCards(token!, key!, source, boardId!, listId, includeDueComplete);
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'trello_card_due',
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const token = context?.conn_opts?.token;
    const key = context?.conn_opts?.key;
    const source = context.opts?.source || TrelloCardSourceOption.Board;
    const boardId = context.opts?.boardId;
    const listId = context.opts?.listId;
    const includeDueComplete = context.opts?.includeDueComplete || false;

    if (!token) {
      throw new TrelloError('The token is required to get the card due example data');
    }

    if (!key) {
      throw new TrelloError('The key is required to get the card due example data');
    }

    if (!boardId) {
      throw new TrelloError('boardId is required for this trigger');
    }

    if (source === TrelloCardSourceOption.List && !listId) {
      throw new TrelloError('listId is required when source is set to list');
    }

    const cards = await getTrelloCards(token, key, source, boardId, listId, includeDueComplete);

    const cardsWithDueDate = cards.filter((card) => Boolean(card.due));

    return cardsWithDueDate.length > 0 ? cardsWithDueDate[0] : null;
  },
  event_info: {
    desc: 'Trello Card Due Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        name: { type: 'string' },
        desc: { type: 'string' },
        descData: {
          type: {
            type: 'hash',
            fields: {
              emoji: { type: 'hash' },
            },
          },
        },
        due: { type: 'string' },
        dueComplete: { type: 'bool' },
        dueReminder: { type: 'integer' },
        idList: { type: 'string' },
        idBoard: { type: 'string' },
        idMembers: {
          type: {
            type: 'list',
            element_type: { type: 'string' },
          },
        },
        idMembersVoted: {
          type: {
            type: 'list',
            element_type: { type: 'string' },
          },
        },
        idLabels: {
          type: {
            type: 'list',
            element_type: { type: 'string' },
          },
        },
        labels: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                id: { type: 'string' },
                name: { type: 'string' },
                color: { type: 'string' },
              },
            },
          },
        },
        badges: {
          type: {
            type: 'hash',
            fields: {
              attachments: { type: 'integer' },
              checkItems: { type: 'integer' },
              checkItemsChecked: { type: 'integer' },
              comments: { type: 'integer' },
              description: { type: 'bool' },
              due: { type: 'string' },
              dueComplete: { type: 'bool' },
              start: { type: 'string', required: false },
              votes: { type: 'integer' },
              subscribed: { type: 'bool' },
              viewingMemberVoted: { type: 'bool' },
              location: { type: 'bool' },
              fogbugz: { type: 'string' },
              checkItemsEarliestDue: { type: 'string', required: false },
              lastUpdatedByAi: { type: 'bool' },
              externalSource: { type: 'string', required: false },
              attachmentsByType: {
                type: {
                  type: 'hash',
                  required: false,
                },
              },
              maliciousAttachments: { type: 'integer' },
            },
          },
        },
        closed: { type: 'bool' },
        dateLastActivity: { type: 'string' },
        email: { type: 'string', required: false },
        idChecklists: {
          type: {
            type: 'list',
            element_type: { type: 'string' },
          },
        },
        idShort: { type: 'integer' },
        idAttachmentCover: { type: 'string', required: false },
        manualCoverAttachment: { type: 'bool' },
        nodeId: { type: 'string' },
        pinned: { type: 'bool' },
        pos: { type: 'integer' },
        shortLink: { type: 'string' },
        shortUrl: { type: 'string' },
        start: { type: 'string', required: false },
        subscribed: { type: 'bool' },
        url: { type: 'string' },
        cover: {
          type: {
            type: 'hash',
            fields: {
              idAttachment: { type: 'string', required: false },
              color: { type: 'string', required: false },
              idUploadedBackground: { type: 'string', required: false },
              size: { type: 'string' },
              brightness: { type: 'string' },
              idPlugin: { type: 'string', required: false },
            },
          },
        },
        isTemplate: { type: 'bool' },
        cardRole: { type: 'string', required: false },
        mirrorSourceId: { type: 'string', required: false },
        checkItemStates: {
          type: {
            type: 'list',
            element_type: { type: 'hash' },
          },
        },
        boardName: { type: 'string', required: false },
        listName: { type: 'string', required: false },
      },
    },
  },
});

const getTrelloCards = async (
  token: string,
  key: string,
  source: string = TrelloCardSourceOption.Board,
  boardId: string,
  listId?: string,
  includeDueComplete: boolean = false
): Promise<TrelloCard[]> => {
  try {
    const path =
      source === TrelloCardSourceOption.List && listId
        ? `/lists/${listId}/cards`
        : `/boards/${boardId}/cards`;

    const cards = await fetchTrelloData<TrelloCard[]>({
      token,
      key,
      path,
    });

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

    const now = new Date();

    const enrichedCards = cards
      .filter((card) => Boolean(card.due))
      .filter((card) => includeDueComplete || !card.dueComplete)
      .filter((card) => {
        const dueDate = new Date(card.due!);

        return dueDate < now;
      })
      .map(async (card) => {
        let listName = '';

        try {
          const listInfo = await fetchTrelloData<{ name: string }>({
            token,
            key,
            path: `/lists/${card.idList}`,
          });
          listName = listInfo.name || '';
        } catch (listError) {
          Debugger.log(`Could not fetch list name: ${listError}`);
        }

        return {
          ...card,
          boardName,
          listName,
        };
      });

    return Promise.all(enrichedCards);
  } catch (error) {
    throw new TrelloError(`Failed to fetch Trello cards: ${error.message}`);
  }
};

export default TrelloCardDueTrigger;
