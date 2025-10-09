import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SENTRY_APP_NAME, SentryError } from '../constants';
import { sentryApiClient } from '../helpers/constants';

const action = 'get_issue';

const options = {
  issueId: {
    type: 'string',
    required: true,
  },
} satisfies TQoreOptions;

const getIssue = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SENTRY_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, issueId } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['issueId'],
      ErrorClass: SentryError,
    });

    try {
      const response = await sentryApiClient<Record<string, any>>({
        path: `/api/0/issues/${issueId}/`,
        method: 'GET',
        token,
      });

      return response;
    } catch (error) {
      throw new SentryError(`Failed to ${humanizeNameTitle(action)}: ${error?.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      shareId: { type: 'string' },
      shortId: { type: 'string' },
      title: { type: 'string' },
      culprit: { type: 'string' },
      permalink: { type: 'string' },
      logger: { type: 'string' },
      level: { type: 'string' },
      status: { type: 'string' },
      statusDetails: { type: 'hash' },
      substatus: { type: 'string' },
      isPublic: { type: 'boolean' },
      platform: { type: 'string' },
      project: {
        type: {
          type: 'hash',
          fields: {
            id: { type: 'string' },
            name: { type: 'string' },
            slug: { type: 'string' },
            platform: { type: 'string' },
          },
        },
      },
      type: { type: 'string' },
      metadata: { type: 'hash' },
      numComments: { type: 'integer' },
      assignedTo: {
        type: {
          type: 'hash',
          fields: {
            id: { type: 'string' },
            name: { type: 'string' },
            type: { type: 'string' },
            email: { type: 'string' },
          },
        },
      },
      isBookmarked: { type: 'boolean' },
      isSubscribed: { type: 'boolean' },
      subscriptionDetails: {
        type: {
          type: 'hash',
          fields: {
            reason: { type: 'string' },
          },
        },
      },
      hasSeen: { type: 'boolean' },
      annotations: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
      issueType: { type: 'string' },
      issueCategory: { type: 'string' },
      priority: { type: 'string' },
      priorityLockedAt: { type: 'string' },
      isUnhandled: { type: 'boolean' },
      count: { type: 'string' },
      userCount: { type: 'integer' },
      firstSeen: { type: 'string' },
      lastSeen: { type: 'string' },
      stats: { type: 'hash' },
      participants: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              name: { type: 'string' },
              username: { type: 'string' },
              email: { type: 'string' },
            },
          },
        },
      },
      seenBy: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              name: { type: 'string' },
              username: { type: 'string' },
              email: { type: 'string' },
            },
          },
        },
      },
      pluginIssues: {
        type: {
          type: 'list',
          element_type: 'hash',
        },
      },
      integrationIssues: {
        type: {
          type: 'list',
          element_type: 'hash',
        },
      },
      activity: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              type: { type: 'string' },
              dateCreated: { type: 'string' },
            },
          },
        },
      },
    },
  },
});

export default getIssue;
