import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { QueryBuilder } from 'patreon-api.ts';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { PATREON_APP_NAME, PatreonError } from '../constants';
import { createPatreonClient } from '../helpers/constants';
import { getPatreonCampaignAllowedValues } from '../helpers/get-campaign-allowed-values';
import { getPatreonMemberAllowedValues } from '../helpers/get-member-allowed-values';

const action = 'get_member';

const options = {
  campaignId: {
    type: 'string',
    required: false,
    preselected: true,
    get_allowed_values: getPatreonCampaignAllowedValues,
    on_change: ['refetch'],
  },
  memberId: {
    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getPatreonMemberAllowedValues,
  },
} satisfies TQoreOptions;

const getMember = QoreAppCreator.createLocalizedAction<typeof options>({
  app: PATREON_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, memberId } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['memberId'],
      ErrorClass: PatreonError,
    });

    try {
      const client = createPatreonClient(token);
      const query = QueryBuilder.member.setAttributes({
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
      });

      const response = await client.fetchMember(memberId, query);

      return {
        id: response.data.id,
        ...response.data.attributes,
      };
    } catch (error) {
      throw new PatreonError(`Failed to ${humanizeNameTitle(action)}: ${error?.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      campaign_lifetime_support_cents: { type: 'integer' },
      currently_entitled_amount_cents: { type: 'integer' },
      email: { type: 'string' },
      full_name: { type: 'string' },
      is_follower: { type: 'boolean' },
      is_free_trial: { type: 'boolean' },
      is_gifted: { type: 'boolean' },
      last_charge_date: { type: 'string' },
      last_charge_status: { type: 'string' },
      lifetime_support_cents: { type: 'integer' },
      next_charge_date: { type: 'string' },
      note: { type: 'string' },
      patron_status: { type: 'string' },
      pledge_cadence: { type: 'integer' },
      pledge_relationship_start: { type: 'string' },
      will_pay_amount_cents: { type: 'integer' },
    },
  },
});

export default getMember;
