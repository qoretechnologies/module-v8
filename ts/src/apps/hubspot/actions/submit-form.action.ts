import {
  EQoreAppActionCode,
  QoreAppCreator,
  QorusRequest,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { HUBSPOT_APP_NAME, HubspotError } from '../constants';
import { getHubspotFormAllowedValues } from '../helpers/get-form-allowed-values';
import { getHubspotFormFieldAllowedValues } from '../helpers/get-form-field-allowed-values';
import { getHubspotPortalId } from '../helpers/get-portal-id';

type THubspotSubmitFormField = {
  name: string;
  value: string;
  objectTypeId?: string;
};

type THubspotSubmitFormContext = {
  hutk?: string;
  ipAddress?: string;
  pageUri?: string;
  pageName?: string;
  pageId?: string;
  sfdcCampaignId?: string;
  goToWebinarWebinarKey?: string;
};

type THubspotSubmitFormBody = {
  fields: THubspotSubmitFormField[];
  context?: THubspotSubmitFormContext;
  legalConsentOptions?: Record<string, unknown>;
  submittedAt?: number;
  skipValidation?: boolean;
};

type THubspotSubmitFormResponse = {
  inlineMessage?: string;
  redirectUri?: string;
};

const options = {
  formId: {
    type: 'softstring',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getHubspotFormAllowedValues,
    on_change: ['refetch'],
  },
  fields: {
    required: true,
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          name: {
            type: 'string',
            required: true,
            allowed_values_creatable: true,
            get_allowed_values: getHubspotFormFieldAllowedValues,
          },
          value: {
            type: 'string',
            required: true,
          },
          objectTypeId: {
            type: 'string',
            required: false,
          },
        },
      },
    },
  },
  context: {
    required: false,
    type: {
      type: 'hash',
      fields: {
        hutk: { type: 'string', required: false },
        ipAddress: { type: 'string', required: false },
        pageUri: { type: 'string', required: false },
        pageName: { type: 'string', required: false },
        pageId: { type: 'string', required: false },
        sfdcCampaignId: { type: 'string', required: false },
        goToWebinarWebinarKey: { type: 'string', required: false },
      },
    },
  },
  legalConsentOptions: {
    required: false,
    type: 'hash',
  },
  submittedAt: {
    required: false,
    type: 'date',
  },
  skipValidation: {
    required: false,
    type: 'bool',
    default_value: false,
  },
} satisfies TQoreOptions;

export const submitHubspotFormAction = QoreAppCreator.createLocalizedAction({
  app: HUBSPOT_APP_NAME,
  action: 'submit_form',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, formId } = await getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['formId'],
    });

    const rawFields = (obj?.fields as THubspotSubmitFormField[] | undefined) ?? [];

    if (!rawFields.length) {
      throw new HubspotError('At least one form field is required to submit a form.');
    }

    const portalId = await getHubspotPortalId(token);

    if (!portalId) {
      throw new HubspotError(
        'Unable to resolve HubSpot portalId from /integrations/v1/me — the access token may be invalid, expired, or the request failed.'
      );
    }

    const body: THubspotSubmitFormBody = {
      fields: rawFields.map((field) => ({
        name: field.name,
        value: field.value,
        ...(field.objectTypeId ? { objectTypeId: field.objectTypeId } : {}),
      })),
    };

    const submissionContext = obj?.context as THubspotSubmitFormContext | undefined;

    if (submissionContext && Object.values(submissionContext).some((v) => v !== undefined)) {
      body.context = submissionContext;
    }

    const legalConsentOptions = obj?.legalConsentOptions as Record<string, unknown> | undefined;

    if (legalConsentOptions && Object.keys(legalConsentOptions).length) {
      body.legalConsentOptions = legalConsentOptions;
    }

    if (obj?.submittedAt) {
      body.submittedAt = new Date(obj.submittedAt as string).getTime();
    }

    if (obj?.skipValidation === true) {
      body.skipValidation = true;
    }

    const response = await QorusRequest.post<{ data: THubspotSubmitFormResponse }>(
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        path: `/submissions/v3/integration/secure/submit/${portalId}/${formId}`,
        data: body,
      },
      {
        url: 'https://api.hsforms.com',
        endpointId: 'HubspotForms',
      }
    );

    const responseData = response?.data ?? {};

    return {
      inlineMessage: responseData.inlineMessage ?? '',
      redirectUri: responseData.redirectUri ?? '',
    };
  },
  response_type: {
    type: 'hash',
    fields: {
      inlineMessage: { type: 'string' },
      redirectUri: { type: 'string' },
    },
  },
});

export default submitHubspotFormAction;
