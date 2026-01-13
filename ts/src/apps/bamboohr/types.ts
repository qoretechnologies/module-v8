/**
 * BambooHR API Types
 *
 * Based on BambooHR API documentation:
 * - Field types: https://documentation.bamboohr.com/docs/field-types
 * - Metadata API: https://documentation.bamboohr.com/reference/metadata-get-a-list-of-fields
 */

/**
 * All supported BambooHR field types.
 * @see https://documentation.bamboohr.com/docs/field-types
 */
export type TBambooHRFieldType =
  | 'bool'
  | 'checkbox'
  | 'country'
  | 'currency'
  | 'date'
  | 'ein'
  | 'email'
  | 'employee'
  | 'employee_access'
  | 'exempt'
  | 'gender'
  | 'integer'
  | 'list'
  | 'marital_status'
  | 'paid_per'
  | 'passport_expiry'
  | 'passport_issued'
  | 'passport_number'
  | 'pay_type'
  | 'phone'
  | 'relationship'
  | 'sin'
  | 'ssn'
  | 'state'
  | 'status'
  | 'text'
  | 'textarea'
  | 'timestamp';

/**
 * Field metadata from GET /meta/fields endpoint.
 * Standard fields have an alias (e.g., "firstName"), custom fields only have numeric ID.
 */
export interface IBambooHRFieldMetadata {
  /** Numeric field ID */
  id: number;
  /** Human-readable field name (e.g., "First name") */
  name: string;
  /** Field type */
  type: TBambooHRFieldType;
  /** API alias for standard fields (e.g., "firstName"). Custom fields don't have aliases. */
  alias?: string;
}

/**
 * List option from GET /meta/lists endpoint.
 * Options can be archived (hidden from current selection but kept for historical data).
 */
export interface IBambooHRListOption {
  /** Numeric option ID */
  id: number;
  /** Display value */
  value: string;
  /** Whether this option is archived (hidden from selection) */
  archived: string; // "yes" or "no"
}

/**
 * List field metadata from GET /meta/lists endpoint.
 */
export interface IBambooHRListMetadata {
  /** The field ID this list belongs to */
  fieldId: number;
  /** List name (matches field name) */
  name: string;
  /** Whether this list can be managed (edited) via API */
  manageable: string; // "yes" or "no"
  /** Whether multiple values can be selected */
  multiple: string; // "yes" or "no"
  /** Available options */
  options: IBambooHRListOption[];
}

/**
 * Response from GET /meta/lists endpoint.
 */
export interface IBambooHRListsResponse {
  lists: IBambooHRListMetadata[];
}

/**
 * Basic employee fields that are always present in responses.
 */
export interface IBambooHREmployeeBase {
  id: string;
  displayName?: string;
}

/**
 * Employee response - dynamic fields based on what was requested.
 */
export interface IBambooHREmployee extends IBambooHREmployeeBase {
  [key: string]: unknown;
}

/**
 * Response from GET /employees/directory endpoint.
 */
export interface IBambooHRDirectoryResponse {
  fields: Array<{
    id: string;
    type: string;
    name: string;
  }>;
  employees: IBambooHREmployee[];
}

/**
 * Request body for POST /reports/custom endpoint (used for listing employees with specific fields).
 */
export interface IBambooHRCustomReportRequest {
  title?: string;
  filters?: {
    lastChanged?: {
      includeNull?: string;
      value?: string;
    };
  };
  fields: string[];
}

/**
 * Response from POST /reports/custom endpoint.
 */
export interface IBambooHRCustomReportResponse {
  title: string;
  fields: Array<{
    id: string;
    type: string;
    name: string;
  }>;
  employees: IBambooHREmployee[];
}

/**
 * Connection options for BambooHR API.
 */
export interface IBambooHRConnectionOptions {
  api_key: string;
  company_domain: string;
}
