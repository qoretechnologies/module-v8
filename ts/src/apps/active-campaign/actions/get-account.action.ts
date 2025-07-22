import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ACTIVE_CAMPAIGN_APP_NAME, ActiveCampaignError } from '../constants';
import { activeCampaignApiClient } from '../helpers/constants';
import { getActiveCampaignAccountAllowedValues } from '../helpers/get-account-id-allowed-values';

const action = 'get_account';

const options = {
  id: {
    type: 'string',
    required: true,
    get_allowed_values: getActiveCampaignAccountAllowedValues,
  },
} satisfies TQoreOptions;

const getAccount = QoreAppCreator.createLocalizedAction<typeof options>({
  app: ACTIVE_CAMPAIGN_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, instance_url, id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'instance_url'],
      optionFields: ['id'],
      ErrorClass: ActiveCampaignError,
    });

    try {
      const response = await activeCampaignApiClient<{ account: Record<string, any> }>({
        token,
        url: instance_url,
        method: 'GET',
        path: `accounts/${id}`,
      });

      return response.account;
    } catch (error) {
      throw new ActiveCampaignError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      name: { type: 'string' },
      accountUrl: { type: 'string' },
      createdTimestamp: { type: 'string' },
      updatedTimestamp: { type: 'string' },
      links: {
        type: {
          type: 'list',
          element_type: { type: 'string' },
        },
      },
      id: { type: 'string' },
    },
  },
});

export default getAccount;
