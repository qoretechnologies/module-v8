// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT

import { IQoreAppActionWithFunction } from '@qoretechnologies/ts-toolkit';
import { FindGoogleSheetsSpreadsheetRows } from '../apps/google-sheets/actions';
import GoogleSheetsNewRowTrigger from '../apps/google-sheets/triggers/new-row.trigger';
import * as sheetsClient from '../apps/google-sheets/helpers/constants';

/** A cell of the fake sheet: its value, the text Google Sheets shows for it, its formula, if any, and whether it is
 * a date */
interface IFakeCell {
  value: string | number | boolean;
  formatted?: string;
  formula?: string;
  date?: boolean;
}

type TFakeRow = (IFakeCell | string | number | undefined)[];

const SHEET_ID = '7';

/**
 * The fake sheet: two title rows above the header in row 3, and data rows 4-7; the grid has 9 rows (two empty rows
 * at the end) and 4 columns, the last one a formula column
 */
const titledRows: TFakeRow[] = [
  ['Order confirmations', undefined, undefined, undefined],
  ['week 41'],
  ['Order', 'Supplier', 'Qty', 'Total'],
  ['PO-1', 'Acme', 5, { value: 50, formatted: '50.00 €', formula: '=C4*10' }],
  ['PO-2', 'Globex', 7, { value: 70, formatted: '70.00 €', formula: '=C5*10' }],
  ['PO-3', 'Acme', { value: 1234.5, formatted: '1,234.50' }, { value: 12345, formatted: '12,345.00 €', formula: '=C6*10' }],
  ['PO-4', 'Initech', 2, { value: 20, formatted: '20.00 €', formula: '=C7*10' }],
];

/** The same table with its header in row 1 */
const plainRows: TFakeRow[] = titledRows.slice(2);

const toCell = (cell: IFakeCell | string | number | undefined): IFakeCell | undefined =>
  cell === undefined ? undefined : typeof cell === 'object' ? cell : { value: cell };

/** Returns the 1-based column number of column letters */
const columnNumber = (letters: string) => [...letters].reduce((n, c) => n * 26 + c.charCodeAt(0) - 64, 0);

/** Parses an A1 range with a sheet title, as the Sheets API does */
const parseRange = (range: string, rowCount: number, columnCount: number) => {
  const sep = range.lastIndexOf('!');
  let title = range.slice(0, sep);
  if (title.startsWith("'")) {
    if (!title.endsWith("'")) {
      throw new Error(`Unable to parse range: ${range}`);
    }
    title = title.slice(1, -1).replace(/''/g, "'");
  } else if (/[^A-Za-z0-9_]/.test(title)) {
    // the API requires sheet titles with spaces or punctuation to be quoted
    throw new Error(`Unable to parse range: ${range}`);
  }
  const m = /^([A-Z]*)([0-9]*):([A-Z]*)([0-9]*)$/.exec(range.slice(sep + 1));
  if (!m || (!m[1] && !m[2]) || (!m[3] && !m[4])) {
    throw new Error(`Unable to parse range: ${range}`);
  }
  return {
    title,
    firstColumn: m[1] ? columnNumber(m[1]) : 1,
    firstRow: m[2] ? parseInt(m[2], 10) : 1,
    lastColumn: m[3] ? columnNumber(m[3]) : columnCount,
    lastRow: m[4] ? parseInt(m[4], 10) : rowCount,
  };
};

