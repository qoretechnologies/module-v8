Copyright 2026 Qore Technologies, s.r.o.

# Record-based App Development Guide

This guide covers adding record-based CRUD (table/row) operations to an app. Record-based
support enables generic search, create, update, and delete operations across multiple entity
types ("tables") — users select a table and work with its records through a unified interface.

See also:
- [ts-integration-architecture.md](ts-integration-architecture.md) — high-level overview
- [standard-app-development-guide.md](standard-app-development-guide.md) — unified client pattern
- [ts-integration-checklist.md](ts-integration-checklist.md) — verification checklist

---

## Overview

Record-based apps expose multi-entity CRUD through the `TQoreRecordBasedApp` interface.
The app's `index.ts` satisfies both `TQoreAppWithActions` and `TQoreRecordBasedApp`.

This pattern is additive — it goes on top of standard or swagger-based apps. An app can
have custom actions AND record-based support.

**Reference:** `src/apps/freshdesk/helpers/record-based/`

---

## File Structure

```
src/apps/<app-name>/
├── index.ts                          # satisfies TQoreRecordBasedApp & TQoreAppWithActions
├── helpers/
│   └── record-based/
│       ├── index.ts                  # Exports all record-based functions
│       ├── constants.ts              # Table names, shared types
│       ├── get-table-list.ts
│       ├── get-record-type.ts
│       ├── get-expressions.ts
│       ├── get-search-options.ts
│       ├── search-records.ts
│       ├── create-records.ts
│       ├── update-records.ts
│       └── delete-records.ts
```

---

## Required Exports

The `index.ts` must provide these record-based properties:

```typescript
export default (locale: Locales) =>
  ({
    // ... standard app config (name, actions, rest, etc.)

    // Record-based required exports:
    get_table_list: getTableList,
    expressions: getExpressions(locale),
    get_record_type: getRecordType,
    search_records: searchRecords,
    search_options: getSearchOptions(locale),
    create_records: createRecords,
    update_records: updateRecords,
    delete_records: deleteRecords,

    // Optional:
    upsert_records: upsertRecords,
    upsert_options: getUpsertOptions(locale),
  }) satisfies TQoreRecordBasedApp & TQoreAppWithActions;
```

---

## get_table_list

Returns the list of available table names (entity types).

**Type:** `TQoreGetTableListFunction`

```typescript
const getTableList: TQoreGetTableListFunction = async (context) => {
  // Static list example:
  return ['tickets', 'contacts', 'companies', 'agents'];

  // Dynamic list example (API call):
  const { token } = getQoreContextRequiredValues({ ... });
  const tables = await client.get('tables', { token });
  return tables.map(t => t.name);
};
```

**Table name encoding:** When tables need composite identifiers (e.g., workspace + project),
encode them as a delimited string: `'workspaceName|projectName'`.

See: `src/apps/freshdesk/helpers/record-based/get-table-list.ts`

---

## get_record_type

Returns the schema (field definitions) for a given table.

**Type:** `TQoreGetRecordTypeFunction`

**CRITICAL SERIALIZATION RULE:** The returned `TQoreTypeObject` must contain **NO function
references**. All values must be resolved inline — `allowed_values` must be arrays of objects,
not function references. `get_allowed_values`, `get_element_allowed_values`, and other function
references are NOT allowed in record types.

This is because record types are serialized across the Qore/V8 boundary, and functions cannot
be serialized.

```typescript
const getRecordType: TQoreGetRecordTypeFunction = async (tableName, context) => {
  const { token } = getQoreContextRequiredValues({ ... });

  // CORRECT: allowed_values resolved inline as data
  const statuses = await fetchStatusValues(token);

  return {
    type: 'hash',
    fields: {
      id: { type: 'string', display_name: 'ID', short_desc: 'Record ID' },
      name: { type: 'string', display_name: 'Name', short_desc: 'Record name' },
      status: {
        type: 'string',
        display_name: 'Status',
        short_desc: 'Record status',
        allowed_values: statuses,  // CORRECT: resolved data, not a function
      },
    },
  };
};

// WRONG — this will fail at serialization:
// get_allowed_values: fetchStatusValues,  // Function reference — NOT ALLOWED
```

