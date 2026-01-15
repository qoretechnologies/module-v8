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

/**
 * Standard Qore file type for file uploads/downloads.
 */
export type TQoreFile = {
  /** File name */
  name: string;
  /** MIME type (e.g., 'application/pdf', 'image/png') */
  mime_type: string;
  /** Base64 encoded file content */
  content: string;
};

/**
 * BambooHR file metadata from file list endpoints.
 */
export interface IBambooHRFile {
  /** File ID */
  id: number;
  /** File name */
  name: string;
  /** Original file name */
  originalFileName: string;
  /** File size in bytes */
  size: number;
  /** Date uploaded (ISO 8601) */
  dateCreated: string;
  /** ID of user who uploaded */
  createdBy: string;
  /** Whether shared with employee */
  shareWithEmployee: string;
}

/**
 * BambooHR file category.
 */
export interface IBambooHRFileCategory {
  /** Category ID */
  id: number;
  /** Category name */
  name: string;
}

/**
 * Response from GET /employees/{id}/files endpoint.
 */
export interface IBambooHREmployeeFilesResponse {
  employee: {
    id: string;
  };
  categories: Array<{
    id: number;
    name: string;
    files: IBambooHRFile[];
  }>;
}

/**
 * Response from GET /files endpoint (company files).
 */
export interface IBambooHRCompanyFilesResponse {
  categories: Array<{
    id: number;
    name: string;
    files: IBambooHRFile[];
  }>;
}

/**
 * Time off request from GET /time_off/requests endpoint.
 */
export interface IBambooHRTimeOffRequest {
  /** Request ID */
  id: string;
  /** Employee ID */
  employeeId: string;
  /** Employee name */
  name: string;
  /** Start date (YYYY-MM-DD) */
  start: string;
  /** End date (YYYY-MM-DD) */
  end: string;
  /** Request status */
  status: {
    status: 'approved' | 'denied' | 'requested' | 'canceled' | 'superceded';
    lastChanged: string;
    lastChangedByUserId: string;
  };
  /** Time off type */
  type: {
    id: string;
    name: string;
    icon: string;
  };
  /** Amount of time off */
  amount: {
    unit: string;
    amount: string;
  };
  /** Notes from requester */
  notes?: {
    employee?: string;
    manager?: string;
  };
  /** Dates included in request */
  dates: Record<string, string>;
  /** Actions available */
  actions?: {
    view?: string;
    approve?: string;
    deny?: string;
    bypass?: string;
  };
}

/**
 * Response from GET /time_off/requests endpoint.
 */
export interface IBambooHRTimeOffRequestsResponse {
  requests: IBambooHRTimeOffRequest[];
}

/**
 * Entry from GET /time_off/whos_out endpoint.
 */
export interface IBambooHRWhosOutEntry {
  /** Type: 'timeOff' or 'holiday' */
  type: 'timeOff' | 'holiday';
  /** Employee ID (for timeOff type) */
  employeeId?: string;
  /** Employee name (for timeOff type) */
  name?: string;
  /** Holiday name (for holiday type) */
  holidayName?: string;
  /** Start date (YYYY-MM-DD) */
  start: string;
  /** End date (YYYY-MM-DD) */
  end: string;
}

/**
 * Time off type from meta endpoint.
 */
export interface IBambooHRTimeOffType {
  /** Time off type ID */
  id: string;
  /** Time off type name */
  name: string;
  /** Units (hours, days) */
  units: string;
  /** Color for display */
  color?: string;
  /** Icon */
  icon?: string;
}
