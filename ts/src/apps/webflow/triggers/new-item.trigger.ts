import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { WEBFLOW_APP_NAME, WebflowError } from '../constants';
import { createWebflowClient } from '../helpers/constants';
import { getWebflowSiteIdAllowedValues } from '../helpers/get-site-id-allowed-values';

const trigger = 'new_item';

const options = {
  site: {
    type: 'string',
    required: true,
    get_allowed_values: getWebflowSiteIdAllowedValues,
  },
} satisfies TQoreOptions;

const WebflowNewItem = QoreAppCreator.createLocalizedTrigger<typeof options>({
  action: trigger,
  app: WEBFLOW_APP_NAME,
  action_code: EQoreAppActionCode.EVENT,
  webhook_event_loc: 'payload',
  webhook_method: 'POST',
  options,
  webhook_register: async (context, url) => {
    const { token, site } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['site'],
      ErrorClass: WebflowError,
    });

    const client = createWebflowClient(token);

    const webhook = await client.webhooks.create(site, {
      url,
      triggerType: 'collection_item_created',
    });

    return { webhook };
  },
  webhook_deregister: async (context, _url, regInfo) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: WebflowError,
    });

    const webhookId = regInfo.webhook.id;

    if (!webhookId) {
      throw new WebflowError('Webhook ID is required for deregistration.');
    }

    const client = createWebflowClient(token);

    await client.webhooks.delete(webhookId);
  },
  get_example_event_data: async (context) => {
    const { token, site } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['site'],
      ErrorClass: WebflowError,
    });

    const client = createWebflowClient(token);

    const [siteResponse, collectionsResponse] = await Promise.all([
      client.sites.get(site),
      client.collections.list(site),
    ]);

    const collection = collectionsResponse.collections?.[0];

    if (!collection) return null;

    const itemsResponse = await client.collections.items.listItems(collection.id, { limit: 1 });
    const item = itemsResponse.items?.[0];
    if (!item) return null;

    return {
      id: item.id,
      workspaceId: siteResponse.workspaceId,
      siteId: siteResponse.id,
      collectionId: collection.id,
      fieldData: {
        name: item.fieldData.name,
        slug: item.fieldData.slug,
      },
    };
  },
  event_info: {
    desc: 'Item created event data',
    type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        workspaceId: { type: 'string' },
        siteId: { type: 'string' },
        collectionId: { type: 'string' },
        fieldData: {
          type: {
            type: 'hash',
            fields: {
              name: { type: 'string' },
              slug: { type: 'string' },
            },
          },
        },
      },
    },
  },
});

export default WebflowNewItem;
