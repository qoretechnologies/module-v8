import { IQoreAppActionWithFunction } from '@qoretechnologies/ts-toolkit';
import {
  AddLineItemToShopifyOrder,
  AddTagToShopifyCustomer,
  CreateShopifyBlogEntry,
  CreateShopifyCompany,
  CreateShopifyCustomer,
  CreateShopifyDraftOrder,
  CreateShopifyFulfillment,
  CreateShopifyGiftCard,
  FindShopifyCustomer,
  FindShopifyOrder,
  FindShopifyProduct,
  FindShopifyVariant,
} from '../apps/shopify/actions';
import { getShopifyBlogIdAllowedValues } from '../apps/shopify/helpers/get-blog-id-allowed-values';
import { getShopifyCurrencyAllowedValues } from '../apps/shopify/helpers/get-currency-allowed-values';
import { getShopifyCustomerIdAllowedValues } from '../apps/shopify/helpers/get-customer-id-allowed-values';
import { getShopifyCustomerTagsAllowedValues } from '../apps/shopify/helpers/get-customer-tags-allowed-values';
import { getShopifyFulfillmentOrderIdAllowedValues } from '../apps/shopify/helpers/get-fulfillment-order-id-allowed-values';
import { getShopifyFulfillmentOrderLineItemIdAllowedValues } from '../apps/shopify/helpers/get-fulfillment-order-item-id-allowed-values';
import { getShopifyLocationIdAllowedValues } from '../apps/shopify/helpers/get-location-id-allowed-values';
import { getShopifyOrderIdAllowedValues } from '../apps/shopify/helpers/get-order-id-allowed-values';
import { getShopifyParentTransactionIdAllowedValues } from '../apps/shopify/helpers/get-parent-transaction-id-allowed-values';
import { getShopifyProductVariantIdAllowedValues } from '../apps/shopify/helpers/get-product-variant-id-allowed-values';
import { getShopifyProductIdAllowedValues } from '../apps/shopify/helpers/get-shopify-product-id-allowed-values';
import { getShopifyTaxExemptionsAllowedValues } from '../apps/shopify/helpers/get-tax-exemptions-allowed-values';
import { Debugger, DebugLevels } from '../utils/Debugger';

Debugger.level = DebugLevels.Verbose;

