import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ACTIVE_CAMPAIGN_APP_NAME, ActiveCampaignError } from '../constants';
import { activeCampaignApiClient } from '../helpers/constants';
import { getActiveCampaignContactAllowedValues } from '../helpers/get-contact-id-allowed-values';

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
      const response = await activeCampaignApiClient<{ note: Record<string, any> }>({
        token,
        url: instance_url,
        method: 'POST',
        path: `notes`,
        body: {
          note: {
            reltype: 'Subscriber',
            note,
            relid: contact,
          },
        },
      });

      return response.note;
    } catch (error) {
      throw new ActiveCampaignError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      note: { type: 'string' },
      cdate: { type: 'string' },
      mdate: { type: 'string' },
      reltype: { type: 'string' },
      relid: { type: 'string' },
      userid: { type: 'string' },
      links: {
        type: {
          type: 'hash',
          fields: {
            activities: { type: 'string' },
            user: { type: 'string' },
            mentions: { type: 'string' },
            notes: { type: 'string' },
            owner: { type: 'string' },
          },
        },
      },
      owner: {
        type: {
          type: 'hash',
          fields: {
            type: { type: 'string' },
            id: { type: 'string' },
          },
        },
      },
      is_draft: { type: 'string' },
      id: { type: 'string' },
      user: { type: 'string' },
    },
  },
});

export default addContactNote;
