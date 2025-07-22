import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ACTIVE_CAMPAIGN_APP_NAME, ActiveCampaignError } from '../constants';
import { activeCampaignApiClient } from '../helpers/constants';
import { getActiveCampaignCampaignAllowedValues } from '../helpers/get-campaign-allowed-values';

const action = 'get_campaign';

const options = {
  id: {
    type: 'string',
    required: true,
    get_allowed_values: getActiveCampaignCampaignAllowedValues,
  },
} satisfies TQoreOptions;

const getCampaign = QoreAppCreator.createLocalizedAction<typeof options>({
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
      const response = await activeCampaignApiClient<{ campaign: Record<string, any> }>({
        token,
        url: instance_url,
        method: 'GET',
        path: `campaigns/${id}`,
      });

      return response.campaign;
    } catch (error) {
      throw new ActiveCampaignError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      type: { type: 'string' },
      userid: { type: 'string' },
      segmentid: { type: 'string' },
      bounceid: { type: 'string' },
      realcid: { type: 'string' },
      sendid: { type: 'string' },
      threadid: { type: 'string' },
      seriesid: { type: 'string' },
      formid: { type: 'string' },
      basetemplateid: { type: 'string' },
      basemessageid: { type: 'string' },
      addressid: { type: 'string' },
      source: { type: 'string' },
      name: { type: 'string' },
      cdate: { type: 'string' },
      mdate: { type: 'string' },
      sdate: { type: 'string' },
      ldate: { type: 'string' },
      send_amt: { type: 'string' },
      total_amt: { type: 'string' },
      opens: { type: 'string' },
      uniqueopens: { type: 'string' },
      linkclicks: { type: 'string' },
      uniquelinkclicks: { type: 'string' },
      subscriberclicks: { type: 'string' },
      forwards: { type: 'string' },
      uniqueforwards: { type: 'string' },
      hardbounces: { type: 'string' },
      softbounces: { type: 'string' },
      unsubscribes: { type: 'string' },
      unsubreasons: { type: 'string' },
      updates: { type: 'string' },
      socialshares: { type: 'string' },
      replies: { type: 'string' },
      uniquereplies: { type: 'string' },
      status: { type: 'string' },
      public: { type: 'string' },
      mail_transfer: { type: 'string' },
      mail_send: { type: 'string' },
      mail_cleanup: { type: 'string' },
      mailer_log_file: { type: 'string' },
      tracklinks: { type: 'string' },
      tracklinksanalytics: { type: 'string' },
      trackreads: { type: 'string' },
      trackreadsanalytics: { type: 'string' },
      analytics_campaign_name: { type: 'string' },
      tweet: { type: 'string' },
      facebook: { type: 'string' },
      survey: { type: 'string' },
      embed_images: { type: 'string' },
      htmlunsub: { type: 'string' },
      textunsub: { type: 'string' },
      htmlunsubdata: { type: 'string' },
      textunsubdata: { type: 'string' },
      recurring: { type: 'string' },
      willrecur: { type: 'string' },
      split_type: { type: 'string' },
      split_content: { type: 'string' },
      split_offset: { type: 'string' },
      split_offset_type: { type: 'string' },
      split_winner_messageid: { type: 'string' },
      split_winner_awaiting: { type: 'string' },
      responder_offset: { type: 'string' },
      responder_type: { type: 'string' },
      responder_existing: { type: 'string' },
      reminder_field: { type: 'string' },
      reminder_format: { type: 'string' },
      reminder_type: { type: 'string' },
      reminder_offset: { type: 'string' },
      reminder_offset_type: { type: 'string' },
      reminder_offset_sign: { type: 'string' },
      reminder_last_cron_run: { type: 'string' },
      activerss_interval: { type: 'string' },
      activerss_url: { type: 'string' },
      activerss_items: { type: 'string' },
      ip4: { type: 'string' },
      laststep: { type: 'string' },
      managetext: { type: 'string' },
      schedule: { type: 'string' },
      scheduleddate: { type: 'string' },
      waitpreview: { type: 'string' },
      deletestamp: { type: 'string' },
      replysys: { type: 'string' },
      created_timestamp: { type: 'string' },
      updated_timestamp: { type: 'string' },
      created_by: { type: 'string' },
      updated_by: { type: 'string' },
      ip: { type: 'string' },
      series_send_lock_time: { type: 'string' },
      can_skip_approval: { type: 'string' },
      use_quartz_scheduler: { type: 'string' },
      verified_opens: { type: 'string' },
      verified_unique_opens: { type: 'string' },
      segmentname: { type: 'string' },
      has_predictive_content: { type: 'string' },
      message_id: { type: 'string' },
      screenshot: { type: 'string' },
      campaign_message_id: { type: 'string' },
      ed_version: { type: 'string' },
      links: {
        type: {
          type: 'hash',
          fields: {
            user: { type: 'string' },
            automation: { type: 'string' },
            campaignMessage: { type: 'string' },
            campaignMessages: { type: 'string' },
            links: { type: 'string' },
            aggregateRevenues: { type: 'string' },
            segment: { type: 'string' },
            campaignLists: { type: 'string' },
          },
        },
      },
      id: { type: 'string' },
      user: { type: 'string' },
      automation: { type: 'string' },
    },
  },
});

export default getCampaign;
