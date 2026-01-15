/**
 * BambooHR Dynamic Types
 *
 * Provides dynamic type generation for BambooHR employee fields.
 *
 * @see https://documentation.bamboohr.com/docs/field-types
 */

import {
  IQoreAllowedValue,
  TQoreAnyType,
  TQoreAppActionOption,
  TQoreGetDynamicTypeFunction,
  TQoreOptions,
  TQoreType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, normalizeName } from '../../../global/helpers';
import { BambooHRError } from '../constants';
import {
  IBambooHRConnectionOptions,
  IBambooHRFieldMetadata,
  TBambooHRFieldType,
} from '../types';
import { getBambooHRFields } from './get-fields';
import { getFieldIdToAllowedValuesMap } from './get-list-options';

/**
 * Type mapping configuration for BambooHR field types.
 */
interface ITypeMapping {
  /** The Qore type to use - can be simple string or complex type object */
  qoreType: TQoreType | TQoreAnyType;
  /** Whether this field needs allowed values from /meta/lists */
  needsAllowedValues?: boolean;
  /** Static allowed values for known enumerated types */
  staticAllowedValues?: IQoreAllowedValue<any>[];
  /** Short description for the field */
  shortDesc?: string;
}

/**
 * Declarative mapping from BambooHR field types to Qore types.
 *
 * Key design decisions:
 * - Use 'softstring' for select fields: accepts both ID and display value
 * - Use 'date' for date fields: Qore handles date parsing
 * - Use 'string' for most text-based fields
 * - Use 'integer' or 'number' for numeric fields
 * - Provide shortDesc for fields with specific formats
 */
const BambooHRTypeMap: Record<TBambooHRFieldType, ITypeMapping> = {
  // Text-based fields
  text: {
    qoreType: 'string',
  },
  textarea: {
    qoreType: 'string',
  },

  // Boolean fields
  bool: {
    qoreType: 'bool',
  },
  checkbox: {
    qoreType: 'bool',
    shortDesc: 'Check: "yes" or "checkbox", uncheck: leave empty',
  },

  // Numeric fields
  integer: {
    qoreType: 'integer',
  },
  currency: {
    qoreType: {
      type: 'hash',
      fields: {
        value: {
          type: 'number',
          display_name: 'Amount',
          short_desc: 'Numeric value (e.g., 27000.00)',
          required: true,
        },
        currency: {
          type: 'softstring',
          display_name: 'Currency Code',
          short_desc: 'ISO currency code (e.g., "EUR"). Omit for company default.',
        },
      },
    },
  },

  // Date fields
  date: {
    qoreType: 'date',
  },
  timestamp: {
    qoreType: 'date',
  },
  passport_issued: {
    qoreType: 'date',
  },
  passport_expiry: {
    qoreType: 'date',
  },

  // Contact fields
  email: {
    qoreType: 'string',
    shortDesc: 'Email address',
  },
  phone: {
    qoreType: 'string',
    shortDesc: 'Phone number',
  },

  // ID/Reference fields
  ssn: {
    qoreType: 'string',
    shortDesc: 'Social Security Number (###-##-####)',
  },
  sin: {
    qoreType: 'string',
    shortDesc: 'Canadian Social Insurance Number (9 digits)',
  },
  ein: {
    qoreType: 'string',
    shortDesc: 'Employer Identification Number (##-#######)',
  },
  passport_number: {
    qoreType: 'string',
  },

  // List/select fields - use softstring for flexibility
  list: {
    qoreType: 'softstring',
    needsAllowedValues: true,
  },

  // Reference fields - use softstring for flexibility
  employee: {
    qoreType: 'softstring',
    needsAllowedValues: true,
    shortDesc: 'Employee name or ID',
  },
  country: {
    qoreType: 'softstring',
    needsAllowedValues: true,
  },
  state: {
    qoreType: 'softstring',
    needsAllowedValues: true,
  },

  // Enumerated fields with known static values
  status: {
    qoreType: 'softstring',
    staticAllowedValues: [
      { value: 'Active', display_name: 'Active' },
      { value: 'Inactive', display_name: 'Inactive' },
    ],
  },
  gender: {
    qoreType: 'softstring',
    staticAllowedValues: [
      { value: 'Male', display_name: 'Male' },
      { value: 'Female', display_name: 'Female' },
      { value: 'Non-binary', display_name: 'Non-binary' },
    ],
  },
  exempt: {
    qoreType: 'softstring',
    staticAllowedValues: [
      { value: 'Exempt', display_name: 'Exempt' },
      { value: 'Non-exempt', display_name: 'Non-exempt' },
    ],
  },
  marital_status: {
    qoreType: 'softstring',
    staticAllowedValues: [
      { value: 'Single', display_name: 'Single' },
      { value: 'Married', display_name: 'Married' },
      { value: 'Domestic Partnership', display_name: 'Domestic Partnership' },
      { value: 'Divorced', display_name: 'Divorced' },
      { value: 'Separated', display_name: 'Separated' },
      { value: 'Widowed', display_name: 'Widowed' },
    ],
  },
  paid_per: {
    qoreType: 'softstring',
    staticAllowedValues: [
      { value: 'Hour', display_name: 'Hour' },
      { value: 'Day', display_name: 'Day' },
      { value: 'Week', display_name: 'Week' },
      { value: 'Month', display_name: 'Month' },
      { value: 'Quarter', display_name: 'Quarter' },
      { value: 'Year', display_name: 'Year' },
    ],
  },
  pay_type: {
    qoreType: 'softstring',
    staticAllowedValues: [
      { value: 'Hourly', display_name: 'Hourly' },
      { value: 'Salary', display_name: 'Salary' },
      { value: 'Commission', display_name: 'Commission' },
    ],
  },
  employee_access: {
    qoreType: 'softstring',
    staticAllowedValues: [
      { value: 'Enabled', display_name: 'Enabled' },
      { value: 'Disabled', display_name: 'Disabled' },
    ],
  },
  relationship: {
    qoreType: 'softstring',
    staticAllowedValues: [
      { value: 'Spouse', display_name: 'Spouse' },
      { value: 'Child', display_name: 'Child' },
      { value: 'Parent', display_name: 'Parent' },
      { value: 'Domestic Partner', display_name: 'Domestic Partner' },
      { value: 'Other', display_name: 'Other' },
    ],
  },
};

