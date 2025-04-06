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
import { ShopifyCreateDraftOrderResponseType } from './response-types/create-draft-order.response';
import { getShopifyCurrencyAllowedValues } from '../helpers/get-currency-allowed-values';
import { getShopifyProductVariantIdAllowedValues } from '../helpers/get-product-variant-id-allowed-values';
import { getShopifyTaxExemptionsAllowedValues } from '../helpers/get-tax-exemptions-allowed-values';
import { getShopifyCustomerIdAllowedValues } from '../helpers/get-customer-id-allowed-values';

const MailingAddressType = {
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

const AttributeType = {
  type: 'hash',
  fields: {
    key: {
      type: 'string',
      required: true,
    },
    value: {
      type: 'string',
      required: true,
    },
  },
} satisfies TQoreTypeObject;

const MoneyInputType = {
  type: 'hash',
  fields: {
    amount: {
      type: 'float',
      required: true,
    },
    currencyCode: {
      type: 'string',
      required: true,
      allowed_values_creatable: true,
      get_allowed_values: getShopifyCurrencyAllowedValues,
    },
  },
} satisfies TQoreTypeObject;

const WeightInputType = {
  type: 'hash',
  fields: {
    value: {
      type: 'float',
      required: true,
      desc: 'The weight value',
    },
    unit: {
      type: 'string',
      required: true,
      desc: 'The weight unit',
      allowed_values: [
        { display_name: 'Kilograms', value: 'KILOGRAMS' },
        { display_name: 'Grams', value: 'GRAMS' },
        { display_name: 'Pounds', value: 'POUNDS' },
        { display_name: 'Ounces', value: 'OUNCES' },
      ],
    },
  },
} satisfies TQoreTypeObject;

const DraftOrderAppliedDiscountType = {
  type: 'hash',
  fields: {
    title: {
      type: 'string',
      required: false,
    },
    description: {
      type: 'string',
      required: false,
    },
    value: {
      type: 'float',
      required: true,
    },
    valueType: {
      type: 'string',
      required: true,
      allowed_values: [
        { display_name: 'Fixed Amount', value: 'FIXED_AMOUNT' },
        { display_name: 'Percentage', value: 'PERCENTAGE' },
      ],
    },
    amountWithCurrency: {
      type: MoneyInputType,
      required: false,
    },
  },
} satisfies TQoreTypeObject;

const PaymentTermsInputType = {
  type: 'hash',
  fields: {
    paymentTermsTemplateId: {
      type: 'string',
      required: false,
    },
    paymentSchedules: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            dueAt: {
              type: 'date',
              required: true,
            },
            amount: {
              type: 'float',
              required: false,
            },
            currencyCode: {
              type: 'string',
              required: false,
              desc: 'The currency for the payment',
              allowed_values_creatable: true,
              get_allowed_values: getShopifyCurrencyAllowedValues,
            },
            issuedAt: {
              type: 'date',
              required: false,
            },
          },
        },
      },
      required: false,
      desc: 'The payment schedules for the payment terms',
    },
  },
} satisfies TQoreTypeObject;

const PurchasingEntityInputType = {
  type: 'hash',
  fields: {
    customerId: {
      type: 'string',
      required: false,
    },
    companyId: {
      type: 'string',
      required: false,
    },
    companyLocationId: {
      type: 'string',
      required: false,
    },
    companyContactId: {
      type: 'string',
      required: false,
    },
  },
} satisfies TQoreTypeObject;

const ShippingLineInputType = {
  type: 'hash',
  fields: {
    price: {
      type: 'float',
      required: false,
    },
    priceWithCurrency: {
      type: MoneyInputType,
      required: false,
    },
    title: {
      type: 'string',
      required: false,
    },
    shippingRateHandle: {
      type: 'string',
      required: false,
    },
  },
} satisfies TQoreTypeObject;

