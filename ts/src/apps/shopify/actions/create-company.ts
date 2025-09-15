import {
  EQoreAppActionCode,
  QoreAppCreator,
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
import { ShopifyCreateCompanyResponseType } from './response-types/create-company.response';

const AddressOptionType = {
  type: 'hash',
  fields: {
    address1: {
      type: 'string',
      required: true,
    },
    address2: {
      type: 'string',
      required: false,
    },
    city: {
      type: 'string',
      required: false,
    },
    zoneCode: {
      type: 'string',
      required: false,
    },
    countryCode: {
      type: 'string',
      required: true,
    },
    zip: {
      type: 'string',
      required: false,
    },
  },
} satisfies TQoreTypeObject;

const options = {
  companyName: {
    type: 'string',
    required: true,
  },
  externalId: {
    type: 'string',
    required: false,
  },
  note: {
    type: 'string',
    required: false,
  },
  customerSince: {
    type: 'string',
    required: false,
  },
  contactProperties: {
    type: {
      type: 'hash',
      fields: {
        firstName: {
          type: 'string',
          required: true,
        },
        lastName: {
          type: 'string',
          required: true,
        },
        email: {
          type: 'string',
          required: true,
        },
        phone: {
          type: 'string',
          required: false,
        },
        title: {
          type: 'string',
          required: false,
        },
        locale: {
          type: 'string',
          required: false,
        },
      },
    },
    required: false,
  },
  locationProperties: {
    type: {
      type: 'hash',
      fields: {
        locationName: {
          type: 'string',
          required: true,
        },
        phone: {
          type: 'string',
          required: false,
        },
        note: {
          type: 'string',
          required: false,
        },
        externalId: {
          type: 'string',
          required: false,
        },
        taxExempt: {
          type: 'bool',
          required: false,
        },
        taxRegistrationId: {
          type: 'string',
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
        locale: {
          type: 'string',
          required: false,
        },
        shippingAddress: {
          type: AddressOptionType,
          required: false,
          preselected: true,
        },
        billingSameAsShipping: {
          type: 'bool',
          required: false,
          preselected: true,
        },
        billingAddress: {
          type: AddressOptionType,
          required: false,
          preselected: true,
        },
      },
    },
    required: false,
  },
} satisfies TQoreOptions;

type TCreateCompanyAddressInput = {
  address1?: string;
  address2?: string;
  city?: string;
  zoneCode?: string;
  countryCode?: string;
  zip?: string;
};

type TCreateCompanyInput = {
  name: string;
  externalId?: string;
  note?: string;
  customerSince?: string;

  contactProperties?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    title?: string;
    locale?: string;
  };
  locationProperties?: {
    locationName: string;
    phone?: string;
    note?: string;
    externalId?: string;
    taxExempt?: boolean;
    taxRegistrationId?: string;
    taxExemptions?: string[];
    locale?: string;
    shippingAddress?: TCreateCompanyAddressInput;
    billingAddress?: TCreateCompanyAddressInput;
    billingSameAsShipping?: boolean;
  };
};

const createCompany = async (context: TShopifyContextWithConn, data: TCreateCompanyInput) => {
  const createCompanyMutation = `
    mutation companyCreate($input: CompanyCreateInput!) {
      companyCreate(input: $input) {
        company {
          id
          name
          externalId
          mainContact {
            id
            customer {
              id
              email
              firstName
              lastName
            }
          }
          contacts(first: 5) {
            edges {
              node {
                id
                customer {
                  email
                  firstName
                  lastName
                }
              }
            }
          }
          contactRoles(first: 5) {
            edges {
              node {
                id
                name
              }
            }
          }
          locations(first: 5) {
            edges {
              node {
                id
                name
                shippingAddress {
                  firstName
                  lastName
                  address1
                  city
                  province
                  zip
                  country
                }
              }
            }
          }
        }
        userErrors {
          field
          message
          code
        }
      }
    }
  `;

  const companyInput: Record<string, any> = {
    name: data.name,
  };

  if (data.externalId) companyInput.externalId = data.externalId;
  if (data.note) companyInput.note = data.note;
  if (data.customerSince) companyInput.customerSince = data.customerSince;

  const input: Record<string, any> = {
    company: companyInput,
  };

  if (data.contactProperties) {
    const contactInput: Record<string, any> = {
      firstName: data.contactProperties.firstName,
      lastName: data.contactProperties.lastName,
      email: data.contactProperties.email,
    };

    if (data.contactProperties.phone) contactInput.phone = data.contactProperties.phone;
    if (data.contactProperties.title) contactInput.title = data.contactProperties.title;
    if (data.contactProperties.locale) contactInput.locale = data.contactProperties.locale;

    input.companyContact = contactInput;
  }

  if (data.locationProperties) {
    const locationInput: Record<string, any> = {
      name: data.locationProperties.locationName,
    };

    if (data.locationProperties.phone) locationInput.phone = data.locationProperties.phone;
    if (data.locationProperties.note) locationInput.note = data.locationProperties.note;
    if (data.locationProperties.externalId)
      locationInput.externalId = data.locationProperties.externalId;
    if (data.locationProperties.taxExempt !== undefined)
      locationInput.taxExempt = data.locationProperties.taxExempt;
    if (data.locationProperties.taxRegistrationId)
      locationInput.taxRegistrationId = data.locationProperties.taxRegistrationId;
    if (data.locationProperties.taxExemptions && data.locationProperties.taxExemptions.length > 0)
      locationInput.taxExemptions = data.locationProperties.taxExemptions;
    if (data.locationProperties.locale) locationInput.locale = data.locationProperties.locale;

    if (
      data.locationProperties.shippingAddress &&
      Object.values(data.locationProperties.shippingAddress).some((val) => val !== undefined)
    ) {
      locationInput.shippingAddress = {};

      const shipping = data.locationProperties.shippingAddress;
      if (shipping.address1) locationInput.shippingAddress.address1 = shipping.address1;
      if (shipping.address2) locationInput.shippingAddress.address2 = shipping.address2;
      if (shipping.city) locationInput.shippingAddress.city = shipping.city;
      if (shipping.zoneCode) locationInput.shippingAddress.zoneCode = shipping.zoneCode;
      if (shipping.countryCode) locationInput.shippingAddress.countryCode = shipping.countryCode;
      if (shipping.zip) locationInput.shippingAddress.zip = shipping.zip;
    }

    if (data.locationProperties.billingSameAsShipping !== undefined) {
      locationInput.billingSameAsShipping = data.locationProperties.billingSameAsShipping;
    }

    if (
      data.locationProperties.billingAddress &&
      !data.locationProperties.billingSameAsShipping &&
      Object.values(data.locationProperties.billingAddress).some((val) => val !== undefined)
    ) {
      locationInput.billingAddress = {};

      const billing = data.locationProperties.billingAddress;
      if (billing.address1) locationInput.billingAddress.address1 = billing.address1;
      if (billing.address2) locationInput.billingAddress.address2 = billing.address2;
      if (billing.city) locationInput.billingAddress.city = billing.city;
      if (billing.zoneCode) locationInput.billingAddress.zoneCode = billing.zoneCode;
      if (billing.countryCode) locationInput.billingAddress.countryCode = billing.countryCode;
      if (billing.zip) locationInput.billingAddress.zip = billing.zip;
    }

    input.companyLocation = locationInput;
  }
  const createCompanyResult = await executeShopifyGraphQL(context, createCompanyMutation, {
    input,
  });

  const userErrors = createCompanyResult.data?.companyCreate?.userErrors || [];
  if (userErrors.length > 0) {
    const errors = userErrors.map((err: { message: string }) => err.message).join('; ');
    throw new ShopifyError(`Failed to create company: ${errors}`);
  }

  return createCompanyResult.data.companyCreate;
};

const CreateShopifyCompany = QoreAppCreator.createLocalizedAction<typeof options>({
  action: 'create-company',
  app: SHOPIFY_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (data, _opts, context) => {
    const { companyName, externalId, note, customerSince } = data || {};

    const contactProperties =
      (data?.contactProperties as TCreateCompanyInput['contactProperties']) || undefined;
    const locationProperties =
      (data?.locationProperties as TCreateCompanyInput['locationProperties']) || undefined;

    if (!companyName) {
      throw new ShopifyError('Company name is required');
    }

    if (
      contactProperties &&
      (!contactProperties.firstName || !contactProperties.lastName || !contactProperties.email)
    ) {
      throw new ShopifyError('First name, last name, and email are required for company contact');
    }

    if (locationProperties && !locationProperties.locationName) {
      throw new ShopifyError('Location name is required for company location');
    }

    try {
      const result = await createCompany(context as TShopifyContextWithConn, {
        name: companyName,
        externalId,
        note,
        customerSince,
        contactProperties,
        locationProperties,
      });

      return transformShopifyResponse(result);
    } catch (error) {
      if (error instanceof ShopifyError) {
        throw error;
      }
      throw new ShopifyError(`Failed to create Shopify company: ${error.message}`, error);
    }
  },
  options,
  response_type: ShopifyCreateCompanyResponseType,
});

export default CreateShopifyCompany;
