import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

const periodType = {
  type: 'hash',
  fields: {
    startDate: { type: 'string' },
    endDate: { type: 'string' },
    customersHelped: { type: 'integer' },
    closed: { type: 'integer' },
    totalReplies: { type: 'integer' },
    totalUsers: { type: 'integer' },
    totalDays: { type: 'integer' },
    repliesPerDayPerUser: { type: 'float' },
    repliesPerDay: { type: 'float' },
    resolvedPerDay: { type: 'float' },
  },
} as const;

export const HelpScoutCompanyReportResponseType = {
  type: 'hash',
  fields: {
    filterTags: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            id: { type: 'integer' },
            name: { type: 'string' },
          },
        },
      },
    },
    current: { type: periodType },
    previous: { type: periodType },
    deltas: {
      type: {
        type: 'hash',
        fields: {
          customersHelped: { type: 'float' },
          totalReplies: { type: 'float' },
          repliesPerDay: { type: 'float' },
          closed: { type: 'float' },
          totalUsers: { type: 'float' },
          repliesPerDayPerUser: { type: 'float' },
        },
      },
    },
    users: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            customersHelped: { type: 'integer' },
            happinessScore: { type: 'float' },
            previousCustomersHelped: { type: 'integer' },
            replies: { type: 'integer' },
            name: { type: 'string' },
            previousHappinessScore: { type: 'float' },
            previousReplies: { type: 'integer' },
            user: { type: 'string' },
            previousHandleTime: { type: 'float' },
            handleTime: { type: 'float' },
          },
        },
      },
    },
  },
} satisfies TQoreResponseType;
