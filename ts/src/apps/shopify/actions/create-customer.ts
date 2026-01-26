import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreAppActionOption,
  TQoreOptions,
  TQoreTypeObject,
} from '@qoretechnologies/ts-toolkit';
import { SHOPIFY_APP_NAME, TShopifyContextWithConn } from '../constants';
import {
  executeShopifyGraphQL,
  ShopifyError,
  transformShopifyResponse,
} from '../helpers/constants';
import { getShopifyTaxExemptionsAllowedValues } from '../helpers/get-tax-exemptions-allowed-values';
import { ShopifyCreateCustomerResponseType } from './response-types/create-customer.response';

const AddressOptionType = {
  type: 'hash',
  fields: {
    address1: {
      type: 'string',
      required: false,
    },
    address2: {
      type: 'string',
      required: false,
    },
    city: {
      type: 'string',
      required: false,
    },
    province: {
      type: 'string',
      required: false,
    },
    country: {
      type: 'string',
      required: false,
    },
    zip: {
      type: 'string',
      required: false,
    },
    firstName: {
      type: 'string',
      required: false,
    },
    lastName: {
      type: 'string',
      required: false,
    },
    company: {
      type: 'string',
      required: false,
    },
    phone: {
      type: 'string',
      required: false,
    },
  },
} satisfies TQoreTypeObject;

const MarketingOptInLevel = {
  type: 'string',
  required: false,
  allowed_values_creatable: true,
  allowed_values: [
    { display_name: 'Single Opt-In', value: 'SINGLE_OPT_IN' },
    { display_name: 'Double Opt-In', value: 'DOUBLE_OPT_IN' },
  ],
} satisfies TQoreAppActionOption;

const MarketingState = {
  type: 'string',
  required: true,
  allowed_values_creatable: true,
  allowed_values: [
    { display_name: 'Subscribed', value: 'SUBSCRIBED' },
    { display_name: 'Not Subscribed', value: 'NOT_SUBSCRIBED' },
    { display_name: 'Pending', value: 'PENDING' },
    { display_name: 'Unsubscribed', value: 'UNSUBSCRIBED' },
  ],
} satisfies TQoreAppActionOption;

const EmailMarketingConsentType = {
  type: 'hash',
  fields: {
    marketingState: MarketingState,
    marketingOptInLevel: MarketingOptInLevel,
  },
} satisfies TQoreTypeObject;

const SmsMarketingConsentType = {
  type: 'hash',
  fields: {
    marketingState: MarketingState,
    marketingOptInLevel: MarketingOptInLevel,
  },
} satisfies TQoreTypeObject;

const MetafieldType = {
  type: 'hash',
  fields: {
    namespace: {
      type: 'string',
      required: true,
    },
    key: {
      type: 'string',
      required: true,
    },
    value: {
      type: 'string',
      required: true,
    },
    type: {
      type: 'string',
      required: true,
    },
  },
} satisfies TQoreTypeObject;

const options = {
  email: {
    type: 'string',
    required: true,
  },
  phone: {
    type: 'string',
    required: false,
  },
  firstName: {
    type: 'string',
    preselected: true,
    required: false,
  },
  lastName: {
    type: 'string',
    preselected: true,
    required: false,
  },
  locale: {
    type: 'string',
    required: false,
  },
  note: {
    type: 'string',
    required: false,
  },
  taxExempt: {
    type: 'bool',
    required: false,
  },
  taxExemptions: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    required: false,
    element_allowed_values_creatable: true,
    get_element_allowed_values: getShopifyTaxExemptionsAllowedValues,
  },
  tags: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    required: false,
  },
  addresses: {
    type: {
      type: 'list',
      element_type: AddressOptionType,
    },
    required: false,
    desc: 'The addresses for a customer.',
  },
  emailMarketingConsent: {
    type: EmailMarketingConsentType,
    required: false,
  },
  smsMarketingConsent: {
    type: SmsMarketingConsentType,
    required: false,
  },
  metafields: {
    type: {
      type: 'list',
      element_type: MetafieldType,
    },
    required: false,
  },
} satisfies TQoreOptions;

type TCreateCustomerAddressInput = {
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  country?: string;
  zip?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
};

type TCreateCustomerInput = {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  locale?: string;
  note?: string;
  taxExempt?: boolean;
  taxExemptions?: string[];
  tags?: string[];
  addresses?: TCreateCustomerAddressInput[];
  emailMarketingConsent?: {
    marketingState: string;
    marketingOptInLevel?: string;
  };
  smsMarketingConsent?: {
    marketingState: string;
    marketingOptInLevel?: string;
  };
  metafields?: Array<{
    namespace: string;
    key: string;
    value: string;
    type: string;
  }>;
};

