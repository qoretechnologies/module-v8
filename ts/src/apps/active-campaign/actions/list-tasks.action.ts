import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ACTIVE_CAMPAIGN_APP_NAME, ActiveCampaignError } from '../constants';
import { activeCampaignApiClient } from '../helpers/constants';
import { getActiveCampaignUserAllowedValues } from '../helpers/get-user-id-allowed-values';

const action = 'list_tasks';

const options = {
  limit: {
    type: 'number',
    required: false,
    default_value: 20,
  },
  offset: {
    type: 'number',
    required: false,
  },
  assignee: {
    type: 'string',
    required: false,
    get_allowed_values: getActiveCampaignUserAllowedValues,
  },
  userid: {
    type: 'string',
    required: false,
    get_allowed_values: getActiveCampaignUserAllowedValues,
  },
  title: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const listTasks = QoreAppCreator.createLocalizedAction<typeof options>({
  app: ACTIVE_CAMPAIGN_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, instance_url } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'instance_url'],
      ErrorClass: ActiveCampaignError,
    });

    const { limit = 20, offset = 0, assignee, userid, title } = obj || {};

    try {
      const response = await activeCampaignApiClient({
        token,
        url: instance_url,
        method: 'GET',
        params: {
          limit: limit.toString(),
          offset: offset.toString(),
          ...(assignee && { ['filter[assignee_userid]']: assignee }),
          ...(userid && { ['filter[userid]']: userid }),
          ...(title && { ['filter[title]']: title }),
        },
        path: `dealTasks`,
      });

      return response;
    } catch (error) {
      throw new ActiveCampaignError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      dealTasks: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              duedate: { type: 'string' },
              edate: { type: 'string' },
              status: { type: 'number' },
              title: { type: 'string' },
              note: { type: 'string' },
              relid: { type: 'string' },
              reltype: { type: 'string' },
              dealTasktype: { type: 'string' },
              cdate: { type: 'string' },
              udate: { type: 'string' },
              automation: { type: 'string' },
              doneAutomation: { type: 'string' },
              user: { type: 'string' },
              assignee: { type: 'string' },
              owner: {
                type: {
                  type: 'hash',
                  fields: {
                    type: { type: 'string' },
                    id: { type: 'string' },
                  },
                },
              },
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
        },
      },
      meta: {
        type: {
          type: 'hash',
          fields: {
            total: { type: 'string' },
          },
        },
      },
    },
  },
});

export default listTasks;
