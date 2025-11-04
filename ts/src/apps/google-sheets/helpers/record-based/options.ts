import { TQoreCrudOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { Debugger } from '../../../../utils/Debugger';
import { getGoogleSheetIdAllowedValues } from '../get-sheet-id-allowed-values';
import { getGoogleSheetsTableIdByName } from './constants';

export const GoogleSheetsUpdateOptions = {
  sheet_id: {
    required: true,
    type: 'string',
    get_allowed_values: async (context) => {
      try {
        const { token, table } = getQoreContextRequiredValues({
          context,
          connectionFields: ['token'],
          optionFields: ['table'],
        });

        const spreadsheetId = await getGoogleSheetsTableIdByName(token, table);

        const allowedValues = await getGoogleSheetIdAllowedValues({
          ...context,
          opts: { spreadsheet_id: spreadsheetId },
        });

        return allowedValues;
      } catch (error) {
        Debugger.log(`Error fetching allowed values for sheet_id: ${error}`);

        return [];
      }
    },
  },
} satisfies TQoreCrudOptions;

export const GoogleSheetsCreateOptions = GoogleSheetsUpdateOptions;
export const GoogleSheetsDeleteOptions = GoogleSheetsUpdateOptions;
