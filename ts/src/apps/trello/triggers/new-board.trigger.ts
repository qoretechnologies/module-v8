import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { TRELLO_APP_NAME } from '../constants';
import { fetchTrelloData, TrelloError } from '../helpers/constants';

interface TrelloBoard {
  id: string;
  name: string;
  desc: string;
  closed: boolean;
  idOrganization: string;
  url: string;
  shortUrl: string;
  dateLastActivity: string;
  dateLastView: string;
  shortLink: string;
  subscribed: boolean;
  starred: boolean;
  enterpriseOwned: boolean;
  memberships: TrelloMembership[];
  labelNames: {
    green: string;
    yellow: string;
    orange: string;
    red: string;
    purple: string;
    blue: string;
    sky: string;
    lime: string;
    pink: string;
    black: string;
  };
  prefs: {
    permissionLevel: string;
    hideVotes: boolean;
    voting: string;
    comments: string;
    invitations: string;
    selfJoin: boolean;
    cardCovers: boolean;
    isTemplate: boolean;
    cardAging: string;
    background: string;
    backgroundImage: string | null;
    backgroundImageScaled: { width: number; height: number; url: string }[] | null;
    backgroundColor: string | null;
    backgroundTile: boolean;
    backgroundBrightness: string;
    canBePublic: boolean;
    canBeEnterprise: boolean;
    canBeOrg: boolean;
    canBePrivate: boolean;
    canInvite: boolean;
  };
  organizationName?: string;
}

interface TrelloMembership {
  id: string;
  idMember: string;
  memberType: string;
  unconfirmed: boolean;
  deactivated: boolean;
}

const TrelloNewBoardTrigger = QoreAppCreator.createLocalizedTrigger({
  app: TRELLO_APP_NAME,
  action: 'new-board',
  action_code: EQoreAppActionCode.EVENT,
  event_function: async (context, update, should_stop) => {
    const token = context.conn_opts?.token;
    const key = context.conn_opts?.key;

    const missingValues: string[] = [];

    if (!token) missingValues.push('token');
    if (!key) missingValues.push('key');

    if (missingValues.length) {
      throw new TrelloError(
        `All of the following ${missingValues.join(', ')} are required to start the Trello new board trigger`
      );
    }

    const getItems = async () => {
      return await getTrelloBoards(token!, key!);
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'trello_new_board',
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const token = context?.conn_opts?.token;
    const key = context?.conn_opts?.key;

    if (!token) {
      throw new TrelloError('The token is required to get the new board example data');
    }

    if (!key) {
      throw new TrelloError('The key is required to get the new board example data');
    }

    const boards = await getTrelloBoards(token, key);

    return boards.length > 0 ? boards[0] : null;
  },
  event_info: {
    desc: 'Trello New Board Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        name: { type: 'string' },
        desc: { type: 'string' },
        closed: { type: 'bool' },
        idOrganization: { type: 'string' },
        url: { type: 'string' },
        shortUrl: { type: 'string' },
        dateLastActivity: { type: 'string' },
        dateLastView: { type: 'string' },
        shortLink: { type: 'string' },
        subscribed: { type: 'bool' },
        starred: { type: 'bool' },
        enterpriseOwned: { type: 'bool' },
        memberships: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                id: { type: 'string' },
                idMember: { type: 'string' },
                memberType: { type: 'string' },
                unconfirmed: { type: 'bool' },
                deactivated: { type: 'bool' },
              },
            },
          },
        },
        labelNames: {
          type: {
            type: 'hash',
            fields: {
              green: { type: 'string' },
              yellow: { type: 'string' },
              orange: { type: 'string' },
              red: { type: 'string' },
              purple: { type: 'string' },
              blue: { type: 'string' },
              sky: { type: 'string' },
              lime: { type: 'string' },
              pink: { type: 'string' },
              black: { type: 'string' },
            },
          },
        },
        prefs: {
          type: {
            type: 'hash',
            fields: {
              permissionLevel: { type: 'string' },
              hideVotes: { type: 'bool' },
              voting: { type: 'string' },
              comments: { type: 'string' },
              invitations: { type: 'string' },
              selfJoin: { type: 'bool' },
              cardCovers: { type: 'bool' },
              isTemplate: { type: 'bool' },
              cardAging: { type: 'string' },
              background: { type: 'string' },
              backgroundImage: { type: 'string', required: false },
              backgroundImageScaled: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      width: { type: 'integer' },
                      height: { type: 'integer' },
                      url: { type: 'string' },
                    },
                  },
                },
                required: false,
              },
              backgroundColor: { type: 'string', required: false },
              backgroundTile: { type: 'bool' },
              backgroundBrightness: { type: 'string' },
              canBePublic: { type: 'bool' },
              canBeEnterprise: { type: 'bool' },
              canBeOrg: { type: 'bool' },
              canBePrivate: { type: 'bool' },
              canInvite: { type: 'bool' },
            },
          },
        },
        organizationName: { type: 'string', required: false },
      },
    },
  },
});

const getTrelloBoards = async (token: string, key: string): Promise<TrelloBoard[]> => {
  try {
    const boards = await fetchTrelloData<TrelloBoard[]>({
      token,
      key,
      path: '/members/me/boards',
      params: {
        filter: 'all',
        fields: 'all',
      },
    });

    return boards;
  } catch (error) {
    throw new TrelloError(`Failed to fetch Trello boards: ${error.message}`);
  }
};

export default TrelloNewBoardTrigger;
