import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ACTIVE_DIRECTORY_APP_NAME, ActiveDirectoryError } from '../constants';
import { createActiveDirectoryClient } from '../helpers/constants';

const action = 'create_group';

const options = {
  displayName: {
    type: 'string',
    required: true,
    preselected: true,
  },
  description: {
    type: 'string',
    required: false,
    preselected: true,
  },
  groupTypes: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    required: false,
    preselected: true,
    element_allowed_values: [
      {
        value: 'Unified',
        display_name: 'Microsoft 365 Group (Unified)',
        desc: 'Creates a Microsoft 365 group with modern collaboration features',
      },
      {
        value: 'DynamicMembership',
        display_name: 'Dynamic Group',
        desc: 'Group membership is automatically managed based on user or device attributes',
      },
    ],
  },
  mailEnabled: {
    type: 'boolean',
    required: true,
    preselected: true,
    default_value: false,
  },
  mailNickname: {
    type: 'string',
    required: true,
    preselected: true,
  },
  securityEnabled: {
    type: 'boolean',
    required: true,
    preselected: true,
    default_value: true,
  },
  isAssignableToRole: {
    type: 'boolean',
    required: false,
    preselected: true,
    default_value: false,
  },
  visibility: {
    type: 'string',
    required: false,
    allowed_values: [
      {
        value: 'Public',
        display_name: 'Public',
        desc: 'Anyone in the organization can see the group and its content',
      },
      {
        value: 'Private',
        display_name: 'Private',
        desc: 'Only group members can see the group and its content',
      },
      {
        value: 'HiddenMembership',
        display_name: 'Hidden Membership',
        desc: 'Group is visible but membership is hidden from non-members',
      },
    ],
    default_value: 'Private',
  },
} satisfies TQoreOptions;

const createGroup = QoreAppCreator.createLocalizedAction<typeof options>({
  app: ACTIVE_DIRECTORY_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, displayName, mailEnabled, mailNickname, securityEnabled } =
      getQoreContextRequiredValues({
        context: { ...context, opts: obj },
        connectionFields: ['token'],
        optionFields: ['displayName', 'mailEnabled', 'mailNickname', 'securityEnabled'],
        ErrorClass: ActiveDirectoryError,
      });

    const { description, groupTypes = [], isAssignableToRole, visibility } = obj || {};

    try {
      const client = createActiveDirectoryClient(token);

      const mailNicknameRegex = /^[a-zA-Z0-9._-]+$/;
      if (!mailNicknameRegex.test(mailNickname)) {
        throw new ActiveDirectoryError(
          'Mail nickname must contain only letters, numbers, periods, hyphens, and underscores'
        );
      }

      const requestBody: any = {
        displayName,
        mailEnabled,
        mailNickname,
        securityEnabled,
        groupTypes: groupTypes || [],
      };

      if (description) {
        requestBody.description = description;
      }

      if (isAssignableToRole !== undefined) {
        requestBody.isAssignableToRole = isAssignableToRole;
      }

      if (visibility) {
        requestBody.visibility = visibility;
      }

      if (groupTypes.includes('Unified')) {
        requestBody.mailEnabled = true;
        requestBody.securityEnabled = false;
      }

      const response = await client.api('/groups').post(requestBody);

      return omit(response, ['@odata.context']);
    } catch (error) {
      if (error.code === 'Request_BadRequest' && error.message?.includes('mailNickname')) {
        throw new ActiveDirectoryError(
          'Mail nickname is already in use or invalid. Please choose a different one.'
        );
      }

      if (error.code === 'Request_BadRequest' && error.message?.includes('displayName')) {
        throw new ActiveDirectoryError(
          'Display name is invalid or already in use. Please choose a different one.'
        );
      }

      throw new ActiveDirectoryError(
        `Failed to ${humanizeNameTitle(action)}: ${error.message || error}`
      );
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
});

export default createGroup;