/**
 * Options for mapping a field to a Qore option.
 */
interface IMapFieldOptions {
  /** True when mapping for response types (excludes allowed_values) */
  isForResponse?: boolean;
  /** Allowed values for list-type fields (from /meta/lists) */
  listOptions?: IQoreAllowedValue<string>[];
}

/**
 * Map a BambooHR field to a Qore option definition.
 *
 * Key differences between input and response:
 * - Input: includes allowed_values with creatable flag
 * - Response: excludes allowed_values (not needed for display)
 *
 * @param field - BambooHR field metadata
 * @param options - Mapping options
 * @returns Qore option definition
 */
export const mapBambooHRFieldToQoreOption = (
  field: IBambooHRFieldMetadata,
  options: IMapFieldOptions = {}
): TQoreAppActionOption => {
  const { isForResponse = false, listOptions } = options;
  const typeMapping = BambooHRTypeMap[field.type] || { qoreType: 'string' };

  const option: TQoreAppActionOption = {
    type: typeMapping.qoreType as TQoreAnyType,
    display_name: field.name,
  };

  // Add short description if available
  if (typeMapping.shortDesc) {
    option.short_desc = typeMapping.shortDesc;
  }

  // Only add allowed_values for input types, not responses
  if (!isForResponse) {
    // Priority: dynamic list options > static allowed values
    if (listOptions && listOptions.length > 0) {
      option.allowed_values = listOptions;
      option.allowed_values_creatable = true;
    } else if (typeMapping.staticAllowedValues) {
      option.allowed_values = typeMapping.staticAllowedValues;
      option.allowed_values_creatable = true;
    }
  }

  return option;
};

/**
 * Fields that are always required when creating an employee.
 * BambooHR documentation: "New employees must have at least a first name and a last name."
 * Note: Additional fields become required if employee is on a Trax Payroll pay schedule.
 */
const REQUIRED_EMPLOYEE_FIELDS = new Set(['firstName', 'lastName']);

