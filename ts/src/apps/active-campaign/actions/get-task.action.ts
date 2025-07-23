import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ACTIVE_CAMPAIGN_APP_NAME, ActiveCampaignError } from '../constants';
import { activeCampaignApiClient } from '../helpers/constants';
import { getActiveCampaignTaskAllowedValues } from '../helpers/get-task-id-allowed-values';

const action = 'get_task';

const options = {
  id: {
    type: 'string',
    required: true,
    get_allowed_values: getActiveCampaignTaskAllowedValues,
  },
} satisfies TQoreOptions;

const getTask = QoreAppCreator.createLocalizedAction<typeof options>({
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
      const response = await activeCampaignApiClient<{ dealTask: Record<string, any> }>({
        token,
        url: instance_url,
        method: 'GET',
        path: `dealTasks/${id}`,
      });

      return response.dealTask;
    } catch (error) {
      throw new ActiveCampaignError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      relid: { type: 'string' },
      reltype: { type: 'string' },
      dealTasktype: { type: 'string' },
      user: { type: 'string' },
      assignee: { type: 'string' },
      automation: { type: 'string' },
      cdate: { type: 'string' },
      duedate: { type: 'string' },
      edate: { type: 'string' },
      duration: { type: 'string' },
      status: { type: 'string' },
      title: { type: 'string' },
      note: { type: 'string' },
      donedate: { type: 'string' },
      doneAutomation: { type: 'string' },
      udate: { type: 'string' },
      owner: {
        type: {
          type: 'hash',
          fields: {
            type: { type: 'string' },
            id: { type: 'string' },
          },
        },
      },
      id: { type: 'string' },
      outcomeId: { type: 'number' },
      outcomeInfo: { type: 'string' },
      links: {
        type: {
          type: 'hash',
          fields: {
            activities: { type: 'string' },
            automation: { type: 'string' },
            dealTasktype: { type: 'string' },
            doneAutomation: { type: 'string' },
            notes: { type: 'string' },
            owner: { type: 'string' },
            taskNotifications: { type: 'string' },
            user: { type: 'string' },
            assignee: { type: 'string' },
          },
        },
      },
    },
  },
});

export default getTask;
