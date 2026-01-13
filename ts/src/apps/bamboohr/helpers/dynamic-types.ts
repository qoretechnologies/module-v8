/**
 * BambooHR Dynamic Types - Reference Implementation
 *
 * This file serves as the reference implementation for dynamic types in Qore apps.
 * It combines the best patterns from existing implementations:
 *
 * FROM BASEROW:
 * - Declarative TypeMap for O(1) lookups (vs switch statements)
 * - Use of 'softstring' for select fields (flexible input)
 * - 'allowed_values_creatable: true' for list fields
 * - Separate functions for input vs response types
 * - Read-only field filtering for input options
 * - System fields added to response types
 *
 * FROM COPPERCRM:
 * - Factory pattern for parameterized functions
 * - 'isForResponse' flag in shared mapping function
 * - Bidirectional data transformers
 * - Strong typing with explicit union types
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

// ============================================================================
// PATTERN 1: Declarative Type Mapping (from Baserow)
// ============================================================================

/**
 * Type mapping configuration for BambooHR field types.
 * Provides O(1) lookup instead of switch statements.
 */
interface ITypeMapping {
  /** The Qore type to use */
  qoreType: TQoreType;
  /** Whether this field needs allowed values from /meta/lists */
  needsAllowedValues?: boolean;
  /** Static allowed values for known enumerated types */
  staticAllowedValues?: IQoreAllowedValue<string>[];
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
    qoreType: 'number',
    shortDesc: 'Numeric value without currency symbol',
  },

  // Date fields
  date: {
    qoreType: 'date',
    shortDesc: 'Format: yyyy-mm-dd',
  },
  timestamp: {
    qoreType: 'date',
    shortDesc: 'ISO 8601 timestamp with timezone',
  },
  passport_issued: {
    qoreType: 'date',
    shortDesc: 'Passport issue date (yyyy-mm-dd)',
  },
  passport_expiry: {
    qoreType: 'date',
    shortDesc: 'Passport expiration date (yyyy-mm-dd)',
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
    qoreType: 'string',
    shortDesc: 'Gender designation',
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

// ============================================================================
// PATTERN 2: Unified Mapping with isForResponse Flag (from CopperCRM)
// ============================================================================

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

// ============================================================================
// PATTERN 3: Separate Input/Response Type Functions (from Baserow)
// ============================================================================

/**
 * Get dynamic input type for employee fields.
 * Used for Create/Update actions.
 *
 * Features:
 * - Fetches field metadata and list options in parallel
 * - Uses field alias as key (or ID for custom fields)
 * - Includes allowed_values for select fields
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

    qoreOptions[fieldKey] = mapBambooHRFieldToQoreOption(field, {
      isForResponse: false,
      listOptions: listOptionsMap.get(field.id),
    });
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
 * - Includes all fields (including read-only)
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
  const fields = await getBambooHRFields(connectionOptions);

  const qoreOptions: TQoreOptions = {};

  // Add system field
  qoreOptions['id'] = {
    type: 'string',
    display_name: 'Employee ID',
    short_desc: 'Unique identifier for the employee',
  };

  fields.forEach((field) => {
    // Use normalized field name as key for user-friendly output
    const fieldKey = normalizeName(field.alias || field.name);

    qoreOptions[fieldKey] = mapBambooHRFieldToQoreOption(field, {
      isForResponse: true,
    });
  });

  return {
    type: 'hash',
    fields: qoreOptions,
  };
};

// ============================================================================
// PATTERN 4: Bidirectional Data Transformers (from CopperCRM)
// ============================================================================

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

// ============================================================================
// PATTERN 5: Get Allowed Values Functions (for field selection)
// ============================================================================

/**
 * Get allowed values for selecting fields in actions.
 * Returns all available fields as selectable options.
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
