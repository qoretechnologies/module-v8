# Dynamic Types Implementation Guide

This guide describes the best practices for implementing dynamic types, custom fields, and dynamic response types in Qore apps. It combines patterns from Baserow (declarative type mapping) and CopperCRM (factory pattern, bidirectional transformations).

## Core Concepts

Dynamic types allow actions to adapt their input options and response types based on the user's configuration (e.g., selected table, entity type). This is essential for apps with:
- Custom fields (CRMs, project management tools)
- User-defined schemas (databases, spreadsheets)
- Configurable entities (forms, surveys)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Dynamic Types System                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │  Type Mapping   │    │ Factory Pattern │                    │
│  │  (Declarative)  │    │  (Configurable) │                    │
│  └────────┬────────┘    └────────┬────────┘                    │
│           │                      │                              │
│           ▼                      ▼                              │
│  ┌─────────────────────────────────────────┐                   │
│  │         Field Mapper Function           │                   │
│  │  mapApiFieldToQoreOption(field, opts)   │                   │
│  └────────────────────┬────────────────────┘                   │
│                       │                                         │
│           ┌───────────┴───────────┐                            │
│           ▼                       ▼                            │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │ get_dynamic_type│    │get_dynamic_     │                    │
│  │   (for inputs)  │    │ response_type   │                    │
│  └─────────────────┘    └─────────────────┘                    │
│                                                                 │
│  ┌─────────────────────────────────────────┐                   │
│  │      Data Transformation Helpers        │                   │
│  │  - inputToApiFormat()                   │                   │
│  │  - apiResponseToOutput()                │                   │
│  │  - batchTransform()                     │                   │
│  └─────────────────────────────────────────┘                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation Pattern

### 1. Define API Field Types (Strong Typing)

Always create explicit types for the API's field definitions:

```typescript
// types.ts
type TApiFieldType =
  | 'string'
  | 'text'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'select'
  | 'multiselect'
  | 'email'
  | 'url'
  | 'phone'
  | 'currency'
  | 'percent'
  | 'relation'
  | 'file'
  | 'user';

type TApiField = {
  id: string | number;
  name: string;
  type: TApiFieldType;
  required?: boolean;
  read_only?: boolean;
  description?: string;
  default_value?: unknown;
  options?: Array<{ id: string | number; label: string }>;
  // Add API-specific properties as needed
};
```

### 2. Declarative Type Mapping (from Baserow)

Use a declarative map instead of switch statements for maintainability:

```typescript
// type-mapping.ts
import { TQoreType } from '@qoretechnologies/ts-toolkit';

/**
 * Maps API field types to Qore types.
 *
 * Guidelines:
 * - Use 'softstring' for select fields (allows both ID and label input)
 * - Use 'string' for text-based fields
 * - Use 'number' for decimals, 'integer' for whole numbers
 * - Use 'date' for date/datetime fields
 * - Use { type: 'list', element_type: X } for multi-value fields
 * - Use { type: 'hash', fields: {...} } for complex nested structures
 * - Use 'any' only as a last resort for truly dynamic types
 */
const ApiTypeToQoreTypeMap: Record<TApiFieldType, TQoreType> = {
  // Simple types
  string: 'string',
  text: 'string',
  number: 'number',
  boolean: 'bool',
  date: 'date',
  datetime: 'date',

  // String variants
  email: 'string',
  url: 'string',
  phone: 'string',

  // Numeric variants
  currency: 'number',
  percent: 'number',

  // Select types - use 'softstring' for flexibility
  select: 'softstring',
  multiselect: { type: 'list', element_type: 'softstring' },

  // Complex types
  relation: { type: 'list', element_type: 'softstring' },
  file: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        name: { type: 'string' },
        url: { type: 'string' },
      },
    },
  },
  user: {
    type: 'hash',
    fields: {
      id: { type: 'integer' },
      name: { type: 'string' },
    },
  },
};

/**
 * Get the Qore type for an API field.
 * Override this for special cases (e.g., formula fields with sub-types).
 */
export const getQoreTypeForField = (field: TApiField): TQoreType => {
  // Handle special cases first
  // Example: formula fields might have a sub-type
  // if (field.type === 'formula' && field.formula_type) {
  //   return ApiTypeToQoreTypeMap[field.formula_type] || 'any';
  // }

  return ApiTypeToQoreTypeMap[field.type] || 'string';
};
```

