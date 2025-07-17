import { configDotenv } from 'dotenv';
import {
  GetWebflowCollection,
  GetWebflowItem,
  GetWebflowSite,
  ListWebflowCollections,
  ListWebflowCustomDomains,
  ListWebflowItems,
  ListWebflowSites,
} from '../apps/webflow/actions';
import { getWebflowCollectionAllowedValues } from '../apps/webflow/helpers/get-collection-allowed-values';
import { getWebflowCustomDomainAllowedValues } from '../apps/webflow/helpers/get-custom-domain-allowed-values';
import { getWebflowItemAllowedValues } from '../apps/webflow/helpers/get-item-id-allowed-values';
import { getWebflowCmsLocaleIdAllowedValues } from '../apps/webflow/helpers/get-locale-id-allowed-values';
import { getWebflowSiteIdAllowedValues } from '../apps/webflow/helpers/get-site-id-allowed-values';
import WebflowNewItem from '../apps/webflow/triggers/new-item.trigger';
import WebflowUpdatedItem from '../apps/webflow/triggers/updated-item.trigger';
import WebflowNewOrder from '../apps/webflow/triggers/new-order.trigger';

configDotenv({ path: '.env' });

describe('Webflow', () => {
  const base_context = {
    conn_opts: {
      token: '',
    } as any,
  };

  beforeAll(() => {
    const token = process.env.WEBFLOW_TOKEN;

    if (!token) {
      throw new Error(`Please set the WEBFLOW_TOKEN environment variable.`);
    }

    base_context.conn_opts.token = token;
  });

  let site: string | undefined;
  let collection: string | undefined;
  let item: string | undefined;
  // let createdItem: string | undefined;

  describe('Should test allowed values', () => {
    it('Should get site id allowed values', async () => {
      const allowed_values = await getWebflowSiteIdAllowedValues(base_context);
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      site = allowed_values[0].value;
    });

    it('Should get custom domain allowed values', async () => {
      const allowed_values = await getWebflowCustomDomainAllowedValues({
        ...base_context,
        opts: { site },
      });
      expect(allowed_values).toBeDefined();
    });

    it('Should get collection allowed values', async () => {
      const allowed_values = await getWebflowCollectionAllowedValues({
        ...base_context,
        opts: { site },
      });
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      collection =
        allowed_values.find((allowedValue) => allowedValue.display_name === 'Blog Posts')?.value ||
        allowed_values[0].value;
    });

    it('Should get cms locale id allowed values', async () => {
      const allowed_values = await getWebflowCmsLocaleIdAllowedValues({
        ...base_context,
        opts: { site },
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get item id allowed values', async () => {
      const allowed_values = await getWebflowItemAllowedValues({
        ...base_context,
        opts: { collection },
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      item = allowed_values[0].value;
    });
  });

  describe('Should test actions', () => {
    it('Should list sites', async () => {
      const action = ListWebflowSites;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({}, undefined, base_context);

      expect(result).toBeDefined();
      expect(Array.isArray(result.sites)).toBe(true);
      expect(result.sites.length).toBeGreaterThan(0);
    });

    it('Should get a single site', async () => {
      const action = GetWebflowSite;

      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!site) throw new Error('Site ID is not defined');

      const result = await action.api_function({ site }, undefined, base_context);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.id).toBe(site);
    });

    it('Should get custom domains for a site', async () => {
      const action = ListWebflowCustomDomains;

      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!site) throw new Error('Site ID is not defined');

      const result = await action.api_function({ site }, undefined, base_context);

      expect(result).toBeDefined();
      expect(Array.isArray(result.customDomains)).toBe(true);
    });

    it('Should list webflow collections', async () => {
      const action = ListWebflowCollections;

      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!site) throw new Error('Site ID is not defined');

      const result = await action.api_function({ site }, undefined, base_context);

      expect(result).toBeDefined();
      expect(Array.isArray(result.collections)).toBe(true);
      expect(result.collections.length).toBeGreaterThan(0);
    });

    it('Should get a single collection', async () => {
      const action = GetWebflowCollection;

      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!collection) throw new Error('Collection ID is not defined');

      const result = await action.api_function({ collection }, undefined, base_context);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.id).toBe(collection);
    });

    it('Should get items in a collection', async () => {
      const action = ListWebflowItems;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      if (!collection) throw new Error('Collection ID is not defined');

      const result = await action.api_function({ collection }, undefined, base_context);

      expect(result).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.items.length).toBeGreaterThan(0);
    });

    it('Should get a single item from a collection', async () => {
      const action = GetWebflowItem;

      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!collection) throw new Error('Collection ID is not defined');
      if (!item) throw new Error('Item ID is not defined');

      const result = await action.api_function({ item, collection }, undefined, base_context);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.id).toBe(item);
    });

    // Not available on free plan
    // it('Should create a new item in a collection', async () => {
    //   const action = CreateWebflowItem;

    //   if (!('api_function' in action)) throw new Error('api_function not found in action');
    //   if (!collection) throw new Error('Collection ID is not defined');

    //   const result = await action.api_function(
    //     {
    //       collection,
    //       name: 'Test Item',
    //       slug: 'test-item',
    //       'post-body': 'Smth',
    //     } as any,
    //     undefined,
    //     base_context
    //   );

    //   expect(result).toBeDefined();
    //   expect(result.id).toBeDefined();

    //   createdItem = result.id;
    // });

    // it('Should update an existing item in a collection', async () => {
    //   const action = CreateWebflowItem;

    //   if (!('api_function' in action)) throw new Error('api_function not found in action');
    //   if (!collection) throw new Error('Collection ID is not defined');
    //   if (!createdItem) throw new Error('Created Item ID is not defined');

    //   const result = await action.api_function(
    //     {
    //       collection,
    //       item: createdItem,
    //       'post-body': 'Updated content',
    //     } as any,
    //     undefined,
    //     base_context
    //   );

    //   expect(result).toBeDefined();
    //   expect(result.id).toBeDefined();
    //   expect(result.id).toBe(createdItem);
    // });

    // it('Should delete an item in a collection', async () => {
    //   const action = DeleteWebflowItem;

    //   if (!('api_function' in action)) throw new Error('api_function not found in action');
    //   if (!collection) throw new Error('Collection ID is not defined');
    //   if (!createdItem) throw new Error('Created Item ID is not defined');

    //   await action.api_function(
    //     {
    //       collection,
    //       item: createdItem,
    //     } as any,
    //     undefined,
    //     base_context
    //   );
    // });
  });

  describe('Should test triggers webhook registration', () => {
    describe('Should test new item webhook registration', () => {
      let webhook: { id: string } | undefined;
      it('Should register the new item webhook', async () => {
        const trigger = WebflowNewItem;

        if (!('webhook_register' in trigger) || !trigger.webhook_register)
          throw new Error('webhook_register not found in trigger');

        if (!site) throw new Error('Site ID is not defined');

        const result = await trigger.webhook_register(
          { ...base_context, opts: { site } },
          'https://example.com/webhook'
        );

        expect(result).toBeDefined();
        expect(result?.webhook.id).toBeDefined();

        webhook = result?.webhook;
      });
      it('Should deregister the webhook', async () => {
        const trigger = WebflowNewItem;

        if (!('webhook_deregister' in trigger) || !trigger.webhook_deregister)
          throw new Error('webhook_deregister not found in trigger');

        if (!webhook) throw new Error('webhook is not defined');

        await trigger.webhook_deregister(base_context, 'https://example.com/webhook', {
          webhook,
        });
      });
    });
    describe('Should test updated item webhook registration', () => {
      let webhook: { id: string } | undefined;
      it('Should register the webhook', async () => {
        const trigger = WebflowUpdatedItem;

        if (!('webhook_register' in trigger) || !trigger.webhook_register)
          throw new Error('webhook_register not found in trigger');

        if (!site) throw new Error('Site ID is not defined');

        const result = await trigger.webhook_register(
          { ...base_context, opts: { site } },
          'https://example.com/webhook'
        );

        expect(result).toBeDefined();
        expect(result?.webhook.id).toBeDefined();

        webhook = result?.webhook;
      });
      it('Should deregister the webhook', async () => {
        const trigger = WebflowUpdatedItem;

        if (!('webhook_deregister' in trigger) || !trigger.webhook_deregister)
          throw new Error('webhook_deregister not found in trigger');

        if (!webhook) throw new Error('webhook is not defined');

        await trigger.webhook_deregister(base_context, 'https://example.com/webhook', {
          webhook,
        });
      });
    });
    describe('Should test new order webhook registration', () => {
      let webhook: { id: string } | undefined;
      it('Should register the webhook', async () => {
        const trigger = WebflowNewOrder;

        if (!('webhook_register' in trigger) || !trigger.webhook_register)
          throw new Error('webhook_register not found in trigger');

        if (!site) throw new Error('Site ID is not defined');

        const result = await trigger.webhook_register(
          { ...base_context, opts: { site } },
          'https://example.com/webhook'
        );

        expect(result).toBeDefined();
        expect(result?.webhook.id).toBeDefined();

        webhook = result?.webhook;
      });
      it('Should deregister the webhook', async () => {
        const trigger = WebflowNewOrder;

        if (!('webhook_deregister' in trigger) || !trigger.webhook_deregister)
          throw new Error('webhook_deregister not found in trigger');

        if (!webhook) throw new Error('webhook is not defined');

        await trigger.webhook_deregister(base_context, 'https://example.com/webhook', {
          webhook,
        });
      });
    });
  });
});