const MetafieldInputType = {
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

const LocalizedFieldInputType = {
  type: 'hash',
  fields: {
    value: {
      type: 'string',
      required: true,
    },
    key: {
      type: 'string',
      required: true,
    },
    locale: {
      type: 'string',
      required: true,
    },
  },
} satisfies TQoreTypeObject;

const DraftOrderLineItemComponentInputType = {
  type: 'hash',
  fields: {
    quantity: {
      type: 'int',
      required: true,
    },
    variantId: {
      type: 'string',
      required: true,
      get_allowed_values: getShopifyProductVariantIdAllowedValues,
    },
  },
} satisfies TQoreTypeObject;

const DraftOrderLineItemInputType = {
  type: 'hash',
  fields: {
    variantId: {
      type: 'string',
      required: false,
    },
    quantity: {
      type: 'int',
      required: true,
    },
    title: {
      type: 'string',
      required: false,
    },
    originalUnitPrice: {
      type: 'float',
      required: false,
    },
    originalUnitPriceWithCurrency: {
      type: MoneyInputType,
      required: false,
    },
    sku: {
      type: 'string',
      required: false,
    },
    requiresShipping: {
      type: 'bool',
      required: false,
    },
    taxable: {
      type: 'bool',
      required: false,
    },
    weight: {
      type: WeightInputType,
      required: false,
    },
    customAttributes: {
      type: {
        type: 'list',
        element_type: AttributeType,
      },
      required: false,
    },
    appliedDiscount: {
      type: DraftOrderAppliedDiscountType,
      required: false,
    },
    generatePriceOverride: {
      type: 'bool',
      required: false,
    },
    priceOverride: {
      type: MoneyInputType,
      required: false,
    },
    components: {
      type: {
        type: 'list',
        element_type: DraftOrderLineItemComponentInputType,
      },
      required: false,
    },
    uuid: {
      type: 'string',
      required: false,
    },
  },
} satisfies TQoreTypeObject;

const options = {
  customerId: {
    type: 'string',
    required: false,
    get_allowed_values: getShopifyCustomerIdAllowedValues,
  },
  email: {
    type: 'string',
    required: false,
  },
  phone: {
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
    get_element_allowed_values: getShopifyTaxExemptionsAllowedValues,
  },
  tags: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    required: false,
  },
  shippingAddress: {
    type: MailingAddressType,
    required: false,
  },
  billingAddress: {
    type: MailingAddressType,
    required: false,
  },
  useCustomerDefaultAddress: {
    type: 'bool',
    required: false,
  },
  lineItems: {
    type: {
      type: 'list',
      element_type: DraftOrderLineItemInputType,
    },
    required: true,
  },
  appliedDiscount: {
    type: DraftOrderAppliedDiscountType,
    required: false,
  },
  shippingLine: {
    type: ShippingLineInputType,
    required: false,
  },
  customAttributes: {
    type: {
      type: 'list',
      element_type: AttributeType,
    },
    required: false,
  },
  allowDiscountCodesInCheckout: {
    type: 'bool',
    required: false,
  },
  acceptAutomaticDiscounts: {
    type: 'bool',
    required: false,
  },
  discountCodes: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    required: false,
  },
  metafields: {
    type: {
      type: 'list',
      element_type: MetafieldInputType,
    },
    required: false,
  },
  localizedFields: {
    type: {
      type: 'list',
      element_type: LocalizedFieldInputType,
    },
    required: false,
  },
  presentmentCurrencyCode: {
    type: 'string',
    required: false,
  },
  poNumber: {
    type: 'string',
    required: false,
  },
  paymentTerms: {
    type: PaymentTermsInputType,
    required: false,
  },
  purchasingEntity: {
    type: PurchasingEntityInputType,
    required: false,
  },
  reserveInventoryUntil: {
    type: 'date',
    required: false,
  },
  sourceName: {
    type: 'string',
    required: false,
  },
  visibleToCustomer: {
    type: 'bool',
    required: false,
  },
} satisfies TQoreOptions;