### 3. Field Mapper with Input/Response Distinction (from CopperCRM)

Create a single mapper function that handles both input and response scenarios:

```typescript
// field-mapper.ts
import { TQoreAppActionOption, IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

type TMapFieldOptions = {
  /** True when mapping for response types (excludes allowed_values, includes read-only) */
  isForResponse?: boolean;
  /** True to include read-only fields (typically for responses only) */
  includeReadOnly?: boolean;
};

/**
 * Maps an API field to a Qore option definition.
 *
 * Key differences between input and response:
 * - Input: includes allowed_values, excludes read-only fields
 * - Response: excludes allowed_values, includes read-only fields
 */
export const mapApiFieldToQoreOption = (
  field: TApiField,
  options: TMapFieldOptions = {}
): TQoreAppActionOption | null => {
  const { isForResponse = false, includeReadOnly = isForResponse } = options;

  // Skip read-only fields for input options
  if (field.read_only && !includeReadOnly) {
    return null;
  }

  const type = getQoreTypeForField(field);
  const baseOption: TQoreAppActionOption = {
    type,
    display_name: field.name,
    ...(field.description && { desc: field.description }),
    ...(field.required && { required: true }),
  };

  // Add default value if present (input only)
  if (!isForResponse && field.default_value !== undefined) {
    baseOption.default_value = field.default_value;
  }

  // Add allowed values for select fields (input only)
  if (!isForResponse && field.options?.length) {
    const allowedValues: IQoreAllowedValue<unknown>[] = field.options.map((opt) => ({
      value: opt.id,
      display_name: opt.label,
    }));

    if (field.type === 'multiselect') {
      baseOption.element_allowed_values = allowedValues;
      baseOption.element_allowed_values_creatable = true; // Allow creating new options
    } else if (field.type === 'select') {
      baseOption.allowed_values = allowedValues;
      baseOption.allowed_values_creatable = true; // Allow creating new options
    }
  }

  return baseOption;
};
```

### 4. Factory Pattern for Configurable Dynamic Types (from CopperCRM)

Use a factory function when fields need to be filtered by entity type or other criteria:

```typescript
// dynamic-type-factory.ts
import { TQoreGetDynamicTypeFunction, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, normalizeName } from '../../../global/helpers';

type TEntityType = 'lead' | 'contact' | 'company' | 'deal';

type TDynamicTypeFactoryOptions = {
  /** Filter fields by entity type */
  entityType?: TEntityType;
  /** Custom field filter function */
  fieldFilter?: (field: TApiField) => boolean;
};

/**
 * Factory function that returns a configured get_dynamic_type function.
 *
 * Usage in action:
 * ```typescript
 * options: {
 *   custom_fields: {
 *     type: 'hash',
 *     get_dynamic_type: createDynamicTypeFunction({ entityType: 'contact' }),
 *   }
 * }
 * ```
 */
export const createDynamicTypeFunction = (
  factoryOptions: TDynamicTypeFactoryOptions = {}
): TQoreGetDynamicTypeFunction => {
  return async (context) => {
    const { token, url } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'url'],
      ErrorClass: AppError,
    });

    let fields = await fetchApiFields({ token, url });

    // Apply entity type filter
    if (factoryOptions.entityType) {
      fields = fields.filter((f) => f.available_on?.includes(factoryOptions.entityType));
    }

    // Apply custom filter
    if (factoryOptions.fieldFilter) {
      fields = fields.filter(factoryOptions.fieldFilter);
    }

    const qoreOptions: TQoreOptions = {};

    fields.forEach((field) => {
      const option = mapApiFieldToQoreOption(field, { isForResponse: false });
      if (option) {
        // Use field ID as key for input (API expects IDs)
        qoreOptions[field.id] = option;
      }
    });

    return {
      type: 'hash',
      fields: qoreOptions,
    };
  };
};

/**
 * Factory function for response types.
 * Uses normalized field names as keys (user-friendly output).
 */
export const createDynamicResponseTypeFunction = (
  factoryOptions: TDynamicTypeFactoryOptions = {}
): TQoreGetDynamicTypeFunction => {
  return async (context) => {
    const { token, url } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'url'],
      ErrorClass: AppError,
    });

    let fields = await fetchApiFields({ token, url });

    if (factoryOptions.entityType) {
      fields = fields.filter((f) => f.available_on?.includes(factoryOptions.entityType));
    }

    if (factoryOptions.fieldFilter) {
      fields = fields.filter(factoryOptions.fieldFilter);
    }

    const qoreOptions: TQoreOptions = {};

    fields.forEach((field) => {
      const option = mapApiFieldToQoreOption(field, { isForResponse: true });
      if (option) {
        // Use normalized field name as key for response (user-friendly)
        const fieldName = normalizeName(field.name);
        qoreOptions[fieldName] = option;
      }
    });

    // Add system fields that are always present
    qoreOptions['id'] = {
      type: 'integer',
      display_name: 'ID',
      desc: 'Unique identifier',
    };

    return {
      type: 'hash',
      fields: qoreOptions,
    };
  };
};
```

