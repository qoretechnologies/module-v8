import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ACTIVE_CAMPAIGN_APP_NAME, ActiveCampaignError } from '../constants';
import { activeCampaignApiClient } from '../helpers/constants';
import { getActiveCampaignContactAllowedValues } from '../helpers/get-contact-id-allowed-values';
import { getActiveCampaignTagAllowedValues } from '../helpers/get-tag-allowed-values';

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
      const response = await activeCampaignApiClient<{ contactTag: Record<string, any> }>({
        token,
        url: instance_url,
        method: 'POST',
        path: `contactTags`,
        body: {
          contactTag: {
            contact,
            tag,
          },
        },
      });

      return response.contactTag;
    } catch (error) {
      throw new ActiveCampaignError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      cdate: { type: 'string' },
      contact: { type: 'string' },
      id: { type: 'string' },
      links: {
        type: {
          type: 'hash',
          fields: {
            contact: { type: 'string' },
            tag: { type: 'string' },
          },
        },
      },
      tag: { type: 'string' },
    },
  },
});

export default addTagToContact;
