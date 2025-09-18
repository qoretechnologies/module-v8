import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { ACTIVE_DIRECTORY_APP_NAME, ActiveDirectoryError } from '../constants';
import { createActiveDirectoryClient } from '../helpers/constants';

const action = 'new_group';

const options = {
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

const NewGroup = QoreAppCreator.createLocalizedTrigger({
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

    const { filter } = context?.opts || {};

    const getItems = () => {
      return fetchLatestItems({
        token,
        filter,
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

    const { filter } = context?.opts || {};

    const items = await fetchLatestItems({
      token,
      filter,
    });

    return items?.length ? items[0] : null;
  },
  event_info: {
    desc: `Active Directory ${humanizeNameTitle(action)} Trigger Event Info`,
    type: {
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
        isAssignableToRole: { type: 'boolean' },
        mail: { type: 'string' },
        mailEnabled: { type: 'boolean' },
        mailNickname: { type: 'string' },
        membershipRule: { type: 'string' },
        membershipRuleProcessingState: { type: 'string' },
        onPremisesDomainName: { type: 'string' },
        onPremisesLastSyncDateTime: { type: 'string' },
        onPremisesNetBiosName: { type: 'string' },
        onPremisesSamAccountName: { type: 'string' },
        onPremisesSecurityIdentifier: { type: 'string' },
        onPremisesSyncEnabled: { type: 'boolean' },
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
        securityEnabled: { type: 'boolean' },
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
                isResolved: { type: 'boolean' },
                serviceInstance: { type: 'string' },
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
}): Promise<Record<string, any>[]> => {
  const maxResults = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;
  const { token, filter } = options;

  try {
    const client = createActiveDirectoryClient(token);

    let request = client
      .api('/groups')
      .select('*')
      .top(maxResults)
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

    const response = await request.get();

    return response.value;
  } catch (error) {
    throw new ActiveDirectoryError(
      `Failed to fetch latest items for ${action}: ${error.message || error}`
    );
  }
};

export default NewGroup;
