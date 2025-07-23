import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ACTIVE_CAMPAIGN_APP_NAME, ActiveCampaignError } from '../constants';
import { activeCampaignApiClient } from '../helpers/constants';
import { getActiveCampaignListAllowedValues } from '../helpers/get-list-id-allowed-values';

const action = 'get_list';

const options = {
  id: {
    type: 'string',
    required: true,
    get_allowed_values: getActiveCampaignListAllowedValues,
  },
} satisfies TQoreOptions;

const getList = QoreAppCreator.createLocalizedAction<typeof options>({
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

    try {
      const response = await activeCampaignApiClient<{ list: Record<string, any> }>({
        token,
        url: instance_url,
        method: 'GET',
        path: `lists/${id}`,
      });

      return response.list;
    } catch (error) {
      throw new ActiveCampaignError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      stringid: { type: 'string' },
      userid: { type: 'string' },
      name: { type: 'string' },
      cdate: { type: 'string' },
      p_use_tracking: { type: 'string' },
      p_use_analytics_read: { type: 'string' },
      p_use_analytics_link: { type: 'string' },
      p_use_twitter: { type: 'string' },
      p_use_facebook: { type: 'string' },
      p_embed_image: { type: 'string' },
      p_use_captcha: { type: 'string' },
      send_last_broadcast: { type: 'string' },
      private: { type: 'string' },
      analytics_domains: { type: 'string' },
      analytics_source: { type: 'string' },
      analytics_ua: { type: 'string' },
      twitter_token: { type: 'string' },
      twitter_token_secret: { type: 'string' },
      facebook_session: { type: 'string' },
      carboncopy: { type: 'string' },
      subscription_notify: { type: 'string' },
      unsubscription_notify: { type: 'string' },
      require_name: { type: 'string' },
      get_unsubscribe_reason: { type: 'string' },
      to_name: { type: 'string' },
      optinoptout: { type: 'string' },
      sender_name: { type: 'string' },
      sender_addr1: { type: 'string' },
      sender_addr2: { type: 'string' },
      sender_city: { type: 'string' },
      sender_state: { type: 'string' },
      sender_zip: { type: 'string' },
      sender_country: { type: 'string' },
      sender_phone: { type: 'string' },
      sender_url: { type: 'string' },
      sender_reminder: { type: 'string' },
      fulladdress: { type: 'string' },
      optinmessageid: { type: 'string' },
      optoutconf: { type: 'string' },
      deletestamp: { type: 'string' },
      udate: { type: 'string' },
      links: {
        type: {
          type: 'hash',
          fields: {
            contactGoalLists: { type: 'string' },
            user: { type: 'string' },
            addressLists: { type: 'string' },
          },
        },
      },
      id: { type: 'string' },
      user: { type: 'string' },
    },
  },
});

export default getList;
