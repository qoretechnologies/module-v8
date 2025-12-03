/* eslint-disable max-len */
const WebflowAppEn = {
  displayName: 'Webflow',
  groups: ['E-commerce Platforms', 'Design & Creative Tools'],
  shortDesc:
    'Webflow is a web design tool, CMS, and hosting platform that allows users to build responsive websites visually.',
  longDesc: `Webflow is a powerful web design tool that combines the flexibility of a CMS with the ease of use of a visual editor. It allows users to create responsive websites without writing code, making it accessible for designers and developers alike. With Webflow, you can design, build, and launch websites all in one platform, streamlining the web development process.`,
  actions: {
    create_item: {
      groups: ['Collections'],
      displayName: 'Create Item',
      shortDesc: 'Create a new item in a Webflow collection',
      longDesc:
        'Create a new item with custom field data in a specified Webflow collection. You can set the item as archived or draft and specify a CMS locale.',
      options: {
        site: {
          displayName: 'Site',
          shortDesc: 'The Webflow site (optional)',
          longDesc: 'Select the Webflow site to filter collections from (optional)',
        },
        collection: {
          displayName: 'Collection',
          shortDesc: 'The collection to create the item in',
          longDesc: 'Select the Webflow collection where you want to create the new item',
        },
        isArchived: {
          displayName: 'Is Archived',
          shortDesc: 'Whether the item should be archived',
          longDesc: 'Set to true if you want the item to be archived upon creation',
        },
        isDraft: {
          displayName: 'Is Draft',
          shortDesc: 'Whether the item should be a draft',
          longDesc: 'Set to true if you want the item to be saved as a draft (default: true)',
        },
        cmsLocaleId: {
          displayName: 'CMS Locale ID',
          shortDesc: 'The locale ID for the item',
          longDesc: 'Specify the CMS locale ID if working with a multi-locale site',
        },
      },
    },
    delete_item: {
      groups: ['Collections'],
      displayName: 'Delete Item',
      shortDesc: 'Delete an item from a Webflow collection',
      longDesc:
        'Permanently delete a specified item from a Webflow collection. This action cannot be undone.',
      options: {
        item: {
          displayName: 'Item',
          shortDesc: 'The item to delete',
          longDesc: 'Select the specific item you want to delete from the collection',
        },
        site: {
          displayName: 'Site',
          shortDesc: 'The Webflow site (optional)',
          longDesc: 'Select the Webflow site to filter collections from (optional)',
        },
        collection: {
          displayName: 'Collection',
          shortDesc: 'The collection containing the item',
          longDesc: 'Select the Webflow collection that contains the item you want to delete',
        },
      },
    },
    get_collection: {
      groups: ['Collections'],
      displayName: 'Get Collection',
      shortDesc: 'Retrieve information about a Webflow collection',
      longDesc:
        'Get detailed information about a specific Webflow collection including its fields, settings, and metadata.',
      options: {
        site: {
          displayName: 'Site',
          shortDesc: 'The Webflow site (optional)',
          longDesc: 'Select the Webflow site to filter collections from (optional)',
        },
        collection: {
          displayName: 'Collection',
          shortDesc: 'The collection to retrieve',
          longDesc: 'Select the specific Webflow collection you want to get information about',
        },
      },
    },
    get_item: {
      groups: ['Collections'],
      displayName: 'Get Item',
      shortDesc: 'Retrieve a specific item from a Webflow collection',
      longDesc:
        'Get detailed information about a specific item from a Webflow collection, including all its field data.',
      options: {
        item: {
          displayName: 'Item',
          shortDesc: 'The item to retrieve',
          longDesc: 'Select the specific item you want to retrieve from the collection',
        },
        site: {
          displayName: 'Site',
          shortDesc: 'The Webflow site (optional)',
          longDesc: 'Select the Webflow site to filter collections from (optional)',
        },
        collection: {
          displayName: 'Collection',
          shortDesc: 'The collection containing the item',
          longDesc: 'Select the Webflow collection that contains the item you want to retrieve',
        },
        cmsLocaleId: {
          displayName: 'CMS Locale ID',
          shortDesc: 'The locale ID for the item',
          longDesc: 'Specify the CMS locale ID if working with a multi-locale site',
        },
      },
    },
    get_order: {
      groups: ['Orders'],
      displayName: 'Get Order',
      shortDesc: 'Retrieve a specific order from Webflow',
      longDesc:
        'Get detailed information about a specific order from Webflow, including customer details, purchased items, and payment information.',
      options: {
        site: {
          displayName: 'Site',
          shortDesc: 'The Webflow site',
          longDesc: 'Select the Webflow site that contains the order',
        },
        order: {
          displayName: 'Order',
          shortDesc: 'The order to retrieve',
          longDesc: 'Select the specific order you want to retrieve information about',
        },
      },
    },
    get_site: {
      groups: ['Sites'],
      displayName: 'Get Site',
      shortDesc: 'Retrieve information about a Webflow site',
      longDesc:
        'Get detailed information about a specific Webflow site including its settings, domains, and locale configuration.',
      options: {
        site: {
          displayName: 'Site',
          shortDesc: 'The site to retrieve',
          longDesc: 'Select the specific Webflow site you want to get information about',
        },
      },
    },
    list_collections: {
      groups: ['Collections'],
      displayName: 'List Collections',
      shortDesc: 'List all collections from a Webflow site',
      longDesc:
        'Retrieve a list of all collections from a specified Webflow site with their basic information.',
      options: {
        site: {
          displayName: 'Site',
          shortDesc: 'The Webflow site',
          longDesc: 'Select the Webflow site to list collections from',
        },
      },
    },
    list_custom_domains: {
      groups: ['Sites'],
      displayName: 'List Custom Domains',
      shortDesc: 'List custom domains for a Webflow site',
      longDesc: 'Retrieve a list of all custom domains configured for a specified Webflow site.',
      options: {
        site: {
          displayName: 'Site',
          shortDesc: 'The Webflow site',
          longDesc: 'Select the Webflow site to list custom domains from',
        },
      },
    },
    list_items: {
      groups: ['Collections'],
      displayName: 'List Items',
      shortDesc: 'List items from a Webflow collection',
      longDesc:
        'Retrieve a paginated list of items from a specified Webflow collection with filtering and sorting options.',
      options: {
        site: {
          displayName: 'Site',
          shortDesc: 'The Webflow site (optional)',
          longDesc: 'Select the Webflow site to filter collections from (optional)',
        },
        collection: {
          displayName: 'Collection',
          shortDesc: 'The collection to list items from',
          longDesc: 'Select the Webflow collection you want to list items from',
        },
        cmsLocaleId: {
          displayName: 'CMS Locale ID',
          shortDesc: 'The locale ID for filtering items',
          longDesc: 'Specify the CMS locale ID to filter items by locale',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Number of items to skip',
          longDesc: 'The number of items to skip for pagination (default: 0)',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of items to return',
          longDesc: 'The maximum number of items to return per page (default: 20)',
        },
        name: {
          displayName: 'Name',
          shortDesc: 'Filter by item name',
          longDesc: 'Filter items by their name field',
        },
        slug: {
          displayName: 'Slug',
          shortDesc: 'Filter by item slug',
          longDesc: 'Filter items by their slug field',
        },
        lastPublished: {
          displayName: 'Last Published',
          shortDesc: 'Filter by publication date range',
          longDesc: 'Filter items by their last published date range',
          type: {
            fields: {
              lte: {
                displayName: 'Less Than or Equal To',
                shortDesc: 'Items published before or on this date',
                longDesc: 'Include items published before or on this date',
              },
              gte: {
                displayName: 'Greater Than or Equal To',
                shortDesc: 'Items published after or on this date',
                longDesc: 'Include items published after or on this date',
              },
            },
          },
        },
        sortBy: {
          displayName: 'Sort By',
          shortDesc: 'Field to sort items by',
          longDesc: 'Choose the field to sort the items by',
        },
        sortOrder: {
          displayName: 'Sort Order',
          shortDesc: 'Sort direction',
          longDesc: 'Choose whether to sort in ascending or descending order',
        },
      },
    },
    list_orders: {
      groups: ['Orders'],
      displayName: 'List Orders',
      shortDesc: 'List orders from a Webflow site',
      longDesc:
        'Retrieve a paginated list of orders from a specified Webflow site with filtering options.',
      options: {
        site: {
          displayName: 'Site',
          shortDesc: 'The Webflow site',
          longDesc: 'Select the Webflow site to list orders from',
        },
        status: {
          displayName: 'Status',
          shortDesc: 'Filter by order status',
          longDesc: 'Filter orders by their current status',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Number of orders to skip',
          longDesc: 'The number of orders to skip for pagination',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of orders to return',
          longDesc: 'The maximum number of orders to return per page (default: 20)',
        },
      },
    },
    list_sites: {
      groups: ['Sites'],
      displayName: 'List Sites',
      shortDesc: 'List all Webflow sites',
      longDesc:
        'Retrieve a list of all Webflow sites accessible with the current authentication token.',
    },
    mark_order_status: {
      groups: ['Orders'],
      displayName: 'Mark Order Status',
      shortDesc: 'Update the status of a Webflow order',
      longDesc:
        'Change the status of a Webflow order to fulfilled, unfulfilled, or refunded with additional options.',
      options: {
        site: {
          displayName: 'Site',
          shortDesc: 'The Webflow site',
          longDesc: 'Select the Webflow site that contains the order',
        },
        order: {
          displayName: 'Order',
          shortDesc: 'The order to update',
          longDesc: 'Select the specific order you want to update the status for',
        },
        status: {
          displayName: 'Status',
          shortDesc: 'The new status for the order',
          longDesc: 'Choose the new status to set for the order',
        },
        reason: {
          displayName: 'Refund Reason',
          shortDesc: 'Reason for refunding the order',
          longDesc: 'Specify the reason for refunding the order (required for refunded status)',
        },
        sendOrderFulfilledEmail: {
          displayName: 'Send Order Fulfilled Email',
          shortDesc: 'Send fulfillment notification email',
          longDesc: 'Whether to send an order fulfilled email to the customer',
        },
      },
    },
    publish_item: {
      groups: ['Collections'],
      displayName: 'Publish Item',
      shortDesc: 'Publish items from a Webflow collection',
      longDesc:
        'Publish one or more items from a Webflow collection to make them live on the website.',
      options: {
        items: {
          displayName: 'Items',
          shortDesc: 'The items to publish',
          longDesc: 'Select one or more items from the collection to publish',
        },
        site: {
          displayName: 'Site',
          shortDesc: 'The Webflow site (optional)',
          longDesc: 'Select the Webflow site to filter collections from (optional)',
        },
        collection: {
          displayName: 'Collection',
          shortDesc: 'The collection containing the items',
          longDesc: 'Select the Webflow collection that contains the items you want to publish',
        },
      },
    },
    publish_site: {
      groups: ['Sites'],
      displayName: 'Publish Site',
      shortDesc: 'Publish a Webflow site',
      longDesc:
        'Publish a Webflow site to make all changes live. You can specify custom domains and whether to publish to the Webflow subdomain.',
      options: {
        site: {
          displayName: 'Site',
          shortDesc: 'The site to publish',
          longDesc: 'Select the Webflow site you want to publish',
        },
        customDomains: {
          displayName: 'Custom Domains',
          shortDesc: 'Custom domains to publish to',
          longDesc: 'Specify custom domains to publish the site to (optional)',
        },
        publishToWebflowSubdomain: {
          displayName: 'Publish to Webflow Subdomain',
          shortDesc: 'Whether to publish to Webflow subdomain',
          longDesc: 'Whether to publish the site to its Webflow subdomain',
        },
      },
    },
    update_item: {
      groups: ['Collections'],
      displayName: 'Update Item',
      shortDesc: 'Update an existing item in a Webflow collection',
      longDesc: 'Update the field data and settings of an existing item in a Webflow collection.',
      options: {
        site: {
          displayName: 'Site',
          shortDesc: 'The Webflow site (optional)',
          longDesc: 'Select the Webflow site to filter collections from (optional)',
        },
        item: {
          displayName: 'Item',
          shortDesc: 'The item to update',
          longDesc: 'Select the specific item you want to update',
        },
        collection: {
          displayName: 'Collection',
          shortDesc: 'The collection containing the item',
          longDesc: 'Select the Webflow collection that contains the item you want to update',
        },
        isArchived: {
          displayName: 'Is Archived',
          shortDesc: 'Whether the item should be archived',
          longDesc: 'Set to true to archive the item, false to unarchive it',
        },
        isDraft: {
          displayName: 'Is Draft',
          shortDesc: 'Whether the item should be a draft',
          longDesc: 'Set to true to save the item as a draft, false to make it live',
        },
        cmsLocaleId: {
          displayName: 'CMS Locale ID',
          shortDesc: 'The locale ID for the item',
          longDesc: 'Specify the CMS locale ID if working with a multi-locale site',
        },
      },
    },
  },
  triggers: {
    new_item: {
      displayName: 'New Item',
      shortDesc: 'Triggered when a new item is created in a collection',
      longDesc:
        'This trigger fires whenever a new item is created in any collection within the specified Webflow site. It provides detailed information about the newly created item including its field data.',
      options: {
        site: {
          displayName: 'Site',
          shortDesc: 'The Webflow site to monitor',
          longDesc:
            'Select the Webflow site where you want to monitor for new item creation events',
        },
      },
    },
    new_order: {
      displayName: 'New Order',
      shortDesc: 'Triggered when a new order is placed',
      longDesc:
        'This trigger fires whenever a new order is placed on the specified Webflow site. It provides comprehensive order information including customer details, purchased items, payment information, and shipping details.',
      options: {
        site: {
          displayName: 'Site',
          shortDesc: 'The Webflow site to monitor',
          longDesc: 'Select the Webflow site where you want to monitor for new order events',
        },
      },
    },
    updated_item: {
      displayName: 'Updated Item',
      shortDesc: 'Triggered when an item is updated in a collection',
      longDesc:
        'This trigger fires whenever an existing item is modified in any collection within the specified Webflow site. It provides information about the updated item including its current field data.',
      options: {
        site: {
          displayName: 'Site',
          shortDesc: 'The Webflow site to monitor',
          longDesc: 'Select the Webflow site where you want to monitor for item update events',
        },
      },
    },
    updated_order: {
      displayName: 'Updated Order',
      shortDesc: 'Triggered when an order status is updated',
      longDesc:
        'This trigger fires whenever an existing order is modified on the specified Webflow site. This includes status changes, fulfillment updates, refunds, and other order modifications.',
      options: {
        site: {
          displayName: 'Site',
          shortDesc: 'The Webflow site to monitor',
          longDesc: 'Select the Webflow site where you want to monitor for order update events',
        },
      },
    },
  },
};

export default WebflowAppEn;