describe('Should test Shopify integration', () => {
  const shopifyShop = process.env.SHOPIFY_SHOP;
  const shopifyAccessToken = process.env.SHOPIFY_ACCESS_TOKEN;

  let timestamp: number;
  let customerId: string;
  let testTag: string;
  let replacementTag: string;
  let blogId: string;
  let variantId: string;
  let orderId: string;
  let currency: string;
  let fulfillmentOrderId: string;

  beforeAll(() => {
    if (!shopifyShop || !shopifyAccessToken) {
      throw new Error(
        'Shopify credentials are not provided. Set SHOPIFY_SHOP and SHOPIFY_ACCESS_TOKEN environment variables.'
      );
    }

    testTag = `test-tag`;
    replacementTag = `replacement-tag`;
    timestamp = Date.now();
  });

  describe('Should test Shopify allowed values functions', () => {
    it('Should get Shopify customer tags allowed values', async () => {
      const allowed_values = await getShopifyCustomerTagsAllowedValues({
        conn_opts: {
          shop: shopifyShop,
          token: shopifyAccessToken,
        } as any,
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get shopify parent transaction id allowed values', async () => {
      const allowed_values = await getShopifyParentTransactionIdAllowedValues({
        conn_opts: {
          shop: shopifyShop,
          token: shopifyAccessToken,
        } as any,
      });

      expect(allowed_values).toBeDefined();
    });

    it('Should get Shopify fulfillment order id allowed values', async () => {
      const allowed_values = await getShopifyFulfillmentOrderIdAllowedValues({
        conn_opts: {
          shop: shopifyShop,
          token: shopifyAccessToken,
        } as any,
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      if (allowed_values.length > 0) {
        fulfillmentOrderId = allowed_values[0].value;
      } else {
        console.warn(
          'No fulfillment orders found in store.' +
            'Create at least one fulfillment order in your Shopify admin to run the action tests.'
        );
      }
    });

    it('Should get Shopify fulfillment order item id allowed values', async () => {
      const allowed_values = await getShopifyFulfillmentOrderLineItemIdAllowedValues({
        conn_opts: {
          shop: shopifyShop,
          token: shopifyAccessToken,
        } as any,
        opts: {
          fulfillmentOrderId,
        } as any,
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get Shopify tax exemptions allowed values', async () => {
      const allowed_values = await getShopifyTaxExemptionsAllowedValues({
        conn_opts: {
          shop: shopifyShop,
          token: shopifyAccessToken,
        } as any,
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get Shopify product id allowed values', async () => {
      const allowed_values = await getShopifyProductIdAllowedValues({
        conn_opts: {
          shop: shopifyShop,
          token: shopifyAccessToken,
        } as any,
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get Shopify currency allowed values', async () => {
      const allowed_values = await getShopifyCurrencyAllowedValues({
        conn_opts: {
          shop: shopifyShop,
          token: shopifyAccessToken,
        } as any,
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      if (allowed_values.length > 0) {
        currency = allowed_values[0].value;
      } else {
        console.warn(
          'No currencies found in store. Create at least one currency in your Shopify admin to run the action tests.'
        );
      }
    });

    it('Should get Shopify location allowed values', async () => {
      const allowed_values = await getShopifyLocationIdAllowedValues({
        conn_opts: {
          shop: shopifyShop,
          token: shopifyAccessToken,
        } as any,
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get Shopify customer IDs allowed values', async () => {
      const allowed_values = await getShopifyCustomerIdAllowedValues({
        conn_opts: {
          shop: shopifyShop,
          token: shopifyAccessToken,
        } as any,
      });

      expect(allowed_values).toBeDefined();

      if (allowed_values.length > 0) {
        customerId = allowed_values[0].value;
      } else {
        console.warn(
          'No customers found in store. Create at least one customer in your Shopify admin to run the action tests.'
        );
      }
    });

    it('Should get Shopify blog IDs allowed values', async () => {
      const allowed_values = await getShopifyBlogIdAllowedValues({
        conn_opts: {
          shop: shopifyShop,
          token: shopifyAccessToken,
        } as any,
      });

      expect(allowed_values).toBeDefined();

      if (allowed_values.length > 0) {
        blogId = allowed_values[0].value;
      } else {
        console.warn(
          'No blogs found in store. Create at least one blog in your Shopify admin to run the action tests.'
        );
      }
    });

    it('Should get Shopify order IDs allowed values', async () => {
      const allowed_values = await getShopifyOrderIdAllowedValues({
        conn_opts: {
          shop: shopifyShop,
          token: shopifyAccessToken,
        } as any,
      });

      expect(allowed_values).toBeDefined();

      if (allowed_values.length > 0) {
        orderId = allowed_values.at(-1)!.value;
      } else {
        console.warn(
          'No orders found in store. Create at least one order in your Shopify admin to run the action tests.'
        );
      }
    });

    it('Should get Shopify product variant IDs allowed values', async () => {
      const allowed_values = await getShopifyProductVariantIdAllowedValues({
        conn_opts: {
          shop: shopifyShop,
          token: shopifyAccessToken,
        } as any,
      });

      expect(allowed_values).toBeDefined();

      if (allowed_values.length > 0) {
        variantId = allowed_values[0].value;
      } else {
        console.warn(
          'No product variants found in store. Create at least one product to run the action tests.'
        );
      }
    });
  });

  describe('Should test Shopify actions', () => {
    describe('Should test Shopify customer actions', () => {
      beforeAll(() => {
        if (!customerId) {
          throw new Error('No customers found. Skipping action tests.');
        }
      });
      it('Should add a tag to a customer', async () => {
        const action = AddTagToShopifyCustomer as IQoreAppActionWithFunction;
        const result = await action.api_function(
          {
            customerId,
            tags: [testTag],
            append: true,
          },
          undefined,
          {
            conn_opts: {
              shop: shopifyShop,
              token: shopifyAccessToken,
            } as any,
          }
        );
        expect(result).toBeDefined();
        expect(result.customer).toBeDefined();
        expect(result.customer.tags).toContain(testTag);
      });
      it('Should replace tags on a customer', async () => {
        const action = AddTagToShopifyCustomer as IQoreAppActionWithFunction;
        const result = await action.api_function(
          {
            customerId,
            tags: [replacementTag],
            append: false,
          },
          undefined,
          {
            conn_opts: {
              shop: shopifyShop,
              token: shopifyAccessToken,
            } as any,
          }
        );
        expect(result).toBeDefined();
        expect(result.customer).toBeDefined();
        expect(result.customer.tags).toContain(replacementTag);
        expect(result.customer.tags).not.toContain(testTag);
      });
    });
    describe('Should test Shopify blog actions', () => {
      const testTitle = `Test Blog Article ${timestamp}`;
      const testContent = '<p>This is a test blog article content created by automated tests.</p>';
      const testAuthor = 'Test Author';
      const testTags = ['test', 'automation', 'integration'];
      const testImageUrl =
        'https://images.pexels.com/photos/248797/pexels-photo-248797.jpeg?auto=compress&cs=tinysrgb&w=500';
      beforeAll(() => {
        if (!blogId) {
          throw new Error('No blogs found. Skipping action tests.');
        }
      });
      it('Should create a blog article with all options', async () => {
        const action = CreateShopifyBlogEntry as IQoreAppActionWithFunction;
        const fullTestTitle = `${testTitle} - Complete`;
        const result = await action.api_function(
          {
            blogId,
            title: fullTestTitle,
            content: testContent,
            author: testAuthor,
            tags: testTags,
            summary: 'This is a test summary for the blog article',
            published: true,
            image: {
              altText: 'Test image alt text',
              url: testImageUrl,
            },
          },
          undefined,
          {
            conn_opts: {
              shop: shopifyShop,
              token: shopifyAccessToken,
            } as any,
          }
        );
        expect(result).toBeDefined();
        expect(result.article).toBeDefined();
        expect(result.article.title).toBe(fullTestTitle);
        expect(result.article.author?.name).toBe(testAuthor);
        testTags.forEach((tag) => {
          expect(result.article.tags).toContain(tag);
        });
        expect(result.article.image).toBeDefined();
      });
    });
    describe('Should test adding line items to Shopify orders', () => {
      beforeAll(() => {
        if (!orderId || !variantId) {
          throw new Error('Order ID or Product Variant ID not found. Skipping action tests.');
        }
      });
      it('Should add a product variant to an order', async () => {
        const action = AddLineItemToShopifyOrder as IQoreAppActionWithFunction;
        const result = await action.api_function(
          {
            orderId,
            type: 'product',
            variantId,
            quantity: 1,
            allowDuplicates: true,
            notifyCustomer: false,
          },
          undefined,
          {
            conn_opts: {
              shop: shopifyShop,
              token: shopifyAccessToken,
            } as any,
          }
        );
        expect(result).toBeDefined();
        expect(result.addedItem).toBeDefined();
        expect(result.addedItem.quantity).toBe(1);
        expect(result.addedItem.title).toBeDefined();
        expect(result.order).toBeDefined();
      });
      it('Should add a custom item to an order', async () => {
        const action = AddLineItemToShopifyOrder as IQoreAppActionWithFunction;
        const result = await action.api_function(
          {
            orderId,
            type: 'custom_item',
            itemName: 'Custom Test Item',
            price: 29.99,
            currency,
            quantity: 1,
            isTaxable: true,
            isPhysical: true,
            reason: 'Adding custom item',
            notifyCustomer: false,
          },
          undefined,
          {
            conn_opts: {
              shop: shopifyShop,
              token: shopifyAccessToken,
            } as any,
          }
        );
        expect(result).toBeDefined();
        expect(result.addedItem).toBeDefined();
        expect(result.addedItem.title).toBe('Custom Test Item');
        expect(result.addedItem.quantity).toBe(1);
        expect(result.order).toBeDefined();
      });

      describe('Should test fulfillment creation', () => {
        it('Should get fulfilment order id', async () => {
          const allowed_values = await getShopifyFulfillmentOrderIdAllowedValues({
            conn_opts: {
              shop: shopifyShop,
              token: shopifyAccessToken,
            } as any,
          });

          expect(allowed_values).toBeDefined();
          expect(allowed_values.length).toBeGreaterThan(0);

          if (allowed_values.length > 0) {
            fulfillmentOrderId = allowed_values[0].value;
          }
        });

        it('Should create a fulfillment with a fulfillment order ID', async () => {
          const action = CreateShopifyFulfillment as IQoreAppActionWithFunction;

          const result = await action.api_function(
            {
              fulfillmentOrderId: fulfillmentOrderId,
              notifyCustomer: true,
              trackingInfo: {
                number: 'TRACK123456',
                company: 'USPS',
                url: 'https://tools.usps.com/go/TrackConfirmAction?tLabels=TRACK123456',
              },
              originAddress: {
                address1: '123 Fulfillment Street',
                city: 'Warehouse City',
                countryCode: 'US',
                provinceCode: 'NY',
                zip: '10001',
              },
              message: 'Test fulfillment created by automated test',
            },
            undefined,
            {
              conn_opts: {
                shop: shopifyShop,
                token: shopifyAccessToken,
              } as any,
            }
          );

          expect(result).toBeDefined();
          expect(result.fulfillment).toBeDefined();
          expect(result.fulfillment.id).toBeDefined();
          expect(result.fulfillment.status).toBeDefined();

          expect(result.fulfillment.trackingInfo).toBeDefined();
          expect(result.fulfillment.trackingInfo.length).toBeGreaterThan(0);
          expect(result.fulfillment.trackingInfo[0].number).toBe('TRACK123456');
          expect(result.fulfillment.trackingInfo[0].company).toBe('USPS');

          expect(result.fulfillment.originAddress).toBeDefined();
          expect(result.fulfillment.originAddress.address1).toBe('123 Fulfillment Street');
          expect(result.fulfillment.originAddress.countryCode).toBe('US');
        });
      });
    });
    describe('Should test company creation', () => {
      it('Should create a complete company with both contact and location', async () => {
        const action = CreateShopifyCompany as IQoreAppActionWithFunction;
        const companyName = `Complete Test Company ${timestamp}`;
        const result = await action.api_function(
          {
            companyName,
            note: 'Complete test company with all details',
            externalId: `complete-test-company-${timestamp}`,
            customerSince: new Date().toISOString(),
            contactProperties: {
              firstName: 'Complete',
              lastName: 'Test',
              email: `complete-test-${timestamp}@example.com`,
              title: 'CEO',
            },
            locationProperties: {
              locationName: `Main Office ${timestamp}`,
              shippingAddress: {
                address1: '456 Complete Street',
                address2: 'Suite 789',
                city: 'Complete City',
                provinceCode: 'CA',
                countryCode: 'US',
                zip: '90210',
              },
              billingSameAsShipping: false,
              billingAddress: {
                address1: '789 Billing Avenue',
                city: 'Billing City',
                provinceCode: 'NY',
                countryCode: 'US',
                zip: '10001',
              },
            },
          },
          undefined,
          {
            conn_opts: {
              shop: shopifyShop,
              token: shopifyAccessToken,
            } as any,
          }
        );
        expect(result).toBeDefined();
        expect(result.company.name).toBe(companyName);
        expect(result.company.mainContact).toBeDefined();
        expect(result.company.mainContact.customer).toBeDefined();
        expect(result.company.mainContact.customer.firstName).toBe('Complete');
        expect(result.company.mainContact.customer.lastName).toBe('Test');
      });
      it('Should create a company with name only', async () => {
        const action = CreateShopifyCompany as IQoreAppActionWithFunction;
        const companyName = `Only name Test Company ${timestamp}`;
        const result = await action.api_function(
          {
            companyName,
          },
          undefined,
          {
            conn_opts: {
              shop: shopifyShop,
              token: shopifyAccessToken,
            } as any,
          }
        );
        expect(result).toBeDefined();
        expect(result.company.name).toBe(companyName);
      });
    });
    describe('Should test customer creation', () => {
      it('Should create a complete customer with addresses and marketing consent', async () => {
        const action = CreateShopifyCustomer as IQoreAppActionWithFunction;
        const customerEmail = `test-customer-${timestamp}@example.com`;
        const phoneNumber = `+14083${timestamp.toString().slice(-6)}`;
        const result = await action.api_function(
          {
            email: customerEmail,
            phone: phoneNumber,
            firstName: 'Test',
            lastName: `Customer ${timestamp}`,
            taxExempt: true,
            taxExemptions: ['US_NY_RESELLER_EXEMPTION'],
            tags: ['test', `timestamp-${timestamp}`],
            note: 'Test customer created via automated test',
            locale: 'en-US',
            addresses: [
              {
                firstName: 'Test',
                lastName: `Customer ${timestamp}`,
                address1: '123 Main Street',
                address2: 'Apt 4B',
                city: 'New York',
                province: 'NY',
                country: 'US',
                zip: '10001',
                phone: phoneNumber,
                company: 'Test Company',
              },
              {
                firstName: 'Test',
                lastName: `Customer ${timestamp}`,
                address1: '456 Office Boulevard',
                city: 'Chicago',
                province: 'IL',
                country: 'US',
                zip: '60601',
              },
            ],
            emailMarketingConsent: {
              marketingState: 'SUBSCRIBED',
              marketingOptInLevel: 'SINGLE_OPT_IN',
            },
            smsMarketingConsent: {
              marketingState: 'SUBSCRIBED',
              marketingOptInLevel: 'SINGLE_OPT_IN',
            },
            metafields: [
              {
                namespace: 'custom',
                key: 'customer_source',
                value: 'automated_test',
                type: 'single_line_text_field',
              },
            ],
          },
          undefined,
          {
            conn_opts: {
              shop: shopifyShop,
              token: shopifyAccessToken,
            } as any,
          }
        );
        expect(result).toBeDefined();
        expect(result.customer).toBeDefined();
        expect(result.customer.email).toBe(customerEmail);
        expect(result.customer.firstName).toBe('Test');
        expect(result.customer.lastName).toContain('Customer');
        expect(result.customer.taxExempt).toBe(true);
        expect(result.customer.tags).toContain('test');
        expect(result.customer.addresses.length).toBeGreaterThanOrEqual(2);
        const mainAddress = result.customer.addresses[0];
        expect(mainAddress.address1).toBe('123 Main Street');
        expect(mainAddress.city).toBe('New York');
        expect(result.customer.emailMarketingConsent).toBeDefined();
        expect(result.customer.emailMarketingConsent.marketingState).toBe('SUBSCRIBED');
        expect(result.customer.smsMarketingConsent).toBeDefined();
        expect(result.customer.smsMarketingConsent.marketingState).toBe('SUBSCRIBED');
      });
    });
    describe('Should test draft order creation', () => {
      it('Should create a complete draft order with multiple line items', async () => {
        const action = CreateShopifyDraftOrder as IQoreAppActionWithFunction;
        const phone = `+14083${timestamp.toString().slice(-6)}`;
        const result = await action.api_function(
          {
            email: `test-customer-${timestamp}@example.com`,
            phone: phone,
            note: `Test draft order created at ${new Date().toISOString()}`,
            taxExempt: true,
            tags: ['test', `timestamp-${timestamp}`],
            shippingAddress: {
              firstName: 'Test',
              lastName: 'Customer',
              address1: '123 Test Street',
              address2: 'Suite 101',
              city: 'New York',
              province: 'NY',
              country: 'United States',
              zip: '10001',
            },
            billingAddress: {
              firstName: 'Test',
              lastName: 'Customer',
              address1: '123 Test Street',
              address2: 'Suite 101',
              city: 'New York',
              province: 'NY',
              country: 'United States',
              zip: '10001',
            },
            lineItems: [
              {
                title: `Custom Product ${timestamp}`,
                quantity: 2,
                originalUnitPrice: 19.99,
                sku: `CUSTOM-${timestamp}`,
                requiresShipping: true,
                taxable: true,
                weight: {
                  value: 1.5,
                  unit: 'KILOGRAMS',
                },
                customAttributes: [
                  {
                    key: 'color',
                    value: 'Blue',
                  },
                  {
                    key: 'material',
                    value: 'Cotton',
                  },
                ],
                appliedDiscount: {
                  title: 'Custom Discount',
                  description: 'Special discount for test',
                  value: 10,
                  valueType: 'PERCENTAGE',
                },
              },
              {
                variantId: variantId,
                quantity: 1,
              },
            ],
            shippingLine: {
              title: 'Standard Shipping',
              priceWithCurrency: {
                currencyCode: currency,
                amount: 5.0,
              },
              custom: true,
            },
            appliedDiscount: {
              title: 'Order Discount',
              description: 'Test order discount',
              value: 5.0,
              valueType: 'FIXED_AMOUNT',
            },
            customAttributes: [
              {
                key: 'source',
                value: 'api_test',
              },
              {
                key: 'requested_by',
                value: 'automated_test',
              },
            ],
            metafields: [
              {
                namespace: 'test',
                key: 'created_at',
                value: new Date().toISOString(),
                type: 'single_line_text_field',
              },
            ],
            visibleToCustomer: true,
          },
          undefined,
          {
            conn_opts: {
              shop: shopifyShop,
              token: shopifyAccessToken,
            } as any,
          }
        );
        expect(result).toBeDefined();
        expect(result.draftOrder).toBeDefined();
        expect(result.draftOrder.id).toBeDefined();
        expect(result.draftOrder.email).toContain(`test-customer-${timestamp}`);
        expect(result.draftOrder.lineItems).toBeDefined();
        expect(result.draftOrder.lineItems.length).toBeGreaterThanOrEqual(2);
        const customItem = result.draftOrder.lineItems.find((item: { title: string }) =>
          item.title.includes(`Custom Product ${timestamp}`)
        );
        expect(customItem).toBeDefined();
        expect(customItem.quantity).toBe(2);
        expect(customItem.sku).toBe(`CUSTOM-${timestamp}`);
        expect(customItem.appliedDiscount).toBeDefined();
        expect(customItem.appliedDiscount.valueType).toBe('PERCENTAGE');
        expect(result.draftOrder.shippingLine).toBeDefined();
        expect(result.draftOrder.shippingLine.title).toBe('Standard Shipping');
        expect(result.draftOrder.appliedDiscount).toBeDefined();
        expect(result.draftOrder.appliedDiscount.valueType).toBe('FIXED_AMOUNT');
        expect(result.draftOrder.customAttributes).toBeDefined();
        const sourceAttr = result.draftOrder.customAttributes.find(
          (attr: { key: string }) => attr.key === 'source'
        );
        expect(sourceAttr).toBeDefined();
        expect(sourceAttr.value).toBe('api_test');
      });
    });

    describe('Should test gift card creation', () => {
      it('Should create a basic gift card with only initial value', async () => {
        const action = CreateShopifyGiftCard as IQoreAppActionWithFunction;

        const result = await action.api_function(
          {
            initialValue: 50.0,
          },
          undefined,
          {
            conn_opts: {
              shop: shopifyShop,
              token: shopifyAccessToken,
            } as any,
          }
        );

        expect(result).toBeDefined();
        expect(result.giftCard).toBeDefined();
        expect(result.giftCard.id).toBeDefined();
        expect(result.giftCard.initialValue).toBeDefined();
        expect(result.giftCard.initialValue.amount).toBe('50.0');
        expect(result.giftCard.enabled).toBe(true);
      });

      it('Should create a gift card with a custom code', async () => {
        const action = CreateShopifyGiftCard as IQoreAppActionWithFunction;
        const customCode = `TEST${timestamp}`;

        const result = await action.api_function(
          {
            initialValue: 25.0,
            code: customCode,
          },
          undefined,
          {
            conn_opts: {
              shop: shopifyShop,
              token: shopifyAccessToken,
            } as any,
          }
        );

        expect(result).toBeDefined();
        expect(result.giftCard).toBeDefined();
        expect(result.giftCard.id).toBeDefined();
      });

      it('Should create a gift card with customer and note', async () => {
        const action = CreateShopifyGiftCard as IQoreAppActionWithFunction;

        const result = await action.api_function(
          {
            initialValue: 100.0,
            customerId: customerId,
            note: `Test gift card created at ${new Date().toISOString()}`,
          },
          undefined,
          {
            conn_opts: {
              shop: shopifyShop,
              token: shopifyAccessToken,
            } as any,
          }
        );

        expect(result).toBeDefined();
        expect(result.giftCard).toBeDefined();
        expect(result.giftCard.id).toBeDefined();
        expect(result.giftCard.customer).toBeDefined();
        expect(result.giftCard.customer.id).toBe(customerId);
        expect(result.giftCard.note).toBeDefined();
      });

      it('Should create a gift card with expiration date', async () => {
        const action = CreateShopifyGiftCard as IQoreAppActionWithFunction;

        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);

        const result = await action.api_function(
          {
            initialValue: 75.0,
            expiresOn: expiryDate,
          },
          undefined,
          {
            conn_opts: {
              shop: shopifyShop,
              token: shopifyAccessToken,
            } as any,
          }
        );

        expect(result).toBeDefined();
        expect(result.giftCard).toBeDefined();
        expect(result.giftCard.id).toBeDefined();
        expect(result.giftCard.expiresOn).toBeDefined();

        const expectedDateStr = expiryDate.toISOString().split('T')[0];
        const actualDateStr = new Date(result.giftCard.expiresOn).toISOString().split('T')[0];
        expect(actualDateStr).toBe(expectedDateStr);
      });
    });

    describe('Should test search actions', () => {
      it('Should search for customers', async () => {
        const action = FindShopifyCustomer as IQoreAppActionWithFunction;
        const result = await action.api_function(undefined, undefined, {
          conn_opts: {
            shop: shopifyShop,
            token: shopifyAccessToken,
          } as any,
        });

        expect(result).toBeDefined();
        expect(result.customers).toBeDefined();
        expect(result.customers.length).toBeGreaterThan(0);
      });

      it('Should search for orders', async () => {
        const action = FindShopifyOrder as IQoreAppActionWithFunction;
        const result = await action.api_function(undefined, undefined, {
          conn_opts: {
            shop: shopifyShop,
            token: shopifyAccessToken,
          } as any,
        });

        expect(result).toBeDefined();
        expect(result.orders).toBeDefined();
        expect(result.orders.length).toBeGreaterThan(0);
      });

      it('Should search for products', async () => {
        const action = FindShopifyProduct as IQoreAppActionWithFunction;
        const result = await action.api_function(undefined, undefined, {
          conn_opts: {
            shop: shopifyShop,
            token: shopifyAccessToken,
          } as any,
        });

        expect(result).toBeDefined();
        expect(result.products).toBeDefined();
        expect(result.products.length).toBeGreaterThan(0);
      });

      it('Should search for product variant', async () => {
        const action = FindShopifyVariant as IQoreAppActionWithFunction;
        const result = await action.api_function(undefined, undefined, {
          conn_opts: {
            shop: shopifyShop,
            token: shopifyAccessToken,
          } as any,
        });

        expect(result).toBeDefined();
        expect(result.variants).toBeDefined();
        expect(result.variants.length).toBeGreaterThan(0);
      });
    });
  });
});
