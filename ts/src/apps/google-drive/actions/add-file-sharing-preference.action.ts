import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_DRIVE_APP_NAME, GoogleDriveError } from '../constants';
import { createGoogleDriveClient } from '../helpers/constants';
import { getGoogleDriveFileIdAllowedValues } from '../helpers/get-file-id-allowed-values';
import {
  GOOGLE_DRIVE_SHARING_PRESETS,
  GoogleDriveSharingPreferencesAllowedValues,
  GoogleDriveSharingPreferencesMapping,
  GoogleDriveSharingPreset,
} from '../helpers/sharing-preferences-allowed-values';
import { getGoogleDriveUserDomainDefaultValue } from '../helpers/get-organization-domain-default-value';

const options = {
  file_id: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getGoogleDriveFileIdAllowedValues,
  },
  sharing_preference: {
    required: true,
    type: 'string',
    allowed_values: GoogleDriveSharingPreferencesAllowedValues,
    on_change: ['refetch'],
    get_dependent_options: (context) => {
      const sharing_preference = context?.opts?.sharing_preference as GoogleDriveSharingPreset;
      if (!sharing_preference) return {} as TQoreOptions;
      if (sharing_preference.startsWith('org_')) return organizationSharingOptions;
      if (sharing_preference === 'email') return emailSharingOptions;

      return {} as TQoreOptions;
    },
  },
} satisfies TQoreOptions;

const organizationSharingOptions = {
  organization_domain: {
    get_default_value: getGoogleDriveUserDomainDefaultValue,
    required: true,
    type: 'string',
  },
} satisfies TQoreOptions;

const emailSharingOptions = {
  email_address: {
    required: true,
    type: 'string',
  },
  sharing_role: {
    required: true,
    type: 'string',
    allowed_values: [
      { value: 'reader', display_name: 'Viewer' },
      { value: 'commenter', display_name: 'Commenter' },
      { value: 'writer', display_name: 'Editor' },
    ],
  },
} satisfies TQoreOptions;

const addFileSharingPreference = QoreAppCreator.createLocalizedAction<
  typeof options & Partial<typeof organizationSharingOptions & typeof emailSharingOptions>
>({
  app: GOOGLE_DRIVE_APP_NAME,
  action: 'add_file_sharing_preference',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, file_id, sharing_preference } = getQoreContextRequiredValues<{
      token: string;
      file_id: string;
      sharing_preference: string;
    }>({
      context: { ...context, opts: obj },
      optionFields: ['file_id', 'sharing_preference'],
      connectionFields: ['token'],
      ErrorClass: GoogleDriveError,
    });

    const organization_domain = obj?.organization_domain;
    const email_address = obj?.email_address;
    const sharing_role = obj?.sharing_role;

    if (sharing_preference.startsWith('org_') && !organization_domain) {
      throw new GoogleDriveError('Organization domain is required for organization-based sharing');
    }

    if (sharing_preference === 'email' && (!email_address || !sharing_role)) {
      throw new GoogleDriveError(
        'Email address and sharing role are required for email-based sharing'
      );
    }

    try {
      const driveClient = createGoogleDriveClient(token);

      let permissionData: Record<string, any> = {};

      if (sharing_preference in GoogleDriveSharingPreferencesMapping) {
        permissionData = GoogleDriveSharingPreferencesMapping[sharing_preference];

        if (permissionData.type === 'domain' && organization_domain) {
          permissionData.domain = organization_domain;
        }

        await driveClient.permissions.create({
          fileId: file_id,
          requestBody: permissionData,
        });

        return {
          success: true,
          file_id,
          sharing_preference,
          organization_domain: organization_domain || null,
          message:
            `File sharing preference set to` +
            `${GOOGLE_DRIVE_SHARING_PRESETS[sharing_preference as GoogleDriveSharingPreset]}`,
        };
      }

      if (sharing_preference === 'email') {
        permissionData = {
          type: 'user',
          role: sharing_role,
          emailAddress: email_address,
        };

        await driveClient.permissions.create({
          fileId: file_id,
          requestBody: permissionData,
          sendNotificationEmail: true,
        });

        return {
          success: true,
          file_id,
          sharing_preference,
          email_address,
          sharing_role,
          message: `File shared with ${email_address} as ${sharing_role}`,
        };
      }

      throw new GoogleDriveError(`Invalid sharing preference: ${sharing_preference}`);
    } catch (error) {
      throw new GoogleDriveError(
        `Failed to update file sharing preferences: ${error.message || error}`
      );
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      success: { type: 'bool' },
      file_id: { type: 'string' },
      sharing_preference: { type: 'string' },
      organization_domain: { type: 'string' },
      email_address: { type: 'string' },
      sharing_role: { type: 'string' },
      message: { type: 'string' },
    },
  },
});

export default addFileSharingPreference;
