import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { SENTRY_APP_NAME, SentryError } from '../constants';
import { sentryApiClient } from '../helpers/constants';
import { getSentryProjectAllowedValues } from '../helpers/get-project-allowed-values';

const action = 'new_project_issue';

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
} satisfies TQoreOptions;

const NewProjectIssue = QoreAppCreator.createLocalizedTrigger({
  app: SENTRY_APP_NAME,
  action,
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { token, organization, projectId } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'organization'],
      optionFields: ['projectId'],
      ErrorClass: SentryError,
    });

    const { query, statsPeriod } = context.opts || {};

    const getItems = () => {
      return fetchLatestIssues({
        token,
        organization,
        projectId,
        query,
        statsPeriod,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: `sentry_${action}`,
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token, organization, projectId } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'organization'],
      optionFields: ['projectId'],
      ErrorClass: SentryError,
    });

    const { query, statsPeriod } = context.opts || {};

    const issues = await fetchLatestIssues({
      token,
      organization,
      projectId,
      query,
      statsPeriod,
    });

    return issues?.length ? issues[0] : null;
  },
  event_info: {
    desc: 'Sentry New Project Issue Trigger Event Info',
    type: {
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
  },
});

const fetchLatestIssues = async (options: {
  token: string;
  organization: string;
  projectId: string;
  query?: string;
  statsPeriod?: string;
}): Promise<Record<string, any>[]> => {
  const { token, organization, projectId, query, statsPeriod } = options;

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
      },
      token,
    });

    return response.items || [];
  } catch (error) {
    throw new SentryError(`Failed to fetch latest issues: ${error.message || error}`);
  }
};

export default NewProjectIssue;
