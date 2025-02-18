import { TCustomConnOptions, TQoreAppActionFunctionContext } from '@qoretechnologies/ts-toolkit';
import {
  ArchiveRecord,
  ClearColumnValue,
  CreateRecord,
  DeleteRecord,
  GetRecord,
  MoveRecord,
  SearchRecords,
  UpdateRecord,
} from '../customApps/monday/actions';
import { getMondayBoardDependentOptions } from '../customApps/monday/actions/helpers/get-board-dependent-options';
import { getMondayBoardIdAllowedValues } from '../customApps/monday/actions/helpers/get-board-id-allowed-values';
import { getMondaySingleColumnAllowedValues } from '../customApps/monday/actions/helpers/get-column-allowed-values';
import { getMondayColumnIdAllowedValues } from '../customApps/monday/actions/helpers/get-column-id-allowed-values';
import { getMondayGroupIdAllowedValues } from '../customApps/monday/actions/helpers/get-group-id-allowed-values';
import { getMondayRecordIdAllowedValues } from '../customApps/monday/actions/helpers/get-record-id-allowed-values';

describe('Should test Monday app', () => {
  let token: string;
  let boardId: string;
  let groupId: string;
  let destinationGroupId: string;
  let baseContext: TQoreAppActionFunctionContext<any, any>;
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
      const allowedValues = await getMondayBoardIdAllowedValues(baseContext);

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0].value).not.toBeFalsy();

      boardId = allowedValues[0].value;
      baseContext.opts = { board_id: boardId };
    });
    it('Should get column id allowed values', async () => {
      const allowedValues = await getMondayColumnIdAllowedValues(baseContext);

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0].value).not.toBeFalsy();
    });

    it('Should get column allowed values', async () => {
      const allowedValues = await getMondaySingleColumnAllowedValues({
        ...baseContext,
        opts: { ...baseContext.opts, column_id: 'project_status' },
      });

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0].value).not.toBeFalsy();
    });
    it('Should get group id allowed values', async () => {
      const allowedValues = await getMondayGroupIdAllowedValues(baseContext);

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0].value).not.toBeFalsy();

      groupId = allowedValues[0].value;
      destinationGroupId = allowedValues[1].value;
    });
    it('Should get record id allowed values', async () => {
      const allowedValues = await getMondayRecordIdAllowedValues(baseContext);

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0].value).not.toBeFalsy();
    });

    it('Should get record fields', async () => {
      const options = await getMondayBoardDependentOptions(baseContext);

      expect(options).toBeDefined();
      expect(Object.keys(options).length).toBeGreaterThan(0);
    });
  });

  describe('Should test Monday app actions', () => {
    let itemId: string;
    it('Should create a new record', async () => {
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
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.data.create_item).toBeDefined();

      itemId = result.data.create_item.id;
    });

    it('Should get the created record', async () => {
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
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(itemId);
    });

    it('Should clear the column values of the created record', async () => {
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
        baseContext
      );

      expect(result).toBeDefined();
    });

    it('Should move the created record', async () => {
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
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
    });

    it('Should search for the created record', async () => {
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
          // TODO: remove after the required types are fixed
          cursor: undefined as unknown as string,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(result.items[0].id).toBe(itemId);
    });

    it('Should update the created record', async () => {
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
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
    });

    it('Should archive the created record', async () => {
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
        baseContext
      );

      expect(result).toBeDefined();
    });

    it('Should delete the created record', async () => {
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
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.data?.delete_item).toBeDefined();
      expect(result.data?.delete_item.id).toBe(itemId);
    });
  });
});