/**
 * Get dynamic input type for employee fields.
 * Used for Create/Update actions.
 *
 * Features:
 * - Fetches field metadata and list options in parallel
 * - Uses field alias as key (or ID for custom fields)
 * - Includes allowed_values for select fields
 * - Marks firstName and lastName as required (per BambooHR API docs)
 * - Excludes read-only fields (none currently in BambooHR standard fields)
 */
export const getBambooHREmployeeInputType: TQoreGetDynamicTypeFunction = async (context) => {
  const { api_key, company_domain } = getQoreContextRequiredValues({
    context,
    connectionFields: ['api_key', 'company_domain'],
    ErrorClass: BambooHRError,
  });

  const connectionOptions: IBambooHRConnectionOptions = { api_key, company_domain };

  // Fetch fields and list options in parallel for efficiency
  const [fields, listOptionsMap] = await Promise.all([
    getBambooHRFields(connectionOptions),
    getFieldIdToAllowedValuesMap(connectionOptions),
  ]);

  const qoreOptions: TQoreOptions = {};

  fields.forEach((field) => {
    // Use alias as key if available (standard fields), otherwise use ID (custom fields)
    const fieldKey = field.alias || field.id.toString();

    const option = mapBambooHRFieldToQoreOption(field, {
      isForResponse: false,
      listOptions: listOptionsMap.get(field.id),
    });

    // Mark required fields (firstName, lastName are always required per BambooHR docs)
    if (field.alias && REQUIRED_EMPLOYEE_FIELDS.has(field.alias)) {
      option.required = true;
    }

    qoreOptions[fieldKey] = option;
  });

  return {
    type: 'hash',
    fields: qoreOptions,
  };
};

/**
 * Get dynamic response type for employee fields.
 * Used for Get/List response types.
 *
 * Features:
 * - If user selected specific fields via `opts.fields`, only includes those fields
 * - If no fields selected, includes all standard fields (those with aliases)
 * - Uses normalized field name as key for user-friendly output
 * - Adds system fields (id)
 * - Excludes allowed_values (not needed in responses)
 */
export const getBambooHREmployeeResponseType: TQoreGetDynamicTypeFunction = async (context) => {
  const { api_key, company_domain } = getQoreContextRequiredValues({
    context,
    connectionFields: ['api_key', 'company_domain'],
    ErrorClass: BambooHRError,
  });

  const connectionOptions: IBambooHRConnectionOptions = { api_key, company_domain };
  const allFields = await getBambooHRFields(connectionOptions);

  // Check if user selected specific fields
  const opts = context?.opts as { fields?: string[] } | undefined;
  const selectedFields = opts?.fields;
  const hasSelectedFields = Array.isArray(selectedFields) && selectedFields.length > 0;

  // Create a set of selected field aliases for quick lookup
  const selectedFieldSet = hasSelectedFields ? new Set(selectedFields) : null;

  const qoreOptions: TQoreOptions = {};

  // Add system field (always included)
  qoreOptions['id'] = {
    type: 'string',
    display_name: 'Employee ID',
    short_desc: 'Unique identifier for the employee',
  };

  allFields.forEach((field) => {
    const fieldAlias = field.alias;

    // If user selected specific fields, only include those
    if (selectedFieldSet && fieldAlias) {
      if (!selectedFieldSet.has(fieldAlias)) {
        return; // Skip fields not in user's selection
      }
    } else if (selectedFieldSet) {
      // User selected fields but this field has no alias - skip it
      // (GET endpoint only works with aliased fields anyway)
      return;
    } else if (!fieldAlias) {
      // No user selection, but field has no alias - skip for GET endpoint compatibility
      return;
    }

    // Use normalized field name as key for user-friendly output
    const fieldKey = normalizeName(fieldAlias || field.name);

    qoreOptions[fieldKey] = mapBambooHRFieldToQoreOption(field, {
      isForResponse: true,
    });
  });

  return {
    type: 'hash',
    fields: qoreOptions,
  };
};

/**
 * Transform user input (using field aliases/IDs) to BambooHR API format.
 * Filters out empty values.
 *
 * @param inputData - User input keyed by field alias/ID
 * @returns Data ready for BambooHR API
 */
export const transformInputToBambooHRFormat = (
  inputData: Record<string, unknown>
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  Object.entries(inputData).forEach(([key, value]) => {
    // Skip empty values
    if (value === undefined || value === null || value === '') {
      return;
    }

    // BambooHR expects the alias/ID as the key
    result[key] = value;
  });

  return result;
};