/** A fake Sheets API client for one sheet; records the ranges and value render options requested */
const createFakeClient = (rows: TFakeRow[], rowCount: number, columnCount: number, sheetTitle: string) => {
  const requests: { range: string; valueRenderOption?: string; dateTimeRenderOption?: string }[] = [];

  const render = (cell: IFakeCell | undefined, option = 'FORMATTED_VALUE', dateOption = 'SERIAL_NUMBER') => {
    if (!cell) {
      return '';
    }
    switch (option) {
      case 'UNFORMATTED_VALUE':
        return cell.date && dateOption === 'FORMATTED_STRING' ? cell.formatted : cell.value;
      case 'FORMULA':
        return cell.formula ?? (cell.date && dateOption === 'FORMATTED_STRING' ? cell.formatted : cell.value);
      default:
        return cell.formatted ?? String(cell.value);
    }
  };

  const getValues = (range: string, valueRenderOption?: string, dateTimeRenderOption?: string) => {
    requests.push({ range, valueRenderOption, dateTimeRenderOption });
    const r = parseRange(range, rowCount, columnCount);
    if (r.title !== sheetTitle) {
      throw new Error(`Unable to parse range: ${range}`);
    }
    const values: any[][] = [];
    for (let row = r.firstRow; row <= Math.min(r.lastRow, rowCount); ++row) {
      const out: any[] = [];
      for (let col = r.firstColumn; col <= Math.min(r.lastColumn, columnCount); ++col) {
        out.push(render(toCell(rows[row - 1]?.[col - 1]), valueRenderOption, dateTimeRenderOption));
      }
      // the API omits trailing empty cells and rows
      while (out.length && out[out.length - 1] === '') {
        out.pop();
      }
      values.push(out);
    }
    while (values.length && !values[values.length - 1].length) {
      values.pop();
    }
    return values.length ? { values } : {};
  };

  const sheet = {
    properties: { sheetId: parseInt(SHEET_ID, 10), title: sheetTitle, gridProperties: { rowCount, columnCount } },
  };

  const client = {
    spreadsheets: {
      get: async () => ({ data: { sheets: [sheet] } }),
      values: {
        get: async ({
          range,
          valueRenderOption,
          dateTimeRenderOption,
        }: {
          range: string;
          valueRenderOption?: string;
          dateTimeRenderOption?: string;
        }) => ({
          data: getValues(range, valueRenderOption, dateTimeRenderOption),
        }),
        batchGet: async ({
          ranges,
          valueRenderOption,
          dateTimeRenderOption,
        }: {
          ranges: string[];
          valueRenderOption?: string;
          dateTimeRenderOption?: string;
        }) => ({
          data: { valueRanges: ranges.map((range) => getValues(range, valueRenderOption, dateTimeRenderOption)) },
        }),
      },
    },
  };
  return { client, requests };
};

const action = FindGoogleSheetsSpreadsheetRows as IQoreAppActionWithFunction;
const context = { conn_opts: { token: 'fixture' } } as any;

const findRows = (opts: Record<string, any>) =>
  action.api_function({ spreadsheet_id: 'fixture', sheet_id: SHEET_ID, limit: 10, ...opts }, undefined, context);

