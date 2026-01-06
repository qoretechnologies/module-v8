import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ACTIVE_CAMPAIGN_APP_NAME, ActiveCampaignError } from '../constants';
import { activeCampaignClient } from '../helpers/constants';
import { mapActiveCampaignAccountCustomFieldsToQoreOptions } from '../helpers/get-custom-field-type';
import { getActiveCampaignUserAllowedValues } from '../helpers/get-user-id-allowed-values';
import { AccountResponseType } from '../response-types';

const action = 'create_account';

const options = {
  name: {
    required: true,
    type: 'string',
  },
  accountUrl: {
    type: 'string',
    required: false,
    preselected: true,
  },
  owner: {
    type: 'string',
    required: false,
    get_allowed_values: getActiveCampaignUserAllowedValues,
  },
  fieldOptions: {
    type: {
      type: 'hash',
    },
    get_dynamic_type: async (context) => {
      const { token, instance_url } = getQoreContextRequiredValues({
        context,
        connectionFields: ['token', 'instance_url'],
        ErrorClass: ActiveCampaignError,
      });

      const mappedFields = await mapActiveCampaignAccountCustomFieldsToQoreOptions({
        token,
        url: instance_url,
      });

      return {
        type: 'hash',
        fields: mappedFields,
      };
    },
  },
} satisfies TQoreOptions;

const createAccount = QoreAppCreator.createLocalizedAction<typeof options>({
  app: ACTIVE_CAMPAIGN_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, instance_url, name } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'instance_url'],
      optionFields: ['name'],
      ErrorClass: ActiveCampaignError,
    });

    const { accountUrl, owner } = obj || {};
    const fieldOptions: Record<string, any> = obj?.fieldOptions || {};

    const fields = Object.keys(fieldOptions).map((key) => ({
      customFieldId: key,
      fieldValue: fieldOptions[key],
    }));

    try {
      const response = await activeCampaignClient.post<{ account: Record<string, any> }>(`accounts`, {
        account: {
          name,
          ...(accountUrl && { accountUrl }),
          ...(owner && { owner }),
          ...(fields?.length && { fields }),
        },
      }, {
        token,
        baseUrl: instance_url,
      });

      return response.account;
    } catch (error) {
      throw new ActiveCampaignError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: AccountResponseType,
});

export default createAccount;
