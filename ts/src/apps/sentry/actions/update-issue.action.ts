import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SENTRY_APP_NAME, SentryError } from '../constants';
import { sentryApiClient } from '../helpers/constants';
import { getSentryIssueAllowedValues } from '../helpers/get-issue-allowed-values';
import { getSentryProjectAllowedValues } from '../helpers/get-project-allowed-values';
import { getSentryTeamAllowedValues } from '../helpers/get-team-allowed-values';

const action = 'update_issue';

const options = {
  projectId: {
    type: 'string',
    preselected: true,
    required: false,
    get_allowed_values: getSentryProjectAllowedValues,
  },
  issueId: {
    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getSentryIssueAllowedValues,
  },
  status: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: 'resolved', display_name: 'Resolved' },
      { value: 'unresolved', display_name: 'Unresolved' },
      { value: 'ignored', display_name: 'Ignored' },
      { value: 'resolvedInNextRelease', display_name: 'Resolved in Next Release' },
    ],
  },
  assignedTo: {
    type: 'string',
    required: false,
    allowed_values_creatable: true,
    get_allowed_values: getSentryTeamAllowedValues,
  },
  hasSeen: {
    type: 'boolean',
    required: false,
  },
  isBookmarked: {
    type: 'boolean',
    required: false,
  },
  isSubscribed: {
    type: 'boolean',
    required: false,
  },
  isPublic: {
    type: 'boolean',
    required: false,
  },
} satisfies TQoreOptions;

const updateIssue = QoreAppCreator.createLocalizedAction<typeof options>({
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

    const { status, assignedTo, hasSeen, isBookmarked, isSubscribed, isPublic } = obj || {};

    const body: Record<string, any> = {};

    if (status !== undefined) body.status = status;
    if (assignedTo !== undefined) body.assignedTo = assignedTo;
    if (hasSeen !== undefined) body.hasSeen = hasSeen;
    if (isBookmarked !== undefined) body.isBookmarked = isBookmarked;
    if (isSubscribed !== undefined) body.isSubscribed = isSubscribed;
    if (isPublic !== undefined) body.isPublic = isPublic;

    if (Object.keys(body).length === 0) {
      throw new SentryError('At least one field must be provided to update the issue');
    }

    try {
      const response = await sentryApiClient<Record<string, any>>({
        path: `/api/0/issues/${issueId}/`,
        method: 'PUT',
        body,
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
    },
  },
});

export default updateIssue;