describe('Google Sheets find_spreadsheet_rows', () => {
  let requests: { range: string; valueRenderOption?: string; dateTimeRenderOption?: string }[];

  const useSheet = (rows: TFakeRow[], rowCount: number, columnCount = 4, sheetTitle = 'Orders') => {
    const fake = createFakeClient(rows, rowCount, columnCount, sheetTitle);
    requests = fake.requests;
    jest.spyOn(sheetsClient, 'createGoogleSheetsClient').mockReturnValue(fake.client as any);
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('column ranges', () => {
    beforeEach(() => useSheet(plainRows, 7));

    it('returns every column of a row, including the last one', async () => {
      const result = await findRows({ response_type: 'raw' });
      expect(result.rows[0]).toEqual({ row_index: 2, values: ['PO-1', 'Acme', 5, 50] });
      expect(result.rows.map((r: any) => r.values.length)).toEqual([4, 4, 4, 4]);
    });

    it('searches the column of the given header', async () => {
      const result = await findRows({
        response_type: 'mapped-headers',
        search: { header: 'Supplier', type: 'exact', value: 'Acme' },
      });
      expect(result.rows_found).toBe(2);
      expect(result.rows.map((r: any) => r.row_index)).toEqual([2, 4]);
      expect(result.rows[0].values).toEqual({ Order: 'PO-1', Supplier: 'Acme', Qty: 5, Total: 50 });
    });

    it('searches the first column by its header', async () => {
      const result = await findRows({ search: { header: 'Order', type: 'exact', value: 'PO-3' } });
      expect(result.rows.map((r: any) => r.row_index)).toEqual([4]);
    });

    it('searches the last column by its letter and maps values to column letters', async () => {
      const result = await findRows({
        response_type: 'mapped-columns',
        search: { column: 'D', type: 'exact', value: '70' },
      });
      expect(result.rows).toEqual([{ row_index: 3, values: { A: 'PO-2', B: 'Globex', C: 7, D: 70 } }]);
    });

    it('quotes the sheet title in every range', async () => {
      // the API requires a title with spaces or punctuation to be quoted, with its quotes doubled
      useSheet(plainRows, 7, 4, "Supplier's Orders");
      const result = await findRows({
        response_type: 'mapped-headers',
        search: { header: 'Qty', type: 'exact', value: '7' },
      });
      expect(result.rows.map((r: any) => r.row_index)).toEqual([3]);
      expect((await findRows({ response_type: 'mapped-headers' })).rows_found).toBe(4);
      expect(requests.length).toBeGreaterThan(0);
      for (const r of requests) {
        expect(r.range.startsWith("'Supplier''s Orders'!")).toBe(true);
      }
    });
  });

  describe('header_row option', () => {
    beforeEach(() => useSheet(titledRows, 9));

    it('reads the headers from the given row and the data from the rows below it', async () => {
      const result = await findRows({ header_row: 3, response_type: 'mapped-headers' });
      expect(result.total_rows).toBe(6);
      expect(result.rows.map((r: any) => r.row_index)).toEqual([4, 5, 6, 7]);
      expect(result.rows[0].values).toEqual({ Order: 'PO-1', Supplier: 'Acme', Qty: 5, Total: 50 });
    });

    it('pages through the data rows below the header row', async () => {
      const result = await findRows({ header_row: 3, offset: 1, limit: 2 });
      expect(result.rows).toEqual([
        { row_index: 5, values: ['PO-2', 'Globex', 7, 70] },
        { row_index: 6, values: ['PO-3', 'Acme', 1234.5, 12345] },
      ]);
    });

    it('searches by a header of the header row and only below it', async () => {
      const result = await findRows({
        header_row: 3,
        response_type: 'mapped-headers',
        search: { header: 'Supplier', type: 'exact', value: 'Acme' },
      });
      expect(result.rows.map((r: any) => r.row_index)).toEqual([4, 6]);
      expect(result.rows_searched).toBe(6);
      // a title row is not searched
      const titles = await findRows({ header_row: 3, search: { column: 'A', type: 'contains', value: 'Order' } });
      expect(titles.rows_found).toBe(0);
    });

    it('searches from the last row back to the row below the header row', async () => {
      const result = await findRows({
        header_row: 3,
        search_from_last_row: true,
        search: { header: 'Supplier', type: 'exact', value: 'Acme' },
      });
      expect(result.rows.map((r: any) => r.row_index)).toEqual([6, 4]);
    });

    it('returns no rows for a header row below the last row', async () => {
      const result = await findRows({ header_row: 12 });
      expect(result).toEqual({ rows_found: 0, total_rows: 0, rows_searched: 0, rows: [] });
    });

    it('rejects a header row that is not a positive row number', async () => {
      await expect(findRows({ header_row: 0 })).rejects.toThrow('header_row must be a row number of 1 or more');
      await expect(findRows({ header_row: -2 })).rejects.toThrow('header_row must be a row number of 1 or more');
    });

    it('defaults to the first row', async () => {
      useSheet(plainRows, 7);
      const result = await findRows({ response_type: 'mapped-headers' });
      expect(result.rows[0]).toEqual({
        row_index: 2,
        values: { Order: 'PO-1', Supplier: 'Acme', Qty: 5, Total: 50 },
      });
    });
  });

  describe('value_render option', () => {
    beforeEach(() => useSheet(plainRows, 7));

    it('returns unformatted values by default', async () => {
      const result = await findRows({ offset: 2, limit: 1 });
      expect(result.rows[0].values).toEqual(['PO-3', 'Acme', 1234.5, 12345]);
      expect(requests.every((r) => r.valueRenderOption === 'UNFORMATTED_VALUE' || r.range.endsWith('!1:1'))).toBe(
        true
      );
    });

    it('returns the values as displayed', async () => {
      const result = await findRows({ value_render: 'formatted', offset: 2, limit: 1 });
      expect(result.rows[0].values).toEqual(['PO-3', 'Acme', '1,234.50', '12,345.00 €']);
    });

    it('returns the formulas of formula cells', async () => {
      const result = await findRows({ value_render: 'formula', limit: 2, response_type: 'mapped-headers' });
      // the fixture's formulas, as written for the table under two title rows
      expect(result.rows.map((r: any) => r.values.Total)).toEqual(['=C4*10', '=C5*10']);
      expect(result.rows[0].values.Qty).toBe(5);
    });

    it('searches the values as they are returned', async () => {
      const result = await findRows({
        value_render: 'formatted',
        search: { header: 'Total', type: 'exact', value: '70.00 €' },
      });
      expect(result.rows).toEqual([{ row_index: 3, values: ['PO-2', 'Globex', '7', '70.00 €'] }]);
    });

    it('reads header names as displayed whatever the value rendering', async () => {
      await findRows({ value_render: 'formula', response_type: 'mapped-headers' });
      const header = requests.find((r) => r.range.endsWith('!1:1'));
      expect(header?.valueRenderOption).toBe('FORMATTED_VALUE');
    });

    it('rejects an unknown value rendering', async () => {
      await expect(findRows({ value_render: 'raw' })).rejects.toThrow('unknown value_render "raw"');
    });
  });
});

describe('Google Sheets find_spreadsheet_rows date_render option', () => {
  // an order sheet with a date column: 2026-10-07 is serial number 46302
  const datedRows: TFakeRow[] = [
    ['Order', 'Shipped'],
    ['PO-1', { value: 46302, formatted: '10/7/2026', date: true }],
    ['PO-2', { value: 46303.5, formatted: '10/8/2026 12:00:00', date: true }],
  ];
  let requests: { range: string; valueRenderOption?: string; dateTimeRenderOption?: string }[];

  beforeEach(() => {
    const fake = createFakeClient(datedRows, 3, 2, 'Orders');
    requests = fake.requests;
    jest.spyOn(sheetsClient, 'createGoogleSheetsClient').mockReturnValue(fake.client as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns dates as serial numbers by default', async () => {
    const result = await findRows({});
    expect(result.rows.map((r: any) => r.values[1])).toEqual([46302, 46303.5]);
    expect(requests.every((r) => r.dateTimeRenderOption === 'SERIAL_NUMBER')).toBe(true);
  });

  it('returns dates as the sheet displays them', async () => {
    const result = await findRows({ date_render: 'formatted_string' });
    expect(result.rows.map((r: any) => r.values)).toEqual([
      ['PO-1', '10/7/2026'],
      ['PO-2', '10/8/2026 12:00:00'],
    ]);
  });

  it('searches the dates as they are returned', async () => {
    const result = await findRows({
      date_render: 'formatted_string',
      search: { header: 'Shipped', type: 'contains', value: '10/8/2026' },
    });
    expect(result.rows.map((r: any) => r.row_index)).toEqual([3]);
  });

  it('rejects an unknown date rendering', async () => {
    await expect(findRows({ date_render: 'iso' })).rejects.toThrow('unknown date_render "iso"');
  });
});

describe('Google Sheets new_spreadsheet_row', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  const exampleEvent = (rows: TFakeRow[], rowCount: number, columnCount: number, sheetTitle = 'Orders') => {
    const fake = createFakeClient(rows, rowCount, columnCount, sheetTitle);
    jest.spyOn(sheetsClient, 'createGoogleSheetsClient').mockReturnValue(fake.client as any);
    return (GoogleSheetsNewRowTrigger as any).get_example_event_data({
      conn_opts: { token: 'fixture' },
      opts: { spreadsheet_id: 'fixture', sheet_id: SHEET_ID },
    });
  };

  it('gives every column of a new row', async () => {
    expect(await exampleEvent(plainRows, 7, 4)).toEqual({
      row_index: 2,
      Order: 'PO-1',
      Supplier: 'Acme',
      Qty: 5,
      Total: 50,
    });
  });

  it('gives the columns of a sheet with one column', async () => {
    expect(await exampleEvent([['Order'], ['PO-1'], ['PO-2']], 3, 1)).toEqual({ row_index: 2, Order: 'PO-1' });
  });

  it('gives the columns past Z', async () => {
    const header = Array.from({ length: 28 }, (_, i) => `H${i + 1}`);
    const row = Array.from({ length: 28 }, (_, i) => i + 1);
    const event = await exampleEvent([header, row], 2, 28);
    expect(event.H26).toBe(26);
    expect(event.H28).toBe(28);
  });

  it('reads a sheet whose title has spaces and quotes', async () => {
    expect((await exampleEvent(plainRows, 7, 4, "Supplier's Orders")).Total).toBe(50);
  });
});
