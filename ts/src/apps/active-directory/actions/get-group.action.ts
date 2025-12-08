import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ACTIVE_DIRECTORY_APP_NAME, ActiveDirectoryError } from '../constants';
import { createActiveDirectoryClient } from '../helpers/constants';
import { getActiveDirectoryGroupAllowedValues } from '../helpers/get-group-allowed-values';

const action = 'get_group';

const options = {
  group_id: {
    type: 'string',
    required: true,
    get_allowed_values: getActiveDirectoryGroupAllowedValues,
  },
} satisfies TQoreOptions;

const getGroup = QoreAppCreator.createLocalizedAction<typeof options>({
  app: ACTIVE_DIRECTORY_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, group_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['group_id'],
      ErrorClass: ActiveDirectoryError,
    });

    try {
      const client = createActiveDirectoryClient(token);

      const response = await client.api(`/groups/${group_id}`).select('*').get();

      return omit(response, ['@odata.context']);
    } catch (error) {
      throw new ActiveDirectoryError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
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
});

export default getGroup;