type TCreateDraftOrderInput = {
  customerId?: string;
  email?: string;
  phone?: string;
  note?: string;
  taxExempt?: boolean;
  taxExemptions?: string[];
  tags?: string[];
  shippingAddress?: Record<string, any>;
  billingAddress?: Record<string, any>;
  useCustomerDefaultAddress?: boolean;
  lineItems: Array<Record<string, any>>;
  appliedDiscount?: Record<string, any>;
  shippingLine?: Record<string, any>;
  customAttributes?: Array<Record<string, any>>;
  allowDiscountCodesInCheckout?: boolean;
  acceptAutomaticDiscounts?: boolean;
  discountCodes?: string[];
  metafields?: Array<Record<string, any>>;
  localizedFields?: Array<Record<string, any>>;
  presentmentCurrencyCode?: string;
  poNumber?: string;
  paymentTerms?: Record<string, any>;
  purchasingEntity?: Record<string, any>;
  reserveInventoryUntil?: Date;
  sourceName?: string;
  visibleToCustomer?: boolean;
};

const createDraftOrder = async (context: TShopifyContextWithConn, data: TCreateDraftOrderInput) => {
  const createDraftOrderMutation = `
  mutation draftOrderCreate($input: DraftOrderInput!) {
    draftOrderCreate(input: $input) {
      draftOrder {
        id
        name
        email
        phone
        taxExempt
        tags
        subtotalPrice
        totalPrice
        totalTax
        status
        createdAt
        updatedAt
        invoiceUrl
        customer {
          id
          firstName
          lastName
          email
        }
        lineItems(first: 50) {
          edges {
            node {
              id
              title
              quantity
              originalUnitPrice
              variantTitle
              vendor
              sku
              requiresShipping
              taxable
              product {
                id
                title
              }
              variant {
                id
                title
                sku
                price
              }
              appliedDiscount {
                title
                description
                value
                valueType
              }
              customAttributes {
                key
                value
              }
            }
          }
        }
        shippingLine {
          title
          price
          shippingRateHandle
        }
        shippingAddress {
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
        billingAddress {
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
        appliedDiscount {
          title
          description
          value
          valueType
        }
        customAttributes {
          key
          value
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

  if (data.customerId) input.customerId = data.customerId;
  if (data.email) input.email = data.email;
  if (data.phone) input.phone = data.phone;
  if (data.note) input.note = data.note;
  if (data.taxExempt !== undefined) input.taxExempt = data.taxExempt;
  if (data.taxExemptions && data.taxExemptions.length > 0) input.taxExemptions = data.taxExemptions;
  if (data.tags && data.tags.length > 0) input.tags = data.tags;
  if (data.useCustomerDefaultAddress !== undefined)
    input.useCustomerDefaultAddress = data.useCustomerDefaultAddress;
  if (data.allowDiscountCodesInCheckout !== undefined)
    input.allowDiscountCodesInCheckout = data.allowDiscountCodesInCheckout;
  if (data.acceptAutomaticDiscounts !== undefined)
    input.acceptAutomaticDiscounts = data.acceptAutomaticDiscounts;
  if (data.discountCodes && data.discountCodes.length > 0) input.discountCodes = data.discountCodes;
  if (data.presentmentCurrencyCode) input.presentmentCurrencyCode = data.presentmentCurrencyCode;
  if (data.poNumber) input.poNumber = data.poNumber;
  if (data.sourceName) input.sourceName = data.sourceName;
  if (data.visibleToCustomer !== undefined) input.visibleToCustomer = data.visibleToCustomer;
  if (data.reserveInventoryUntil)
    input.reserveInventoryUntil = data.reserveInventoryUntil.toISOString();

  if (data.shippingAddress) input.shippingAddress = data.shippingAddress;
  if (data.billingAddress) input.billingAddress = data.billingAddress;

  if (data.appliedDiscount) {
    input.appliedDiscount = {
      ...data.appliedDiscount,
      amount:
        data.appliedDiscount.amount ||
        (data.appliedDiscount.valueType === 'FIXED_AMOUNT'
          ? data.appliedDiscount.value
          : undefined),
    };
  }

  if (data.shippingLine) {
    const shippingLine: Record<string, any> = {};

    if (data.shippingLine.title) shippingLine.title = data.shippingLine.title;
    if (data.shippingLine.shippingRateHandle)
      shippingLine.shippingRateHandle = data.shippingLine.shippingRateHandle;

    if (data.shippingLine.priceWithCurrency) {
      shippingLine.priceWithCurrency = data.shippingLine.priceWithCurrency;
    } else if (data.shippingLine.price !== undefined) {
      shippingLine.price =
        typeof data.shippingLine.price === 'number'
          ? data.shippingLine.price
          : parseFloat(data.shippingLine.price);
    }

    input.shippingLine = shippingLine;
  }

  if (data.lineItems && data.lineItems.length > 0) {
    input.lineItems = data.lineItems.map((item) => {
      const lineItem: Record<string, any> = { ...item };

      if (lineItem.appliedDiscount) {
        lineItem.appliedDiscount = {
          ...lineItem.appliedDiscount,
          amount:
            lineItem.appliedDiscount.amount ||
            (lineItem.appliedDiscount.valueType === 'FIXED_AMOUNT'
              ? lineItem.appliedDiscount.value
              : undefined),
        };
      }

      return lineItem;
    });
  }

  if (data.customAttributes && data.customAttributes.length > 0) {
    input.customAttributes = data.customAttributes;
  }

  if (data.metafields && data.metafields.length > 0) {
    input.metafields = data.metafields;
  }

  if (data.localizedFields && data.localizedFields.length > 0) {
    input.localizedFields = data.localizedFields;
  }

  if (data.paymentTerms) input.paymentTerms = data.paymentTerms;

  if (data.purchasingEntity) input.purchasingEntity = data.purchasingEntity;

  const createDraftOrderResult = await executeShopifyGraphQL(context, createDraftOrderMutation, {
    input,
  });

  const userErrors = createDraftOrderResult.data?.draftOrderCreate?.userErrors || [];
  if (userErrors.length > 0) {
    const errors = userErrors.map((err: { message: string }) => err.message).join('; ');
    throw new ShopifyError(`Failed to create draft order: ${errors}`);
  }

  return createDraftOrderResult.data.draftOrderCreate;
};

export const CreateShopifyDraftOrder = QoreAppCreator.createLocalizedAction<typeof options>({
  action: 'create-draft-order',
  app: SHOPIFY_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (data, _opts, context) => {
    const lineItems = data?.lineItems as Array<Record<string, any>> | undefined;

    try {
      if (!lineItems || lineItems.length === 0) {
        throw new ShopifyError('At least one line item is required to create a draft order');
      }

      lineItems.forEach((item, index) => {
        if (!item.variantId && !item.title) {
          throw new ShopifyError(
            `Line item at index ${index} must have either a variantId (for product items) or a title (for custom items)`
          );
        }

        if (item.variantId) item.variantId = `gid://shopify/ProductVariant/${item.variantId}`;

        if (!item.quantity || item.quantity <= 0) {
          throw new ShopifyError(`Line item at index ${index} must have a quantity greater than 0`);
        }
      });

      const result = await createDraftOrder(
        context as TShopifyContextWithConn,
        { ...data, lineItems } as TCreateDraftOrderInput
      );

      return transformShopifyResponse(result);
    } catch (error) {
      if (error instanceof ShopifyError) {
        throw error;
      }
      throw new ShopifyError(`Failed to create Shopify draft order: ${error.message}`, error);
    }
  },
  options,
  response_type: ShopifyCreateDraftOrderResponseType,
});
