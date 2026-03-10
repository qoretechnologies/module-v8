// Copyright 2026 Qore Technologies, s.r.o.
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { enums, MutateOperation, resources } from 'google-ads-api';
import { GOOGLE_ADS_APP_NAME, GoogleAdsError } from '../constants';
import { CUSTOMER_ID_OPTION, getGoogleAdsCustomerFromContext, getGoogleAdsErrorMessage } from '../helpers/constants';

const action = 'create_customer_list';

const options = {
  ...CUSTOMER_ID_OPTION,
  name: {
    type: 'string',
    required: true,
  },
  description: {
    type: 'string',
    required: false,
  },
  membership_life_span: {
    type: 'integer',
    required: false,
    default_value: 10000,
  },
} satisfies TQoreOptions;

const createCustomerList = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_ADS_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { customer } = getGoogleAdsCustomerFromContext(context as any, ['name']);

    const { name, description, membership_life_span = 10000 } = obj || {};

    if (!name) {
      throw new GoogleAdsError('Name is required to create a customer list');
    }

    try {
      const userListResource: resources.IUserList = {
        name,
        membership_life_span: membership_life_span,
        membership_status: enums.UserListMembershipStatus.OPEN,
        crm_based_user_list: {
          upload_key_type: enums.CustomerMatchUploadKeyType.CONTACT_INFO,
          data_source_type: enums.UserListCrmDataSourceType.FIRST_PARTY,
        },
      };

      if (description) {
        userListResource.description = description;
      }

      const operation: MutateOperation<resources.IUserList> = {
        entity: 'user_list',
        operation: 'create',
        resource: userListResource,
      };

      const response = await customer.mutateResources([operation]);

      const resourceName = response.mutate_operation_responses?.find(
        (r) => r.user_list_result?.resource_name
      )?.user_list_result?.resource_name;

      return {
        resource_name: resourceName ?? '',
        name,
        description: description ?? '',
        membership_life_span,
      };
    } catch (error: unknown) {
      if (error instanceof GoogleAdsError) {
        throw error;
      }
      const message = getGoogleAdsErrorMessage(error);
      throw new GoogleAdsError(`Failed to create customer list: ${message}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      resource_name: { type: 'string' },
      name: { type: 'string' },
      description: { type: 'string' },
      membership_life_span: { type: 'integer' },
    },
  },
});

export default createCustomerList;
