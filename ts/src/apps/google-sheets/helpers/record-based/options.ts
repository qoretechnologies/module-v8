// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT

import { TQoreCrudOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { getGoogleSheetIdAllowedValues } from '../get-sheet-id-allowed-values';
import { getGoogleSheetsTableIdByName } from './constants';

export const GoogleSheetsSearchOptions = {
  sheet_id: {
    required: true,
    type: 'string',
    get_allowed_values: async (context) => {
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
    },
  },
  limit: {
    type: 'int',
    required: false,
  },
} satisfies TQoreCrudOptions;
