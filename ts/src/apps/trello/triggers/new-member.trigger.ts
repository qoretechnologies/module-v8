import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { TRELLO_APP_NAME } from '../constants';
import { getTrelloBoardIdAllowedValues } from '../helpers/get-board-id-allowed-values';
import { fetchTrelloData, TrelloError } from '../helpers/constants';
import { Debugger } from '../../../utils/Debugger';

interface TrelloMember {
  id: string;
  fullName: string;
  username: string;
  initials: string;
  memberType: string;
  confirmed: boolean;
  avatarUrl: string | null;
  avatarHash: string | null;
  email: string | null;
  activityBlocked: boolean;
  nonPublic: Record<string, unknown>;
  nonPublicAvailable: boolean;
  idMemberReferrer: string | null;
  idPremOrgsAdmin: string[];
  bio: string;
  bioData: Record<string, unknown> | null;
  products: string[];
  status: string;
  url: string;
  boardId?: string;
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

const TrelloNewMemberTrigger = QoreAppCreator.createLocalizedTrigger<typeof options>({
  app: TRELLO_APP_NAME,
  action: 'new-member',
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
        `All of the following ${missingValues.join(', ')} are required to start the Trello new member trigger`
      );
    }

    const getItems = async () => {
      return await getTrelloBoardMembers(token!, key!, boardId!);
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'trello_new_member',
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
      throw new TrelloError('The token is required to get the new member example data');
    }

    if (!key) {
      throw new TrelloError('The key is required to get the new member example data');
    }

    if (!boardId) {
      throw new TrelloError('boardId is required for this trigger');
    }

    const members = await getTrelloBoardMembers(token, key, boardId);

    return members.length > 0 ? members[0] : null;
  },
  event_info: {
    desc: 'Trello New Member Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        fullName: { type: 'string' },
        username: { type: 'string' },
        initials: { type: 'string' },
        memberType: { type: 'string' },
        confirmed: { type: 'boolean' },
        avatarUrl: { type: 'string', required: false },
        avatarHash: { type: 'string', required: false },
        email: { type: 'string', required: false },
        activityBlocked: { type: 'boolean' },
        nonPublic: { type: 'hash' },
        nonPublicAvailable: { type: 'boolean' },
        idMemberReferrer: { type: 'string', required: false },
        idPremOrgsAdmin: {
          type: {
            type: 'list',
            element_type: { type: 'string' },
          },
        },
        bio: { type: 'string' },
        bioData: { type: 'hash', required: false },
        products: {
          type: {
            type: 'list',
            element_type: { type: 'string' },
          },
        },
        status: { type: 'string' },
        url: { type: 'string' },
        boardId: { type: 'string', required: false },
        boardName: { type: 'string', required: false },
      },
    },
  },
});

const getTrelloBoardMembers = async (
  token: string,
  key: string,
  boardId: string
): Promise<TrelloMember[]> => {
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

    const path = `/boards/${boardId}/members`;
    const params: Record<string, string> = {};

    const members = await fetchTrelloData<TrelloMember[]>({
      token,
      key,
      path,
      params,
    });

    return members.map((member) => ({
      ...member,
      boardId,
      boardName,
    }));
  } catch (error) {
    throw new TrelloError(`Failed to fetch Trello board members: ${error.message}`);
  }
};

export default TrelloNewMemberTrigger;
