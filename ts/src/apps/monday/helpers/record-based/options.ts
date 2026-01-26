import { TQoreCrudOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { getMondayBoardIdByName } from './constants';
import { getMondayGroupIdAllowedValues } from '../get-group-id-allowed-values';

const commonOptions = {
  group_id: {
    type: 'string',
    required: false,
    allowed_values_creatable: true,
    get_allowed_values: async (context) => {
      const { token } = getQoreContextRequiredValues({ context, connectionFields: ['token'] });

      const table = context?.opts?.table;

      if (!table) {
        return [];
      }

      const boardId = await getMondayBoardIdByName(token, table);

      return await getMondayGroupIdAllowedValues({ ...context, opts: { board_id: boardId } });
    },
  },
} satisfies TQoreCrudOptions;

export const MondaySearchOptions = {
  orderBy: {
    type: {
      type: 'hash',
      fields: {
        column: {
          type: 'string',
          required: true,
        },
        ascending: {
          type: 'bool',
          required: false,
        },
      },
    },
  },
  ...commonOptions,
} satisfies TQoreCrudOptions;

export const MondayCreateOptions = {
  ...commonOptions,
} satisfies TQoreCrudOptions;
