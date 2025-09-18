import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ACTIVE_DIRECTORY_APP_NAME, ActiveDirectoryError } from '../constants';
import { createActiveDirectoryClient } from '../helpers/constants';
import { getActiveDirectoryUserAllowedValues } from '../helpers/get-user-allowed-values';

const action = 'update_user';

const options = {
  user_id: {
    type: 'string',
    required: true,
    get_allowed_values: getActiveDirectoryUserAllowedValues,
  },
  displayName: {
    type: 'string',
    required: false,
    preselected: true,
  },
  givenName: {
    type: 'string',
    required: false,
    preselected: true,
  },
  surname: {
    type: 'string',
    required: false,
    preselected: true,
  },
  mailNickname: {
    type: 'string',
    required: false,
    preselected: true,
  },
  jobTitle: {
    type: 'string',
    required: false,
    preselected: true,
  },
  department: {
    type: 'string',
    required: false,
    preselected: true,
  },
  mobilePhone: {
    type: 'string',
    required: false,
    preselected: true,
  },
  mail: {
    type: 'string',
    required: false,
    preselected: true,
  },
  streetAddress: {
    type: 'string',
    required: false,
  },
  city: {
    type: 'string',
    required: false,
  },
  state: {
    type: 'string',
    required: false,
  },
  postalCode: {
    type: 'string',
    required: false,
  },
  country: {
    type: 'string',
    required: false,
  },
  accountEnabled: {
    type: 'boolean',
    required: false,
    preselected: true,
  },
  usageLocation: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: 'US', display_name: 'United States' },
      { value: 'CA', display_name: 'Canada' },
      { value: 'GB', display_name: 'United Kingdom' },
      { value: 'DE', display_name: 'Germany' },
      { value: 'FR', display_name: 'France' },
      { value: 'AU', display_name: 'Australia' },
      { value: 'JP', display_name: 'Japan' },
      { value: 'IN', display_name: 'India' },
      { value: 'BR', display_name: 'Brazil' },
      { value: 'MX', display_name: 'Mexico' },
    ],
  },
} satisfies TQoreOptions;

const updateUser = QoreAppCreator.createLocalizedAction<typeof options>({
  app: ACTIVE_DIRECTORY_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, user_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['user_id'],
      ErrorClass: ActiveDirectoryError,
    });

    const {
      displayName,
      givenName,
      surname,
      mailNickname,
      jobTitle,
      department,
      mobilePhone,
      mail,
      streetAddress,
      city,
      state,
      postalCode,
      country,
      accountEnabled,
      usageLocation,
    } = obj || {};

    try {
      const client = createActiveDirectoryClient(token);

      const requestBody: any = {
        ...(displayName && { displayName }),
        ...(givenName && { givenName }),
        ...(surname && { surname }),
        ...(jobTitle && { jobTitle }),
        ...(department && { department }),
        ...(mobilePhone && { mobilePhone }),
        ...(mail && { mail }),
        ...(streetAddress && { streetAddress }),
        ...(city && { city }),
        ...(state && { state }),
        ...(postalCode && { postalCode }),
        ...(country && { country }),
        ...(accountEnabled !== undefined && { accountEnabled }),
        ...(usageLocation && { usageLocation }),
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

      await client.api(`/users/${user_id}`).patch(requestBody);

      const updatedUser = await client.api(`/users/${user_id}`).select('*').get();

      return omit(updatedUser, ['@odata.context']);
    } catch (error) {
      if (error.code === 'Request_BadRequest') {
        if (error.message?.includes('mailNickname')) {
          throw new ActiveDirectoryError(
            'Mail nickname is already in use or invalid. Please choose a different one.'
          );
        }

        if (error.message?.includes('mail')) {
          throw new ActiveDirectoryError(
            'Email address is invalid or already in use. Please choose a different one.'
          );
        }
      }

      if (error.code === 'Request_ResourceNotFound') {
        throw new ActiveDirectoryError('User not found. The user may have been deleted.');
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
      businessPhones: {
        type: {
          type: 'list',
          element_type: { type: 'string' },
        },
      },
      displayName: { type: 'string' },
      givenName: { type: 'string' },
      surname: { type: 'string' },
      jobTitle: { type: 'string' },
      mail: { type: 'string' },
      mobilePhone: { type: 'string' },
      officeLocation: { type: 'string' },
      preferredLanguage: { type: 'string' },
      userPrincipalName: { type: 'string' },
      mailNickname: { type: 'string' },
      accountEnabled: { type: 'boolean' },
      createdDateTime: { type: 'string' },
      lastPasswordChangeDateTime: { type: 'string' },
      usageLocation: { type: 'string' },
      department: { type: 'string' },
      streetAddress: { type: 'string' },
      city: { type: 'string' },
      state: { type: 'string' },
      postalCode: { type: 'string' },
      country: { type: 'string' },
    },
  },
});

export default updateUser;
