import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ACTIVE_CAMPAIGN_APP_NAME, ActiveCampaignError } from '../constants';
import { activeCampaignClient } from '../helpers/constants';
import { getActiveCampaignTaskAllowedValues } from '../helpers/get-task-id-allowed-values';
import { TaskResponseType } from '../response-types';

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
      const response = await activeCampaignClient.get<{ dealTask: Record<string, any> }>(`dealTasks/${id}`, {
        token,
        baseUrl: instance_url,
      });

      return response.dealTask;
    } catch (error) {
      throw new ActiveCampaignError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: TaskResponseType,
});

export default getTask;