See: `src/apps/freshdesk/helpers/record-based/get-record-type.ts`

**Stripping function references:** Use `stripRecordTypeFunctions()` from
`src/global/helpers/strip-record-type-functions.ts` if you need to clean a type object
that may contain function references.

---

## expressions

Defines the search operators available for filtering records. Expressions are localized
using `mapExpressionsToApp()`.

```typescript
const EXPRESSIONS = {
  equals: {
    role: 'value',
    args: [{ type: 'string' }],
  },
  not_equals: {
    role: 'value',
    args: [{ type: 'string' }],
  },
  contains: {
    role: 'value',
    args: [{ type: 'string' }],
  },
  greater_than: {
    role: 'value',
    args: [{ type: 'string' }],
  },
  less_than: {
    role: 'value',
    args: [{ type: 'string' }],
  },
};

const getExpressions = (locale: Locales) =>
  mapExpressionsToApp(APP_NAME, EXPRESSIONS, locale);
```

**Locale requirement:** Each expression needs locale entries at:
```typescript
expressions: {
  equals: {
    displayName: () => 'Equals',
    shortDesc: () => 'Value equals the specified value',
    longDesc: () => 'Filters records where the field value exactly matches',
    args: [
      { displayName: () => 'Value', shortDesc: () => 'Value to compare', longDesc: () => '' },
    ],
  },
  // ...
},
```

See: `src/global/helpers/index.ts` for `mapExpressionsToApp` implementation.

---

## search_records

Searches records in a table and returns results in **column format**.

**Type:** `TQoreSearchRecordsFunction`

```typescript
const searchRecords: TQoreSearchRecordsFunction = async (
  tableName,
  context,
  whereCondition,
  searchOptions
) => {
  const { token } = getQoreContextRequiredValues({ ... });

  // Fetch records from API
  const records = await client.get(`/${tableName}`, { token, params: buildQuery(whereCondition) });

  // Convert to column format
  return mapObjectToColumnFormat(records);
};
```

**Column format:** Instead of `[{ id: 1, name: 'a' }, { id: 2, name: 'b' }]`, return:
```typescript
{ id: [1, 2], name: ['a', 'b'] }
```

Use `mapObjectToColumnFormat()` from `src/global/helpers/index.ts`.

### Applying Where Conditions

Parse the `whereCondition` to build API-specific filters. The where condition is a tree of
expressions that need to be translated to the API's query language.

See: `src/apps/freshdesk/helpers/record-based/search-records.ts` for an implementation.

---

## search_options

Defines additional options for the search operation (pagination, sorting, etc.).
Localized using `mapCrudOptionsToApp()`.

```typescript
const SEARCH_OPTIONS: TQoreCrudOptions = {
  limit: {
    type: 'int',
    default_value: 100,
  },
  order_by: {
    type: 'string',
    allowed_values: [
      { value: 'created_at', display_name: 'Created At' },
      { value: 'updated_at', display_name: 'Updated At' },
    ],
  },
};

const getSearchOptions = (locale: Locales) =>
  mapCrudOptionsToApp(APP_NAME, SEARCH_OPTIONS, 'searchOptions', locale);
```

**Note:** Unlike `get_record_type`, search options CAN contain function references
(`get_allowed_values`, etc.) because they are not serialized the same way.

See: `src/global/helpers/index.ts` for `mapCrudOptionsToApp` implementation.

---

## create_records

Creates records from column-format input.

**Type:** `TQoreCreateRecordsFunction`

```typescript
const createRecords: TQoreCreateRecordsFunction = async (tableName, context, records) => {
  const { token } = getQoreContextRequiredValues({ ... });

  // Convert from column format to row objects
  const rows = mapColumnFormatToObject(records);

  // Create each record
  const created = [];
  for (const row of rows) {
    const result = await client.post(`/${tableName}`, row, { token });
    created.push(result);
  }

  // Return in column format
  return mapObjectToColumnFormat(created);
};
```

Use `mapColumnFormatToObject()` from `src/global/helpers/index.ts` to convert input.

---

## update_records

Updates existing records.

**Type:** `TQoreUpdateRecordsFunction`

