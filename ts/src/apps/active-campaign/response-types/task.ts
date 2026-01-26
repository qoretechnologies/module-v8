import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';
import { OwnerType } from './common';

const TaskLinksType = {
  type: 'hash',
  fields: {
    activities: { type: 'string' },
    automation: { type: 'string' },
    dealTasktype: { type: 'string' },
    doneAutomation: { type: 'string' },
    notes: { type: 'string' },
    owner: { type: 'string' },
    taskNotifications: { type: 'string' },
    user: { type: 'string' },
    assignee: { type: 'string' },
  },
} satisfies TQoreResponseType;

export const TaskResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'string' },
    relid: { type: 'string' },
    reltype: { type: 'string' },
    dealTasktype: { type: 'string' },
    user: { type: 'string' },
    assignee: { type: 'string' },
    automation: { type: 'string' },
    cdate: { type: 'string' },
    duedate: { type: 'string' },
    edate: { type: 'string' },
    duration: { type: 'string' },
    status: { type: 'string' },
    title: { type: 'string' },
    note: { type: 'string' },
    donedate: { type: 'string' },
    doneAutomation: { type: 'string' },
    udate: { type: 'string' },
    owner: { type: OwnerType },
    outcomeId: { type: 'number' },
    outcomeInfo: { type: 'string' },
    links: { type: TaskLinksType },
  },
} satisfies TQoreResponseType;
