import { sheets_v4 } from '@googleapis/sheets';
import { TQoreGetDependentOptionsFunction, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { GoogleSheetsError } from '../constants';
import { createGoogleSheetsClient } from './constants';

export const getSheetRowsOptions: TQoreGetDependentOptionsFunction = async (context) => {
  const { conn_opts, opts } = context || {};

  const token = conn_opts?.token;
  const spreadsheet_id = opts?.spreadsheet_id;
  const sheet_id = opts?.sheet_id;
  const add_row_index = opts?.add_row_index;

  if (!token || !spreadsheet_id || !sheet_id) {
    return {
      rows: {
        required: true,
        type: {
          type: 'list',
          element_type: 'hash',
        },
        display_name: 'Rows to Add',
        desc:
          `The rows to add to the worksheet.` +
          ` Select a spreadsheet and worksheet first to see the available columns.`,
      },
    };
  }

  try {
    const sheetsClient = createGoogleSheetsClient(token);

    const spreadsheet = await sheetsClient.spreadsheets.get({
      spreadsheetId: spreadsheet_id,
      fields: 'sheets.properties',
    });

    const sheets = spreadsheet.data.sheets || [];
    const targetSheet = sheets.find((s) => s.properties?.sheetId?.toString() === sheet_id);

    if (!targetSheet || !targetSheet.properties?.title) {
      throw new GoogleSheetsError(`Sheet with ID ${sheet_id} not found or has no title`);
    }

    const sheetTitle = targetSheet.properties.title;

    const fullSheetResponse = await sheetsClient.spreadsheets.get({
      spreadsheetId: spreadsheet_id,
      ranges: [`${sheetTitle}`],
      includeGridData: true,
    });

    const sheetData = fullSheetResponse.data.sheets?.[0];
    const headerRow = sheetData?.data?.[0]?.rowData?.[0]?.values || [];
    const secondRow = sheetData?.data?.[0]?.rowData?.[1]?.values || [];

    const headers = headerRow
      .map((cell) => cell.formattedValue || '')
      .filter((header) => header.trim() !== '');

    if (headers.length === 0) {
      throw new GoogleSheetsError('No headers found in the first row of the sheet');
    }

    const rowFields: TQoreOptions = {};

    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];

      if (typeof header !== 'string' || header.trim() === '') {
        continue;
      }

      const fieldConfig: any = {
        type: 'string',
        required: false,
        display_name: header,
      };

      const headerCell = headerRow[i];
      const secondRowCell = secondRow[i] || {};

      if (headerCell.dataValidation || secondRowCell.dataValidation) {
        const dataValidation: sheets_v4.Schema$DataValidationRule =
          headerCell.dataValidation! || secondRowCell.dataValidation!;

        const dataValidationType = dataValidation.condition?.type || '';

        if (dataValidation.condition?.type === 'ONE_OF_LIST') {
          const values = dataValidation.condition.values || [];
          const allowedValues = values.map((v) => ({
            value: v.userEnteredValue,
            display_name: v.userEnteredValue,
          }));

          if (allowedValues.length > 0) {
            fieldConfig.type = 'string';
            fieldConfig.allowed_values = allowedValues;
            fieldConfig.allowed_values_creatable = true;
          }
        } else if (
          [
            'NUMBER_BETWEEN',
            'NUMBER_GREATER',
            'NUMBER_GREATER_THAN_OR_EQUAL',
            'NUMBER_LESS',
            'NUMBER_LESS_THAN_OR_EQUAL',
          ].includes(dataValidationType)
        ) {
          fieldConfig.type = 'number';
        } else if (
          ['DATE_BEFORE', 'DATE_AFTER', 'DATE_BETWEEN', 'DATE_ON'].includes(dataValidationType)
        ) {
          fieldConfig.type = 'date';
        } else if (dataValidationType === 'BOOLEAN') {
          fieldConfig.type = 'boolean';
        }
      } else if (secondRowCell.effectiveValue) {
        if (secondRowCell.effectiveValue.numberValue !== undefined) {
          fieldConfig.type = 'number';
        } else if (secondRowCell.effectiveValue.boolValue !== undefined) {
          fieldConfig.type = 'boolean';
        } else if (
          secondRowCell.userEnteredFormat?.numberFormat?.type === 'DATE' ||
          secondRowCell.userEnteredFormat?.numberFormat?.type === 'DATE_TIME'
        ) {
          fieldConfig.type = 'date';
        }
      }

      const condition = headerCell.dataValidation?.condition;
      if (condition) {
        if (fieldConfig.type === 'number') {
          if (
            condition.type === 'NUMBER_BETWEEN' &&
            condition.values &&
            condition.values.length >= 2 &&
            condition.values[0].userEnteredValue &&
            condition.values[1].userEnteredValue
          ) {
            fieldConfig.minimum = parseFloat(condition.values[0].userEnteredValue);
            fieldConfig.maximum = parseFloat(condition.values[1].userEnteredValue);
          } else if (
            (condition.type === 'NUMBER_GREATER' ||
              condition.type === 'NUMBER_GREATER_THAN_OR_EQUAL') &&
            condition.values &&
            condition.values.length >= 1 &&
            condition.values[0].userEnteredValue
          ) {
            fieldConfig.minimum = parseFloat(condition.values[0].userEnteredValue);
          } else if (
            (condition.type === 'NUMBER_LESS' || condition.type === 'NUMBER_LESS_THAN_OR_EQUAL') &&
            condition.values &&
            condition.values.length >= 1 &&
            condition.values[0].userEnteredValue
          ) {
            fieldConfig.maximum = parseFloat(condition.values[0].userEnteredValue);
          }
        }
      }

      rowFields[header] = fieldConfig;
    }

    if (Object.keys(rowFields).length === 0) {
      return {
        rows: {
          required: true,
          type: {
            type: 'list',
            element_type: 'hash',
          },
          display_name: 'Rows to Add',
          desc: 'No valid headers found in the first row. Please ensure the sheet has headers.',
        },
      };
    }

    return {
      rows: {
        required: true,
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              ...rowFields,
              ...(add_row_index
                ? {
                    row_index: {
                      type: 'integer',
                      required: true,
                    },
                  }
                : {}),
            },
          },
        },
        display_name: 'Rows to Add',
        desc: 'The rows to add to the end of the table. Each row should include values for the corresponding columns.',
      },
    };
  } catch (error) {
    console.error('Error fetching sheet headers:', error);

    return {
      rows: {
        required: true,
        type: {
          type: 'list',
          element_type: 'hash',
        },
        display_name: 'Rows to Add',
        desc:
          `Error fetching headers.` +
          ` Please ensure the spreadsheet and worksheet exist and contain headers in the first row.`,
      },
    };
  }
};
