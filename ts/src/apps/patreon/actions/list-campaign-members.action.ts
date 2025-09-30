import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { QueryBuilder } from 'patreon-api.ts';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { PATREON_APP_NAME, PatreonError } from '../constants';
import { createPatreonClient } from '../helpers/constants';
import { getPatreonCampaignAllowedValues } from '../helpers/get-campaign-allowed-values';

const action = 'list_campaign_members';

const options = {
  campaignId: {
    type: 'string',
    required: true,
    get_allowed_values: getPatreonCampaignAllowedValues,
  },
  count: {
    type: 'integer',
    required: false,
  },
  cursor: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const listCampaignMembers = QoreAppCreator.createLocalizedAction<typeof options>({
  app: PATREON_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, campaignId } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['campaignId'],
      ErrorClass: PatreonError,
    });

    const { count = 20, cursor } = obj || {};

    try {
      const client = createPatreonClient(token);
      const query = QueryBuilder.campaignMembers
        .setAttributes({
          member: [
            'campaign_lifetime_support_cents',
            'currently_entitled_amount_cents',
            'email',
            'full_name',
            'is_follower',
            'is_free_trial',
            'is_gifted',
            'last_charge_date',
            'last_charge_status',
            'lifetime_support_cents',
            'next_charge_date',
            'note',
            'patron_status',
            'pledge_cadence',
            'pledge_relationship_start',
            'will_pay_amount_cents',
          ],
        })
        .setRequestOptions({
          ...(cursor && { cursor }),
          count,
        });

      const response = await client.fetchCampaignMembers(campaignId, query);

      return {
        members: response.data.map((member) => {
          return {
            id: member.id,
            ...member.attributes,
          };
        }),
        total: response.meta?.pagination?.total,
        next_cursor: response.meta?.pagination?.cursors?.next || null,
      };
    } catch (error) {
      throw new PatreonError(`Failed to ${humanizeNameTitle(action)}: ${error?.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
  },
});

export default listCampaignMembers;
