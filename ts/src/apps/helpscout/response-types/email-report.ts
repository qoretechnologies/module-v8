import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

const volumeType = {
  type: 'hash',
  fields: {
    emailConversations: { type: 'integer' },
    emailsCreated: { type: 'integer' },
    repliesSent: { type: 'integer' },
    messagesReceived: { type: 'integer' },
  },
} as const;

const resolutionsType = {
  type: 'hash',
  fields: {
    resolved: { type: 'integer' },
    resolvedOnFirstReply: { type: 'integer' },
    percentResolvedOnFirstReply: { type: 'float' },
    resolutionTime: { type: 'float' },
    repliesToResolve: { type: 'float' },
    handleTime: { type: 'integer' },
    closed: { type: 'integer' },
  },
} as const;

const responsesType = {
  type: 'hash',
  fields: {
    responseTime: { type: 'integer' },
    firstResponseTime: { type: 'integer' },
  },
} as const;

const periodType = {
  type: 'hash',
  fields: {
    startDate: { type: 'string' },
    endDate: { type: 'string' },
    volume: { type: volumeType },
    resolutions: { type: resolutionsType },
    responses: { type: responsesType },
  },
} as const;

const volumeDeltaType = {
  type: 'hash',
  fields: {
    emailConversations: { type: 'float' },
    emailsCreated: { type: 'float' },
    repliesSent: { type: 'float' },
    messagesReceived: { type: 'float' },
  },
} as const;

const resolutionsDeltaType = {
  type: 'hash',
  fields: {
    resolved: { type: 'float' },
    resolvedOnFirstReply: { type: 'float' },
    resolutionTime: { type: 'float' },
    repliesToResolve: { type: 'float' },
    handleTime: { type: 'float' },
    closed: { type: 'float' },
  },
} as const;

const responsesDeltaType = {
  type: 'hash',
  fields: {
    responseTime: { type: 'float' },
    firstResponseTime: { type: 'float' },
  },
} as const;

const rangeType = {
  type: 'hash',
  fields: {
    id: { type: 'integer' },
    count: { type: 'integer' },
    percent: { type: 'float' },
    previousCount: { type: 'integer' },
    previousPercent: { type: 'float' },
    resolutionTime: { type: 'integer' },
  },
} as const;

const timeDistributionType = {
  type: 'hash',
  fields: {
    count: { type: 'integer' },
    previousCount: { type: 'integer' },
    ranges: {
      type: {
        type: 'list',
        element_type: rangeType,
      },
    },
  },
} as const;

export const HelpScoutEmailReportResponseType = {
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
          volume: { type: volumeDeltaType },
          resolutions: { type: resolutionsDeltaType },
          responses: { type: responsesDeltaType },
        },
      },
    },
    responseTime: { type: timeDistributionType },
    handleTime: { type: timeDistributionType },
    firstResponseTime: { type: timeDistributionType },
    resolutionTime: { type: timeDistributionType },
    repliesToResolve: { type: timeDistributionType },
  },
} satisfies TQoreResponseType;
