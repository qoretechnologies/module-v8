// Copyright 2026 Qore Technologies, s.r.o.
import { createHash } from 'crypto';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_ADS_APP_NAME, GoogleAdsError } from '../constants';
import { CUSTOMER_ID_OPTION, getGoogleAdsErrorMessage } from '../helpers/constants';
import { getGoogleAdsCustomerListAllowedValues } from '../helpers/get-customer-list-allowed-values';

const action = 'remove_contacts_from_customer_list';

const normalizeEmail = (email: string): string => {
  let normalized = email.trim().toLowerCase();
  const [localPart, domain] = normalized.split('@');
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    const cleanLocal = localPart.replace(/\./g, '').replace(/\+.*$/, '');
    normalized = `${cleanLocal}@${domain}`;
  }
  return normalized;
};

const sha256Hash = (value: string): string => {
  return createHash('sha256').update(value).digest('hex');
};

const options = {
  ...CUSTOMER_ID_OPTION,
  user_list_id: {
    type: 'string',
    required: true,
    get_allowed_values: getGoogleAdsCustomerListAllowedValues,
    depends_on: ['customer_id'],
  },
  contacts: {
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          email: {
            type: 'string',
            required: false,
          },
          phone_number: {
            type: 'string',
            required: false,
          },
        },
      },
    },
    required: true,
  },
} satisfies TQoreOptions;

const removeContactsFromCustomerList = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_ADS_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, developer_token, customer_id, login_customer_id } = getQoreContextRequiredValues<{
      token: string;
      developer_token: string;
      customer_id: string;
      login_customer_id?: string;
    }>({
      context,
      connectionFields: ['token', 'developer_token'],
      optionFields: ['customer_id', 'user_list_id', 'contacts'],
      ErrorClass: GoogleAdsError,
    });

    const { user_list_id, contacts } = obj || {};

    if (!user_list_id) {
      throw new GoogleAdsError('User list ID is required');
    }

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      throw new GoogleAdsError('At least one contact is required');
    }

    const customerId = String(customer_id).replace(/-/g, '');

    try {
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`,
        'developer-token': developer_token,
        'Content-Type': 'application/json',
      };

      if (login_customer_id) {
        headers['login-customer-id'] = String(login_customer_id).replace(/-/g, '');
      }

      // Step 1: Create an offline user data job
      const createJobResponse = await fetch(
        `https://googleads.googleapis.com/v23/customers/${customerId}/offlineUserDataJobs:create`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            job: {
              type: 'CUSTOMER_MATCH_USER_LIST',
              customerMatchUserListMetadata: {
                userList: `customers/${customerId}/userLists/${user_list_id}`,
              },
            },
          }),
        }
      );

      if (!createJobResponse.ok) {
        const errorBody = await createJobResponse.text();
        throw new GoogleAdsError(`Failed to create offline user data job: ${errorBody}`);
      }

      const createJobData = await createJobResponse.json();
      const jobResourceName = createJobData.resourceName;

      if (!jobResourceName) {
        throw new GoogleAdsError('Failed to get job resource name from response');
      }

      // Step 2: Build user identifiers and add remove operations
      const operations = contacts.map((contact: { email?: string; phone_number?: string }) => {
        const userIdentifiers: Record<string, string>[] = [];

        if (contact.email) {
          userIdentifiers.push({
            hashedEmail: sha256Hash(normalizeEmail(contact.email)),
          });
        }

        if (contact.phone_number) {
          const normalizedPhone = contact.phone_number.trim().replace(/[\s-()]/g, '');
          userIdentifiers.push({
            hashedPhoneNumber: sha256Hash(normalizedPhone),
          });
        }

        return {
          remove: {
            userIdentifiers,
          },
        };
      });

      const addOpsResponse = await fetch(
        `https://googleads.googleapis.com/v23/${jobResourceName}:addOperations`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            operations,
            enablePartialFailure: true,
          }),
        }
      );

      if (!addOpsResponse.ok) {
        const errorBody = await addOpsResponse.text();
        throw new GoogleAdsError(`Failed to add operations to offline user data job: ${errorBody}`);
      }

      // Step 3: Run the job
      const runResponse = await fetch(
        `https://googleads.googleapis.com/v23/${jobResourceName}:run`,
        {
          method: 'POST',
          headers,
        }
      );

      if (!runResponse.ok) {
        const errorBody = await runResponse.text();
        throw new GoogleAdsError(`Failed to run offline user data job: ${errorBody}`);
      }

      return {
        job_resource_name: jobResourceName,
        user_list_id,
        contacts_removed: contacts.length,
        status: 'RUNNING',
      };
    } catch (error: unknown) {
      if (error instanceof GoogleAdsError) {
        throw error;
      }
      const message = getGoogleAdsErrorMessage(error);
      throw new GoogleAdsError(`Failed to remove contacts from customer list: ${message}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      job_resource_name: { type: 'string' },
      user_list_id: { type: 'string' },
      contacts_removed: { type: 'integer' },
      status: { type: 'string' },
    },
  },
});

export default removeContactsFromCustomerList;