const createCustomer = async (context: TShopifyContextWithConn, data: TCreateCustomerInput) => {
  const createCustomerMutation = `
    mutation customerCreate($input: CustomerInput!) {
      customerCreate(input: $input) {
        customer {
          id
          email
          phone
          firstName
          lastName
          locale
          note
          taxExempt
          tags
          addresses {
            id
            formatted
            address1
            address2
            city
            province
            country
            zip
            firstName
            lastName
            company
            phone
          }
          emailMarketingConsent {
            marketingState
            marketingOptInLevel
            consentUpdatedAt
          }
          smsMarketingConsent {
            marketingState
            marketingOptInLevel
            consentUpdatedAt
          }
          metafields(first: 10) {
            edges {
              node {
                id
                namespace
                key
                value
                type
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const input: Record<string, any> = {};

  if (data.email) input.email = data.email;
  if (data.phone) input.phone = data.phone;
  if (data.firstName) input.firstName = data.firstName;
  if (data.lastName) input.lastName = data.lastName;
  if (data.locale) input.locale = data.locale;
  if (data.note) input.note = data.note;
  if (data.taxExempt !== undefined) input.taxExempt = data.taxExempt;
  if (data.taxExemptions && data.taxExemptions.length > 0) input.taxExemptions = data.taxExemptions;
  if (data.tags && data.tags.length > 0) input.tags = data.tags;

  if (data.addresses && data.addresses.length > 0) {
    input.addresses = data.addresses.map((address) => {
      const formattedAddress: Record<string, any> = {};

      if (address.address1) formattedAddress.address1 = address.address1;
      if (address.address2) formattedAddress.address2 = address.address2;
      if (address.city) formattedAddress.city = address.city;
      if (address.province) formattedAddress.province = address.province;
      if (address.country) formattedAddress.country = address.country;
      if (address.zip) formattedAddress.zip = address.zip;
      if (address.firstName) formattedAddress.firstName = address.firstName;
      if (address.lastName) formattedAddress.lastName = address.lastName;
      if (address.company) formattedAddress.company = address.company;
      if (address.phone) formattedAddress.phone = address.phone;

      return formattedAddress;
    });
  }

  if (data.emailMarketingConsent) {
    input.emailMarketingConsent = {
      marketingState: data.emailMarketingConsent.marketingState,
    };

    if (data.emailMarketingConsent.marketingOptInLevel) {
      input.emailMarketingConsent.marketingOptInLevel =
        data.emailMarketingConsent.marketingOptInLevel;
    }
  }

  if (data.smsMarketingConsent) {
    input.smsMarketingConsent = {
      marketingState: data.smsMarketingConsent.marketingState,
    };

    if (data.smsMarketingConsent.marketingOptInLevel) {
      input.smsMarketingConsent.marketingOptInLevel = data.smsMarketingConsent.marketingOptInLevel;
    }
  }

  if (data.metafields && data.metafields.length > 0) {
    input.metafields = data.metafields.map((metafield) => ({
      namespace: metafield.namespace,
      key: metafield.key,
      value: metafield.value,
      type: metafield.type,
    }));
  }

  const createCustomerResult = await executeShopifyGraphQL(context, createCustomerMutation, {
    input,
  });

  const userErrors = createCustomerResult.data?.customerCreate?.userErrors || [];
  if (userErrors.length > 0) {
    const errors = userErrors.map((err: { message: string }) => err.message).join('; ');
    throw new ShopifyError(`Failed to create customer: ${errors}`);
  }

  return createCustomerResult.data.customerCreate;
};

const CreateShopifyCustomer = QoreAppCreator.createLocalizedAction<typeof options>({
  action: 'create-customer',
  app: SHOPIFY_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (data, _opts, context) => {
    try {
      if (data?.emailMarketingConsent && !data?.email) {
        throw new ShopifyError('Email is required when providing email marketing consent');
      }

      if (data?.smsMarketingConsent && !data.phone) {
        throw new ShopifyError('Phone is required when providing SMS marketing consent');
      }

      if (!data?.email && !data?.phone) {
        throw new ShopifyError('Either email or phone is required to create a customer');
      }

      const result = await createCustomer(
        context as TShopifyContextWithConn,
        data as TCreateCustomerInput
      );

      return transformShopifyResponse(result);
    } catch (error) {
      if (error instanceof ShopifyError) {
        throw error;
      }
      throw new ShopifyError(`Failed to create Shopify customer: ${error.message}`, error);
    }
  },
  options,
  response_type: ShopifyCreateCustomerResponseType,
});

export default CreateShopifyCustomer;
