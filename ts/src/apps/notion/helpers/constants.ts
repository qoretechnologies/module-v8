import { Client, RichTextItemResponse } from '@notionhq/client';
import { IQoreAllowedValue, TQoreAppActionOption } from '@qoretechnologies/ts-toolkit';

export const NOTION_API_VERSION = '2025-09-03';

export const createNotionClient = (token: string, version = NOTION_API_VERSION) => {
  const notion = new Client({
    auth: token,
    notionVersion: version,
  });

  return notion;
};

export const getNotionRickTextFieldPlainText = (
  richTextField: Array<RichTextItemResponse>
): string | null => {
  if (Array.isArray(richTextField) && richTextField.length > 0) {
    return richTextField.map((item) => item.plain_text).join(' ');
  }

  return null;
};

export const NOTION_FETCH_DELAY = 300;
export const NOTION_ALLOWED_VALUES_TIMEOUT = 30_000;

type EmptyObject = Record<string, never>;
type RollupFunction =
  | 'count'
  | 'count_values'
  | 'empty'
  | 'not_empty'
  | 'unique'
  | 'show_unique'
  | 'percent_empty'
  | 'percent_not_empty'
  | 'sum'
  | 'average'
  | 'median'
  | 'min'
  | 'max'
  | 'range'
  | 'earliest_date'
  | 'latest_date'
  | 'date_range'
  | 'checked'
  | 'unchecked'
  | 'percent_checked'
  | 'percent_unchecked'
  | 'count_per_group'
  | 'percent_per_group'
  | 'show_original';
type NumberFormat =
  | 'number'
  | 'number_with_commas'
  | 'percent'
  | 'dollar'
  | 'australian_dollar'
  | 'canadian_dollar'
  | 'singapore_dollar'
  | 'euro'
  | 'pound'
  | 'yen'
  | 'ruble'
  | 'rupee'
  | 'won'
  | 'yuan'
  | 'real'
  | 'lira'
  | 'rupiah'
  | 'franc'
  | 'hong_kong_dollar'
  | 'new_zealand_dollar'
  | 'krona'
  | 'norwegian_krone'
  | 'mexican_peso'
  | 'rand'
  | 'new_taiwan_dollar'
  | 'danish_krone'
  | 'zloty'
  | 'baht'
  | 'forint'
  | 'koruna'
  | 'shekel'
  | 'chilean_peso'
  | 'philippine_peso'
  | 'dirham'
  | 'colombian_peso'
  | 'riyal'
  | 'ringgit'
  | 'leu'
  | 'argentine_peso'
  | 'uruguayan_peso'
  | 'peruvian_sol';
type SelectColor =
  | 'default'
  | 'gray'
  | 'brown'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'red';

type NumberDatabasePropertyConfigResponse = {
  type: 'number';
  number: {
    format: NumberFormat;
  };
};
type FormulaDatabasePropertyConfigResponse = {
  type: 'formula';
  formula: {
    expression: string;
  };
};
type SelectPropertyResponse = {
  id: string;
  name: string;
  color: SelectColor;
  description: string | null;
};
type SelectDatabasePropertyConfigResponse = {
  type: 'select';
  select: {
    options: Array<SelectPropertyResponse>;
  };
};
type MultiSelectDatabasePropertyConfigResponse = {
  type: 'multi_select';
  multi_select: {
    options: Array<SelectPropertyResponse>;
  };
};
type StatusPropertyResponse = {
  id: string;
  name: string;
  color: SelectColor;
  description: string | null;
};
type StatusDatabasePropertyConfigResponse = {
  type: 'status';
  status: {
    options: Array<StatusPropertyResponse>;
    groups: Array<{
      id: string;
      name: string;
      color: SelectColor;
      option_ids: Array<string>;
    }>;
  };
};
type SinglePropertyDatabasePropertyRelationConfigResponse = {
  type: 'single_property';
  single_property: EmptyObject;
};
type DualPropertyDatabasePropertyRelationConfigResponse = {
  type?: 'dual_property';
  dual_property: {
    synced_property_id: string;
    synced_property_name: string;
  };
};
type DatabasePropertyRelationConfigResponseCommon = {
  database_id: string;
  data_source_id: string;
};

