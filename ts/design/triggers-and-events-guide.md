Copyright 2026 Qore Technologies, s.r.o.

# Triggers and Events Guide

This guide covers implementing polling and webhook triggers for app integrations. Triggers
are event sources that fire when something happens in a third-party service (new message,
new record, webhook event, etc.).

See also:
- [ts-integration-architecture.md](ts-integration-architecture.md) — high-level overview
- [standard-app-development-guide.md](standard-app-development-guide.md) — client and action patterns
- [ts-integration-checklist.md](ts-integration-checklist.md) — verification checklist

---

## Overview

Two trigger types:

| Type | How it works | Use when |
|------|-------------|----------|
| **Polling** | Periodically fetches data and detects new/updated items | No webhook API available |
| **Webhook** | Receives HTTP callbacks from the service | Service supports webhooks |

Both types use `QoreAppCreator.createLocalizedTrigger()` and require `event_info` and
`get_example_event_data`.

**Key infrastructure:**
- `src/global/helpers/event-triggers.ts` — `pollCreatedItemsForTrigger`, `pollUpdatedItemsForTrigger`, `delayOrCancel`
- `src/global/constants.ts` — `DEFAULT_TRIGGER_POLLING_INTERVAL` (10 min), `DEFAULT_TRIGGER_POLL_ITEM_LIMIT` (50)

---

## Polling Triggers

Polling triggers periodically fetch data from the API and detect new items by comparing
against previously seen items using a unique field for deduplication.

### Using pollCreatedItemsForTrigger

The standard helper for polling new items:

```typescript
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';

const NewItem = QoreAppCreator.createLocalizedTrigger({
  app: APP_NAME,
  action: 'new_item',
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_info: { desc: 'Fires when a new item is created', type: ItemEventType },

  event_function: async (context, update, should_stop) => {
    const { token } = getQoreContextRequiredValues({ ... });

    await pollCreatedItemsForTrigger<ItemType>({
      trigger_name: 'new_item',
      uniqueField: 'id',           // Deduplication key
      getItems: async () => {
        return await client.fetchPaginated({ token, path: 'items', itemsPath: 'data' });
      },
      update,
      should_stop,
    });
  },

  get_example_event_data: async (context) => {
    // Fetch real data for example
    const { token } = getQoreContextRequiredValues({ ... });
    const items = await client.fetchPaginated({ token, path: 'items', maxResults: 1 });
    return items[0] || null;
  },
});
```

**Parameters:**
- `trigger_name` — identifier for logging
- `uniqueField` — key field for deduplication (e.g., `'id'`, `'message_id'`)
- `getItems` — async function returning latest items
- `update` — callback to fire for each new item
- `should_stop` — function that returns `true` when trigger should stop

See: `src/global/helpers/event-triggers.ts` for the full implementation.

### Using pollUpdatedItemsForTrigger

For detecting updated (not just new) items:

```typescript
await pollUpdatedItemsForTrigger<ItemType>({
  trigger_name: 'item_updated',
  uniqueField: 'id',
  updatedDateField: 'updated_at',    // Field containing last modified timestamp
  getItems: async () => { ... },
  update,
  should_stop,
});
```

This tracks the last seen update timestamp per item and fires when it changes.

### delayOrCancel

For custom polling loops, use `delayOrCancel` instead of `setTimeout`:

```typescript
import { delayOrCancel } from '../../../global/helpers/event-triggers';

// Waits up to 10 minutes or until should_stop returns true
await delayOrCancel(DEFAULT_TRIGGER_POLLING_INTERVAL, should_stop);
```

This enables cancellable waits — the trigger stops promptly when requested rather than
waiting for the full interval.

### Polling Reference

- `src/apps/dropbox/triggers/new-file.trigger.ts` — polling with `fetchWithCursor`
- `src/apps/slack/triggers/new-message.trigger.ts` — polling with cursor pagination

---

## Webhook Triggers

Webhook triggers register a URL with the third-party service and receive HTTP callbacks.

### Structure

```typescript
const NewEvent = QoreAppCreator.createLocalizedTrigger({
  app: APP_NAME,
  action: 'new_event',
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_info: { desc: 'Fires on new event', type: EventType },

  webhook_method: 'POST',

  webhook_register: async (context, url) => {
    const { token } = getQoreContextRequiredValues({ ... });

    const response = await client.post('webhooks', {
      url,
      events: ['event.created'],
    }, { token });

    return { id: response.id };  // Registration info for deregistration
  },

  webhook_deregister: async (context, _url, regInfo) => {
    const { token } = getQoreContextRequiredValues({ ... });
    const webhookId = regInfo.id;

    if (!webhookId) {
      throw new AppError('Webhook ID required for deregistration');
    }

    await client.delete(`webhooks/${webhookId}`, { token });
  },

  get_example_event_data: async (context) => {
    // Return sample webhook payload
    return {
      event_type: 'event.created',
      timestamp: new Date().toISOString(),
      data: { /* sample data */ },
    };
  },
});
```

