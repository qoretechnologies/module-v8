import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SENTRY_APP_NAME, SentryError } from '../constants';
import { sentryApiClient } from '../helpers/constants';
import { getSentryProjectAllowedValues } from '../helpers/get-project-allowed-values';

const action = 'list_project_issues';

const options = {
  projectId: {
    type: 'string',
    required: true,
    get_allowed_values: getSentryProjectAllowedValues,
  },
  query: {
    type: 'string',
    required: false,
  },
  statsPeriod: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: '14d', display_name: '14 days' },
      { value: '24h', display_name: '24 hours' },
      { value: '30d', display_name: '30 days' },
      { value: '7d', display_name: '7 days' },
    ],
  },
  shortIdLookup: {
    type: 'bool',
    required: false,
    default_value: false,
  },
  cursor: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const listProjectIssues = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SENTRY_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, organization, projectId } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'organization'],
      optionFields: ['projectId'],
      ErrorClass: SentryError,
    });

    const { query, statsPeriod, shortIdLookup, cursor } = obj || {};

    try {
      const response = await sentryApiClient<{
        items: Record<string, any>[];
        links: {
          next?: { url: string; cursor: string; results: string };
          previous?: { url: string; cursor: string; results: string };
        };
      }>({
        path: `/api/0/projects/${organization}/${projectId}/issues/`,
        method: 'GET',
        params: {
          ...(query && { query }),
          ...(statsPeriod && { statsPeriod }),
          ...(shortIdLookup && { shortIdLookup: 'true' }),
          ...(cursor && { cursor }),
        },
        token,
      });

      return {
        issues: response.items,
        next_cursor: response.links.next?.cursor,
        previous_cursor: response.links.previous?.cursor,
      };
    } catch (error) {
      throw new SentryError(`Failed to ${humanizeNameTitle(action)}: ${error?.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      issues: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              shortId: { type: 'string' },
              title: { type: 'string' },
              culprit: { type: 'string' },
              permalink: { type: 'string' },
              logger: { type: 'string' },
              level: { type: 'string' },
              status: { type: 'string' },
              statusDetails: { type: 'hash' },
              isPublic: { type: 'bool' },
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
                  },
                },
              },
              isBookmarked: { type: 'bool' },
              isSubscribed: { type: 'bool' },
              subscriptionDetails: { type: 'hash' },
              hasSeen: { type: 'bool' },
              annotations: {
                type: {
                  type: 'list',
                  element_type: 'string',
                },
              },
              isUnhandled: { type: 'bool' },
              count: { type: 'string' },
              userCount: { type: 'integer' },
              firstSeen: { type: 'string' },
              lastSeen: { type: 'string' },
              stats: { type: 'hash' },
              lifetime: {
                type: {
                  type: 'hash',
                  fields: {
                    count: { type: 'string' },
                    userCount: { type: 'integer' },
                    firstSeen: { type: 'string' },
                    lastSeen: { type: 'string' },
                    stats: { type: 'hash' },
                  },
                },
              },
              filtered: { type: 'hash' },
            },
          },
        },
      },
      next_cursor: { type: 'string' },
      previous_cursor: { type: 'string' },
    },
  },
});

export default listProjectIssues;