type DatabasePropertyRelationConfigResponse = DatabasePropertyRelationConfigResponseCommon &
  (
    | SinglePropertyDatabasePropertyRelationConfigResponse
    | DualPropertyDatabasePropertyRelationConfigResponse
  );
type RelationDatabasePropertyConfigResponse = {
  type: 'relation';
  relation: DatabasePropertyRelationConfigResponse;
};
type RollupDatabasePropertyConfigResponse = {
  type: 'rollup';
  rollup: {
    function: RollupFunction;
    rollup_property_name: string;
    relation_property_name: string;
    rollup_property_id: string;
    relation_property_id: string;
  };
};
type UniqueIdDatabasePropertyConfigResponse = {
  type: 'unique_id';
  unique_id: {
    prefix: string | null;
  };
};
type TitleDatabasePropertyConfigResponse = {
  type: 'title';
  title: EmptyObject;
};
type RichTextDatabasePropertyConfigResponse = {
  type: 'rich_text';
  rich_text: EmptyObject;
};
type UrlDatabasePropertyConfigResponse = {
  type: 'url';
  url: EmptyObject;
};
type PeopleDatabasePropertyConfigResponse = {
  type: 'people';
  people: EmptyObject;
};
type FilesDatabasePropertyConfigResponse = {
  type: 'files';
  files: EmptyObject;
};
type EmailDatabasePropertyConfigResponse = {
  type: 'email';
  email: EmptyObject;
};
type PhoneNumberDatabasePropertyConfigResponse = {
  type: 'phone_number';
  phone_number: EmptyObject;
};
type DateDatabasePropertyConfigResponse = {
  type: 'date';
  date: EmptyObject;
};
type CheckboxDatabasePropertyConfigResponse = {
  type: 'checkbox';
  checkbox: EmptyObject;
};
type CreatedByDatabasePropertyConfigResponse = {
  type: 'created_by';
  created_by: EmptyObject;
};
type CreatedTimeDatabasePropertyConfigResponse = {
  type: 'created_time';
  created_time: EmptyObject;
};
type LastEditedByDatabasePropertyConfigResponse = {
  type: 'last_edited_by';
  last_edited_by: EmptyObject;
};
type LastEditedTimeDatabasePropertyConfigResponse = {
  type: 'last_edited_time';
  last_edited_time: EmptyObject;
};

type DatabasePropertyConfigResponseCommon = {
  id: string;
  name: string;
  description: string | null;
};
type DatabasePropertyConfigResponse = DatabasePropertyConfigResponseCommon &
  (
    | NumberDatabasePropertyConfigResponse
    | FormulaDatabasePropertyConfigResponse
    | SelectDatabasePropertyConfigResponse
    | MultiSelectDatabasePropertyConfigResponse
    | StatusDatabasePropertyConfigResponse
    | RelationDatabasePropertyConfigResponse
    | RollupDatabasePropertyConfigResponse
    | UniqueIdDatabasePropertyConfigResponse
    | TitleDatabasePropertyConfigResponse
    | RichTextDatabasePropertyConfigResponse
    | UrlDatabasePropertyConfigResponse
    | PeopleDatabasePropertyConfigResponse
    | FilesDatabasePropertyConfigResponse
    | EmailDatabasePropertyConfigResponse
    | PhoneNumberDatabasePropertyConfigResponse
    | DateDatabasePropertyConfigResponse
    | CheckboxDatabasePropertyConfigResponse
    | CreatedByDatabasePropertyConfigResponse
    | CreatedTimeDatabasePropertyConfigResponse
    | LastEditedByDatabasePropertyConfigResponse
    | LastEditedTimeDatabasePropertyConfigResponse
  );

export const NotionFieldMapping: Record<
  string,
  {
    buildQoreType: (property: DatabasePropertyConfigResponse) => TQoreAppActionOption;
    buildNotionType: (property: any) => any;
  }
