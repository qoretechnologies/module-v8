import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { BREVO_APP_NAME, BrevoError, extractBrevoError } from '../constants';
import { createBrevoClient } from '../helpers/constants';
import { getBrevoListAllowedValues } from '../helpers/get-list-allowed-values';

const action = 'get_list';

const options = {
  listId: {
    type: 'number',
    required: true,
    get_allowed_values: getBrevoListAllowedValues,
  },
} satisfies TQoreOptions;

const getList = QoreAppCreator.createLocalizedAction<typeof options>({
  app: BREVO_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, listId } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['listId'],
      connectionFields: ['token'],
      ErrorClass: BrevoError,
    });

    const client = createBrevoClient(token);

    try {
      const response = await client.contactsClient.getList(listId);

      return response.body;
    } catch (error) {
      throw new BrevoError(`Failed to ${humanizeNameTitle(action)}: ${extractBrevoError(error)}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'number' },
      name: { type: 'string' },
      totalBlacklisted: { type: 'number' },
      totalSubscribers: { type: 'number' },
      uniqueSubscribers: { type: 'number' },
      folderId: { type: 'number' },
      createdAt: { type: 'string' },
      campaignStats: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              campaignId: { type: 'number' },
              stats: {
                type: {
                  type: 'hash',
                  fields: {
                    uniqueClicks: { type: 'number' },
                    clickers: { type: 'number' },
                    complaints: { type: 'number' },
                    delivered: { type: 'number' },
                    sent: { type: 'number' },
                    softBounces: { type: 'number' },
                    hardBounces: { type: 'number' },
                    uniqueViews: { type: 'number' },
                    unsubscriptions: { type: 'number' },
                    viewed: { type: 'number' },
                    deferred: { type: 'number' },
                  },
                },
              },
            },
          },
        },
      },
      dynamicList: { type: 'boolean' },
    },
  },
});

export default getList;
