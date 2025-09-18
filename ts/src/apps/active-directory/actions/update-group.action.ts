import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ACTIVE_DIRECTORY_APP_NAME, ActiveDirectoryError } from '../constants';
import { createActiveDirectoryClient } from '../helpers/constants';
import { getActiveDirectoryGroupAllowedValues } from '../helpers/get-group-allowed-values';

const action = 'update_group';

const options = {
  group_id: {
    type: 'string',
    required: true,
    get_allowed_values: getActiveDirectoryGroupAllowedValues,
  },
  displayName: {
    type: 'string',
    required: false,
    preselected: true,
  },
  description: {
    type: 'string',
    required: false,
    preselected: true,
  },
  mailNickname: {
    type: 'string',
    required: false,
    preselected: true,
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
  },
  preferredLanguage: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: 'en-US', display_name: 'English (United States)' },
      { value: 'en-GB', display_name: 'English (United Kingdom)' },
      { value: 'es-ES', display_name: 'Spanish (Spain)' },
      { value: 'fr-FR', display_name: 'French (France)' },
      { value: 'de-DE', display_name: 'German (Germany)' },
      { value: 'it-IT', display_name: 'Italian (Italy)' },
      { value: 'pt-BR', display_name: 'Portuguese (Brazil)' },
      { value: 'ja-JP', display_name: 'Japanese (Japan)' },
      { value: 'zh-CN', display_name: 'Chinese (Simplified)' },
    ],
  },
  allowExternalSenders: {
    type: 'boolean',
    required: false,
    desc: 'Allow people external to the organization to send messages to the group',
  },
  autoSubscribeNewMembers: {
    type: 'boolean',
    required: false,
    desc: 'Automatically subscribe new members to receive email notifications',
  },
  hideFromAddressLists: {
    type: 'boolean',
    required: false,
    desc: 'Hide this group from address lists',
  },
  hideFromOutlookClients: {
    type: 'boolean',
    required: false,
    desc: 'Hide this group from Outlook clients',
  },
} satisfies TQoreOptions;

const updateGroup = QoreAppCreator.createLocalizedAction<typeof options>({
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

    const {
      displayName,
      description,
      mailNickname,
      visibility,
      preferredLanguage,
      allowExternalSenders,
      autoSubscribeNewMembers,
      hideFromAddressLists,
      hideFromOutlookClients,
    } = obj || {};

    try {
      const client = createActiveDirectoryClient(token);

      const requestBody: any = {
        ...(displayName && { displayName }),
        ...(description && { description }),
        ...(visibility && { visibility }),
        ...(preferredLanguage && { preferredLanguage }),
        ...(allowExternalSenders !== undefined && { allowExternalSenders }),
        ...(autoSubscribeNewMembers !== undefined && { autoSubscribeNewMembers }),
        ...(hideFromAddressLists !== undefined && { hideFromAddressLists }),
        ...(hideFromOutlookClients !== undefined && { hideFromOutlookClients }),
      };

      if (mailNickname !== undefined) {
        const mailNicknameRegex = /^[a-zA-Z0-9._-]+$/;
        if (!mailNicknameRegex.test(mailNickname)) {
          throw new ActiveDirectoryError(
            'Mail nickname must contain only letters, numbers, periods, hyphens, and underscores'
          );
        }
        requestBody.mailNickname = mailNickname;
      }

      if (Object.keys(requestBody).length === 0) {
        throw new ActiveDirectoryError('At least one field must be provided to update');
      }

      await client.api(`/groups/${group_id}`).patch(requestBody);

      const updatedGroup = await client.api(`/groups/${group_id}`).select('*').get();

      return omit(updatedGroup, ['@odata.context']);
    } catch (error) {
      if (error.code === 'Request_BadRequest') {
        if (error.message?.includes('mailNickname')) {
          throw new ActiveDirectoryError(
            'Mail nickname is already in use or invalid. Please choose a different one.'
          );
        }

        if (error.message?.includes('displayName')) {
          throw new ActiveDirectoryError(
            'Display name is invalid or already in use. Please choose a different one.'
          );
        }

        if (error.message?.includes('visibility')) {
          throw new ActiveDirectoryError(
            'Cannot change visibility for this group type. Some group types have fixed visibility settings.'
          );
        }
      }

      if (error.code === 'Request_ResourceNotFound') {
        throw new ActiveDirectoryError('Group not found. The group may have been deleted.');
      }

      if (error.code === 'Forbidden') {
        throw new ActiveDirectoryError(
          'Insufficient permissions to update this group or some properties cannot be modified.'
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
      allowExternalSenders: { type: 'boolean' },
      autoSubscribeNewMembers: { type: 'boolean' },
      hideFromAddressLists: { type: 'boolean' },
      hideFromOutlookClients: { type: 'boolean' },
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

export default updateGroup;
