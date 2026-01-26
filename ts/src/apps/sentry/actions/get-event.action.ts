import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SENTRY_APP_NAME, SentryError } from '../constants';
import { sentryApiClient } from '../helpers/constants';
import { getSentryProjectAllowedValues } from '../helpers/get-project-allowed-values';

const action = 'get_event';

const options = {
  projectId: {
    type: 'string',
    required: true,
    get_allowed_values: getSentryProjectAllowedValues,
  },
  eventId: {
    type: 'string',
    required: true,
  },
} satisfies TQoreOptions;

const getEvent = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SENTRY_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, organization, projectId, eventId } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'organization'],
      optionFields: ['projectId', 'eventId'],
      ErrorClass: SentryError,
    });

    try {
      const response = await sentryApiClient<Record<string, any>>({
        path: `/api/0/projects/${organization}/${projectId}/events/${eventId}/`,
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
            name: { type: 'string' },
          },
        },
      },
      contexts: { type: 'hash' },
      entries: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              type: { type: 'string' },
              data: { type: 'hash' },
            },
          },
        },
      },
      packages: { type: 'hash' },
      sdk: {
        type: {
          type: 'hash',
          fields: {
            name: { type: 'string' },
            version: { type: 'string' },
          },
        },
      },
      _meta: { type: 'hash' },
      errors: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              type: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
      dist: { type: 'string' },
      fingerprints: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
      context: { type: 'hash' },
    },
  },
});

export default getEvent;