### webhook_auth Types

```typescript
import { EQoreAppActionWebhookAuthType } from '@qoretechnologies/ts-toolkit';

// No authentication required (service signs/verifies webhooks)
webhook_auth: EQoreAppActionWebhookAuthType.AUTH_NONE,

// Require authentication (webhook endpoint is protected)
webhook_auth: EQoreAppActionWebhookAuthType.AUTH_REQUIRE_AUTH,
webhook_perms: { /* permission configuration */ },
```

### Webhook Reference

- `src/apps/survey-monkey/triggers/new-response.trigger.ts` — webhook with client for register/deregister
- `src/apps/survey-monkey/triggers/` — multiple webhook triggers using the client correctly

---

## event_info

Every trigger must define `event_info` with a description and type schema:

```typescript
event_info: {
  desc: 'Fires when a new survey response is completed',
  type: {
    type: 'hash',
    fields: {
      id: { type: 'string', display_name: 'ID', short_desc: 'Response ID' },
      survey_id: { type: 'string', display_name: 'Survey ID', short_desc: 'Survey identifier' },
      status: { type: 'string', display_name: 'Status', short_desc: 'Response status' },
      created_at: { type: 'string', display_name: 'Created At', short_desc: 'Timestamp' },
    },
  },
},
```

The `type.fields` define the schema of data the trigger produces. This schema is used by
the UI to show what data is available for downstream actions.

---

## get_example_event_data

**Required for all triggers.** Returns a sample of the data the trigger produces.

### Requirements

1. **Must be async** — even if returning static data
2. **Fields must exactly match `event_info.type.fields`** — no extra fields, no missing fields
3. **Should try real API data first** — fallback to static sample if API call fails
4. **Return `null` if no data available** — don't throw

### Pattern

```typescript
get_example_event_data: async (context) => {
  const { token } = getQoreContextRequiredValues({ ... });

  try {
    // Try to fetch real data
    const items = await client.fetchPaginated({
      token,
      path: 'items',
      maxResults: 1,
    });

    if (items.length === 0) return null;

    // Return only the fields declared in event_info
    return {
      id: items[0].id,
      survey_id: items[0].survey_id,
      status: items[0].status,
      created_at: items[0].created_at,
    };
  } catch {
    // Static fallback
    return {
      id: 'example-id',
      survey_id: 'example-survey',
      status: 'completed',
      created_at: new Date().toISOString(),
    };
  }
},
```

### Field Alignment Verification

In tests, verify that `get_example_event_data` returns data matching `event_info`:

```typescript
it('Should return example data matching event_info schema', async () => {
  const exampleData = await trigger.get_example_event_data(baseContext);
  const eventInfoFields = Object.keys(trigger.event_info.type.fields);
  const exampleFields = Object.keys(exampleData);

  // All declared fields should be present
  const missingFields = eventInfoFields.filter((f) => !exampleFields.includes(f));
  expect(missingFields).toEqual([]);

  // No extra undeclared fields
  const extraFields = exampleFields.filter((f) => !eventInfoFields.includes(f));
  expect(extraFields).toEqual([]);
});
```

---

## Trigger Options

Triggers can have options just like actions:

```typescript
const options = {
  channel_id: {
    type: 'string',
    required: true,
    get_allowed_values: getChannelAllowedValues,
  },
} satisfies TQoreOptions;
```

Options with dynamic allowed values follow the same patterns as actions.

---

## Trigger Locales

```typescript
triggers: {
  new_response: {
    displayName: () => 'New Survey Response',
    shortDesc: () => 'Fires when a new survey response is submitted',
    longDesc: () => 'Triggers when a respondent completes a survey response',
    event_info: {
      desc: () => 'Survey response event data',
    },
    options: {
      survey_id: {
        displayName: () => 'Survey',
        shortDesc: () => 'Select the survey to monitor',
        longDesc: () => 'Choose which survey should trigger events on new responses',
      },
    },
  },
},
```

---

## Common Pitfalls

1. **`event_info` fields don't match `get_example_event_data`** — extra or missing fields
   cause runtime errors; always verify alignment
2. **Missing `get_example_event_data`** — required for all triggers, even webhooks
3. **Polling without `uniqueField`** — causes duplicate event firing
4. **Using `setTimeout` instead of `delayOrCancel`** — trigger won't stop promptly
5. **Webhook register not returning registration info** — needed for deregistration
6. **Not handling webhook deregistration errors** — the service may have already removed
   the webhook
7. **Returning data with extra fields** from `get_example_event_data` — strip to only the
   fields declared in `event_info.type.fields`
