/* eslint-disable max-len */
const MondayAppEn = {
  displayName: 'Monday.com',
  groups: ['Project & Task Management'],
  shortDesc:
    'Connect to Monday.com to automate work management with boards, items, columns, and updates.',
  longDesc:
    'The Monday.com integration provides comprehensive access to your work operating system. Create and manage boards, items, groups, and columns. Track work progress, update item statuses, manage column values, and monitor board changes. Automate workflows by creating items, updating records, moving items between groups, and receiving notifications when boards or items are modified. Perfect for project management, task tracking, team collaboration, and workflow automation across your organization.',
  actions: {
    archive_record: {
      displayName: 'Archive Record',
      shortDesc: 'Move a record to the archive.',
      longDesc:
        'This action allows you to archive a specific record (item) on a Monday.com board, helping you keep your workspace organized by removing completed or inactive items from view without permanently deleting them.',
      options: {
        board_id: {
          displayName: 'Board ID',
          shortDesc: 'The ID of the board containing the record to archive.',
          longDesc: 'The unique identifier of the board containing the record you want to archive.',
        },
        record_id: {
          displayName: 'Record ID',
          shortDesc: 'The ID of the record to archive.',
          longDesc: 'The unique identifier of the record you want to archive.',
        },
      },
    },
    clear_column_value: {
      displayName: 'Clear Column Value',
      shortDesc: 'Remove data from a column in a record.',
      longDesc:
        'Use this action to clear the content of a specified column within a record, resetting its value to empty.',
      options: {
        board_id: {
          displayName: 'Board ID',
          shortDesc: 'The ID of the board containing the record.',
          longDesc: 'The unique identifier of the board containing the record you want to modify.',
        },
        record_id: {
          displayName: 'Record ID',
          shortDesc: 'The ID of the record to modify.',
          longDesc: 'The unique identifier of the record you want to modify.',
        },
        column_id: {
          displayName: 'Column ID',
          shortDesc: 'The ID of the column to clear.',
          longDesc: 'The unique identifier of the column you want to clear.',
        },
      },
    },
    create_record: {
      displayName: 'Create Record',
      shortDesc: 'Add a new record to a board.',
      longDesc:
        'This action enables you to create a new record (item) in a specified board, allowing you to define initial column values upon creation.',
      options: {
        board_id: {
          displayName: 'Board ID',
          shortDesc: 'The ID of the board where the record will be created.',
          longDesc: 'The unique identifier of the board where you want to create a new record.',
        },
        group_id: {
          displayName: 'Group ID',
          shortDesc: 'The ID of the group where the record will be created.',
          longDesc: 'The unique identifier of the group where you want to create a new record.',
        },
        item_name: {
          displayName: 'Item Name',
          shortDesc: 'The name of the new record.',
          longDesc: 'The name of the new record you want to create.',
        },
        column_values: {
          displayName: 'Column Values',
          shortDesc: 'The values to set for the record columns.',
          longDesc: 'The values to set for the columns of the record you want to create.',
        },
      },
    },
    custom_action: {
      displayName: 'Custom Action',
      shortDesc: 'Perform a user-defined operation.',
      longDesc:
        'This action allows you to execute a custom operation defined by your integration or automation setup, providing flexibility for various tasks.',
      options: {
        payload: {
          displayName: 'Payload',
          shortDesc: 'Payload for your custom action',
          longDesc: 'The payload for your custom action',
        },
        actionName: {
          displayName: 'Action Name',
          shortDesc: 'The name of the custom action to execute',
          longDesc: 'The name of the custom action to execute',
        },
      },
    },
    delete_record: {
      displayName: 'Delete Record',
      shortDesc: 'Permanently remove a record.',
      longDesc:
        'Use this action to permanently delete a specific record from a board, removing all associated data.',
      options: {
        board_id: {
          displayName: 'Board ID',
          shortDesc: 'The ID of the board containing the record to delete.',
          longDesc: 'The unique identifier of the board containing the record you want to delete.',
        },
        record_id: {
          displayName: 'Record ID',
          shortDesc: 'The ID of the record to delete.',
          longDesc: 'The unique identifier of the record you want to delete.',
        },
      },
    },
    get_record: {
      displayName: 'Get Record',
      shortDesc: 'Retrieve details of a specific record.',
      longDesc:
        'This action fetches the details of a specified record, including all column values and associated metadata.',
      options: {
        board_id: {
          displayName: 'Board ID',
          shortDesc: 'The ID of the board containing the record to get.',
          longDesc: 'The unique identifier of the board containing the record you want to get.',
        },
        record_id: {
          displayName: 'Record ID',
          shortDesc: 'The ID of the record to get.',
          longDesc: 'The unique identifier of the record you want to get.',
        },
      },
    },
    move_record: {
      displayName: 'Move Record',
      shortDesc: 'Transfer a record to another group or board.',
      longDesc:
        'Use this action to move a record from its current group or board to another specified group or board, maintaining its data and history.',
      options: {
        board_id: {
          displayName: 'Board ID',
          shortDesc: 'The ID of the board containing the record to move.',
          longDesc: 'The unique identifier of the board containing the record you want to move.',
        },
        record_id: {
          displayName: 'Record ID',
          shortDesc: 'The ID of the record to move.',
          longDesc: 'The unique identifier of the record you want to move.',
        },
        destination_group_id: {
          displayName: 'Destination Group ID',
          shortDesc: 'The ID of the group to move the record to.',
          longDesc: 'The unique identifier of the group you want to move the record to.',
        },
      },
    },
    search_records: {
      displayName: 'Search Records',
      shortDesc: 'Find records matching specific criteria.',
      longDesc:
        'This action allows you to search for records that meet defined criteria, such as specific column values or statuses, and returns a list of matching records.',
      options: {
        board_id: {
          displayName: 'Board ID',
          shortDesc: 'The ID of the board to search for records in.',
          longDesc:
            'The unique identifier of the board containing the records you want to search for.',
        },
        query_text: {
          displayName: 'Query',
          shortDesc: 'The search query to use.',
          longDesc: 'The search query to use to find records.',
        },
        columnId: {
          displayName: 'Column ID',
          shortDesc: 'The ID of the column to search in.',
          longDesc: 'The unique identifier of the column to search in.',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'The maximum number of records to return.',
          longDesc: 'The maximum number of records to return.',
        },
        cursor: {
          displayName: 'Cursor',
          shortDesc: 'The cursor to use for pagination.',
          longDesc: 'The cursor to use for pagination.',
        },
      },
    },
    update_record: {
      displayName: 'Update Record',
      shortDesc: `Modify the values of a record's columns.`,
      longDesc:
        'Use this action to update one or more column values of a specific record, allowing you to change its data as needed.',
      options: {
        board_id: {
          displayName: 'Board ID',
          shortDesc: 'The ID of the board containing the record to update.',
          longDesc: 'The unique identifier of the board containing the record you want to update.',
        },
        record_id: {
          displayName: 'Record ID',
          shortDesc: 'The ID of the record to update.',
          longDesc: 'The unique identifier of the record you want to update.',
        },
        column_values: {
          displayName: 'Column Values',
          shortDesc: 'The values to set for the record columns.',
          longDesc: 'The values to set for the columns of the record you want to update.',
        },
      },
    },
  },
  triggers: {
    new_record: {
      displayName: 'New Record',
      shortDesc: 'Triggered when a new item is created.',
      longDesc: 'Triggered when a new record is created.',
      options: {
        board_id: {
          displayName: 'Board ID',
          shortDesc: 'The ID of the board to check for new records.',
          longDesc: 'The unique identifier of the board that should be checked for new records.',
        },
        group_id: {
          displayName: 'Group ID',
          shortDesc: 'The ID of the group to check for new records.',
          longDesc: 'The unique identifier of the group you want to check for new records in.',
        },
      },
    },
    new_record_moved_to_group: {
      displayName: 'New Record Moved To Group',
      shortDesc: 'Triggered when an item was moved to a group.',
      longDesc: 'Triggered when a new record is created.',
      options: {
        board_id: {
          displayName: 'Board ID',
          shortDesc: 'The ID of the board to check for new records.',
          longDesc: 'The unique identifier of the board that should be checked for new records.',
        },
        group_id: {
          displayName: 'Group ID',
          shortDesc: 'The ID of the group to check for new records.',
          longDesc: 'The unique identifier of the group you want to check for new records in.',
        },
      },
    },
    record_column_value_updated: {
      displayName: 'Record Column Value Updated',
      shortDesc: 'Triggered when a record column value is updated.',
      longDesc: 'Triggered when a record column value is updated.',
      options: {
        board_id: {
          displayName: 'Board ID',
          shortDesc: 'The ID of the board to check for record field updates.',
          longDesc:
            'The unique identifier of the board that should be checked for record field updates.',
        },
        column_id: {
          displayName: 'Column ID',
          shortDesc: 'The ID of the column to check for new value.',
          longDesc: 'The unique identifier of the column that should be checked for new value.',
        },
      },
    },
    updated_record: {
      displayName: 'Updated Record',
      shortDesc: 'Triggered when an item is updated.',
      longDesc: 'Triggered when an item on the board is updated.',
      options: {
        board_id: {
          displayName: 'Board ID',
          shortDesc: 'The ID of the board to check for updated records.',
          longDesc:
            'The unique identifier of the board that should be checked for updated records.',
        },
        group_id: {
          displayName: 'Group ID',
          shortDesc: 'The ID of the group to check for new records.',
          longDesc: 'The unique identifier of the group you want to check for new records in.',
        },
      },
    },
  },
  expressions: {
    '&&': {
      displayName: 'and (&&)',
      shortDesc: 'Returns True if all arguments are True',
      longDesc: 'Returns `True` if all arguments are `True` with logic short-circuiting',
      args: [
        {
          displayName: 'Condition',
          shortDesc: 'Boolean condition to evaluate',
          longDesc: 'A boolean expression or condition that evaluates to True or False',
        },
      ],
    },
    '||': {
      displayName: 'or (||)',
      shortDesc: 'Returns True if any argument is True',
      longDesc: 'Returns `True` if any argument is `True` with logic short-circuiting',
      args: [
        {
          displayName: 'Condition',
          shortDesc: 'Boolean condition to evaluate',
          longDesc: 'A boolean expression or condition that evaluates to True or False',
        },
      ],
    },
    '==': {
      displayName: 'equal (==)',
      shortDesc: 'Equality comparison',
      longDesc: 'Returns `True` if the field value equals the specified value',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Field to compare',
          longDesc: 'The field whose value will be compared',
        },
        {
          displayName: 'Value',
          shortDesc: 'Value to compare against',
          longDesc: 'The value to compare the field against',
        },
      ],
    },
    '!=': {
      displayName: 'not equal (!=)',
      shortDesc: 'Inequality comparison',
      longDesc: 'Returns `True` if the field value does not equal the specified value',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Field to compare',
          longDesc: 'The field whose value will be compared',
        },
        {
          displayName: 'Value',
          shortDesc: 'Value to compare against',
          longDesc: 'The value to compare the field against',
        },
      ],
    },
    '>': {
      displayName: 'higher than (>)',
      shortDesc: 'Greater than comparison',
      longDesc: 'Returns `True` if the field value is greater than the specified value',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Field to compare',
          longDesc: 'The field whose value will be compared',
        },
        {
          displayName: 'Value',
          shortDesc: 'Value to compare against',
          longDesc: 'The value to compare the field against',
        },
      ],
    },
    '>=': {
      displayName: 'higher than or equal (>=)',
      shortDesc: 'Greater than or equal comparison',
      longDesc: 'Returns `True` if the field value is greater than or equal to the specified value',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Field to compare',
          longDesc: 'The field whose value will be compared',
        },
        {
          displayName: 'Value',
          shortDesc: 'Value to compare against',
          longDesc: 'The value to compare the field against',
        },
      ],
    },
    '<': {
      displayName: 'lower than (<)',
      shortDesc: 'Less than comparison',
      longDesc: 'Returns `True` if the field value is less than the specified value',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Field to compare',
          longDesc: 'The field whose value will be compared',
        },
        {
          displayName: 'Value',
          shortDesc: 'Value to compare against',
          longDesc: 'The value to compare the field against',
        },
      ],
    },
    '<=': {
      displayName: 'lower than or equal (<=)',
      shortDesc: 'Less than or equal comparison',
      longDesc: 'Returns `True` if the field value is less than or equal to the specified value',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Field to compare',
          longDesc: 'The field whose value will be compared',
        },
        {
          displayName: 'Value',
          shortDesc: 'Value to compare against',
          longDesc: 'The value to compare the field against',
        },
      ],
    },
    in: {
      displayName: 'in',
      shortDesc: 'Value is in list',
      longDesc: 'Returns `True` if the field value is in the specified list of values',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Field to check',
          longDesc: 'The field whose value will be checked',
        },
        {
          displayName: 'Values',
          shortDesc: 'List of values',
          longDesc: 'The list of values to check against',
        },
      ],
    },
    'not-in': {
      displayName: 'not in',
      shortDesc: 'Value is not in list',
      longDesc: 'Returns `True` if the field value is not in the specified list of values',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Field to check',
          longDesc: 'The field whose value will be checked',
        },
        {
          displayName: 'Values',
          shortDesc: 'List of values',
          longDesc: 'The list of values to check against',
        },
      ],
    },
    'is-empty': {
      displayName: 'is empty',
      shortDesc: 'Field is empty',
      longDesc: 'Returns `True` if the field is empty or has no value',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Field to check',
          longDesc: 'The field to check for emptiness',
        },
      ],
    },
    'is-not-empty': {
      displayName: 'is not empty',
      shortDesc: 'Field is not empty',
      longDesc: 'Returns `True` if the field has a value',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Field to check',
          longDesc: 'The field to check for a value',
        },
      ],
    },
    between: {
      displayName: 'between',
      shortDesc: 'Value is between two values',
      longDesc: 'Returns `True` if the field value is between two specified values (inclusive)',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Field to check',
          longDesc: 'The field whose value will be checked',
        },
        {
          displayName: 'Lower Value',
          shortDesc: 'Lower bound',
          longDesc: 'The lower bound value',
        },
        {
          displayName: 'Upper Value',
          shortDesc: 'Upper bound',
          longDesc: 'The upper bound value',
        },
      ],
    },
    'contains-text': {
      displayName: 'contains text',
      shortDesc: 'Contains text',
      longDesc: 'Returns `True` if the field contains the specified text',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Text field to search',
          longDesc: 'The text field to search within',
        },
        {
          displayName: 'Text',
          shortDesc: 'Text to search for',
          longDesc: 'The text string to search for within the field',
        },
      ],
    },
    'not-contains-text': {
      displayName: 'does not contain text',
      shortDesc: 'Does not contain text',
      longDesc: 'Returns `True` if the field does not contain the specified text',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Text field to search',
          longDesc: 'The text field to search within',
        },
        {
          displayName: 'Text',
          shortDesc: 'Text to exclude',
          longDesc: 'The text string that should not be present in the field',
        },
      ],
    },
    'contains-terms': {
      displayName: 'contains terms',
      shortDesc: 'Contains search terms',
      longDesc: 'Returns `True` if the field contains any of the specified search terms',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Text field to search',
          longDesc: 'The text field to search within',
        },
        {
          displayName: 'Terms',
          shortDesc: 'Search terms',
          longDesc: 'The search terms to look for within the field',
        },
      ],
    },
    'starts-with': {
      displayName: 'starts with',
      shortDesc: 'Starts with text',
      longDesc: 'Returns `True` if the field starts with the specified text',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Text field to check',
          longDesc: 'The text field to check',
        },
        {
          displayName: 'Text',
          shortDesc: 'Starting text',
          longDesc: 'The text that the field should start with',
        },
      ],
    },
    'ends-with': {
      displayName: 'ends with',
      shortDesc: 'Ends with text',
      longDesc: 'Returns `True` if the field ends with the specified text',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Text field to check',
          longDesc: 'The text field to check',
        },
        {
          displayName: 'Text',
          shortDesc: 'Ending text',
          longDesc: 'The text that the field should end with',
        },
      ],
    },
    'within-the-next': {
      displayName: 'within the next',
      shortDesc: 'Date is within the next N days',
      longDesc:
        'Returns `True` if the date field falls within the specified number of days in the future',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Date field to check',
          longDesc: 'The date field to check',
        },
        {
          displayName: 'Days',
          shortDesc: 'Number of days',
          longDesc: 'The number of days in the future to check',
        },
      ],
    },
    'within-the-last': {
      displayName: 'within the last',
      shortDesc: 'Date is within the last N days',
      longDesc:
        'Returns `True` if the date field falls within the specified number of days in the past',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Date field to check',
          longDesc: 'The date field to check',
        },
        {
          displayName: 'Days',
          shortDesc: 'Number of days',
          longDesc: 'The number of days in the past to check',
        },
      ],
    },
  },
};

export default MondayAppEn;
