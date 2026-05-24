import {
  EQoreAppActionCode,
  QoreAppCreator,
  QorusRequest,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { delay, getQoreContextRequiredValues } from '../../../global/helpers';
import { HUBSPOT_APP_NAME } from '../constants';
import { getHubspotFormAllowedValues } from '../helpers/get-form-allowed-values';

const FORMS_SUBMISSIONS_PAGE_SIZE_MAX = 50;
const FORMS_SUBMISSIONS_PAGE_DELAY_MS = 200;

type THubspotSubmissionValue = {
  name: string;
  value: string;
};

type THubspotSubmission = {
  conversionId?: string;
  submittedAt: number;
  pageUrl: string | null;
  values: THubspotSubmissionValue[];
};

type THubspotSubmissionsResponse = {
  results: THubspotSubmission[];
  paging?: {
    next?: {
      after?: string;
      link?: string;
    };
  };
};

const options = {
  formId: {
    type: 'softstring',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getHubspotFormAllowedValues,
  },
  limit: {
    type: 'integer',
    required: false,
    default_value: 20,
  },
  maxResults: {
    type: 'integer',
    required: false,
    default_value: 200,
  },
  after: {
    type: 'string',
    required: false,
  },
  since: {
    type: 'date',
    required: false,
  },
} satisfies TQoreOptions;

export const getHubspotFormSubmissionsAction = QoreAppCreator.createLocalizedAction({
  app: HUBSPOT_APP_NAME,
  action: 'get_form_submissions',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, formId } = await getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['formId'],
    });

    const pageSize = Math.min(
      Math.max(Number(obj?.limit) || 20, 1),
      FORMS_SUBMISSIONS_PAGE_SIZE_MAX
    );
    const maxResults = Number(obj?.maxResults) || 200;
    const sinceMs = obj?.since ? new Date(obj.since as string).getTime() : undefined;

    const collected: THubspotSubmission[] = [];
    let after: string | undefined = (obj?.after as string | undefined) || undefined;
    let reachedSinceBoundary = false;

    do {
      const params: Record<string, string | number> = { limit: pageSize };

      if (after) {
        params.after = after;
      }

      const response = await QorusRequest.get<{ data: THubspotSubmissionsResponse }>(
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          path: `/form-integrations/v1/submissions/forms/${formId}`,
          params,
        },
        {
          url: 'https://api.hubapi.com',
          endpointId: 'Hubspot',
        }
      );

      const data = response?.data;
      const results = data?.results ?? [];

      if (!results.length) {
        break;
      }

      for (const submission of results) {
        if (sinceMs !== undefined && submission.submittedAt < sinceMs) {
          reachedSinceBoundary = true;
          break;
        }

        collected.push(submission);

        if (collected.length >= maxResults) {
          break;
        }
      }

      if (reachedSinceBoundary || collected.length >= maxResults) {
        break;
      }

      after = data?.paging?.next?.after;

      if (after) {
        await delay(FORMS_SUBMISSIONS_PAGE_DELAY_MS);
      }
    } while (after);

    return {
      results: collected,
      total: collected.length,
      after: after ?? '',
    };
  },
  response_type: {
    type: 'hash',
    fields: {
      total: {
        type: 'integer',
      },
      after: {
        type: 'string',
      },
      results: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              conversionId: { type: 'string' },
              submittedAt: { type: 'integer' },
              pageUrl: { type: 'string' },
              values: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      name: { type: 'string' },
                      value: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
});

export default getHubspotFormSubmissionsAction;
