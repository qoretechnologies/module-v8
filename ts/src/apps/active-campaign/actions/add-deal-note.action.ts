import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ACTIVE_CAMPAIGN_APP_NAME, ActiveCampaignError } from '../constants';
import { activeCampaignApiClient } from '../helpers/constants';
import { getActiveCampaignDealAllowedValues } from '../helpers/get-deal-id-allowed-values';

const action = 'add_deal_note';

const options = {
  note: {
    type: 'string',
    required: true,
  },
  deal: {
    type: 'string',
    required: true,
    get_allowed_values: getActiveCampaignDealAllowedValues,
  },
} satisfies TQoreOptions;

const addDealNote = QoreAppCreator.createLocalizedAction<typeof options>({
  app: ACTIVE_CAMPAIGN_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, instance_url, note, deal } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'instance_url'],
      optionFields: ['note', 'deal'],
      ErrorClass: ActiveCampaignError,
    });

    try {
      const response = await activeCampaignApiClient<{ note: Record<string, any> }>({
        token,
        url: instance_url,
        method: 'POST',
        path: `deals/${deal}/notes`,
        body: {
          note: {
            note,
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
      cdate: { type: 'string' },
      id: { type: 'string' },
      links: {
        type: {
          type: 'hash',
          fields: {
            activities: { type: 'string' },
            mentions: { type: 'string' },
            notes: { type: 'string' },
            owner: { type: 'string' },
            user: { type: 'string' },
          },
        },
      },
      mdate: { type: 'string' },
      note: { type: 'string' },
      owner: {
        type: {
          type: 'hash',
          fields: {
            id: { type: 'string' },
            type: { type: 'string' },
          },
        },
      },
      relid: { type: 'string' },
      reltype: { type: 'string' },
      user: { type: 'string' },
      userid: { type: 'string' },
    },
  },
});

export default addDealNote;