```typescript
const updateRecords: TQoreUpdateRecordsFunction = async (
  tableName,
  context,
  whereCondition,
  updateData
) => {
  const { token } = getQoreContextRequiredValues({ ... });

  // Find records matching the where condition
  const matchingRecords = await findMatchingRecords(tableName, whereCondition, token);

  // Update each record
  const updated = [];
  for (const record of matchingRecords) {
    const rows = mapColumnFormatToObject(updateData);
    const result = await client.put(`/${tableName}/${record.id}`, rows[0], { token });
    updated.push(result);
  }

  return mapObjectToColumnFormat(updated);
};
```

---

## delete_records

Deletes records matching a where condition.

**Type:** `TQoreDeleteRecordsFunction`

```typescript
const deleteRecords: TQoreDeleteRecordsFunction = async (
  tableName,
  context,
  whereCondition
) => {
  const { token } = getQoreContextRequiredValues({ ... });

  // Find records to delete
  const matchingRecords = await findMatchingRecords(tableName, whereCondition, token);

  let deletedCount = 0;
  for (const record of matchingRecords) {
    await client.delete(`/${tableName}/${record.id}`, { token });
    deletedCount++;
  }

  return deletedCount;
};
```

---

## Hybrid Pattern (Swagger + Record-based)

Apps like Freshdesk and Trello combine swagger-based actions with record-based CRUD.
The `index.ts` has both swagger configuration and record-based exports:

```typescript
export default (locale: Locales) =>
  ({
    // Swagger config
    swagger: 'schemas/app.swagger.json',
    actions: [
      ...mapActionsToApp(APP_NAME, SWAGGER_ACTIONS, locale),
      ...mapTriggersToApp(APP_NAME, TRIGGERS, locale),
    ],

    // Record-based exports
    get_table_list: getTableList,
    expressions: getExpressions(locale),
    get_record_type: getRecordType,
    search_records: searchRecords,
    search_options: getSearchOptions(locale),
    create_records: createRecords,
    update_records: updateRecords,
    delete_records: deleteRecords,

    rest: { /* ... */ },
  }) satisfies TQoreRecordBasedApp & TQoreAppWithActions;
```

---

## Column Format Data Model

The Qore record-based system uses **column format** for data exchange:

### Row format (standard):
```typescript
[
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' },
]
```

### Column format (Qore record-based):
```typescript
{
  id: [1, 2],
  name: ['Alice', 'Bob'],
  email: ['alice@example.com', 'bob@example.com'],
}
```

**Conversion utilities:**
- `mapObjectToColumnFormat(rows)` — row format → column format (for returning data)
- `mapColumnFormatToObject(columns)` — column format → row format (for receiving data)

Both are exported from `src/global/helpers/index.ts`.

---

## Localization for Record-based

### Expression Locales

```typescript
// In locale file:
expressions: {
  equals: {
    displayName: () => 'Equals',
    shortDesc: () => 'Exact match',
    longDesc: () => 'Filters where field value equals the specified value',
    args: [
      { displayName: () => 'Value', shortDesc: () => 'Value to match', longDesc: () => '' },
    ],
  },
},
```

### CRUD Option Locales

```typescript
searchOptions: {
  limit: {
    displayName: () => 'Limit',
    shortDesc: () => 'Maximum records to return',
    longDesc: () => 'Set the maximum number of records returned',
  },
},
createOptions: { /* ... */ },
upsertOptions: { /* ... */ },
```

---

## Common Pitfalls

1. **Function references in `get_record_type`** — the most common and critical error; all
   values must be resolved inline data, no `get_allowed_values` functions
2. **Not converting to column format** — `search_records` must return column format,
   `create_records` receives column format
3. **Missing expression locales** — `mapExpressionsToApp()` requires locale entries for
   every expression
4. **Missing CRUD option locales** — `mapCrudOptionsToApp()` requires locale entries
5. **Not handling empty where conditions** — `search_records` may receive `undefined`
   where condition (return all records)
6. **Forgetting `satisfies TQoreRecordBasedApp`** — the type assertion ensures all required
   exports are present
7. **Not verifying with `qdp`** — run `qdp ts-actions{}/<appname>` and check that `"tables"`
   appears in the output
