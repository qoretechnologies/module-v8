import {
  IQoreAllowedValue,
  TQoreAppActionOption,
  TQoreGetAllowedValuesFunction,
  TQoreGetDynamicTypeFunction,
  TQoreType,
} from '@qoretechnologies/ts-toolkit';
import { ZENDESK_CONN_OPTIONS } from '..';
import { getQoreContextRequiredValues, normalizeName } from '../../../global/helpers';
import { ZendeskError } from '../constants';
import { fetchZendeskPaginatedRecords } from './constants';
import { getAgentIdAllowedValues } from './get-agent-id-allowed-values';
import { getGroupIdAllowedValues } from './get-group-id-allowed-values';
import { getOrganizationIdAllowedValues } from './get-organization-id-allowed-values';
import { getTicketIdAllowedValues } from './get-ticket-id-allowed-values';
import { getUserIdAllowedValues } from './get-user-id-allowed-values';
import { isCustomZendeskObject } from './record-based/constants';
import { TZendeskTable } from './record-based/get-table-list';

const defaultFields = [
  'subject',
  'description',
  'status',
  'priority',
  'tickettype',
  'group',
  'assignee',
  'custom_status',
] as const;

type TZendeskDefaultField = (typeof defaultFields)[number];
//The custom field type: "checkbox", "date", "decimal", "dropdown", "integer", "lookup", "multiselect", "regexp", "text", or "textarea"
type TZendeskFieldType =
  | 'text'
  | 'textarea'
  | 'checkbox'
  | 'date'
  | 'integer'
  | 'decimal'
  | 'lookup'
  | 'regexp'
  | 'partialcreditcard'
  | 'multiselect'
  | 'tagger'
  | 'dropdown'
  | TZendeskDefaultField;

type TZendeskSystemFieldOption = {
  name: string;
  value: string;
};

type TZendeskCustomFieldOption = {
  id: number;
  name: string;
};

type TZendeskCustomStatus = {
  id: number;
  end_user_label: string;
  active: boolean;
  description: string;
};

type TZendeskField = {
  id: number;
  type: TZendeskFieldType;
  title: string;
  raw_title: string;
  description: string;
  active: boolean;
  required: boolean;
  relationship_target_type?: 'zen:organization' | 'zen:ticket' | 'zen:user';
  system_field_options?: TZendeskSystemFieldOption[];
  custom_field_options?: TZendeskCustomFieldOption[];
  agent_can_edit: boolean;
  key: string;
  custom_statuses?: TZendeskCustomStatus[];
};

const tableNameToFieldsPathMap: Record<TZendeskTable, string> = {
  tickets: 'ticket_fields',
  users: 'user_fields',
  organizations: 'organization_fields',
};

export const getZendeskFields = async (options: {
  token: string;
  url: string;
  object: TZendeskTable;
}): Promise<Array<TZendeskField>> => {
  const { object, ...requestOptions } = options;
  const isCustomObject = isCustomZendeskObject(object);

  try {
    const fields = await fetchZendeskPaginatedRecords<any, TZendeskField>({
      ...requestOptions,
      path: isCustomObject
        ? `custom_objects/${object}/fields`
        : `${tableNameToFieldsPathMap[object]}.json`,
      method: 'GET',
      object: isCustomObject ? 'custom_object_fields' : tableNameToFieldsPathMap[object],
    });

    const filteredFields = fields.filter(
      (field) => field.active && (field?.agent_can_edit || isCustomObject)
    );

    return filteredFields;
  } catch (error) {
    throw new ZendeskError(`Failed to fetch Zendesk ${object} fields: ${error}`);
  }
};

const mapZendeskOptionToAllowedValue = (
  option: TZendeskSystemFieldOption | TZendeskCustomStatus | TZendeskCustomFieldOption
): IQoreAllowedValue<any> => {
  if ('name' in option) {
    return 'value' in option
      ? {
          value: option.value,
          display_name: option.name,
        }
      : {
          value: option.id,
          display_name: option.name,
        };
  } else {
    return {
      value: option.id,
      display_name: option.end_user_label,
      ...(option.description && { desc: option.description }),
    };
  }
};

export const getAllowedValuesFunction = (
  object: TZendeskField['relationship_target_type']
): TQoreGetAllowedValuesFunction<typeof ZENDESK_CONN_OPTIONS, number> | undefined => {
  switch (object) {
    case 'zen:organization':
      return getOrganizationIdAllowedValues;
    case 'zen:ticket':
      return getTicketIdAllowedValues;
    case 'zen:user':
      return getUserIdAllowedValues;
    default:
      return undefined;
  }
};

