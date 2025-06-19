import { TQoreAnyType, TQoreAppActionOption, TQoreType } from '@qoretechnologies/ts-toolkit';
import { createOdooClient } from './constants';

export const ODOO_TO_QORE_TYPE_MAPPING: Record<string, TQoreType> = {
  char: 'string',
  text: 'string',
  html: 'string',

  integer: 'integer',
  float: 'float',
  monetary: 'float',

  boolean: 'boolean',

  date: 'date',
  datetime: 'date',

  selection: 'string',

  binary: 'binary',
  image: 'binary',

  json: {
    type: 'hash',
  },

  many2one: 'integer',
  one2many: {
    type: 'list',
    element_type: 'integer',
  },
  many2many: {
    type: 'list',
    element_type: 'integer',
  },

  reference: 'string',
  many2one_reference: 'integer',

  computed: 'string',
  related: 'string',
  stored: 'string',

  id: 'integer',
  create_date: 'date',
  write_date: 'date',
  create_uid: 'integer',
  write_uid: 'integer',
  __last_update: 'date',

  stage_id: 'integer',
  user_id: 'integer',
  team_id: 'integer',
  partner_id: 'integer',
  company_id: 'integer',
  currency_id: 'integer',
  country_id: 'integer',
  state_id: 'integer',
  category_id: {
    type: 'list',
    element_type: 'integer',
  },

  mail_activity_ids: {
    type: 'list',
    element_type: 'integer',
  },
  message_ids: {
    type: 'list',
    element_type: 'integer',
  },
  message_follower_ids: {
    type: 'list',
    element_type: 'integer',
  },
  activity_ids: {
    type: 'list',
    element_type: 'integer',
  },

  priority: 'string',
  state: 'string',
  kanban_state: 'string',

  tag_ids: {
    type: 'list',
    element_type: 'integer',
  },
  categ_ids: {
    type: 'list',
    element_type: 'integer',
  },

  decimal: 'float',

  percentage: 'float',

  progress: 'float',

  handle: 'integer',

  sign: 'binary',

  command: {
    type: 'hash',
  },

  properties: {
    type: 'hash',
  },
} satisfies Record<string, TQoreType>;

const fieldAttributes = ['type', 'readonly', 'required', 'string', 'relation'];

type TOdooField = {
  type: string;
  readonly: boolean;
  required: boolean;
  string: string;
  relation?: string;
};

export const getOdooModelFields = async (options: {
  model: string;
  subdomain: string;
  username: string;
  password: string;
}): Promise<Record<string, TOdooField>> => {
  const client = await createOdooClient(options);

  return await client.getFields(options.model, fieldAttributes);
};

export const mapOdooFieldsToQoreType = async (options: {
  model: string;
  fields: string[];
  subdomain: string;
  username: string;
  password: string;
}): Promise<Record<string, TQoreAppActionOption>> => {
  const { fields, model, subdomain, username, password } = options;

  const fieldsData = await getOdooModelFields({ model, subdomain, username, password });
  const selectedFields = fields.reduce(
    (acc, fieldName) => {
      if (fieldsData[fieldName]) {
        acc[fieldName] = fieldsData[fieldName];
      }

      return acc;
    },
    {} as Record<string, TOdooField>
  );

  return Object.entries(selectedFields).reduce(
    (acc, [fieldName, field]) => {
      const qoreType = ODOO_TO_QORE_TYPE_MAPPING[field.type] || 'any';

      acc[fieldName] = {
        type: qoreType as TQoreAnyType,
        required: field.required,
        display_name: field.string,
      };

      return acc;
    },
    {} as Record<string, TQoreAppActionOption>
  );
};
