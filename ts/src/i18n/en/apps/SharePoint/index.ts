

const SharepointAppEn = {
  displayName: 'Microsoft SharePoint',
  shortDesc: 'Connect, automate, and manage your SharePoint Online workflows with ease.',
  longDesc:
    'Integrate your Microsoft 365 environment to quickly create, update, and synchronize documents, lists, and other assets—all from one secure, user-friendly app.',
  triggers: {
    'new-row': {
      displayName: 'New Row',
      shortDesc: 'Triggers when a new row is added to a SharePoint list.',
      longDesc:
        'This trigger activates whenever a new row is added to a specified SharePoint list.',
      options: {
        site_id: {
          displayName: 'Site ID',
          shortDesc: 'The unique identifier for the SharePoint site.',
          longDesc:
            'Enter the Site ID where the target list resides. This ID ensures that the trigger is activated in the correct SharePoint site.',
        },
        list_id: {
          displayName: 'List ID',
          shortDesc: 'The unique identifier for the SharePoint list.',
          longDesc: 'Specify the List ID of the SharePoint list where the new row will be added.',
        },
      },
    },
  },
  actions: {
    'create-folder': {
      displayName: 'Create Folder',
      shortDesc: 'Create a new folder in a specified SharePoint drive.',
      longDesc:
        'This action creates a new folder within a specified SharePoint document library. Provide the target site, drive, parent folder path, and the desired folder name to organize your files effectively.',
      options: {
        site_id: {
          displayName: 'Site ID',
          shortDesc: 'The unique identifier for the SharePoint site.',
          longDesc:
            'Enter the unique Site ID where the folder will be created. This ID is required to target the correct SharePoint site in your Microsoft 365 environment.',
        },
        drive_id: {
          displayName: 'Drive ID',
          shortDesc: 'The unique identifier for the SharePoint drive.',
          longDesc:
            'Specify the Drive ID corresponding to the document library in which the folder will be created.',
        },
        parent_folder: {
          displayName: 'Parent Folder Path',
          shortDesc: 'The path of the existing parent folder.',
          longDesc:
            'Provide the path of the parent folder where the new folder should reside. This helps maintain an organized folder structure within your SharePoint drive.',
        },
        folder_name: {
          displayName: 'Folder Name',
          shortDesc: 'The name for the new folder.',
          longDesc:
            'Enter the desired name for the new folder. This name will be used as the folder title in SharePoint.',
        },
      },
    },
    'create-list-item': {
      displayName: 'Create List Item',
      shortDesc: 'Add a new item to an existing SharePoint list.',
      longDesc:
        'This action creates a new item within a specified SharePoint list. Provide the Site ID and List ID to target the correct list, and include the necessary fields to populate the item data.',
      options: {
        site_id: {
          displayName: 'Site ID',
          shortDesc: 'The unique identifier for the SharePoint site.',
          longDesc:
            'Enter the Site ID where your target list resides. This ID ensures that the action is executed in the correct SharePoint environment.',
        },
        list_id: {
          displayName: 'List ID',
          shortDesc: 'The unique identifier for the SharePoint list.',
          longDesc:
            'Specify the List ID of the SharePoint list to which the new item will be added.',
        },
      },
    },
    'create-list': {
      displayName: 'Create List',
      shortDesc: 'Generate a new list within a SharePoint site.',
      longDesc:
        'This action creates a new SharePoint list. Provide the Site ID, a name for the list, and a description if needed. This is ideal for setting up new data repositories in your SharePoint site.',
      options: {
        site_id: {
          displayName: 'Site ID',
          shortDesc: 'The unique identifier for the SharePoint site.',
          longDesc:
            'Enter the Site ID where the new list should be created, ensuring the list is added to the correct SharePoint site.',
        },
        list_name: {
          displayName: 'List Name',
          shortDesc: 'The name of the new list.',
          longDesc:
            'Provide a name for your new list. This name will be visible to users and used to identify the list within SharePoint.',
        },
        list_description: {
          displayName: 'List Description',
          shortDesc: 'A brief description of the list.',
          longDesc:
            'Enter a description for the new list to provide context about its purpose and contents. This helps users understand what the list is used for.',
        },
      },
    },
    'delete-list-item': {
      displayName: 'Delete List Item',
      shortDesc: 'Remove an item from a SharePoint list.',
      longDesc:
        'This action deletes a specific item from a SharePoint list. Provide the Site ID, List ID, and the Item ID of the list item to be removed. Use this action with caution, as deleted items cannot be easily recovered.',
      options: {
        site_id: {
          displayName: 'Site ID',
          shortDesc: 'The unique identifier for the SharePoint site.',
          longDesc:
            'Enter the Site ID where the list is hosted, ensuring the deletion is performed in the correct SharePoint environment.',
        },
        list_id: {
          displayName: 'List ID',
          shortDesc: 'The unique identifier for the SharePoint list.',
          longDesc:
            'Specify the List ID of the target SharePoint list from which the item will be deleted.',
        },
        item_id: {
          displayName: 'Item ID',
          shortDesc: 'The unique identifier for the list item.',
          longDesc:
            'Provide the Item ID of the list item that you want to delete. This ensures that the correct item is removed from the list.',
        },
      },
    },
    'search-list-item': {
      displayName: 'Search List Item',
      shortDesc: 'Search for items in a SharePoint list by title.',
      longDesc:
        'This action searches for list items within a specified SharePoint list that match a provided title or search term. Use this action to quickly locate specific items based on their Title field.',
      options: {
        site_id: {
          displayName: 'Site ID',
          shortDesc: 'The unique identifier for the SharePoint site.',
          longDesc:
            'Enter the Site ID where the list is located, ensuring the search is conducted in the correct SharePoint site.',
        },
        list_id: {
          displayName: 'List ID',
          shortDesc: 'The unique identifier for the SharePoint list.',
          longDesc: 'Provide the List ID of the SharePoint list to be searched.',
        },
        search_value: {
          displayName: 'Search Value',
          shortDesc: 'The search term to filter list items.',
          longDesc:
            'Enter the text value to search for within the list items, particularly in the Title field. This value is used to filter and return matching items.',
        },
      },
    },
    'update-list-item': {
      displayName: 'Update List Item',
      shortDesc: 'Modify an existing item in a SharePoint list.',
      longDesc:
        'This action updates the fields of an existing list item in a SharePoint list. Provide the Site ID, List ID, and Item ID to locate the item, along with the new field values that should be applied.',
      options: {
        site_id: {
          displayName: 'Site ID',
          shortDesc: 'The unique identifier for the SharePoint site.',
          longDesc:
            'Enter the Site ID where the list is hosted. This identifies the correct SharePoint site in your Microsoft 365 environment.',
        },
        list_id: {
          displayName: 'List ID',
          shortDesc: 'The unique identifier for the SharePoint list.',
          longDesc:
            'Provide the List ID of the target SharePoint list that contains the item you wish to update.',
        },
        item_id: {
          displayName: 'Item ID',
          shortDesc: 'The unique identifier for the list item.',
          longDesc:
            'Specify the Item ID of the list item that you want to update. This ensures that the correct item is modified.',
        },
      },
    },
  },
};

export default SharepointAppEn;
