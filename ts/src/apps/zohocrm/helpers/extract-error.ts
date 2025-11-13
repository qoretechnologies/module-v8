type TZohoCrmError = {
  message?: string;
  data?: Array<{
    code: keyof typeof ZOHO_CRM_ERROR_CODES;
    details?: any;
    message?: string;
  }>;
};

type TZohoCrmMissingFieldsDetails = {
  expected_fields?: Array<{ api_name: string; json_path?: string }>;
  expected_data_type?: string;
  api_name?: string;
};

type TZohoCrmDuplicateDetails = {
  api_name?: string;
  id?: string;
};

const ZOHO_CRM_ERROR_CODES = {
  EXPECTED_FIELD_MISSING: (details: TZohoCrmMissingFieldsDetails) =>
    details.expected_fields
      ? `Expected field(s) missing: ${details.expected_fields.map((f) => f.api_name).join(', ')}`
      : 'Expected fields are missing',
  MANDATORY_NOT_FOUND: (_details: TZohoCrmMissingFieldsDetails) =>
    'Required field not found. Please provide all mandatory fields.',
  INVALID_DATA: (details: TZohoCrmMissingFieldsDetails) =>
    details.expected_data_type
      ? `Invalid data type. Expected: ${details.expected_data_type}${details.api_name ? ` for field: ${details.api_name}` : ''}`
      : 'Invalid data provided',
  DUPLICATE_DATA: (details: TZohoCrmDuplicateDetails) =>
    details.api_name
      ? `Duplicate value found for field: ${details.api_name}${details.id ? ` (existing record ID: ${details.id})` : ''}`
      : 'Duplicate data found',
  MULTIPLE_OR_MULTI_ERRORS: () => 'Duplicate data found in multiple fields',
  NO_PERMISSION: () =>
    'Permission denied. You do not have sufficient privileges to perform this operation.',
  AUTHORIZATION_FAILED: () => 'Authorization failed. User does not have sufficient privileges.',
  INVALID_MODULE: () => 'The specified module name is invalid or not supported',
  DEPENDENT_FIELD_MISSING: () => 'Required dependent field not found',
  DEPENDENT_MISMATCH: () => 'There is a mismatch in dependent fields',
  RECORD_LOCKED: () => 'The record is locked and cannot be modified',
  LIMIT_EXCEEDED: () => 'Operation limit exceeded. Maximum 100 records per API call.',
  PROCESSING_ERROR: () => 'Error occurred while processing the request',
  INTERNAL_ERROR: () => 'Internal server error. Please contact support.',
  INVALID_REQUEST_METHOD: () => 'Invalid HTTP request method',
  INVALID_URL_PATTERN: () => 'Invalid request URL pattern',
  OAUTH_SCOPE_MISMATCH: () => 'OAuth scope mismatch. Client does not have required scope.',
  WIZARD_CONNECTION_INVALID: () => 'Invalid wizard connection ID',
  DEPENDENT_SERVICE_ERROR: () => 'Error in dependent service integration',
  DUPLICATE_ASSOCIATION: () => 'Record already has an association with the specified record',
} as const;

export const extractZohoCrmErrorMessage = (error: TZohoCrmError): string => {
  let parsedError = error;

  if (error.message && typeof error.message === 'string') {
    const trimmedMessage = error.message.trim();
    if (trimmedMessage.startsWith('{') || trimmedMessage.startsWith('[')) {
      try {
        parsedError = JSON.parse(trimmedMessage);
      } catch (e) {}
    }
  }

  if (parsedError.data && Array.isArray(parsedError.data)) {
    const messages: string[] = [];

    for (const err of parsedError.data) {
      const codeHandler = ZOHO_CRM_ERROR_CODES[err.code];
      if (codeHandler) {
        messages.push(codeHandler(err.details));
      } else {
        const message = err.message || err.code;
        messages.push(message);
      }
    }

    return messages.join('\n - ');
  }

  return error.message || JSON.stringify(error);
};
