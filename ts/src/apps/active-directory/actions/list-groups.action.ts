import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ACTIVE_DIRECTORY_APP_NAME, ActiveDirectoryError } from '../constants';
import { createActiveDirectoryClient } from '../helpers/constants';

const action = 'list_groups';

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
  filter: {
    type: {
      type: 'hash',
      fields: {
        field: {
          type: 'string',
          required: true,
          allowed_values: [
            { value: 'displayName', display_name: 'Display Name' },
            { value: 'description', display_name: 'Description' },
            { value: 'id', display_name: 'ID' },
            { value: 'mail', display_name: 'Email' },
            { value: 'mailNickname', display_name: 'Mail Nickname' },

            { value: 'groupTypes', display_name: 'Group Types' },
            { value: 'classification', display_name: 'Classification' },
            { value: 'visibility', display_name: 'Visibility' },

            { value: 'mailEnabled', display_name: 'Mail Enabled' },
            { value: 'securityEnabled', display_name: 'Security Enabled' },
            { value: 'isAssignableToRole', display_name: 'Is Assignable To Role' },
            { value: 'onPremisesSyncEnabled', display_name: 'On-Premises Sync Enabled' },

            { value: 'createdDateTime', display_name: 'Created Date Time' },
            { value: 'renewedDateTime', display_name: 'Renewed Date Time' },
            { value: 'expirationDateTime', display_name: 'Expiration Date Time' },
            { value: 'onPremisesLastSyncDateTime', display_name: 'Last Sync Date Time' },

            { value: 'preferredLanguage', display_name: 'Preferred Language' },
            { value: 'securityIdentifier', display_name: 'Security Identifier' },
            { value: 'membershipRule', display_name: 'Membership Rule' },
            {
              value: 'membershipRuleProcessingState',
              display_name: 'Membership Rule Processing State',
            },

            { value: 'onPremisesDomainName', display_name: 'On-Premises Domain Name' },
            { value: 'onPremisesNetBiosName', display_name: 'On-Premises NetBios Name' },
            {
              value: 'onPremisesSecurityIdentifier',
              display_name: 'On-Premises Security Identifier',
            },
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

const listGroups = QoreAppCreator.createLocalizedAction<typeof options>({
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
      const { limit = 20, filter, next_page_token } = obj || {};

      let request = client
        .api('/groups')
        .select('*')
        .top(limit)
        .headers({ ConsistencyLevel: 'eventual' })
        .orderby('createdDateTime desc')
        .count(true);

      if (filter?.field && filter?.value) {
        const operator = filter.operator || 'eq';

        if (['eq', 'ne'].includes(operator)) {
          request = request.filter(`${filter.field} ${operator} '${filter.value}'`);
        }

        if (['startsWith', 'endsWith'].includes(operator)) {
          request = request.filter(`${operator}(${filter.field}, '${filter.value}')`);
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
        groups: response.value,
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
      groups: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              deletedDateTime: { type: 'string' },
              classification: { type: 'string' },
              createdDateTime: { type: 'string' },
              creationOptions: {
                type: {
                  type: 'list',
                  element_type: { type: 'string' },
                },
              },
              description: { type: 'string' },
              displayName: { type: 'string' },
              expirationDateTime: { type: 'string' },
              groupTypes: {
                type: {
                  type: 'list',
                  element_type: { type: 'string' },
                },
              },
              isAssignableToRole: { type: 'bool' },
              mail: { type: 'string' },
              mailEnabled: { type: 'bool' },
              mailNickname: { type: 'string' },
              membershipRule: { type: 'string' },
              membershipRuleProcessingState: { type: 'string' },
              onPremisesDomainName: { type: 'string' },
              onPremisesLastSyncDateTime: { type: 'string' },
              onPremisesNetBiosName: { type: 'string' },
              onPremisesSamAccountName: { type: 'string' },
              onPremisesSecurityIdentifier: { type: 'string' },
              onPremisesSyncEnabled: { type: 'bool' },
              preferredDataLocation: { type: 'string' },
              preferredLanguage: { type: 'string' },
              proxyAddresses: {
                type: {
                  type: 'list',
                  element_type: { type: 'string' },
                },
              },
              renewedDateTime: { type: 'string' },
              resourceBehaviorOptions: {
                type: {
                  type: 'list',
                  element_type: { type: 'string' },
                },
              },
              resourceProvisioningOptions: {
                type: {
                  type: 'list',
                  element_type: { type: 'string' },
                },
              },
              securityEnabled: { type: 'bool' },
              securityIdentifier: { type: 'string' },
              theme: { type: 'string' },
              uniqueName: { type: 'string' },
              visibility: { type: 'string' },
              onPremisesProvisioningErrors: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      category: { type: 'string' },
                      occurredDateTime: { type: 'string' },
                      propertyCausingError: { type: 'string' },
                      value: { type: 'string' },
                    },
                  },
                },
              },
              serviceProvisioningErrors: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      createdDateTime: { type: 'string' },
                      isResolved: { type: 'bool' },
                      serviceInstance: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
});

export default listGroups;
