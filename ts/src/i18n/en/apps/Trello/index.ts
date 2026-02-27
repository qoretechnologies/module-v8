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
      },
    },
  },
  expressions: {
    '&&': {
      displayName: 'And',
      shortDesc: 'Logical AND operator',
      longDesc: 'Combines multiple conditions where all must be true',
    },
    '||': {
      displayName: 'Or',
      shortDesc: 'Logical OR operator',
      longDesc: 'Combines multiple conditions where at least one must be true',
    },
    '==': {
      displayName: 'Equals',
      shortDesc: 'Field equals value',
      longDesc: 'Matches records where the field equals the specified value',
    },
    '!=': {
      displayName: 'Not Equals',
      shortDesc: 'Field does not equal value',
      longDesc: 'Matches records where the field does not equal the specified value',
    },
    '>': {
      displayName: 'Greater Than',
      shortDesc: 'Field is greater than value',
      longDesc: 'Matches records where the field value is greater than the specified value',
    },
    '>=': {
      displayName: 'Greater Than or Equal',
      shortDesc: 'Field is greater than or equal to value',
      longDesc:
        'Matches records where the field value is greater than or equal to the specified value',
    },
    '<': {
      displayName: 'Less Than',
      shortDesc: 'Field is less than value',
      longDesc: 'Matches records where the field value is less than the specified value',
    },
    '<=': {
      displayName: 'Less Than or Equal',
      shortDesc: 'Field is less than or equal to value',
      longDesc:
        'Matches records where the field value is less than or equal to the specified value',
    },
    'is-set': {
      displayName: 'Is Set',
      shortDesc: 'Field has a value',
      longDesc: 'Matches records where the field has a value (is not empty)',
    },
    'is-not-set': {
      displayName: 'Is Not Set',
      shortDesc: 'Field has no value',
      longDesc: 'Matches records where the field has no value (is empty)',
    },
    contains: {
      displayName: 'Contains',
      shortDesc: 'Field contains value',
      longDesc: 'Matches records where the field contains the specified substring',
    },
  },
  searchOptions: {
    orderBy: {
      displayName: 'Order By',
      shortDesc: 'Sort results by a specific field',
      longDesc: 'Define the field and direction to sort search results',
      type: {
        fields: {
          field: {
            displayName: 'Field',
            shortDesc: 'The field to sort by',
            longDesc: 'The name of the field to use for sorting results',
          },
          direction: {
            displayName: 'Direction',
            shortDesc: 'Sort direction',
            longDesc: 'The direction to sort results (ascending or descending)',
          },
        },
      },
    },
  },
};

export default TrelloAppEn;
