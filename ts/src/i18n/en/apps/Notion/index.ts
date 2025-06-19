const NotionAppEn = {
  displayName: 'Notion',
  shortDesc: 'Collection of actions to interact with the Notion API',
  longDesc: 'Collection of actions to interact with the Notion API',
  triggers: {
    new_database_item: {
      displayName: 'New Database Item',
      shortDesc: 'Triggers when a new item is added to a database',
      longDesc: 'Triggers when a new item is added to a database',
      options: {
        databaseId: {
          displayName: 'Database ID',
          shortDesc: 'The ID of the database to watch for new items',
          longDesc: 'The ID of the database to watch for new items',
        },
      },
      event_info: {
        desc: 'Notion New Database Item Event Info',
      },
    },
    updated_database_item: {
      displayName: 'Updated Database Item',
      shortDesc: 'Triggers when an item in a database is updated',
      longDesc: 'Triggers when an item in a database is updated',
      options: {
        databaseId: {
          displayName: 'Database ID',
          shortDesc: 'The ID of the database to watch for updates',
          longDesc: 'The ID of the database to watch for updates',
        },
      },
      event_info: {
        desc: 'Notion Updated Database Item Event Info',
      },
    },
    updated_page: {
      displayName: 'Updated Page',
      shortDesc: 'Triggers when a page is updated',
      longDesc: 'Triggers when a page is updated',
      options: {
        pageId: {
          displayName: 'Page ID',
          shortDesc: 'The ID of the page to watch for updates',
          longDesc: 'The ID of the page to watch for updates',
        },
      },
      event_info: {
        desc: 'Notion Page Updated Event Info',
      },
    },
  },
};

export default NotionAppEn;
