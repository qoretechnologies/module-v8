import {
  EQoreAppActionCode,
  QoreAppCreator,
  QorusRequest,
  TQoreOptions,
  TQoreTypeObject,
} from '@qoretechnologies/ts-toolkit';
import { delay } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { HUBSPOT_APP_NAME } from '../constants';
import { getHubspotFormAllowedValues } from '../helpers/get-form-allowed-values';

const triggerName = 'hubspot_form_submitted_trigger';

const FORM_SUBMISSIONS_POLL_PAGE_SIZE = 50;
const FORM_SUBMISSIONS_POLL_MAX_ITEMS = 200;
const FORM_SUBMISSIONS_POLL_PAGE_DELAY_MS = 200;

type THubspotSubmission = {
  conversionId?: string;
  submittedAt: number;
  pageUrl: string | null;
  values: Array<{ name: string; value: string }>;
};

type THubspotSubmissionsResponse = {
  results: THubspotSubmission[];
  paging?: { next?: { after?: string } };
};

const eventInfoType = {
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
} satisfies TQoreTypeObject;

const options = {
  formId: {
    type: 'softstring',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getHubspotFormAllowedValues,
  },
} satisfies TQoreOptions;

const fetchLatestSubmissions = async (
  token: string,
  formId: string
): Promise<THubspotSubmission[]> => {
  const collected: THubspotSubmission[] = [];
  let after: string | undefined = undefined;

  do {
    const params: Record<string, string | number> = { limit: FORM_SUBMISSIONS_POLL_PAGE_SIZE };

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

    const results = response?.data?.results ?? [];

    if (!results.length) {
      break;
    }

    for (const s of results) {
      collected.push({
        ...s,
        conversionId: s.conversionId ?? `${s.submittedAt}_${collected.length}`,
      });

      if (collected.length >= FORM_SUBMISSIONS_POLL_MAX_ITEMS) {
        break;
      }
    }

    if (collected.length >= FORM_SUBMISSIONS_POLL_MAX_ITEMS) {
      break;
    }

    after = response?.data?.paging?.next?.after;

    if (after) {
      await delay(FORM_SUBMISSIONS_POLL_PAGE_DELAY_MS);
    }
  } while (after);

  return collected;
};

const normalizeSubmission = (submission: THubspotSubmission): Record<string, unknown> => ({
  conversionId: submission.conversionId ?? '',
  submittedAt: submission.submittedAt,
  pageUrl: submission.pageUrl ?? '',
  values: submission.values ?? [],
});

const hubspotFormSubmittedTrigger = QoreAppCreator.createLocalizedTrigger({
  app: HUBSPOT_APP_NAME,
  action: triggerName,
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const token = context.conn_opts?.token;
    const formId = context.opts?.formId;

    if (!token || !formId) {
      throw new Error(
        `The token and formId are required to start the Hubspot ${triggerName}`
      );
    }

    await pollCreatedItemsForTrigger({
      trigger_name: triggerName,
      uniqueField: 'conversionId',
      getItems: async () => {
        const subs = await fetchLatestSubmissions(token, formId);

        return subs.map(normalizeSubmission);
      },
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const token = context.conn_opts?.token;
    const formId = context.opts?.formId;

    if (!token || !formId) {
      throw new Error(
        `The token and formId are required to get the example event data for the Hubspot ${triggerName}`
      );
    }

    const submissions = await fetchLatestSubmissions(token, formId);

    if (!submissions.length) {
      return null;
    }

    return normalizeSubmission(submissions[0]);
  },
  event_info: {
    desc: 'Hubspot Form Submitted Trigger Event Info',
    type: eventInfoType,
  },
});

export default hubspotFormSubmittedTrigger;