### 5. Bidirectional Data Transformation (from CopperCRM)

Always provide helpers to transform data between Qore format and API format:

```typescript
// data-transformers.ts

/**
 * Transform user input (keyed by field ID) to API format.
 * Some APIs expect arrays, others expect objects.
 */
export const transformInputToApiFormat = (
  input: Record<string, unknown>
): Array<{ field_id: string; value: unknown }> => {
  return Object.entries(input).map(([fieldId, value]) => ({
    field_id: fieldId,
    value,
  }));
};

/**
 * Transform API response (keyed by field ID) to user-friendly format (keyed by field name).
 */
export const transformApiResponseToOutput = async (options: {
  token: string;
  url: string;
  response: Record<string, unknown>;
}): Promise<Record<string, unknown>> => {
  const { token, url, response } = options;
  const fieldIdToNameMap = await getFieldIdToNameMap({ token, url });

  const output: Record<string, unknown> = {};

  Object.entries(response).forEach(([key, value]) => {
    // Check if key is a field ID (e.g., "field_123" or just "123")
    const fieldId = key.startsWith('field_') ? key.replace('field_', '') : key;
    const fieldName = fieldIdToNameMap[fieldId];

    if (fieldName) {
      output[normalizeName(fieldName)] = value;
    } else {
      output[key] = value;
    }
  });

  return output;
};

/**
 * Batch transform for list responses.
 */
export const transformApiResponseList = async <T extends Record<string, unknown>>(options: {
  token: string;
  url: string;
  records: T[];
  customFieldsKey?: string;
}): Promise<T[]> => {
  const { token, url, records, customFieldsKey = 'custom_fields' } = options;
  const fieldIdToNameMap = await getFieldIdToNameMap({ token, url });

  return records.map((record) => {
    const customFields = record[customFieldsKey];
    if (!customFields || typeof customFields !== 'object') {
      return record;
    }

    const transformedFields: Record<string, unknown> = {};

    // Handle array format: [{ field_id: '123', value: 'x' }]
    if (Array.isArray(customFields)) {
      customFields.forEach((field: { field_id: string; value: unknown }) => {
        const fieldName = fieldIdToNameMap[field.field_id];
        transformedFields[fieldName || field.field_id] = field.value;
      });
    }
    // Handle object format: { '123': 'x' }
    else {
      Object.entries(customFields).forEach(([fieldId, value]) => {
        const fieldName = fieldIdToNameMap[fieldId];
        transformedFields[fieldName || fieldId] = value;
      });
    }

    return {
      ...record,
      [customFieldsKey]: transformedFields,
    };
  });
};
```

### 6. Field ID to Name Mapping (Essential Helper)

