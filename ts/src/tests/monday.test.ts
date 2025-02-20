import {
  TCustomConnOptions,
  TQoreAppActionFunctionContext,
  TQoreAppActionOption,
} from '@qoretechnologies/ts-toolkit';
import monday from '../customApps/monday/index';

describe('Should test Monday app', () => {
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
      const CreateRecord = monday.actions.find((action) => action.action === 'create-record');

      if (!CreateRecord) {
        throw new Error('CreateRecord action not found');
      }

      if (!('api_function' in CreateRecord)) {
        throw new Error('CreateRecord action does not have an api_function');
      }

      const actionFunction = CreateRecord.api_function!;
      expect(actionFunction).toBeDefined();

      const result = await actionFunction(
        {
          board_id: boardId,
          item_name: 'Test Item',
          group_id: groupId,
          column_values: { priority_1: '10' },
        },
        undefined,
        baseContext as any
      );

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.data.create_item).toBeDefined();

      itemId = result.data.create_item.id;
    });

    it('Should get the created record', async () => {
      const GetRecord = monday.actions.find((action) => action.action === 'get-record');
      if (!GetRecord) {
        throw new Error('GetRecord action not found');
      }

      if (!('api_function' in GetRecord)) {
        throw new Error('CreateRecord action does not have an api_function');
      }

      const actionFunction = GetRecord.api_function!;
      expect(actionFunction).toBeDefined();

      const result = await actionFunction(
        {
          board_id: boardId,
          record_id: itemId,
        },
        undefined,
        baseContext as any
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(itemId);
    });

    it('Should clear the column values of the created record', async () => {
      const ClearColumnValue = monday.actions.find(
        (action) => action.action === 'clear-column-value'
      );

      if (!ClearColumnValue) {
        throw new Error('ClearColumnValue action not found');
      }

      if (!('api_function' in ClearColumnValue)) {
        throw new Error('CreateRecord action does not have an api_function');
      }

      const actionFunction = ClearColumnValue.api_function!;
      expect(actionFunction).toBeDefined();

      const result = await actionFunction(
        {
          board_id: boardId,
          record_id: itemId,
          column_id: 'priority_1',
        },
        undefined,
        baseContext as any
      );

      expect(result).toBeDefined();
    });

    it('Should move the created record', async () => {
      const MoveRecord = monday.actions.find((action) => action.action === 'move-record');

      if (!MoveRecord) {
        throw new Error('MoveRecord action not found');
      }

      if (!('api_function' in MoveRecord)) {
        throw new Error('MoveRecord action does not have an api_function');
      }

      const actionFunction = MoveRecord.api_function!;
      expect(actionFunction).toBeDefined();

      const result = await actionFunction(
        {
          board_id: boardId,
          record_id: itemId,
          destination_group_id: destinationGroupId,
        } as any,
        undefined,
        baseContext as any
      );

      expect(result).toBeDefined();
    });

    it('Should search for the created record', async () => {
      const SearchRecords = monday.actions.find((action) => action.action === 'search-records');

      if (!SearchRecords) {
        throw new Error('SearchRecords action not found');
      }

      if (!('api_function' in SearchRecords)) {
        throw new Error('SearchRecords action does not have an api_function');
      }

      const actionFunction = SearchRecords.api_function!;
      expect(actionFunction).toBeDefined();

      const result = await actionFunction(
        {
          board_id: boardId,
          columnId: 'name',
          limit: 10,
          query_text: 'Test Item',
        },
        undefined,
        baseContext as any
      );

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(result.items[0].id).toBe(itemId);
    });

    it('Should update the created record', async () => {
      const UpdateRecord = monday.actions.find((action) => action.action === 'update-record');

      if (!UpdateRecord) {
        throw new Error('UpdateRecord action not found');
      }

      if (!('api_function' in UpdateRecord)) {
        throw new Error('UpdateRecord action does not have an api_function');
      }

      const actionFunction = UpdateRecord.api_function!;
      expect(actionFunction).toBeDefined();

      const result = await actionFunction(
        {
          board_id: boardId,
          record_id: itemId,
          column_values: { priority_1: '10', name: 'Test Item Updated' },
        },
        undefined,
        baseContext as any
      );

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
    });

    it('Should archive the created record', async () => {
      const ArchiveRecord = monday.actions.find((action) => action.action === 'archive-record');

      if (!ArchiveRecord) {
        throw new Error('ArchiveRecord action not found');
      }

      if (!('api_function' in ArchiveRecord)) {
        throw new Error('ArchiveRecord action does not have an api_function');
      }

      const actionFunction = ArchiveRecord.api_function!;
      expect(actionFunction).toBeDefined();

      const result = await actionFunction(
        {
          board_id: boardId,
          record_id: itemId,
        },
        undefined,
        baseContext as any
      );

      expect(result).toBeDefined();
    });

    it('Should delete the created record', async () => {
      const DeleteRecord = monday.actions.find((action) => action.action === 'delete-record');

      if (!DeleteRecord) {
        throw new Error('DeleteRecord action not found');
      }

      if (!('api_function' in DeleteRecord)) {
        throw new Error('DeleteRecord action does not have an api_function');
      }

      const actionFunction = DeleteRecord.api_function!;
      expect(actionFunction).toBeDefined();

      const result = await actionFunction(
        {
          board_id: boardId,
          record_id: itemId,
        },
        undefined,
        baseContext as any
      );

      expect(result).toBeDefined();
      expect(result.data?.delete_item).toBeDefined();
      expect(result.data?.delete_item.id).toBe(itemId);
    });
  });
});
