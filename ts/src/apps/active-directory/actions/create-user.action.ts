import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ACTIVE_DIRECTORY_APP_NAME, ActiveDirectoryError } from '../constants';
import { createActiveDirectoryClient } from '../helpers/constants';

const action = 'create_user';

const options = {
  displayName: {
    type: 'string',
    required: true,
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
    required: true,
    preselected: true,
  },
  userPrincipalName: {
    type: 'string',
    required: true,
    preselected: true,
  },
  password: {
    type: 'string',
    required: true,
    preselected: true,
  },
  forceChangePasswordNextSignIn: {
    type: 'bool',
    required: false,
    preselected: true,
    default_value: true,
  },
  forceChangePasswordNextSignInWithMfa: {
    type: 'bool',
    required: false,
    preselected: true,
    default_value: false,
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
    type: 'bool',
    required: false,
    default_value: true,
  },
  usageLocation: {
    type: 'string',
    required: false,
    allowed_values_creatable: true,
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

const createUser = QoreAppCreator.createLocalizedAction<typeof options>({
  app: ACTIVE_DIRECTORY_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, displayName, mailNickname, userPrincipalName, password } =
      getQoreContextRequiredValues({
        context: { ...context, opts: obj },
        connectionFields: ['token'],
        optionFields: ['displayName', 'mailNickname', 'userPrincipalName', 'password'],
        ErrorClass: ActiveDirectoryError,
      });

    const {
      givenName,
      surname,
      forceChangePasswordNextSignIn = true,
      forceChangePasswordNextSignInWithMfa = false,
      jobTitle,
      department,
      mobilePhone,
      mail,
      streetAddress,
      city,
      state,
      postalCode,
      country,
      accountEnabled = true,
      usageLocation,
    } = obj || {};

    try {
      const client = createActiveDirectoryClient(token);

      const upnRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!upnRegex.test(userPrincipalName)) {
        throw new ActiveDirectoryError(
          'User Principal Name must be a valid email format (user@domain.com)'
        );
      }

      const mailNicknameRegex = /^[a-zA-Z0-9._-]+$/;
      if (!mailNicknameRegex.test(mailNickname)) {
        throw new ActiveDirectoryError(
          'Mail nickname must contain only letters, numbers, periods, hyphens, and underscores'
        );
      }

      if (password.length < 8) {
        throw new ActiveDirectoryError('Password must be at least 8 characters long');
      }

      const requestBody: any = {
        displayName,
        mailNickname,
        userPrincipalName,
        accountEnabled,
        passwordProfile: {
          password,
          forceChangePasswordNextSignIn,
          forceChangePasswordNextSignInWithMfa,
        },
        ...(givenName && { givenName }),
        ...(surname && { surname }),
        ...(mail && { mail }),
        ...(jobTitle && { jobTitle }),
        ...(department && { department }),
        ...(mobilePhone && { mobilePhone }),
        ...(usageLocation && { usageLocation }),
        ...(streetAddress && { streetAddress }),
        ...(city && { city }),
        ...(state && { state }),
        ...(postalCode && { postalCode }),
        ...(country && { country }),
      };

      const response = await client.api('/users').post(requestBody);

      return omit(response, ['@odata.context']);
    } catch (error) {
      if (error.code === 'Request_BadRequest') {
        if (error.message?.includes('userPrincipalName')) {
          throw new ActiveDirectoryError(
            'User Principal Name is already in use or invalid. Please choose a different one.'
          );
        }

        if (error.message?.includes('mailNickname')) {
          throw new ActiveDirectoryError(
            'Mail nickname is already in use or invalid. Please choose a different one.'
          );
        }

        if (error.message?.includes('password')) {
          throw new ActiveDirectoryError(
            "Password does not meet complexity requirements. Ensure it has at least 8 characters and meets your organization's password policy."
          );
        }
      }

      if (error.code === 'Request_MultipleObjectsWithSameKeyValue') {
        throw new ActiveDirectoryError(
          'A user with this User Principal Name or Mail Nickname already exists.'
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
      accountEnabled: { type: 'bool' },
      createdDateTime: { type: 'string' },
      lastPasswordChangeDateTime: { type: 'string' },
      passwordPolicies: { type: 'string' },
      usageLocation: { type: 'string' },
      department: { type: 'string' },
      employeeId: { type: 'string' },
      employeeType: { type: 'string' },
      faxNumber: { type: 'string' },
      imAddresses: {
        type: {
          type: 'list',
          element_type: { type: 'string' },
        },
      },
      isResourceAccount: { type: 'bool' },
      onPremisesDistinguishedName: { type: 'string' },
      onPremisesDomainName: { type: 'string' },
      onPremisesImmutableId: { type: 'string' },
      onPremisesLastSyncDateTime: { type: 'string' },
      onPremisesSamAccountName: { type: 'string' },
      onPremisesSecurityIdentifier: { type: 'string' },
      onPremisesSyncEnabled: { type: 'bool' },
      onPremisesUserPrincipalName: { type: 'string' },
      otherMails: {
        type: {
          type: 'list',
          element_type: { type: 'string' },
        },
      },
      proxyAddresses: {
        type: {
          type: 'list',
          element_type: { type: 'string' },
        },
      },
      addresses: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              type: { type: 'string' },
              postOfficeBox: { type: 'string' },
              street: { type: 'string' },
              city: { type: 'string' },
              state: { type: 'string' },
              countryOrRegion: { type: 'string' },
              postalCode: { type: 'string' },
            },
          },
        },
      },
      assignedLicenses: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              disabledPlans: {
                type: {
                  type: 'list',
                  element_type: { type: 'string' },
                },
              },
              skuId: { type: 'string' },
            },
          },
        },
      },
      assignedPlans: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              assignedDateTime: { type: 'string' },
              capabilityStatus: { type: 'string' },
              service: { type: 'string' },
              servicePlanId: { type: 'string' },
            },
          },
        },
      },
    },
  },
});

export default createUser;