/**
 * Transform BambooHR API response to user-friendly format.
 * Uses normalized field names as keys.
 *
 * @param connectionOptions - Connection options for field metadata lookup
 * @param responseData - Raw API response
 * @returns Transformed data with user-friendly field names
 */
export const transformBambooHRResponseToOutput = async (
  connectionOptions: IBambooHRConnectionOptions,
  responseData: Record<string, unknown>
): Promise<Record<string, unknown>> => {
  const fields = await getBambooHRFields(connectionOptions);

  // Build a map from alias/ID to normalized display name
  const fieldKeyToDisplayName = new Map<string, string>();
  fields.forEach((field) => {
    const normalizedName = normalizeName(field.alias || field.name);
    if (field.alias) {
      fieldKeyToDisplayName.set(field.alias, normalizedName);
    }
    fieldKeyToDisplayName.set(field.id.toString(), normalizedName);
  });

  const result: Record<string, unknown> = {};

  Object.entries(responseData).forEach(([key, value]) => {
    // Use normalized display name if available, otherwise keep original key
    const displayName = fieldKeyToDisplayName.get(key) || normalizeName(key);
    result[displayName] = value;
  });

  return result;
};

/**
 * Transform a list of BambooHR employee records to user-friendly format.
 *
 * @param connectionOptions - Connection options for field metadata lookup
 * @param employees - Array of employee records from API
 * @returns Array of transformed records
 */
export const transformBambooHREmployeeList = async (
  connectionOptions: IBambooHRConnectionOptions,
  employees: Record<string, unknown>[]
): Promise<Record<string, unknown>[]> => {
  // Get field metadata once for all employees
  const fields = await getBambooHRFields(connectionOptions);

  // Build a map from alias/ID to normalized display name
  const fieldKeyToDisplayName = new Map<string, string>();
  fields.forEach((field) => {
    const normalizedName = normalizeName(field.alias || field.name);
    if (field.alias) {
      fieldKeyToDisplayName.set(field.alias, normalizedName);
    }
    fieldKeyToDisplayName.set(field.id.toString(), normalizedName);
  });

  return employees.map((employee) => {
    const result: Record<string, unknown> = {};

    Object.entries(employee).forEach(([key, value]) => {
      const displayName = fieldKeyToDisplayName.get(key) || normalizeName(key);
      result[displayName] = value;
    });

    return result;
  });
};

/**
 * Get allowed values for selecting fields in actions that use the custom reports API.
 * Returns all available fields (standard and custom) as selectable options.
 * Use this for list-employees action which uses POST /reports/custom.
 */
export const getBambooHRFieldsAllowedValues = async (
  context: Record<string, unknown>
): Promise<IQoreAllowedValue<string>[]> => {
  const { api_key, company_domain } = getQoreContextRequiredValues({
    context,
    connectionFields: ['api_key', 'company_domain'],
    ErrorClass: BambooHRError,
  });

  const connectionOptions: IBambooHRConnectionOptions = { api_key, company_domain };
  const fields = await getBambooHRFields(connectionOptions);

  return fields.map((field) => ({
    value: field.alias || field.id.toString(),
    display_name: field.name,
  }));
};

/**
 * Get allowed values for selecting fields in actions that use the GET employee endpoint.
 * Returns only standard fields (those with aliases) as selectable options.
 * Custom fields (numeric IDs only) are not supported by GET /employees/{id}.
 * Use this for get-employee action.
 */
export const getBambooHRStandardFieldsAllowedValues = async (
  context: Record<string, unknown>
): Promise<IQoreAllowedValue<string>[]> => {
  const { api_key, company_domain } = getQoreContextRequiredValues({
    context,
    connectionFields: ['api_key', 'company_domain'],
    ErrorClass: BambooHRError,
  });

  const connectionOptions: IBambooHRConnectionOptions = { api_key, company_domain };
  const fields = await getBambooHRFields(connectionOptions);

  // Only return fields with aliases - numeric IDs cause 404 on GET employee endpoint
  return fields
    .filter((field) => field.alias)
    .map((field) => ({
      value: field.alias as string,
      display_name: field.name,
    }));
};
