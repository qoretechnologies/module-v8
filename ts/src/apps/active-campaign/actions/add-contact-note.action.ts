import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ACTIVE_CAMPAIGN_APP_NAME, ActiveCampaignError } from '../constants';
import { activeCampaignClient } from '../helpers/constants';
import { getActiveCampaignContactAllowedValues } from '../helpers/get-contact-id-allowed-values';
import { ContactNoteResponseType } from '../response-types';

const action = 'add_contact_note';

const options = {
  note: {
    type: 'string',
    required: true,
  },
  contact: {
    type: 'string',
    required: true,
    get_allowed_values: getActiveCampaignContactAllowedValues,
  },
} satisfies TQoreOptions;

const addContactNote = QoreAppCreator.createLocalizedAction<typeof options>({
  app: ACTIVE_CAMPAIGN_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, instance_url, note, contact } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'instance_url'],
      optionFields: ['note', 'contact'],
      ErrorClass: ActiveCampaignError,
    });

    try {
      const response = await activeCampaignClient.post<{ note: Record<string, any> }>(`notes`, {
        note: {
          reltype: 'Subscriber',
          note,
          relid: contact,
        },
      }, {
        token,
        baseUrl: instance_url,
      });

      return response.note;
    } catch (error) {
      throw new ActiveCampaignError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: ContactNoteResponseType,
});

export default addContactNote;
