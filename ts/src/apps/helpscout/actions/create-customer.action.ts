import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { HELPSCOUT_APP_NAME, HelpScoutError } from '../constants';
import { helpScoutApiClient } from '../helpers/constants';
import { getHelpScoutOrganizationAllowedValues } from '../helpers/get-organization-allowed-values';

const action = 'create_customer';

export const HelpScoutGenderAllowedValues = [
  { display_name: 'Male', value: 'male' },
  { display_name: 'Female', value: 'female' },
  { display_name: 'Unknown', value: 'unknown' },
];

export const HelpScoutEmailTypeAllowedValues = [
  { display_name: 'Work', value: 'work' },
  { display_name: 'Home', value: 'home' },
  { display_name: 'Other', value: 'other' },
];

export const HelpScoutPhoneTypeAllowedValues = [
  { display_name: 'Work', value: 'work' },
  { display_name: 'Home', value: 'home' },
  { display_name: 'Mobile', value: 'mobile' },
  { display_name: 'Fax', value: 'fax' },
  { display_name: 'Pager', value: 'pager' },
  { display_name: 'Other', value: 'other' },
];

const options = {
  firstName: {
    type: 'string',
    required: false,
    preselected: true,
  },
  lastName: {
    type: 'string',
    required: false,
    preselected: true,
  },
  email: {
    type: 'string',
    required: false,
    preselected: true,
  },
  emailType: {
    type: 'string',
    required: false,
    allowed_values: HelpScoutEmailTypeAllowedValues,
    default_value: 'work',
    depends_on: ['email'],
    preselected: true,
  },
  phone: {
    type: 'string',
    required: false,
  },
  phoneType: {
    type: 'string',
    required: false,
    allowed_values: HelpScoutPhoneTypeAllowedValues,
    default_value: 'work',
    depends_on: ['phone'],
  },
  jobTitle: {
    type: 'string',
    required: false,
  },
  organizationId: {
    type: 'integer',
    required: false,
    get_allowed_values: getHelpScoutOrganizationAllowedValues,
  },
  location: {
    type: 'string',
    required: false,
  },
  background: {
    type: 'string',
    required: false,
  },
  gender: {
    type: 'string',
    required: false,
    allowed_values: HelpScoutGenderAllowedValues,
  },
  age: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'hash',
  fields: {
    customerId: { type: 'integer' },
  },
} satisfies TQoreResponseType;

const createHelpScoutCustomer = QoreAppCreator.createLocalizedAction<typeof options>({
  app: HELPSCOUT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: HelpScoutError,
    });

    const {
      firstName,
      lastName,
      email,
      emailType,
      phone,
      phoneType,
      jobTitle,
      organizationId,
      location,
      background,
      gender,
      age,
    } = obj || {};

    try {
      const body: Record<string, any> = {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(jobTitle && { jobTitle }),
        ...(organizationId && { organizationId }),
        ...(location && { location }),
        ...(background && { background }),
        ...(gender && { gender }),
        ...(age && { age }),
      };

      if (email) {
        body.emails = [
          {
            type: emailType || 'work',
            value: email,
          },
        ];
      }

      if (phone) {
        body.phones = [
          {
            type: phoneType || 'work',
            value: phone,
          },
        ];
      }

      const { headers } = await helpScoutApiClient<{
        headers: { 'resource-id': string };
      }>({
        token,
        path: 'customers',
        getHeaderValues: true,
        method: 'POST',
        body,
      });

      return {
        customerId: parseInt(headers['resource-id'], 10),
      };
    } catch (error) {
      throw new HelpScoutError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default createHelpScoutCustomer;
