import {
  TCustomConnOptions,
  TQoreAppActionFunctionContext,
  TQoreAppActionOption,
} from '@qoretechnologies/ts-toolkit';
import monday from '../customApps/monday/index';

describe('Should test Monday app', () => {
  let connection: string;
  let token: string;
  let boardId: string;
  let groupId: string;
  let destinationGroupId: string;
  let baseContext: TQoreAppActionFunctionContext<TCustomConnOptions>;
  beforeAll(() => {
    token = process.env.MONDAY_TOKEN!;
    expect(token).toBeDefined();
    baseContext = {
      conn_opts: {
        url: 'https://api.monday.com',
        token,
      },
    } as TQoreAppActionFunctionContext<TCustomConnOptions>;

    connection = testApi.createConnection('monday', {
      opts: {
        token,
      },
    });
  });

  describe('Should test Monday app allowed values', () => {
    it('Should get board id allowed values', async () => {
      const createRecord = monday.actions.find((action) => action.action === 'create-record');
      if (
        !createRecord ||
        !('options' in createRecord) ||
        !createRecord.options ||
        !('board_id' in createRecord?.options)
      ) {
        throw new Error('CreateRecord action not found or does not have options');
      }

      const getMondayBoardIdAllowedValues = createRecord.options?.board_id.get_allowed_values;

      const allowedValues = await getMondayBoardIdAllowedValues(baseContext);

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0].value).not.toBeFalsy();

      boardId = allowedValues[0].value;
      baseContext.opts = { board_id: boardId };
    });
    it('Should get group id allowed values', async () => {
      const moveRecord = monday.actions.find((action) => action.action === 'move-record');

      if (
        !moveRecord ||
        !('options' in moveRecord) ||
        !moveRecord.options ||
        !('destination_group_id' in moveRecord?.options)
      ) {
        throw new Error('MoveRecord action not found or does not have options');
      }

      const destinationGroupIdOption = moveRecord.options
        ?.destination_group_id as TQoreAppActionOption;

      const getMondayGroupIdAllowedValues = destinationGroupIdOption.get_allowed_values;

      if (!getMondayGroupIdAllowedValues) {
        throw new Error('getMondayGroupIdAllowedValues is not defined');
      }

      const allowedValues = await getMondayGroupIdAllowedValues(baseContext);

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0].value).not.toBeFalsy();

      groupId = allowedValues[0].value;
      destinationGroupId = allowedValues[1].value;
    });

    it('Should get column id allowed values', async () => {
      const clearColumnValue = monday.actions.find(
        (action) => action.action === 'clear-column-value'
      );

      if (
        !clearColumnValue ||
        !('options' in clearColumnValue) ||
        !clearColumnValue.options ||
        !('column_id' in clearColumnValue?.options)
      ) {
        throw new Error('ClearColumnValue action not found or does not have options');
      }
      const getMondayColumnIdAllowedValues = clearColumnValue.options?.column_id.get_allowed_values;
      const allowedValues = await getMondayColumnIdAllowedValues(baseContext);

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0].value).not.toBeFalsy();
    });

    it('Should get column allowed values', async () => {
      const searchRecords = monday.actions.find((action) => action.action === 'search-records');

      if (
        !searchRecords ||
        !('options' in searchRecords) ||
        !searchRecords.options ||
        !('query_text' in searchRecords?.options)
      ) {
        throw new Error('SearchRecords action not found or does not have options');
      }

      const getMondaySingleColumnAllowedValues =
        searchRecords.options?.query_text.get_allowed_values;

      const allowedValues = await getMondaySingleColumnAllowedValues({
        ...baseContext,
        opts: { ...baseContext.opts, column_id: 'project_status' },
      });

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0].value).not.toBeFalsy();
    });
    it('Should get record id allowed values', async () => {
      const getRecord = monday.actions.find((action) => action.action === 'get-record');

      if (
        !getRecord ||
        !('options' in getRecord) ||
        !getRecord.options ||
        !('record_id' in getRecord?.options)
      ) {
        throw new Error('GetRecord action not found or does not have options');
      }

      const getMondayRecordIdAllowedValues = getRecord.options?.record_id.get_allowed_values;
      const allowedValues = await getMondayRecordIdAllowedValues(baseContext);

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0].value).not.toBeFalsy();
    });

    it('Should get record fields', async () => {
      const createRecord = monday.actions.find((action) => action.action === 'create-record');

      if (
        !createRecord ||
        !('options' in createRecord) ||
        !createRecord.options ||
        !('board_id' in createRecord?.options) ||
        !('get_dependent_options' in createRecord?.options?.board_id)
      ) {
        throw new Error('CreateRecord action not found or does not have options');
      }

      const getMondayBoardDependentOptions = createRecord.options?.board_id.get_dependent_options;
      const options = await getMondayBoardDependentOptions(baseContext);

      expect(options).toBeDefined();
      expect(Object.keys(options).length).toBeGreaterThan(0);
    });
  });

  describe('Should test Monday app actions', () => {
    let itemId: string;
    it('Should create a new record', async () => {
      const result = await testApi.execAppAction('monday', 'create-record', connection, {
        board_id: boardId,
        item_name: 'Test Item',
        group_id: groupId,
        column_values: { name: 'Test' },
      });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.data.create_item).toBeDefined();

      itemId = result.data.create_item.id;
    });

    it('Should get the created record', async () => {
      const result = await testApi.execAppAction('monday', 'get-record', connection, {
        board_id: boardId,
        record_id: itemId,
      });

      expect(result).toBeDefined();
      expect(result.id).toBe(itemId);
    });

    it('Should clear the column values of the created record', async () => {
      const result = await testApi.execAppAction('monday', 'clear-column-value', connection, {
        board_id: boardId,
        record_id: itemId,
        column_id: 'name',
      });

      expect(result).toBeDefined();
    });

    it('Should move the created record', async () => {
      const result = await testApi.execAppAction('monday', 'move-record', connection, {
        board_id: boardId,
        record_id: itemId,
        destination_group_id: destinationGroupId,
      });

      expect(result).toBeDefined();
    });

    it('Should search for the created record', async () => {
      const result = await testApi.execAppAction('monday', 'search-records', connection, {
        board_id: boardId,
        columnId: 'name',
        limit: 10,
        query_text: 'Test Item',
      });

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(result.items[0].id).toBe(itemId);
    });

    it('Should update the created record', async () => {
      const result = await testApi.execAppAction('monday', 'update-record', connection, {
        board_id: boardId,
        record_id: itemId,
        column_values: { name: 'Test Item Updated' },
      });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
    });

    it('Should archive the created record', async () => {
      const result = await testApi.execAppAction('monday', 'archive-record', connection, {
        board_id: boardId,
        record_id: itemId,
      });

      expect(result).toBeDefined();
    });

    it('Should delete the created record', async () => {
      const result = await testApi.execAppAction('monday', 'delete-record', connection, {
        board_id: boardId,
        record_id: itemId,
      });

      expect(result).toBeDefined();
      expect(result.data?.delete_item).toBeDefined();
      expect(result.data?.delete_item.id).toBe(itemId);
    });
  });
});
