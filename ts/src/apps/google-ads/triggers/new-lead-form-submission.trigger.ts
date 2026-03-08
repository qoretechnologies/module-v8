// Copyright 2026 Qore Technologies, s.r.o.
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { GOOGLE_ADS_APP_NAME, GoogleAdsError } from '../constants';
import { CUSTOMER_ID_OPTION, getGoogleAdsCustomerFromContext, getGoogleAdsErrorMessage } from '../helpers/constants';
import { getGoogleAdsCampaignAllowedValues } from '../helpers/get-campaign-allowed-values';

const options = {
  ...CUSTOMER_ID_OPTION,
  campaign_id: {
    type: 'string',
    required: false,
    get_allowed_values: getGoogleAdsCampaignAllowedValues,
    depends_on: ['customer_id'],
  },
} satisfies TQoreOptions;

interface LeadFormSubmission {
  submission_id: string;
  gclid: string;
  submission_date_time: string;
  submission_fields: Array<{
    field_type: string;
    field_value: string;
  }>;
  campaign_id: string;
  campaign_name: string;
  ad_group_id: string;
}

const fetchLeadFormSubmissions = async (
  customer: ReturnType<typeof getGoogleAdsCustomerFromContext>['customer'],
  campaignId?: string
): Promise<LeadFormSubmission[]> => {
  try {
    let query = `
      SELECT
        lead_form_submission_data.id,
        lead_form_submission_data.resource_name,
        lead_form_submission_data.gclid,
        lead_form_submission_data.submission_date_time,
        lead_form_submission_data.lead_form_submission_fields,
        campaign.id,
        campaign.name,
        ad_group.id
      FROM lead_form_submission_data
    `;

    if (campaignId) {
      query += ` WHERE campaign.id = ${campaignId}`;
    }

    query += ' ORDER BY lead_form_submission_data.submission_date_time DESC LIMIT 100';

    const results = await customer.query(query);

    return results.map((row) => ({
      submission_id: String(row.lead_form_submission_data?.id ?? ''),
      gclid: row.lead_form_submission_data?.gclid ?? '',
      submission_date_time: row.lead_form_submission_data?.submission_date_time ?? '',
      submission_fields: Array.isArray(row.lead_form_submission_data?.lead_form_submission_fields)
        ? row.lead_form_submission_data.lead_form_submission_fields.map((field: any) => ({
            field_type: String(field.field_type ?? ''),
            field_value: field.field_value ?? '',
          }))
        : [],
      campaign_id: String(row.campaign?.id ?? ''),
      campaign_name: row.campaign?.name ?? '',
      ad_group_id: String(row.ad_group?.id ?? ''),
    }));
  } catch (error: unknown) {
    const message = getGoogleAdsErrorMessage(error);
    throw new GoogleAdsError(`Failed to fetch lead form submissions: ${message}`);
  }
};

const NewLeadFormSubmissionTrigger = QoreAppCreator.createLocalizedTrigger({
  app: GOOGLE_ADS_APP_NAME,
  action: 'new_lead_form_submission',
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { customer } = getGoogleAdsCustomerFromContext(context as any);
    const campaignId = context.opts?.campaign_id as string | undefined;

    const getItems = () => {
      return fetchLeadFormSubmissions(customer, campaignId);
    };

    await pollCreatedItemsForTrigger<LeadFormSubmission>({
      trigger_name: 'google_ads_new_lead_form_submission',
      uniqueField: 'submission_id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { customer } = getGoogleAdsCustomerFromContext(context as any);
    const campaignId = context.opts?.campaign_id as string | undefined;

    const submissions = await fetchLeadFormSubmissions(customer, campaignId);

    if (submissions.length > 0) {
      return submissions[0];
    }

    return {
      submission_id: '123456789',
      gclid: 'CjwKCAjw-example-gclid',
      submission_date_time: '2026-01-15 10:30:00',
      submission_fields: [
        { field_type: 'FULL_NAME', field_value: 'John Doe' },
        { field_type: 'EMAIL', field_value: 'john.doe@example.com' },
        { field_type: 'PHONE_NUMBER', field_value: '+1234567890' },
      ],
      campaign_id: '987654321',
      campaign_name: 'Example Campaign',
      ad_group_id: '456789123',
    };
  },
  event_info: {
    desc: 'Google Ads New Lead Form Submission Event Info',
    type: {
      type: 'hash',
      fields: {
        submission_id: { type: 'string' },
        gclid: { type: 'string' },
        submission_date_time: { type: 'string' },
        submission_fields: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                field_type: { type: 'string' },
                field_value: { type: 'string' },
              },
            },
          },
        },
        campaign_id: { type: 'string' },
        campaign_name: { type: 'string' },
        ad_group_id: { type: 'string' },
      },
    },
  },
});

export default NewLeadFormSubmissionTrigger;
