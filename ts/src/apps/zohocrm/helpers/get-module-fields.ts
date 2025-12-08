import {
  TQoreAnyType,
  TQoreGetDynamicTypeFunction,
  TQoreOptions,
  TQoreType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ZohoCrmError } from '../constants';
import { zohoCrmApiClient } from './constants';

const RequiredModuleFields: Record<string, string[]> = {
  Leads: ['Last_Name'],
  Contacts: ['Last_Name'],
  Accounts: ['Account_Name'],
  Deals: ['Deal_Name', 'Stage', 'Pipeline'],
  Tasks: ['Subject'],
  Calls: ['Subject', 'Call_Type', 'Call_Start_Time'],
  Events: ['Event_Title', 'Start_DateTime', 'End_DateTime'],
  Products: ['Product_Name'],
  Quotes: ['Subject'],
  Invoices: ['Subject'],
  Campaigns: ['Campaign_Name'],
  Vendors: ['Vendor_Name'],
  Price_Books: ['Price_Book_Name'],
  Cases: ['Case_Origin', 'Status', 'Subject'],
  Solutions: ['Solution_Title'],
  Purchase_Orders: ['Subject', 'Vendor_Name'],
  Sales_Orders: ['Subject'],
};

type TZohoCrmField = {
  id: string;
  api_name: string;
  field_label: string;
  display_label: string;
  data_type: string;
  json_type: string;
  read_only: boolean;
  system_mandatory: boolean;
  custom_field: boolean;
  length?: number;
  decimal_place?: number;
  pick_list_values?: Array<{
    id: string;
    display_value: string;
    actual_value: string;
    reference_value: string;
    type: 'used' | 'unused';
    colour_code: string | null;
  }>;
  lookup?: {
    module?: {
      api_name: string;
      id: string;
    };
  };
  currency?: {
    rounding_option: string;
    precision: number;
  };
  textarea?: {
    type: 'small' | 'large' | 'rich_text';
  };
  formula?: {
    return_type?: string;
  };
  unique?: {
    case_sensitive?: boolean;
  };
  tooltip?: {
    name: string;
    value: string;
  } | null;
  multiselectlookup?: Record<string, any>;
  multiuserlookup?: Record<string, any>;
};

const ZohoCrmDataTypeToQoreTypeMap: Record<string, TQoreType> = {
  text: 'string',
  email: 'string',
  phone: 'string',
  website: 'string',
  url: 'string',
  textarea: 'string',
  integer: 'integer',
  bigint: 'integer',
  number: 'number',
  decimal: 'number',
  double: 'number',
  percent: 'number',
  currency: 'number',
  boolean: 'bool',
  checkbox: 'bool',
  date: 'date',
  datetime: 'date',
  picklist: 'softstring',
  multiselectpicklist: { type: 'list', element_type: 'softstring' },
  lookup: 'softstring',
  ownerlookup: {
    type: 'hash',
    fields: {
      id: { type: 'string', required_groups: ['ownerlookup'] },
      email: { type: 'string', required_groups: ['ownerlookup'] },
    },
  },
  userlookup: {
    type: 'hash',
    fields: {
      id: { type: 'string', required_groups: ['userlookup'] },
      email: { type: 'string', required_groups: ['userlookup'] },
    },
  },
  multiselectlookup: { type: 'list', element_type: 'softstring' },
  multiuserlookup: {
    type: 'list',
    element_type: { type: 'hash', fields: { id: { type: 'string' } } },
  },
  fileupload: {
    type: 'list',
    element_type: { type: 'hash', fields: { file_id: { type: 'string' } } },
  },
  imageupload: {
    type: 'list',
    element_type: { type: 'hash', fields: { file_id: { type: 'string' } } },
  },
  autonumber: 'string',
  formula: 'any',
  rollup_summary: 'any',
};

export const getZohoCrmModuleFields = async (options: {
  token: string;
  moduleApiName: string;
  url: string;
}): Promise<TZohoCrmField[]> => {
  try {
    const { moduleApiName, token, url } = options;

    const response = await zohoCrmApiClient<{ fields: TZohoCrmField[] }>({
      path: 'settings/fields',
      method: 'GET',
      token,
      url,
      params: {
        module: moduleApiName,
      },
    });

    return response.fields || [];
  } catch (error) {
    throw new ZohoCrmError(`Failed to get module fields: ${error}`);
  }
};

export const getZohoCrmModuleFieldApiNames = async (options: {
  token: string;
  moduleApiName: string;
  url: string;
}): Promise<string[]> => {
  try {
    const fields = await getZohoCrmModuleFields(options);
    return fields.map((field) => field.api_name);
  } catch (error) {
    throw new ZohoCrmError(`Failed to get module field API names: ${error}`);
  }
};

