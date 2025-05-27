import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreMappedOptions,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_CONTACTS_APP_NAME, GoogleContactsError } from '../constants';
import { createGooglePeopleClient } from '../helpers/constants';
import { getGoogleContactsContactAllowedValues } from '../helpers/get-contact-allowed-values';
import { getGoogleContactsGroupAllowedValues } from '../helpers/get-group-allowed-values';

const options = {
  group_resource_name: {
    type: 'string',
    required: true,
    get_allowed_values: getGoogleContactsGroupAllowedValues,
  },
  contact_resource_name: {
    type: 'string',
    required: true,
    get_allowed_values: getGoogleContactsContactAllowedValues,
  },
} satisfies TQoreOptions;

const addContactToGroup = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_CONTACTS_APP_NAME,
  action: 'add_contact_to_group',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, group_resource_name, contact_resource_name } = getQoreContextRequiredValues<
      TQoreMappedOptions<typeof options> & { token: string }
    >({
      context: { ...context, opts: obj },
      optionFields: ['group_resource_name', 'contact_resource_name'],
      connectionFields: ['token'],
      ErrorClass: GoogleContactsError,
    });

    try {
      const client = createGooglePeopleClient(token);

      await client.contactGroups.members.modify({
        resourceName: group_resource_name,
        requestBody: {
          resourceNamesToAdd: [contact_resource_name],
        },
      });

      const groupResponse = await client.contactGroups.get({
        resourceName: group_resource_name,
      });

      const contactResponse = await client.people.get({
        resourceName: contact_resource_name,
        personFields: 'names,emailAddresses,phoneNumbers',
      });

      const contact = contactResponse.data;
      const group = groupResponse.data;

      const primaryName = contact.names?.[0];
      const contactDisplayName =
        primaryName?.displayName ||
        `${primaryName?.givenName || ''} ${primaryName?.familyName || ''}`.trim() ||
        'Unnamed Contact';
      const primaryEmail = contact.emailAddresses?.[0]?.value || null;
      const primaryPhone = contact.phoneNumbers?.[0]?.value || null;

      return {
        success: true,
        message: `Successfully added contact "${contactDisplayName}" to group "${group.name}"`,
        group: {
          resourceName: group.resourceName,
          name: group.name,
          groupType: group.groupType,
          memberCount: group.memberCount || 0,
        },
        contact: {
          resourceName: contact.resourceName,
          displayName: contactDisplayName,
          email: primaryEmail,
          phone: primaryPhone,
        },
      };
    } catch (error) {
      throw new GoogleContactsError(`Failed to add contact to group: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      success: { type: 'boolean' },
      message: { type: 'string' },
      group: {
        type: {
          type: 'hash',
          fields: {
            resourceName: { type: 'string' },
            name: { type: 'string' },
            groupType: { type: 'string' },
            memberCount: { type: 'number' },
          },
        },
      },
      contact: {
        type: {
          type: 'hash',
          fields: {
            resourceName: { type: 'string' },
            displayName: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
          },
        },
      },
    },
  } satisfies TQoreResponseType,
});

export default addContactToGroup;
