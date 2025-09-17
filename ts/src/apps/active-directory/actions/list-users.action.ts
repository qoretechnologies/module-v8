import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ACTIVE_DIRECTORY_APP_NAME, ActiveDirectoryError } from '../constants';
import { createActiveDirectoryClient, getActiveDirectoryFilterString } from '../helpers/constants';
import { getActiveDirectoryGroupAllowedValues } from '../helpers/get-group-allowed-values';

const action = 'list_users';

const options = {
  limit: {
    type: 'number',
    required: false,
    default_value: 20,
  },
  next_page_token: {
    type: 'string',
    required: false,
  },
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

const listUsers = QoreAppCreator.createLocalizedAction<typeof options>({
  app: ACTIVE_DIRECTORY_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: ActiveDirectoryError,
    });

    try {
      const client = createActiveDirectoryClient(token);
      const { limit = 20, filter, next_page_token, group_id } = obj || {};

      let request;

      if (group_id) {
        request = client
          .api(`/groups/${group_id}/members/microsoft.graph.user`)
          .select('*')
          .top(limit)
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
          .top(limit)
          .orderby('createdDateTime desc')
          .headers({ ConsistencyLevel: 'eventual' })
          .count(true);

        const filterString = getActiveDirectoryFilterString(filter);
        if (filterString) {
          request = request.filter(filterString);
        }
      }

      if (next_page_token) {
        request = request.skipToken(next_page_token);
      }

      const response = await request.get();

      let newPageToken = null;
      if (response['@odata.nextLink']) {
        const url = new URL(response['@odata.nextLink']);
        newPageToken = url.searchParams.get('$skiptoken') || undefined;
      }

      return {
        users: response.value,
        count: response['@odata.count'],
        next_page_token: newPageToken,
      };
    } catch (error) {
      throw new ActiveDirectoryError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
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
});

export default listUsers;
