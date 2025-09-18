import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { ACTIVE_DIRECTORY_APP_NAME, ActiveDirectoryError } from '../constants';
import { createActiveDirectoryClient, getActiveDirectoryFilterString } from '../helpers/constants';
import { getActiveDirectoryGroupAllowedValues } from '../helpers/get-group-allowed-values';

const action = 'new_user';

const options = {
  group_id: {
    type: 'string',
    required: false,
    get_allowed_values: getActiveDirectoryGroupAllowedValues,
  },
  filter: {
    type: {
      type: 'hash',
      fields: {
        field: {
          type: 'string',
          required: true,
          allowed_values: [
            { value: 'displayName', display_name: 'Display Name' },
            { value: 'givenName', display_name: 'Given Name' },
            { value: 'jobTitle', display_name: 'Job Title' },
            { value: 'mail', display_name: 'Email' },
            { value: 'mobilePhone', display_name: 'Mobile Phone' },
            { value: 'officeLocation', display_name: 'Office Location' },
            { value: 'preferredLanguage', display_name: 'Preferred Language' },
            { value: 'surname', display_name: 'Surname' },
            { value: 'userPrincipalName', display_name: 'User Principal Name' },
            { value: 'id', display_name: 'ID' },
          ],
        },
        operator: {
          type: 'string',
          required: true,
          default_value: 'eq',
          allowed_values: [
            { value: 'eq', display_name: 'Equals' },
            { value: 'ne', display_name: 'Not Equals' },
            { value: 'startsWith', display_name: 'Starts With' },
            { value: 'endsWith', display_name: 'Ends With' },
          ],
        },
        value: {
          type: 'string',
          required: true,
        },
      },
    },
  },
} satisfies TQoreOptions;

const NewUser = QoreAppCreator.createLocalizedTrigger({
  app: ACTIVE_DIRECTORY_APP_NAME,
  action,
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: ActiveDirectoryError,
    });

    const { filter, group_id } = context?.opts || {};

    const getItems = () => {
      return fetchLatestItems({
        token,
        filter,
        group_id,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: `active_directory_${action}`,
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: ActiveDirectoryError,
    });

    const { filter, group_id } = context?.opts || {};

    const items = await fetchLatestItems({
      token,
      filter,
      group_id,
    });

    return items?.length ? items[0] : null;
  },
  event_info: {
    desc: `Active Directory ${humanizeNameTitle(action)} Trigger Event Info`,
    type: {
      type: 'hash',
      fields: {
        count: { type: 'number' },
        next_page_token: { type: 'string' },
        users: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                businessPhones: {
                  type: {
                    type: 'list',
                    element_type: { type: 'string' },
                  },
                },
                displayName: { type: 'string' },
                givenName: { type: 'string' },
                jobTitle: { type: 'string' },
                mail: { type: 'string' },
                mobilePhone: { type: 'string' },
                officeLocation: { type: 'string' },
                preferredLanguage: { type: 'string' },
                userPrincipalName: { type: 'string' },
                id: { type: 'string' },
              },
            },
          },
        },
      },
    },
  },
});

const fetchLatestItems = async (options: {
  token: string;
  filter: { field: string; operator: string; value: string } | undefined;
  group_id?: string;
}): Promise<Record<string, any>[]> => {
  const maxResults = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;
  const { token, filter, group_id } = options;

  try {
    const client = createActiveDirectoryClient(token);

    let request;

    if (group_id) {
      request = client
        .api(`/groups/${group_id}/members/microsoft.graph.user`)
        .select('*')
        .top(maxResults)
        .orderby('createdDateTime desc')
        .headers({ ConsistencyLevel: 'eventual' })
        .count(true);

      const filterString = getActiveDirectoryFilterString(filter);

      if (filterString) {
        request = request.filter(filterString);
      }
    } else {
      request = client
        .api('/users')
        .select('*')
        .top(maxResults)
        .headers({ ConsistencyLevel: 'eventual' })
        .count(true);

      const filterString = getActiveDirectoryFilterString(filter);
      if (filterString) {
        request = request.filter(filterString);
      }
    }

    const response = await request.get();

    return response.value;
  } catch (error) {
    throw new ActiveDirectoryError(
      `Failed to fetch latest items for ${action}: ${error.message || error}`
    );
  }
};

export default NewUser;