> = {
  checkbox: {
    buildQoreType: (property) => ({
      type: 'boolean',
      display_name: property.name,
      ...(property.description && { desc: property.description }),
    }),
    buildNotionType: (property: string) => ({
      checkbox: property,
    }),
  },
  date: {
    buildQoreType: (property) => ({
      type: 'string',
      ...(property.description && { desc: property.description }),
      display_name: property.name,
    }),
    buildNotionType: (property: string) => ({
      date: {
        start: property,
      },
    }),
  },
  email: {
    buildQoreType: (property) => ({
      type: 'string',
      ...(property.description && { desc: property.description }),
      display_name: property.name,
    }),
    buildNotionType: (property: string) => ({
      email: property,
    }),
  },
  formula: {
    buildQoreType: (property) => ({
      type: 'string',
      ...(property.description && { desc: property.description }),
      display_name: property.name,
    }),
    buildNotionType: (property: string) => ({
      formula: property,
    }),
  },
  select: {
    buildQoreType: (
      property: SelectDatabasePropertyConfigResponse & DatabasePropertyConfigResponseCommon
    ) => ({
      type: 'string',
      ...(property.description && { desc: property.description }),
      display_name: property.name,
      allowed_values_creatable: true,
      allowed_values:
        property.select?.options.map((option) => ({
          value: option.name,
          display_name: option.name,
        })) || [],
    }),
    buildNotionType: (property: string) => ({
      select: {
        name: property,
      },
    }),
  },
  multi_select: {
    buildQoreType: (
      property: MultiSelectDatabasePropertyConfigResponse & DatabasePropertyConfigResponseCommon
    ) => {
      const elementAllowedValues = property.multi_select?.options.map((option) => ({
        value: option.name,
        display_name: option.name,
      })) satisfies IQoreAllowedValue<string>[];

      return {
        type: {
          type: 'list',
          element_type: 'string',
        },
        element_allowed_values: elementAllowedValues,
        element_allowed_values_creatable: true,
        ...(property.description && { desc: property.description }),
        display_name: property.name,
      };
    },
    buildNotionType: (property: string[]) => ({
      multi_select: property.map((name) => ({ name })),
    }),
  },
  status: {
    buildQoreType: (
      property: StatusDatabasePropertyConfigResponse & DatabasePropertyConfigResponseCommon
    ) => ({
      type: 'string',
      display_name: property.name,
      ...(property.description && { desc: property.description }),
      allowed_values_creatable: true,
      allowed_values:
        property.status?.options.map((option) => ({
          value: option.name,
          display_name: option.name,
        })) || [],
    }),
    buildNotionType: (property: string) => ({
      status: {
        name: property,
      },
    }),
  },
  number: {
    buildQoreType: (property) => ({
      type: 'number',
      ...(property.description && { desc: property.description }),
      display_name: property.name,
    }),
    buildNotionType: (property: number) => ({
      number: property,
    }),
  },
  phone_number: {
    buildQoreType: (property) => ({
      type: 'string',
      ...(property.description && { desc: property.description }),

      display_name: property.name,
    }),
    buildNotionType: (property: string) => ({
      phone_number: property,
    }),
  },
  rich_text: {
    buildQoreType: (property) => ({
      type: 'string',
      ...(property.description && { desc: property.description }),

      display_name: property.name,
    }),
    buildNotionType: (property: string) => ({
      rich_text: [
        {
          type: 'text',
          text: {
            content: property,
          },
        },
      ],
    }),
  },
  title: {
    buildQoreType: (property) => ({
      type: 'string',
      ...(property.description && { desc: property.description }),

      display_name: property.name,
    }),
    buildNotionType: (property: string) => ({
      title: [
        {
          type: 'text',
          text: {
            content: property,
          },
        },
      ],
    }),
  },
  url: {
    buildQoreType: (property) => ({
      type: 'string',
      display_name: property.name,
      ...(property.description && { desc: property.description }),
    }),
    buildNotionType: (property: string) => ({
      url: property,
    }),
  },
  people: {
    buildQoreType: (property) => ({
      type: 'string',
      display_name: property.name,
      ...(property.description && { desc: property.description }),
    }),
    buildNotionType: (property: string) => ({
      people: [{ id: property }],
    }),
  },
};