export const getZohoCrmFieldApiNameToIdMap = async (options: {
  token: string;
  moduleApiName: string;
  url: string;
}): Promise<Record<string, string>> => {
  try {
    const fields = await getZohoCrmModuleFields(options);
    const map: Record<string, string> = {};
    fields.forEach((field) => {
      map[field.api_name] = field.id;
    });
    return map;
  } catch (error) {
    throw new ZohoCrmError(`Failed to get field API name to ID map: ${error}`);
  }
};

const getQoreTypeForZohoCrmField = (field: TZohoCrmField): TQoreType => {
  const baseType = ZohoCrmDataTypeToQoreTypeMap[field.data_type];

  if (field.data_type === 'formula' && field.formula?.return_type) {
    switch (field.formula.return_type) {
      case 'text':
        return 'string';
      case 'number':
      case 'currency':
      case 'percent':
        return 'number';
      case 'boolean':
        return 'bool';
      case 'date':
      case 'datetime':
        return 'date';
      default:
        return 'any';
    }
  }

  if (field.data_type === 'lookup' && field.lookup?.module) {
    return 'softstring';
  }

  if (field.data_type === 'multiselectlookup') {
    return {
      type: 'list',
      element_type: 'softstring',
    };
  }

  if (field.api_name === 'Tag') {
    return {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          name: { type: 'string' },
          color_code: { type: 'string' },
        },
      },
    };
  }

  return baseType || 'string';
};

export const getZohoCrmModuleFieldsOptions: TQoreGetDynamicTypeFunction = async (context) => {
  const { token, module, url } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'url'],
    optionFields: ['module'],
    ErrorClass: ZohoCrmError,
  });

  const fields = await getZohoCrmModuleFields({ token, moduleApiName: module, url });

  const qoreOptions: TQoreOptions = {};

  fields.forEach((field) => {
    if (field.read_only && field.system_mandatory) {
      return;
    }

    const type = getQoreTypeForZohoCrmField(field);

    let allowed_values = undefined;
    if (field.pick_list_values && field.pick_list_values.length > 0) {
      const usedValues = field.pick_list_values.filter((opt) => opt.type === 'used');
      if (usedValues.length > 0) {
        allowed_values = usedValues.map((opt) => ({
          value: opt.actual_value || opt.reference_value,
          display_name: opt.display_value,
        }));
      }
    }

    let allowedValuesFields = {};

    if (allowed_values) {
      if (field.data_type === 'multiselectpicklist') {
        allowedValuesFields = {
          element_allowed_values_creatable: true,
          element_allowed_values: allowed_values,
        };
      } else if (field.data_type === 'picklist') {
        allowedValuesFields = {
          allowed_values_creatable: true,
          allowed_values,
        };
      }
    }

    qoreOptions[field.api_name] = {
      type: type as TQoreAnyType,
      display_name: field.display_label || field.field_label,
      required:
        field.system_mandatory || RequiredModuleFields[module]?.includes(field.api_name) || false,
      ...(field.tooltip?.value && { desc: field.tooltip.value }),
      ...allowedValuesFields,
    };
  });

  return {
    type: 'hash',
    fields: qoreOptions,
  };
};

export const getZohoCrmModuleFieldsResponseType: TQoreGetDynamicTypeFunction = async (context) => {
  const { token, module, url } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'url'],
    optionFields: ['module'],
    ErrorClass: ZohoCrmError,
  });

  const fields = await getZohoCrmModuleFields({ token, moduleApiName: module, url });

  const qoreOptions: TQoreOptions = {};

  fields.forEach((field) => {
    const type = getQoreTypeForZohoCrmField(field);

    qoreOptions[field.api_name] = {
      type: type as TQoreAnyType,
      display_name: field.display_label || field.field_label,
      required: field.system_mandatory || false,
      ...(field.tooltip?.value && { desc: field.tooltip.value }),
    };
  });

  qoreOptions['id'] = {
    type: 'string',
    display_name: 'Record ID',
    desc: 'Unique identifier for the record',
    required: false,
  };

  qoreOptions['Created_Time'] = {
    type: 'date',
    display_name: 'Created Time',
    desc: 'Date and time the record was created',
    required: false,
  };

  qoreOptions['Modified_Time'] = {
    type: 'date',
    display_name: 'Modified Time',
    desc: 'Date and time the record was last modified',
    required: false,
  };

  return {
    type: 'hash',
    fields: qoreOptions,
  };
};
