import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const SurveyMessageResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'string' },
    type: { type: 'string' },
    status: { type: 'string' },
    subject: { type: 'string' },
    href: { type: 'string' },
  },
} satisfies TQoreResponseType;

const WebhookResourcesResponseType = {
  type: 'hash',
  fields: {
    survey_id: { type: 'string' },
    response_id: { type: 'string' },
    collector_id: { type: 'string' },
    recipient_id: { type: 'string' },
  },
} satisfies TQoreResponseType;

export const NewResponseWebhookEventResponseType = {
  type: 'hash',
  fields: {
    event_type: { type: 'string' },
    object_type: { type: 'string' },
    object_id: { type: 'string' },
    event_datetime: { type: 'string' },
    resources: { type: WebhookResourcesResponseType },
  },
} satisfies TQoreResponseType;

export const ResponseDisqualifiedWebhookEventResponseType = {
  type: 'hash',
  fields: {
    event_type: { type: 'string' },
    object_type: { type: 'string' },
    object_id: { type: 'string' },
    event_datetime: { type: 'string' },
    resources: { type: WebhookResourcesResponseType },
  },
} satisfies TQoreResponseType;

export const ResponseUpdatedWebhookEventResponseType = {
  type: 'hash',
  fields: {
    event_type: { type: 'string' },
    object_type: { type: 'string' },
    object_id: { type: 'string' },
    event_datetime: { type: 'string' },
    resources: { type: WebhookResourcesResponseType },
  },
} satisfies TQoreResponseType;

const CollectorWebhookResourcesResponseType = {
  type: 'hash',
  fields: {
    survey_id: { type: 'string' },
    collector_id: { type: 'string' },
  },
} satisfies TQoreResponseType;

export const CollectorUpdatedWebhookEventResponseType = {
  type: 'hash',
  fields: {
    event_type: { type: 'string' },
    object_type: { type: 'string' },
    object_id: { type: 'string' },
    event_datetime: { type: 'string' },
    resources: { type: CollectorWebhookResourcesResponseType },
  },
} satisfies TQoreResponseType;
