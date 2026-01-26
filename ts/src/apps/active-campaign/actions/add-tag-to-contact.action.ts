import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ACTIVE_CAMPAIGN_APP_NAME, ActiveCampaignError } from '../constants';
import { activeCampaignClient } from '../helpers/constants';
import { getActiveCampaignContactAllowedValues } from '../helpers/get-contact-id-allowed-values';
import { getActiveCampaignTagAllowedValues } from '../helpers/get-tag-allowed-values';
import { ContactTagResponseType } from '../response-types';

const action = 'add_tag_to_contact';

const options = {
  tag: {
    type: 'string',
    required: true,
    get_allowed_values: getActiveCampaignTagAllowedValues,
  },
  contact: {
    type: 'string',
    required: true,
    get_allowed_values: getActiveCampaignContactAllowedValues,
  },
} satisfies TQoreOptions;

const addTagToContact = QoreAppCreator.createLocalizedAction<typeof options>({
  app: ACTIVE_CAMPAIGN_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, instance_url, tag, contact } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'instance_url'],
      optionFields: ['tag', 'contact'],
      ErrorClass: ActiveCampaignError,
    });

    try {
      const response = await activeCampaignClient.post<{ contactTag: Record<string, any> }>(`contactTags`, {
        contactTag: {
          contact,
          tag,
        },
      }, {
        token,
        baseUrl: instance_url,
      });

      return response.contactTag;
    } catch (error) {
      throw new ActiveCampaignError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: ContactTagResponseType,
});

export default addTagToContact;