```typescript
// field-mapping.ts

/**
 * Cache field mappings to avoid repeated API calls.
 * Consider using a proper caching mechanism in production.
 */
const fieldMapCache = new Map<string, Record<string, string>>();

export const getFieldIdToNameMap = async (options: {
  token: string;
  url: string;
  tableId?: string;
}): Promise<Record<string, string>> => {
  const cacheKey = `${options.url}-${options.tableId || 'default'}`;

  if (fieldMapCache.has(cacheKey)) {
    return fieldMapCache.get(cacheKey)!;
  }

  const fields = await fetchApiFields(options);
  const map: Record<string, string> = {};

  fields.forEach((field) => {
    map[String(field.id)] = normalizeName(field.name);
  });

  fieldMapCache.set(cacheKey, map);
  return map;
};
```

## Usage in Actions

### Example: Create Record Action

```typescript
// create-record.action.ts
import { createAction } from '@qoretechnologies/ts-toolkit';
import {
  createDynamicTypeFunction,
  createDynamicResponseTypeFunction,
  transformInputToApiFormat,
  transformApiResponseToOutput,
} from '../helpers/dynamic-types';

export const createRecordAction = createAction({
  id: 'create-record',
  display_name: 'Create Record',
  options: {
    entity_type: {
      type: 'string',
      display_name: 'Entity Type',
      required: true,
      allowed_values: [
        { value: 'contact', display_name: 'Contact' },
        { value: 'company', display_name: 'Company' },
        { value: 'deal', display_name: 'Deal' },
      ],
      on_change: ['refetch'], // Refetch dynamic types when changed
    },
    // Standard fields...
    name: {
      type: 'string',
      display_name: 'Name',
      required: true,
    },
    // Custom fields with dynamic type
    custom_fields: {
      type: 'hash',
      display_name: 'Custom Fields',
      get_dynamic_type: async (context) => {
        // Get entity_type from current options
        const entityType = context.opts?.entity_type as TEntityType;
        const fn = createDynamicTypeFunction({ entityType });
        return fn(context);
      },
    },
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'integer' },
      name: { type: 'string' },
      custom_fields: {
        type: 'hash',
        get_dynamic_type: async (context) => {
          const entityType = context.opts?.entity_type as TEntityType;
          const fn = createDynamicResponseTypeFunction({ entityType });
          return fn(context);
        },
      },
    },
  },
  action: async ({ opts, context }) => {
    const { token, url } = getConnectionValues(context);
    const { entity_type, name, custom_fields } = opts;

    // Transform custom fields to API format
    const apiCustomFields = transformInputToApiFormat(custom_fields || {});

    const response = await apiClient.post(`/${entity_type}`, {
      token,
      url,
      body: {
        name,
        custom_fields: apiCustomFields,
      },
    });

    // Transform response to user-friendly format
    return transformApiResponseToOutput({
      token,
      url,
      response,
    });
  },
});
```

## Checklist for Implementing Dynamic Types

- [ ] **Define API field types** with explicit TypeScript types
- [ ] **Create declarative type mapping** (`ApiTypeToQoreTypeMap`)
- [ ] **Implement field mapper** with `isForResponse` distinction
- [ ] **Use factory pattern** if fields need filtering by entity/table type
- [ ] **Add `on_change: ['refetch']`** to parent options that affect dynamic types
- [ ] **Implement bidirectional transformers** (input → API, API → output)
- [ ] **Use `normalizeName()`** for response field keys
- [ ] **Use field IDs** for input option keys (API expects IDs)
- [ ] **Add `allowed_values_creatable`** for select fields when appropriate
- [ ] **Use `softstring`** for select types (flexible input)
- [ ] **Include system fields** in response types (id, created_at, etc.)
- [ ] **Skip read-only fields** in input options
- [ ] **Handle default values** in input options
- [ ] **Write comprehensive tests** for type mapping and transformations

## Common Pitfalls

1. **Using field names as input keys** - APIs typically expect field IDs
2. **Including `allowed_values` in response types** - Only needed for inputs
3. **Forgetting `on_change: ['refetch']`** - Dynamic types won't update
4. **Not normalizing field names** - Inconsistent output keys
5. **Missing read-only field handling** - Users can't set computed fields
6. **Using `any` type** - Always try to find a more specific type
7. **Not caching field metadata** - Causes unnecessary API calls
8. **Forgetting batch transformation** - List actions need special handling
