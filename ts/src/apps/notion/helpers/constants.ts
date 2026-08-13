import { Client, DataSourceObjectResponse, RichTextItemResponse } from '@notionhq/client';
import { IQoreAllowedValue, TQoreAppActionOption } from '@qoretechnologies/ts-toolkit';

/**
 * The Notion API version this application speaks.
 *
 * Notion dates its versions and requires the `Notion-Version` header on every request. `2026-03-11`
 * renames `archived` to `in_trash` on pages, databases, blocks and data sources, replaces the
 * `after` parameter of Append Block Children with a `position` object, and renames the
 * `transcription` block type to `meeting_notes`. Only the first of those affects this application.
 *
 * `archived` was removed from request parameters and response bodies in this version, so all
 * published response shapes and page-update calls must use `in_trash` exclusively.
 *
 * Requires `@notionhq/client` 5.12.0 or later.
 */
export const NOTION_API_VERSION = '2026-03-11';

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
export type DatabasePropertyConfigResponse = DatabasePropertyConfigResponseCommon &
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
      type: 'bool',
      display_name: property.name,
      ...(property.description && { desc: property.description }),
    }),
    buildNotionType: (property: string) => ({
      checkbox: property,
    }),
  },
  date: {
    buildQoreType: (property) => ({
      type: 'date',
      ...(property.description && { desc: property.description }),
      display_name: property.name,
    }),
    buildNotionType: (property: string) => ({
      date: {
        start: formatNotionDateTime(property),
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
    buildNotionType: (property: string[]) => ({
      people: property.map((id) => ({ id })),
    }),
  },
};

export const getNotionDataSourceByTitle = async (options: {
  token: string;
  titleQuery: string;
}): Promise<DataSourceObjectResponse> => {
  const { token, titleQuery } = options;
  const notion = createNotionClient(token);

  const response = await notion.search({
    query: titleQuery,
    filter: {
      property: 'object',
      value: 'data_source',
    },
  });

  if (!response.results.length) {
    throw new Error('Data source not found');
  }

  return response.results[0] as DataSourceObjectResponse;
};

export const mapNotionPropertiesToSimpleObject = (
  properties: Record<string, any>,
  mapPeopleIntoSingleField?: 'id' | 'name' | 'email'
): Record<string, any> => {
  const result: Record<string, any> = {};

  for (const [key, property] of Object.entries(properties)) {
    if (!property || !property.type) {
      result[key] = null;
      continue;
    }

    switch (property.type) {
      case 'title':
        result[key] = property.title?.[0]?.plain_text || '';
        break;

      case 'rich_text':
        result[key] = property.rich_text?.map((rt: any) => rt.plain_text).join('') || '';
        break;

      case 'number':
        result[key] = property.number;
        break;

      case 'select':
        result[key] = property.select?.name || null;
        break;

      case 'multi_select':
        result[key] = property.multi_select?.map((s: any) => s.name) || [];
        break;

      case 'status':
        result[key] = property.status?.name || null;
        break;

      case 'date':
        result[key] = property.date?.start || null;
        break;

      case 'people':
        result[key] =
          property.people?.map((person: any) => {
            const personData = {
              id: person.id,
              name: person.name,
              email: person.person?.email || person.bot?.owner?.user?.person?.email || null,
            };
            if (mapPeopleIntoSingleField) {
              return personData[mapPeopleIntoSingleField];
            }

            return personData;
          }) || [];
        break;

      case 'files':
        result[key] =
          property.files?.map((file: any) => ({
            name: file.name,
            url: file.file?.url || file.external?.url,
          })) || [];
        break;

      case 'checkbox':
        result[key] = property.checkbox || false;
        break;

      case 'url':
        result[key] = property.url || null;
        break;

      case 'email':
        result[key] = property.email || null;
        break;

      case 'phone_number':
        result[key] = property.phone_number || null;
        break;

      case 'formula':
        result[key] = extractFormulaValue(property.formula);
        break;

      case 'relation':
        result[key] = property.relation?.map((r: any) => r.id) || [];
        break;

      case 'rollup':
        result[key] = extractRollupValue(property.rollup);
        break;

      case 'created_time':
        result[key] = property.created_time;
        break;

      case 'created_by':
        result[key] = {
          id: property.created_by?.id,
          name: property.created_by?.name,
        };
        break;

      case 'last_edited_time':
        result[key] = property.last_edited_time;
        break;

      case 'last_edited_by':
        result[key] = {
          id: property.last_edited_by?.id,
          name: property.last_edited_by?.name,
        };
        break;

      case 'id':
        result[key] = property.id;
        break;

      default:
        result[key] = null;
    }
  }

  return result;
};

const extractFormulaValue = (formula: any): any => {
  if (!formula) return null;

  switch (formula.type) {
    case 'string':
      return formula.string;
    case 'number':
      return formula.number;
    case 'boolean':
      return formula.boolean;
    case 'date':
      return formula.date?.start || null;
    default:
      return null;
  }
};

const extractRollupValue = (rollup: any): any => {
  if (!rollup) return null;

  switch (rollup.type) {
    case 'number':
      return rollup.number;
    case 'date':
      return rollup.date?.start || null;
    case 'array':
      return rollup.array || [];
    default:
      return null;
  }
};

export const formatNotionDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;

  return d.toISOString().replace(/\.\d{3}Z$/, 'Z');
};
