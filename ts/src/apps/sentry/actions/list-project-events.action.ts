import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SENTRY_APP_NAME, SentryError } from '../constants';
import { sentryApiClient } from '../helpers/constants';
import { getSentryProjectAllowedValues } from '../helpers/get-project-allowed-values';

const action = 'list_project_events';

const options = {
  projectId: {
    type: 'string',
    required: true,
    get_allowed_values: getSentryProjectAllowedValues,
  },
  full: {
    type: 'boolean',
    required: false,
    default_value: false,
  },
  cursor: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const listProjectEvents = QoreAppCreator.createLocalizedAction<typeof options>({
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

    const { full, cursor } = obj || {};

    try {
      const response = await sentryApiClient<{
        items: Record<string, any>[];
        links: {
          next?: { url: string; cursor: string; results: string };
          previous?: { url: string; cursor: string; results: string };
        };
      }>({
        path: `/api/0/projects/${organization}/${projectId}/events/`,
        method: 'GET',
        params: {
          ...(full && { full: 'true' }),
          ...(cursor && { cursor }),
        },
        token,
      });

      return {
        events: response.items,
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
      events: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              eventID: { type: 'string' },
              projectID: { type: 'string' },
              groupID: { type: 'string' },
              message: { type: 'string' },
              title: { type: 'string' },
              location: { type: 'string' },
              culprit: { type: 'string' },
              dateCreated: { type: 'string' },
              dateReceived: { type: 'string' },
              platform: { type: 'string' },
              type: { type: 'string' },
              metadata: { type: 'hash' },
              tags: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      key: { type: 'string' },
                      value: { type: 'string' },
                    },
                  },
                },
              },
              user: {
                type: {
                  type: 'hash',
                  fields: {
                    id: { type: 'string' },
                    email: { type: 'string' },
                    username: { type: 'string' },
                    ip_address: { type: 'string' },
                  },
                },
              },
              contexts: { type: 'hash' },
              sdk: {
                type: {
                  type: 'hash',
                  fields: {
                    name: { type: 'string' },
                    version: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
      next_cursor: { type: 'string' },
      previous_cursor: { type: 'string' },
    },
  },
});

export default listProjectEvents;
