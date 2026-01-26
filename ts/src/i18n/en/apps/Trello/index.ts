import { TAppGroups } from '../../../groups';
const TrelloAppEn = {
  groups: ['Project & Task Management'] satisfies TAppGroups,
  displayName: 'Trello',
  shortDesc: 'Trello is a collaboration tool that organizes your projects into boards.',
  longDesc:
    'Trello is a collaboration tool that organizes your projects into boards. It is a web-based Kanban-style list-making application and is a subsidiary of Atlassian.',
  triggers: {
    'card-due': {
      displayName: 'Card Due',
      shortDesc: 'Triggers when a card becomes overdue.',
      longDesc:
        'This trigger fires when a card has passed its due date and has not been marked as complete.',
      options: {
        source: {
          displayName: 'Source',
          shortDesc: 'Choose whether to monitor an entire board or a specific list.',
          longDesc:
            'Select "board" to monitor all lists on a board, or "list" to monitor a specific list only.',
        },
        boardId: {
          displayName: 'Board',
          shortDesc: 'The board containing the cards to monitor.',
          longDesc:
            'Select the Trello board that contains the cards you want to monitor for due dates.',
        },
        listId: {
          displayName: 'List',
          shortDesc: 'The specific list containing the cards to monitor.',
          longDesc:
            'Select a specific list to monitor for overdue cards. Only required if Source is set to "list".',
        },
        includeDueComplete: {
          displayName: 'Include Completed Cards',
          shortDesc: 'Include cards marked as complete.',
          longDesc:
            'When enabled, the trigger will include overdue cards that have been marked as complete. By default, only incomplete overdue cards are included.',
        },
      },
    },
    'new-board': {
      displayName: 'New Board',
      shortDesc: 'Triggers when a new board is created.',
      longDesc:
        'This trigger fires when a new Trello board is created or shared with the authenticated user.',
      options: {
        includeOrganizationInfo: {
          displayName: 'Include Organization Info',
          shortDesc: 'Include organization name and details.',
          longDesc:
            'When enabled, the trigger will include additional information about the organization the board belongs to.',
        },
      },
    },
    'new-card': {
      displayName: 'New Card',
      shortDesc: 'Triggers when a new card is created.',
      longDesc:
        'This trigger fires when a new card is added to a specified board or list in Trello.',
      options: {
        source: {
          displayName: 'Source',
          shortDesc: 'Choose whether to monitor an entire board or a specific list.',
          longDesc:
            'Select "board" to monitor all lists on a board, or "list" to monitor a specific list only.',
        },
        boardId: {
          displayName: 'Board',
          shortDesc: 'The board to monitor for new cards.',
          longDesc:
            'Select the Trello board where you want to monitor for new cards being created.',
        },
        listId: {
          displayName: 'List',
          shortDesc: 'The specific list to monitor for new cards.',
          longDesc:
            'Select a specific list to monitor for new cards. Only required if Source is set to "list".',
        },
      },
    },
    'new-label': {
      displayName: 'New Label',
      shortDesc: 'Triggers when a new label is created.',
      longDesc: 'This trigger fires when a new label is created on a specified Trello board.',
      options: {
        boardId: {
          displayName: 'Board',
          shortDesc: 'The board to monitor for new labels.',
          longDesc:
            'Select the Trello board where you want to monitor for new labels being created.',
        },
      },
    },
    'new-list': {
      displayName: 'New List',
      shortDesc: 'Triggers when a new list is created.',
      longDesc: 'This trigger fires when a new list is added to a specified Trello board.',
      options: {
        boardId: {
          displayName: 'Board',
          shortDesc: 'The board to monitor for new lists.',
          longDesc:
            'Select the Trello board where you want to monitor for new lists being created.',
        },
        includeArchivedLists: {
          displayName: 'Include Archived Lists',
          shortDesc: 'Include lists that are archived.',
          longDesc:
            'When enabled, the trigger will include new lists that are archived. By default, only open lists are included.',
        },
      },
    },
    'new-member': {
      displayName: 'New Member',
      shortDesc: 'Triggers when a new member is added to a board.',
      longDesc: 'This trigger fires when a new member is added to a specified Trello board.',
      options: {
        boardId: {
          displayName: 'Board',
          shortDesc: 'The board to monitor for new members.',
          longDesc:
            'Select the Trello board where you want to monitor for new members being added.',
        },
        includeAllFields: {
          displayName: 'Include All Fields',
          shortDesc: 'Include all available member information.',
          longDesc:
            'When enabled, the trigger will fetch all available fields for each member, providing more comprehensive information.',
        },
      },
    },
  },
};

export default TrelloAppEn;
