import {
  IQoreAllowedValue,
  IQoreTypeObjectNonList,
  TCustomConnOptions,
  TQoreAnyType,
  TQoreAppActionOption,
  TQoreGetAllowedValuesFunction,
  TQoreGetDependentOptionsFunction,
  TQoreGetDynamicTypeFunction,
  TQoreType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { MondayError } from '../constants';
import { callMondayAPI } from './constants';
import { getMondayPeopleAllowedValues } from './get-people-allowed-values';

type TBoardColumn = {
  id: string;
  title: string;
  description: string;
  type: string;
  settings: string;
};

type TParsedBoardColumn = TBoardColumn & {
  settings?: {
    labels?: {
      id: number;
      label: string;
    }[];
  };
};

type TBoardColumnsResponseType = {
  data: {
    boards: {
      columns: TBoardColumn[];
    }[];
  };
};

const MondayFieldTypeToQoreTypeMap: Record<string, TQoreType> = {
  name: 'string',
  text: 'string',
  long_text: 'string',
  email: 'string',
  phone: 'string',
  link: 'string',

  numbers: 'number',
  auto_number: 'integer',

  date: 'date',
  timeline: {
    type: 'hash',
    fields: {
      from: { type: 'date' },
      to: { type: 'date' },
    },
  },
  week: 'date',
  hour: 'string',
  creation_log: 'date',
  last_updated: 'date',

  checkbox: 'boolean',
  vote: 'integer',

  status: 'string',
  dropdown: {
    type: 'list',
    element_type: 'string',
  },
  tags: {
    type: 'list',
    element_type: 'string',
  },
  color_picker: 'string',
  country: 'string',

  people: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        id: { type: 'integer' },
        kind: { type: 'string' },
      },
    },
  },

  board_relation: {
    type: 'list',
    element_type: 'integer',
  },
  dependency: {
    type: 'list',
    element_type: 'integer',
  },

  location: {
    type: 'hash',
    fields: {
      lat: { type: 'number' },
      lng: { type: 'number' },
      address: { type: 'string' },
    },
  },

  file: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        assetId: { type: 'integer' },
        name: { type: 'string' },
        url: { type: 'string' },
      },
    },
  },

  rating: 'integer',

  formula: 'string',
  mirror: 'auto',
  item_id: 'string',
  progress: 'number',

  time_tracking: {
    type: 'hash',
    fields: {
      running: { type: 'boolean' },
      duration: { type: 'integer' },
      additional_value: { type: 'string' },
    },
  },

  button: 'string',
  world_clock: 'string',
  doc: 'string',

  item_assignees: {
    type: 'list',
    element_type: 'integer',
  },
  subitems: 'auto',
  team: 'string',

  unsupported: 'string',
};

const mapMondayColumnToQoreOption = (
  column: TParsedBoardColumn,
  forResponse: boolean = false
): TQoreAppActionOption => {
  const labels = column.settings?.labels;

  const allowedValues: IQoreAllowedValue[] = [];

  if (labels) {
    labels.forEach((label) => {
      allowedValues.push({
        value: label.label,
        display_name: label.label || label.id.toString(),
      });
    });
  }

  const type = (MondayFieldTypeToQoreTypeMap[column.type] || 'string') as TQoreAnyType;

  const required = column.type === 'name';

  let useElementAllowedValues = false;
  let getAllowedValues: TQoreGetAllowedValuesFunction<TCustomConnOptions, any> | undefined =
    undefined;

  if (column.type === 'people') {
    useElementAllowedValues = true;
    getAllowedValues = getMondayPeopleAllowedValues;
  }

  const allowedValuesFields = {
    ...(allowedValues.length > 0 && { allowed_values: allowedValues }),
    ...(getAllowedValues && {
      ...(useElementAllowedValues
        ? { get_element_allowed_values: getAllowedValues, element_allowed_values_creatable: true }
        : { get_allowed_values: getAllowedValues, allowed_values_creatable: true }),
    }),
  };

  return {
    type,
    display_name: column.title,
    desc: column.title,
    short_desc: column.title,
    ...(forResponse && { ...allowedValuesFields }),
    required,
  };
};

export const getMondayBoardFields = async (
  token: string,
  boardId: string
): Promise<Record<string, TParsedBoardColumn>> => {
  try {
    const query = `
    query GetBoardColumns($boardId: [ID!]!) {
      boards(ids: $boardId) {
        columns {
          id
          title
          description
          type
          settings
        }
      }
    }
  `;

    const response = await callMondayAPI<TBoardColumnsResponseType>({
      query,
      token,
      variables: {
        boardId,
      },
    });

    const columns = response.data?.boards?.[0]?.columns;
    if (!columns) {
      throw new Error('No columns returned from monday.com API');
    }

    const columnValuesFields: Record<string, TParsedBoardColumn> = {};
    columns.forEach((column) => {
      columnValuesFields[column.id] = { ...column, settings: column.settings };
    });

    return columnValuesFields;
  } catch (error) {
    throw new Error(`Failed to fetch Monday board fields: ${error.message || error}`);
  }
};

export const getMondayBoardFieldsDynamicOptions: TQoreGetDynamicTypeFunction = async (context) => {
  const { token, board_id } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    optionFields: ['board_id'],
    ErrorClass: MondayError,
  });

  try {
    const columns = await getMondayBoardFields(token, board_id);

    const options: Record<string, TQoreAppActionOption> = {};
    Object.values(columns).forEach((column) => {
      options[column.id] = mapMondayColumnToQoreOption(column);
    });

    return {
      type: 'hash',
      fields: options,
    };
  } catch (error) {
    if (error instanceof MondayError) {
      throw error;
    }

    throw new MondayError(`Failed to fetch Monday board fields: ${error.message || error}`);
  }
};

export const getMondayBoardDependentOptions: TQoreGetDependentOptionsFunction = async (
  context
): Promise<Record<string, TQoreAppActionOption>> => {
  const options = await getMondayBoardFieldsDynamicOptions(context);

  const recordFields = {
    column_values: {
      required: false,
      display_name: 'Column Values',
      short_desc: 'The values to set for the record columns.',
      desc: 'The values to set for the columns of the record you want to create.',
      type: options as IQoreTypeObjectNonList,
    },
  } satisfies Record<string, TQoreAppActionOption>;

  return recordFields;
};

export const getMondayBoardFieldsResponseType: TQoreGetDynamicTypeFunction = async (context) => {
  const { token, board_id } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    optionFields: ['board_id'],
    ErrorClass: MondayError,
  });

  const defaultFields = {
    id: { type: 'string' },
    created_at: { type: 'date' },
    updated_at: { type: 'date' },
  } satisfies Record<string, TQoreAppActionOption>;

  try {
    const columns = await getMondayBoardFields(token, board_id);

    const options: Record<string, TQoreAppActionOption> = {};
    Object.values(columns).forEach((column) => {
      options[column.id] = mapMondayColumnToQoreOption(column);
    });

    return {
      type: 'hash',
      fields: {
        ...options,
        ...defaultFields,
      },
    };
  } catch (error) {
    if (error instanceof MondayError) {
      throw error;
    }

    throw new MondayError(`Failed to fetch Monday board fields: ${error.message || error}`);
  }
};