export const mapZendeskFieldToQoreOption = (customField: TZendeskField): TQoreAppActionOption => {
  const type = customField.type;
  const display_name = customField.title;
  const desc = customField.description;
  let allowed_values: IQoreAllowedValue<any>[] | undefined = undefined;
  let allowedValueType: TQoreType = 'softstring';

  if (customField.system_field_options?.length) {
    allowed_values = customField.system_field_options.map(mapZendeskOptionToAllowedValue);
  } else if (customField.custom_statuses?.length) {
    allowed_values = customField.custom_statuses.map(mapZendeskOptionToAllowedValue);
  } else if (customField.custom_field_options?.length) {
    allowed_values = customField.custom_field_options.map(mapZendeskOptionToAllowedValue);
  }

  if (allowed_values?.length) {
    const allowedValue = allowed_values[0]?.value;
    allowedValueType = typeof allowedValue === 'number' ? 'integer' : 'softstring';
  }

  const commonFields = {
    display_name,
    ...(desc && { desc }),
  };

  switch (type) {
    case 'text':
    case 'subject':
    case 'description':
      return {
        type: 'string',
        ...commonFields,
      };
    case 'textarea':
      return {
        type: 'string',
        ...commonFields,
      };
    case 'checkbox':
      return {
        type: 'bool',
        ...commonFields,
      };
    case 'date':
      return {
        type: 'string',
        short_desc: 'Date in format YYYY-MM-DD. Example: 2025-12-31',
        ...commonFields,
      };
    case 'integer':
      return {
        type: 'integer',
        ...commonFields,
      };
    case 'decimal':
      return {
        type: 'number',
        ...commonFields,
      };
    case 'multiselect':
      return {
        type: {
          type: 'list',
          element_type: allowedValueType,
        },
        ...commonFields,
        ...(allowed_values && { element_allowed_values: allowed_values }),
      };
    case 'regexp': {
      return {
        type: 'string',
        ...commonFields,
      };
    }
    case 'partialcreditcard': {
      return {
        type: 'string',
        ...commonFields,
      };
    }
    case 'dropdown':
      return {
        type: allowedValueType,
        ...commonFields,
        ...(allowed_values && { allowed_values }),
      };
    case 'assignee':
      return {
        type: 'integer',
        ...commonFields,
        get_allowed_values: getAgentIdAllowedValues,
      };
    case 'group':
      return {
        type: 'integer',
        ...commonFields,
        get_allowed_values: getGroupIdAllowedValues,
      };
    case 'tagger':
    case 'tickettype':
    case 'priority':
    case 'custom_status':
    case 'status': {
      return {
        type: allowedValueType,
        ...commonFields,
        ...(allowed_values && { allowed_values }),
      };
    }
    case 'lookup': {
      const get_allowed_values = getAllowedValuesFunction(customField.relationship_target_type!);
      return {
        type: 'integer',
        ...commonFields,
        ...(get_allowed_values && { get_allowed_values }),
      };
    }
    default:
      return {
        type: 'any',
        display_name,
      };
  }
};

export const getZendeskFieldToIdToNameMap = async (options: {
  token: string;
  url: string;
  object: TZendeskTable;
}): Promise<Record<number, string>> => {
  const { object } = options;

  const isCustomObject = isCustomZendeskObject(object);

  try {
    const fields = await getZendeskFields(options);

    const fieldIdToNameMap: Record<number, string> = {};

    fields.forEach((field) => {
      fieldIdToNameMap[field.id] = getFieldName(field, isCustomObject);
    });

    return fieldIdToNameMap;
  } catch (error) {
    throw new ZendeskError(`Failed to fetch Zendesk ${object} fields: ${error}`);
  }
};

const getFieldName = (field: TZendeskField, isCustomObject: boolean): string => {
  const fieldName = defaultFields.includes(field.type as TZendeskDefaultField)
    ? field.type
    : `custom_field_${field.id}_${normalizeName(field.title)}`;

  if (isCustomObject) {
    return field.key;
  }

  if (field.type === 'tickettype') {
    return 'type';
  } else if (field.type === 'group') {
    return 'group_id';
  } else if (field.type === 'assignee') {
    return 'assignee_id';
  } else if (field.type === 'custom_status') {
    return 'custom_status_id';
  }

  return fieldName;
};

export const getZendeskFieldDynamicTypeFunction =
  (object: TZendeskTable): TQoreGetDynamicTypeFunction =>
  async (context) => {
    const { token, url } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'url'],
      ErrorClass: ZendeskError,
    });

    const isCustomObject = isCustomZendeskObject(object);

    try {
      const customFields = await getZendeskFields({
        token,
        url,
        object,
      });

      const fields: Record<string, TQoreAppActionOption> = {};

      customFields.forEach((field) => {
        fields[getFieldName(field, isCustomObject)] = mapZendeskFieldToQoreOption(field);
      });

      return {
        type: 'hash',
        fields,
      };
    } catch (error) {
      if (error instanceof ZendeskError) {
        throw error;
      }

      throw new ZendeskError(`Failed to fetch Zendesk custom field options: ${error}`);
    }
  };
