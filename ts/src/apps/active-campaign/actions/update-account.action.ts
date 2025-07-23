import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ACTIVE_CAMPAIGN_APP_NAME, ActiveCampaignError } from '../constants';
import { activeCampaignApiClient } from '../helpers/constants';
import { getActiveCampaignAccountAllowedValues } from '../helpers/get-account-id-allowed-values';
import { mapActiveCampaignAccountCustomFieldsToQoreOptions } from '../helpers/get-custom-field-type';
import { getActiveCampaignUserAllowedValues } from '../helpers/get-user-id-allowed-values';

const action = 'update_account';

const options = {
  id: {
    type: 'string',
    required: true,
    get_allowed_values: getActiveCampaignAccountAllowedValues,
  },
  name: {
    required: false,
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

const updateAccount = QoreAppCreator.createLocalizedAction<typeof options>({
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

    const { accountUrl, owner, name } = obj || {};
    const fieldOptions: Record<string, any> = obj?.fieldOptions || {};

    const fields = Object.keys(fieldOptions).map((key) => ({
      customFieldId: key,
      fieldValue: fieldOptions[key],
    }));

    try {
      const response = await activeCampaignApiClient<{ account: Record<string, any> }>({
        token,
        url: instance_url,
        method: 'PUT',
        path: `accounts/${id}`,
        body: {
          account: {
            ...(name && { name }),
            ...(accountUrl && { accountUrl }),
            ...(owner && { owner }),
            ...(fields?.length && { fields }),
          },
        },
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

export default updateAccount;
