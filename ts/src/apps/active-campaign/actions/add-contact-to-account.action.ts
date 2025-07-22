import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ACTIVE_CAMPAIGN_APP_NAME, ActiveCampaignError } from '../constants';
import { activeCampaignApiClient } from '../helpers/constants';
import { getActiveCampaignContactAllowedValues } from '../helpers/get-contact-id-allowed-values';
import { getActiveCampaignAccountAllowedValues } from '../helpers/get-account-id-allowed-values';

const action = 'add_contact_to_account';

const options = {
  account: {
    type: 'string',
    required: true,
    get_allowed_values: getActiveCampaignAccountAllowedValues,
  },
  contact: {
    type: 'string',
    required: true,
    get_allowed_values: getActiveCampaignContactAllowedValues,
  },
  jobTitle: {
    type: 'string',
    required: false,
    preselected: true,
  },
} satisfies TQoreOptions;

const addContactToAccount = QoreAppCreator.createLocalizedAction<typeof options>({
  app: ACTIVE_CAMPAIGN_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, instance_url, account, contact } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'instance_url'],
      optionFields: ['account', 'contact'],
      ErrorClass: ActiveCampaignError,
    });

    const jobTitle = obj?.jobTitle;

    try {
      const response = await activeCampaignApiClient<{ accountContact: Record<string, any> }>({
        token,
        url: instance_url,
        method: 'POST',
        path: `accountContacts`,
        body: {
          accountContact: {
            account,
            contact,
            ...(jobTitle && { jobTitle }),
          },
        },
      });

      return response.accountContact;
    } catch (error) {
      throw new ActiveCampaignError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      account: { type: 'number' },
      contact: { type: 'number' },
      jobTitle: { type: 'string' },
      createdTimestamp: { type: 'string' },
      updatedTimestamp: { type: 'string' },
      links: {
        type: {
          type: 'hash',
          fields: {
            account: { type: 'string' },
            contact: { type: 'string' },
          },
        },
      },
      id: { type: 'string' },
    },
  },
});

export default addContactToAccount;
