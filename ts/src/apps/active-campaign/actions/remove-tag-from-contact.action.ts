import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ACTIVE_CAMPAIGN_APP_NAME, ActiveCampaignError } from '../constants';
import { activeCampaignClient } from '../helpers/constants';
import { getActiveCampaignContactAllowedValues } from '../helpers/get-contact-id-allowed-values';
import { getActiveCampaignContactTagAllowedValues } from '../helpers/get-tag-allowed-values';

const action = 'remove_tag_from_contact';

const options = {
  tag: {
    type: 'string',
    required: true,
    get_allowed_values: getActiveCampaignContactTagAllowedValues,
    depends_on: ['contact'],
  },
  contact: {
    type: 'string',
    required: true,
    on_change: ['refetch'],
    get_allowed_values: getActiveCampaignContactAllowedValues,
  },
} satisfies TQoreOptions;

const removeTagFromContact = QoreAppCreator.createLocalizedAction<typeof options>({
  app: ACTIVE_CAMPAIGN_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, instance_url, tag } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'instance_url'],
      optionFields: ['tag', 'contact'],
      ErrorClass: ActiveCampaignError,
    });

    try {
      const response = await activeCampaignClient.delete(`contactTags/${tag}`, {
token,
        baseUrl: instance_url
      });

      return response;
    } catch (error) {
      throw new ActiveCampaignError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
});

export default removeTagFromContact;
