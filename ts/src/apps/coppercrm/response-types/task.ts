import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const CopperCrmTaskResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'integer' },
    name: { type: 'string' },
    related_resource: {
      type: {
        type: 'hash',
        fields: {
          id: { type: 'integer' },
          type: { type: 'string' },
        },
      },
    },
    assignee_id: { type: 'integer' },
    due_date: { type: 'integer' },
    reminder_date: { type: 'integer' },
    completed_date: { type: 'integer' },
    priority: { type: 'string' },
    status: { type: 'string' },
    details: { type: 'string' },
    tags: {
      type: {
        type: 'list',
        element_type: 'string',
      },
    },
    date_created: { type: 'integer' },
    date_modified: { type: 'integer' },
  },
} satisfies TQoreResponseType;
