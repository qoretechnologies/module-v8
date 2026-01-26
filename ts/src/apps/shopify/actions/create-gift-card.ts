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
import { getShopifyCustomerIdAllowedValues } from '../helpers/get-customer-id-allowed-values';
import { ShopifyCreateGiftCardResponseType } from './response-types/create-gift-card.response';

const RecipientAttributesType = {
  type: 'hash',
  fields: {
    id: {
      type: 'string',
      required: false,
      get_allowed_values: getShopifyCustomerIdAllowedValues,
    },
    message: {
      type: 'string',
      required: false,
    },
    preferredName: {
      type: 'string',
      required: false,
    },
    sendNotificationAt: {
      type: 'date',
      required: false,
    },
  },
} satisfies TQoreTypeObject;

const options = {
  initialValue: {
    type: 'float',
    required: true,
  },
  customerId: {
    type: 'string',
    required: false,
    get_allowed_values: getShopifyCustomerIdAllowedValues,
  },
  note: {
    type: 'string',
    required: false,
  },
  expiresOn: {
    type: 'date',
    required: false,
  },
  code: {
    type: 'string',
    required: false,
  },
  templateSuffix: {
    type: 'string',
    required: false,
  },
  recipientAttributes: {
    type: RecipientAttributesType,
    required: false,
  },
} satisfies TQoreOptions;

type TCreateGiftCardInput = {
  initialValue: number;
  customerId?: string;
  note?: string;
  expiresOn?: Date;
  code?: string;
  templateSuffix?: string;
  recipientAttributes?: {
    id?: string;
    message?: string;
    preferredName?: string;
    sendNotificationAt?: Date;
  };
};

const createGiftCard = async (context: TShopifyContextWithConn, data: TCreateGiftCardInput) => {
  const createGiftCardMutation = `
    mutation giftCardCreate($input: GiftCardCreateInput!) {
      giftCardCreate(input: $input) {
        giftCard {
          id
          createdAt
          expiresOn
          balance {
            amount
            currencyCode
          }
          initialValue {
            amount
            currencyCode
          }
          enabled
          maskedCode
          lastCharacters
          note
          templateSuffix
          customer {
            id
            firstName
            lastName
            email
          }
          recipientAttributes {
            recipient {
              id
              firstName
              lastName
              email
            }
            message
            preferredName
            sendNotificationAt
          }
        }
        userErrors {
          message
          field
          code
        }
      }
    }
  `;

  const input: Record<string, any> = {
    initialValue: data.initialValue.toString(),
  };

  if (data.customerId) input.customerId = `gid://shopify/Customer/${data.customerId}`;
  if (data.note) input.note = data.note;
  if (data.expiresOn) input.expiresOn = new Date(data.expiresOn).toISOString().split('T')[0];
  if (data.code) input.code = data.code;
  if (data.templateSuffix) input.templateSuffix = data.templateSuffix;

  if (data.recipientAttributes) {
    const recipientAttributes: Record<string, any> = {};

    if (data.recipientAttributes.id)
      recipientAttributes.id = `gid://shopify/Customer/${data.recipientAttributes.id}`;
    if (data.recipientAttributes.message)
      recipientAttributes.message = data.recipientAttributes.message;
    if (data.recipientAttributes.preferredName)
      recipientAttributes.preferredName = data.recipientAttributes.preferredName;
    if (data.recipientAttributes.sendNotificationAt)
      recipientAttributes.sendNotificationAt =
        data.recipientAttributes.sendNotificationAt.toISOString();

    if (Object.keys(recipientAttributes).length > 0) {
      input.recipientAttributes = recipientAttributes;
    }
  }

  const createGiftCardResult = await executeShopifyGraphQL(context, createGiftCardMutation, {
    input,
  });

  const userErrors = createGiftCardResult.data?.giftCardCreate?.userErrors || [];
  if (userErrors.length > 0) {
    const errors = userErrors.map((err: { message: string }) => err.message).join('; ');
    throw new ShopifyError(`Failed to create gift card: ${errors}`);
  }

  return createGiftCardResult.data.giftCardCreate;
};

const CreateShopifyGiftCard = QoreAppCreator.createLocalizedAction<typeof options>({
  action: 'create-gift-card',
  app: SHOPIFY_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (data, _opts, context) => {
    const recipientAttributes = data?.recipientAttributes as
      | TCreateGiftCardInput['recipientAttributes']
      | undefined;

    try {
      if (data?.initialValue <= 0) {
        throw new ShopifyError('Initial value must be greater than 0');
      }

      if (data?.code) {
        if (data.code.length < 8 || data.code.length > 20) {
          throw new ShopifyError('Gift card code must be between 8 and 20 characters long');
        }

        if (!/^[a-zA-Z0-9]+$/.test(data.code)) {
          throw new ShopifyError('Gift card code can only contain letters and numbers');
        }
      }

      if (recipientAttributes?.sendNotificationAt) {
        const notificationDate = new Date(recipientAttributes.sendNotificationAt);
        if (notificationDate < new Date()) {
          throw new ShopifyError('Notification date must be in the future');
        }
      }

      const result = await createGiftCard(
        context as TShopifyContextWithConn,
        data as TCreateGiftCardInput
      );

      return transformShopifyResponse(result);
    } catch (error) {
      if (error instanceof ShopifyError) {
        throw error;
      }
      throw new ShopifyError(`Failed to create Shopify gift card: ${error.message}`, error);
    }
  },
  options,
  response_type: ShopifyCreateGiftCardResponseType,
});

export default CreateShopifyGiftCard;
