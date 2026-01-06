import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ACTIVE_CAMPAIGN_APP_NAME, ActiveCampaignError } from '../constants';
import { activeCampaignClient } from '../helpers/constants';
import { getActiveCampaignDealAllowedValues } from '../helpers/get-deal-id-allowed-values';
import { DealNoteResponseType } from '../response-types';

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
      const response = await activeCampaignClient.post<{ note: Record<string, any> }>(`deals/${deal}/notes`, {
        note: {
          note,
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
  response_type: DealNoteResponseType,
});

export default addDealNote;
