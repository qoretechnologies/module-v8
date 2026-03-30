const ContentfulAppEn = {
  displayName: 'Contentful',
  groups: ['Documents & Documentation'],
  shortDesc: 'Connect to Contentful to manage your content, assets, and content models',
  longDesc:
    'Integrate with Contentful to automate content management workflows. Create, update, publish, and manage entries, assets, and content types. Monitor content changes with real-time webhook triggers. This integration provides full access to the Contentful Content Management API for comprehensive headless CMS automation.',
  connectionMessage: {
    title: 'Connect to Contentful',
    content: `To connect to Contentful, you will need a **Content Management API (CMA) Token**.

## Getting Your CMA Token

1. Log in to your [Contentful](https://app.contentful.com) account
2. Go to **Settings** (gear icon in the top navigation)
3. Select **CMA tokens** from the left sidebar
4. Click **Create personal access token**
5. Give your token a descriptive name (e.g., "Qore Integration")
6. Click **Generate** and copy the generated token

**Important:** The token is only shown once. Make sure to copy and save it securely.

## Authorizing Your Token for an Organization

If your Contentful account belongs to an organization, you must **authorize your token** for that organization before it can access spaces:

1. Go to your [Personal Access Tokens](https://app.contentful.com/account/profile/cma_tokens) page
2. Find your token in the list
3. Click **Authorize** next to the organization you want the token to access

Without this step, API requests will fail with an \`OrganizationAccessGrantRequired\` error, even though the token is valid.

## Permissions

The CMA token inherits the permissions of the user who created it. Ensure the user has appropriate access to the spaces and environments you want to manage.`,
  },
  actions: {
    // Entry actions
    get_entry: {
      displayName: 'Get an Entry',
      shortDesc: 'Returns attributes of a specific entry',
      longDesc:
        'Retrieves a single entry by its ID from the specified space and environment. Returns all entry fields with their values in the default locale.',
      groups: ['Entries'],
      options: {
        space_id: {
          displayName: 'Space',
          shortDesc: 'The Contentful space to use',
          longDesc: 'Select the Contentful space containing the entry.',
        },
        environment_id: {
          displayName: 'Environment',
          shortDesc: 'The environment to use (default: master)',
          longDesc:
            'Select the environment within the space. Defaults to "master" if not specified.',
        },
        content_type_id: {
          displayName: 'Content Type',
          shortDesc: 'The content type of the entry',
          longDesc: 'Select the content type to filter entries by type.',
        },
        entry_id: {
          displayName: 'Entry',
          shortDesc: 'The entry to retrieve',
          longDesc: 'Select or enter the ID of the entry to retrieve.',
        },
      },
    },
    get_entry_with_replacement: {
      displayName: 'Get an Entry with Replacement',
      shortDesc: 'Replaces text fields with new values using specific tags; returns new values as output',
      longDesc:
        'Retrieves an entry and performs text replacements on all string fields. For each replacement pair, all occurrences of the tag are replaced with the specified value. Useful for template-based content.',
      groups: ['Entries'],
      options: {
        space_id: {
          displayName: 'Space',
          shortDesc: 'The Contentful space to use',
          longDesc: 'Select the Contentful space containing the entry.',
        },
        environment_id: {
          displayName: 'Environment',
          shortDesc: 'The environment to use (default: master)',
          longDesc:
            'Select the environment within the space. Defaults to "master" if not specified.',
        },
        content_type_id: {
          displayName: 'Content Type',
          shortDesc: 'The content type of the entry',
          longDesc: 'Select the content type to filter entries by type.',
        },
        entry_id: {
          displayName: 'Entry',
          shortDesc: 'The entry to retrieve and apply replacements to',
          longDesc: 'Select or enter the ID of the entry to retrieve.',
        },
        replacements: {
          displayName: 'Replacements',
          shortDesc: 'List of tag/value pairs for text replacement',
          longDesc:
            'Provide a list of replacement pairs. Each pair has a "tag" (placeholder to find) and a "value" (text to replace it with). All string fields in the entry will be processed.',
          type: {
            element_type: {
              fields: {
                tag: {
                  displayName: 'Tag',
                  shortDesc: 'The tag/placeholder to search for in text fields',
                  longDesc: 'The tag or placeholder text to search for within all string fields of the entry.',
                },
                value: {
                  displayName: 'Value',
                  shortDesc: 'The replacement value',
                  longDesc: 'The text that will replace all occurrences of the tag.',
                },
              },
            },
          },
        },
      },
    },
    create_entry: {
      displayName: 'Create an Entry',
      shortDesc: 'Creates a new entry',
      longDesc:
        'Creates a new entry of the specified content type in the given space and environment. Optionally publishes the entry immediately after creation.',
      groups: ['Entries'],
      options: {
        space_id: {
          displayName: 'Space',
          shortDesc: 'The Contentful space to use',
          longDesc: 'Select the Contentful space where the entry will be created.',
        },
        environment_id: {
          displayName: 'Environment',
          shortDesc: 'The environment to use (default: master)',
          longDesc:
            'Select the environment within the space. Defaults to "master" if not specified.',
        },
        content_type_id: {
          displayName: 'Content Type',
          shortDesc: 'The content type for the new entry',
          longDesc: 'Select the content type that defines the schema for the new entry.',
        },
        fields: {
          displayName: 'Fields',
          shortDesc: 'The field values for the new entry',
          longDesc:
            'Provide the field values as a key-value object. Keys should match the field IDs of the content type.',
        },
        publish: {
          displayName: 'Publish',
          shortDesc: 'Whether to publish the entry after creation',
          longDesc:
            'If enabled, the entry will be published immediately after creation. Otherwise, it will be saved as a draft.',
        },
      },
    },
    update_entry: {
      displayName: 'Update an Entry',
      shortDesc: 'Updates a specific entry by its ID',
      longDesc:
        'Updates an existing entry with new field values. Only the specified fields are updated; other fields remain unchanged.',
      groups: ['Entries'],
      options: {
        space_id: {
          displayName: 'Space',
          shortDesc: 'The Contentful space to use',
          longDesc: 'Select the Contentful space containing the entry.',
        },
        environment_id: {
          displayName: 'Environment',
          shortDesc: 'The environment to use (default: master)',
          longDesc:
            'Select the environment within the space. Defaults to "master" if not specified.',
        },
        content_type_id: {
          displayName: 'Content Type',
          shortDesc: 'The content type of the entry',
          longDesc: 'Select the content type to filter entries by type.',
        },
        entry_id: {
          displayName: 'Entry',
          shortDesc: 'The entry to update',
          longDesc: 'Select or enter the ID of the entry to update.',
        },
        fields: {
          displayName: 'Fields',
          shortDesc: 'The field values to update',
          longDesc:
            'Provide the field values to update as a key-value object. Only the specified fields will be changed.',
        },
      },
    },
    delete_entry: {
      displayName: 'Delete an Entry',
      shortDesc: 'Permanently removes a specific entry',
      longDesc:
        'Permanently deletes an entry from the space. If the entry is published, it will be unpublished first. This action is irreversible.',
      groups: ['Entries'],
      options: {
        space_id: {
          displayName: 'Space',
          shortDesc: 'The Contentful space to use',
          longDesc: 'Select the Contentful space containing the entry.',
        },
        environment_id: {
          displayName: 'Environment',
          shortDesc: 'The environment to use (default: master)',
          longDesc:
            'Select the environment within the space. Defaults to "master" if not specified.',
        },
        content_type_id: {
          displayName: 'Content Type',
          shortDesc: 'The content type of the entry',
          longDesc: 'Select the content type to filter entries by type.',
        },
        entry_id: {
          displayName: 'Entry',
          shortDesc: 'The entry to delete',
          longDesc: 'Select or enter the ID of the entry to permanently remove.',
        },
      },
    },
    publish_entry: {
      displayName: 'Publish an Entry',
      shortDesc: 'Changes entry status to "published"',
      longDesc:
        'Publishes a draft entry, making it available through the Content Delivery API.',
      groups: ['Entries'],
      options: {
        space_id: {
          displayName: 'Space',
          shortDesc: 'The Contentful space to use',
          longDesc: 'Select the Contentful space containing the entry.',
        },
        environment_id: {
          displayName: 'Environment',
          shortDesc: 'The environment to use (default: master)',
          longDesc:
            'Select the environment within the space. Defaults to "master" if not specified.',
        },
        content_type_id: {
          displayName: 'Content Type',
          shortDesc: 'The content type to filter entries',
          longDesc: 'Select the content type to filter the entry dropdown.',
        },
        entry_id: {
          displayName: 'Entry',
          shortDesc: 'The entry to publish',
          longDesc: 'Select or enter the ID of the entry to publish.',
        },
      },
    },
    unpublish_entry: {
      displayName: 'Unpublish an Entry',
      shortDesc: 'Puts an entry back into "draft" state',
      longDesc:
        'Unpublishes an entry, removing it from the Content Delivery API and reverting it to draft state.',
      groups: ['Entries'],
      options: {
        space_id: {
          displayName: 'Space',
          shortDesc: 'The Contentful space to use',
          longDesc: 'Select the Contentful space containing the entry.',
        },
        environment_id: {
          displayName: 'Environment',
          shortDesc: 'The environment to use (default: master)',
          longDesc:
            'Select the environment within the space. Defaults to "master" if not specified.',
        },
        content_type_id: {
          displayName: 'Content Type',
          shortDesc: 'The content type to filter entries',
          longDesc: 'Select the content type to filter the entry dropdown.',
        },
        entry_id: {
          displayName: 'Entry',
          shortDesc: 'The entry to unpublish',
          longDesc: 'Select or enter the ID of the entry to unpublish.',
        },
      },
    },
    archive_entry: {
      displayName: 'Archive/Unarchive an Entry',
      shortDesc: 'Archives/Unarchives an unpublished entry',
      longDesc:
        'Archives or unarchives an entry. The entry must be unpublished before it can be archived. Archived entries are hidden from the default entry list.',
      groups: ['Entries'],
      options: {
        space_id: {
          displayName: 'Space',
          shortDesc: 'The Contentful space to use',
          longDesc: 'Select the Contentful space containing the entry.',
        },
        environment_id: {
          displayName: 'Environment',
          shortDesc: 'The environment to use (default: master)',
          longDesc:
            'Select the environment within the space. Defaults to "master" if not specified.',
        },
        content_type_id: {
          displayName: 'Content Type',
          shortDesc: 'The content type to filter entries',
          longDesc: 'Select the content type to filter the entry dropdown.',
        },
        entry_id: {
          displayName: 'Entry',
          shortDesc: 'The entry to archive or unarchive',
          longDesc: 'Select or enter the ID of the entry.',
        },
        archive: {
          displayName: 'Archive',
          shortDesc: 'Set to true to archive, false to unarchive',
          longDesc:
            'When enabled, the entry will be archived. When disabled, the entry will be unarchived.',
        },
      },
    },
    search_entries: {
      displayName: 'Search Entries',
      shortDesc: 'Searches for entries',
      longDesc:
        'Searches for entries of a specific content type with optional full-text search. Returns a paginated list of entries.',
      groups: ['Entries'],
      options: {
        space_id: {
          displayName: 'Space',
          shortDesc: 'The Contentful space to search',
          longDesc: 'Select the Contentful space to search in.',
        },
        environment_id: {
          displayName: 'Environment',
          shortDesc: 'The environment to use (default: master)',
          longDesc:
            'Select the environment within the space. Defaults to "master" if not specified.',
        },
        content_type_id: {
          displayName: 'Content Type',
          shortDesc: 'The content type to search',
          longDesc: 'Select the content type to filter results by.',
        },
        query: {
          displayName: 'Search Query',
          shortDesc: 'Full-text search query',
          longDesc: 'Optional text to search across all text fields of the entries.',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of entries to return',
          longDesc: 'The maximum number of entries to return. Default is 100, maximum is 1000.',
        },
        skip: {
          displayName: 'Skip',
          shortDesc: 'Number of entries to skip',
          longDesc: 'The number of entries to skip for pagination. Default is 0.',
        },
      },
    },

    // Asset actions
    get_asset: {
      displayName: 'Get an Asset',
      shortDesc: 'Returns attributes of a specific asset',
      longDesc:
        'Retrieves a single asset by its ID, returning metadata including title, description, file URL, MIME type, and size.',
      groups: ['Assets'],
      options: {
        space_id: {
          displayName: 'Space',
          shortDesc: 'The Contentful space to use',
          longDesc: 'Select the Contentful space containing the asset.',
        },
        environment_id: {
          displayName: 'Environment',
          shortDesc: 'The environment to use (default: master)',
          longDesc:
            'Select the environment within the space. Defaults to "master" if not specified.',
        },
        asset_id: {
          displayName: 'Asset',
          shortDesc: 'The asset to retrieve',
          longDesc: 'Select or enter the ID of the asset to retrieve.',
        },
      },
    },
    create_asset: {
      displayName: 'Create an Asset',
      shortDesc: 'Creates a new asset',
      longDesc:
        'Creates a new asset from a URL. The asset will be processed (downloaded and stored) automatically. Optionally publishes the asset after creation.',
      groups: ['Assets'],
      options: {
        space_id: {
          displayName: 'Space',
          shortDesc: 'The Contentful space to use',
          longDesc: 'Select the Contentful space where the asset will be created.',
        },
        environment_id: {
          displayName: 'Environment',
          shortDesc: 'The environment to use (default: master)',
          longDesc:
            'Select the environment within the space. Defaults to "master" if not specified.',
        },
        title: {
          displayName: 'Title',
          shortDesc: 'The asset title',
          longDesc: 'A descriptive title for the asset.',
        },
        description: {
          displayName: 'Description',
          shortDesc: 'The asset description',
          longDesc: 'An optional description for the asset.',
        },
        file_name: {
          displayName: 'File Name',
          shortDesc: 'The file name for the asset',
          longDesc: 'The file name including extension (e.g., "photo.jpg").',
        },
        file_url: {
          displayName: 'File URL',
          shortDesc: 'The URL of the file to upload',
          longDesc: 'The publicly accessible URL from which Contentful will download the file.',
        },
        content_type: {
          displayName: 'Content Type',
          shortDesc: 'The MIME type of the file',
          longDesc: 'The MIME type of the file (e.g., "image/jpeg", "application/pdf").',
        },
        publish: {
          displayName: 'Publish',
          shortDesc: 'Whether to publish the asset after creation',
          longDesc:
            'If enabled, the asset will be published immediately after processing.',
        },
      },
    },
    update_asset: {
      displayName: 'Update an Asset',
      shortDesc: 'Updates an asset by its ID',
      longDesc: 'Updates the title and/or description of an existing asset.',
      groups: ['Assets'],
      options: {
        space_id: {
          displayName: 'Space',
          shortDesc: 'The Contentful space to use',
          longDesc: 'Select the Contentful space containing the asset.',
        },
        environment_id: {
          displayName: 'Environment',
          shortDesc: 'The environment to use (default: master)',
          longDesc:
            'Select the environment within the space. Defaults to "master" if not specified.',
        },
        asset_id: {
          displayName: 'Asset',
          shortDesc: 'The asset to update',
          longDesc: 'Select or enter the ID of the asset to update.',
        },
        title: {
          displayName: 'Title',
          shortDesc: 'New title for the asset',
          longDesc: 'The updated title for the asset.',
        },
        description: {
          displayName: 'Description',
          shortDesc: 'New description for the asset',
          longDesc: 'The updated description for the asset.',
        },
      },
    },
    delete_asset: {
      displayName: 'Delete an Asset',
      shortDesc: 'Permanently removes an unpublished asset',
      longDesc:
        'Permanently deletes an asset. If the asset is published, it will be unpublished first. This action is irreversible.',
      groups: ['Assets'],
      options: {
        space_id: {
          displayName: 'Space',
          shortDesc: 'The Contentful space to use',
          longDesc: 'Select the Contentful space containing the asset.',
        },
        environment_id: {
          displayName: 'Environment',
          shortDesc: 'The environment to use (default: master)',
          longDesc:
            'Select the environment within the space. Defaults to "master" if not specified.',
        },
        asset_id: {
          displayName: 'Asset',
          shortDesc: 'The asset to delete',
          longDesc: 'Select or enter the ID of the asset to permanently remove.',
        },
      },
    },
    publish_asset: {
      displayName: 'Publish an Asset',
      shortDesc: 'Changes asset status to "published"',
      longDesc: 'Publishes a draft asset, making it available through the Content Delivery API.',
      groups: ['Assets'],
      options: {
        space_id: {
          displayName: 'Space',
          shortDesc: 'The Contentful space to use',
          longDesc: 'Select the Contentful space containing the asset.',
        },
        environment_id: {
          displayName: 'Environment',
          shortDesc: 'The environment to use (default: master)',
          longDesc:
            'Select the environment within the space. Defaults to "master" if not specified.',
        },
        asset_id: {
          displayName: 'Asset',
          shortDesc: 'The asset to publish',
          longDesc: 'Select or enter the ID of the asset to publish.',
        },
      },
    },
    unpublish_asset: {
      displayName: 'Unpublish an Asset',
      shortDesc: 'Puts an asset back into "draft" state',
      longDesc:
        'Unpublishes an asset, removing it from the Content Delivery API and reverting it to draft state.',
      groups: ['Assets'],
      options: {
        space_id: {
          displayName: 'Space',
          shortDesc: 'The Contentful space to use',
          longDesc: 'Select the Contentful space containing the asset.',
        },
        environment_id: {
          displayName: 'Environment',
          shortDesc: 'The environment to use (default: master)',
          longDesc:
            'Select the environment within the space. Defaults to "master" if not specified.',
        },
        asset_id: {
          displayName: 'Asset',
          shortDesc: 'The asset to unpublish',
          longDesc: 'Select or enter the ID of the asset to unpublish.',
        },
      },
    },
    archive_asset: {
      displayName: 'Archive/Unarchive an Asset',
      shortDesc: 'Archives/Unarchives an unpublished asset',
      longDesc:
        'Archives or unarchives an asset. The asset must be unpublished before it can be archived.',
      groups: ['Assets'],
      options: {
        space_id: {
          displayName: 'Space',
          shortDesc: 'The Contentful space to use',
          longDesc: 'Select the Contentful space containing the asset.',
        },
        environment_id: {
          displayName: 'Environment',
          shortDesc: 'The environment to use (default: master)',
          longDesc:
            'Select the environment within the space. Defaults to "master" if not specified.',
        },
        asset_id: {
          displayName: 'Asset',
          shortDesc: 'The asset to archive or unarchive',
          longDesc: 'Select or enter the ID of the asset.',
        },
        archive: {
          displayName: 'Archive',
          shortDesc: 'Set to true to archive, false to unarchive',
          longDesc:
            'When enabled, the asset will be archived. When disabled, the asset will be unarchived.',
        },
      },
    },
    search_assets: {
      displayName: 'Search Assets',
      shortDesc: 'Searches for assets',
      longDesc:
        'Searches for assets with optional full-text search and MIME type filtering. Returns a paginated list of assets.',
      groups: ['Assets'],
      options: {
        space_id: {
          displayName: 'Space',
          shortDesc: 'The Contentful space to search',
          longDesc: 'Select the Contentful space to search in.',
        },
        environment_id: {
          displayName: 'Environment',
          shortDesc: 'The environment to use (default: master)',
          longDesc:
            'Select the environment within the space. Defaults to "master" if not specified.',
        },
        query: {
          displayName: 'Search Query',
          shortDesc: 'Full-text search query',
          longDesc: 'Optional text to search across asset titles and descriptions.',
        },
        mime_type_group: {
          displayName: 'MIME Type Group',
          shortDesc: 'Filter by file type group',
          longDesc:
            'Optionally filter assets by MIME type group (e.g., image, video, audio, pdfdocument).',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of assets to return',
          longDesc: 'The maximum number of assets to return. Default is 100, maximum is 1000.',
        },
        skip: {
          displayName: 'Skip',
          shortDesc: 'Number of assets to skip',
          longDesc: 'The number of assets to skip for pagination. Default is 0.',
        },
      },
    },

    // Content Type actions
    get_content_type: {
      displayName: 'Get a Content Type',
      shortDesc: 'Returns attributes of a specific content type',
      longDesc:
        'Retrieves a content type by its ID, including its name, description, and field definitions.',
      groups: ['Content Types'],
      options: {
        space_id: {
          displayName: 'Space',
          shortDesc: 'The Contentful space to use',
          longDesc: 'Select the Contentful space containing the content type.',
        },
        environment_id: {
          displayName: 'Environment',
          shortDesc: 'The environment to use (default: master)',
          longDesc:
            'Select the environment within the space. Defaults to "master" if not specified.',
        },
        content_type_id: {
          displayName: 'Content Type',
          shortDesc: 'The content type to retrieve',
          longDesc: 'Select the content type to retrieve details for.',
        },
      },
    },
    create_content_type: {
      displayName: 'Create a Content Type',
      shortDesc: 'Creates a new content type',
      longDesc:
        'Creates a new content type with the specified name, description, and field definitions. The content type will be created in draft state.',
      groups: ['Content Types'],
      options: {
        space_id: {
          displayName: 'Space',
          shortDesc: 'The Contentful space to use',
          longDesc: 'Select the Contentful space where the content type will be created.',
        },
        environment_id: {
          displayName: 'Environment',
          shortDesc: 'The environment to use (default: master)',
          longDesc:
            'Select the environment within the space. Defaults to "master" if not specified.',
        },
        name: {
          displayName: 'Name',
          shortDesc: 'The content type name',
          longDesc: 'A descriptive name for the content type (e.g., "Blog Post", "Product").',
        },
        description: {
          displayName: 'Description',
          shortDesc: 'The content type description',
          longDesc: 'An optional description explaining the purpose of this content type.',
        },
        fields: {
          displayName: 'Fields',
          shortDesc: 'The field definitions for the content type',
          longDesc:
            'A list of field definitions. Each field requires an ID, name, and type. Supported types: Symbol, Text, Integer, Number, Date, Boolean, RichText, Link, Array, Object, Location.',
          type: {
            element_type: {
              fields: {
                id: {
                  displayName: 'Field ID',
                  shortDesc: 'Unique identifier for the field',
                  longDesc: 'A unique ID for the field (e.g., "heroImage", "publishDate"). Must be unique within the content type.',
                },
                name: {
                  displayName: 'Field Name',
                  shortDesc: 'Display name for the field',
                  longDesc: 'A human-readable name for the field (e.g., "Hero Image", "Publish Date").',
                },
                type: {
                  displayName: 'Field Type',
                  shortDesc: 'Data type (Symbol, Text, Integer, Number, Date, Boolean, RichText, Link, Array, Object, Location)',
                  longDesc: 'The data type for the field. Supported types: Symbol (short text), Text (long text), Integer, Number, Date, Boolean, RichText, Link, Array, Object, Location.',
                },
                required: {
                  displayName: 'Required',
                  shortDesc: 'Whether the field is required',
                  longDesc: 'If enabled, entries must provide a value for this field.',
                },
                localized: {
                  displayName: 'Localized',
                  shortDesc: 'Whether the field supports localization',
                  longDesc: 'If enabled, the field can have different values for different locales.',
                },
              },
            },
          },
        },
      },
    },
    update_content_type: {
      displayName: 'Update a Content Type',
      shortDesc: 'Updates a specific content type by its ID',
      longDesc: 'Updates the name and/or description of an existing content type.',
      groups: ['Content Types'],
      options: {
        space_id: {
          displayName: 'Space',
          shortDesc: 'The Contentful space to use',
          longDesc: 'Select the Contentful space containing the content type.',
        },
        environment_id: {
          displayName: 'Environment',
          shortDesc: 'The environment to use (default: master)',
          longDesc:
            'Select the environment within the space. Defaults to "master" if not specified.',
        },
        content_type_id: {
          displayName: 'Content Type',
          shortDesc: 'The content type to update',
          longDesc: 'Select the content type to update.',
        },
        name: {
          displayName: 'Name',
          shortDesc: 'New name for the content type',
          longDesc: 'The updated name for the content type.',
        },
        description: {
          displayName: 'Description',
          shortDesc: 'New description for the content type',
          longDesc: 'The updated description for the content type.',
        },
      },
    },
    delete_content_type: {
      displayName: 'Delete a Content Type',
      shortDesc: 'Permanently removes a deactivated content type',
      longDesc:
        'Permanently deletes a content type. The content type must be deactivated (unpublished) first. This action is irreversible.',
      groups: ['Content Types'],
      options: {
        space_id: {
          displayName: 'Space',
          shortDesc: 'The Contentful space to use',
          longDesc: 'Select the Contentful space containing the content type.',
        },
        environment_id: {
          displayName: 'Environment',
          shortDesc: 'The environment to use (default: master)',
          longDesc:
            'Select the environment within the space. Defaults to "master" if not specified.',
        },
        content_type_id: {
          displayName: 'Content Type',
          shortDesc: 'The content type to delete',
          longDesc: 'Select the content type to permanently remove.',
        },
      },
    },
    activate_content_type: {
      displayName: 'Activate a Content Type',
      shortDesc: 'Activates a content type by its ID',
      longDesc:
        'Publishes (activates) a content type, making it available for creating entries.',
      groups: ['Content Types'],
      options: {
        space_id: {
          displayName: 'Space',
          shortDesc: 'The Contentful space to use',
          longDesc: 'Select the Contentful space containing the content type.',
        },
        environment_id: {
          displayName: 'Environment',
          shortDesc: 'The environment to use (default: master)',
          longDesc:
            'Select the environment within the space. Defaults to "master" if not specified.',
        },
        content_type_id: {
          displayName: 'Content Type',
          shortDesc: 'The content type to activate',
          longDesc: 'Select the content type to activate (publish).',
        },
      },
    },
    deactivate_content_type: {
      displayName: 'Deactivate a Content Type',
      shortDesc: 'Changes a content type status to "draft"',
      longDesc:
        'Unpublishes (deactivates) a content type, reverting it to draft state. No new entries can be created for a deactivated content type.',
      groups: ['Content Types'],
      options: {
        space_id: {
          displayName: 'Space',
          shortDesc: 'The Contentful space to use',
          longDesc: 'Select the Contentful space containing the content type.',
        },
        environment_id: {
          displayName: 'Environment',
          shortDesc: 'The environment to use (default: master)',
          longDesc:
            'Select the environment within the space. Defaults to "master" if not specified.',
        },
        content_type_id: {
          displayName: 'Content Type',
          shortDesc: 'The content type to deactivate',
          longDesc: 'Select the content type to deactivate (unpublish).',
        },
      },
    },
    add_field_to_content_type: {
      displayName: 'Add a Field to a Content Type',
      shortDesc: 'Adds a new field to a specific content type',
      longDesc:
        'Adds a new field definition to an existing content type. The content type will need to be re-activated after adding the field.',
      groups: ['Content Types'],
      options: {
        space_id: {
          displayName: 'Space',
          shortDesc: 'The Contentful space to use',
          longDesc: 'Select the Contentful space containing the content type.',
        },
        environment_id: {
          displayName: 'Environment',
          shortDesc: 'The environment to use (default: master)',
          longDesc:
            'Select the environment within the space. Defaults to "master" if not specified.',
        },
        content_type_id: {
          displayName: 'Content Type',
          shortDesc: 'The content type to add the field to',
          longDesc: 'Select the content type to modify.',
        },
        field_id: {
          displayName: 'Field ID',
          shortDesc: 'Unique identifier for the new field',
          longDesc:
            'A unique ID for the field (e.g., "heroImage", "publishDate"). Must be unique within the content type.',
        },
        field_name: {
          displayName: 'Field Name',
          shortDesc: 'Display name for the new field',
          longDesc: 'A human-readable name for the field (e.g., "Hero Image", "Publish Date").',
        },
        field_type: {
          displayName: 'Field Type',
          shortDesc: 'The data type for the field',
          longDesc:
            'Select the data type: Symbol (short text), Text (long text), Integer, Number, Date, Boolean, RichText, Link, Array, Object, or Location.',
        },
        required: {
          displayName: 'Required',
          shortDesc: 'Whether the field is required',
          longDesc: 'If enabled, entries must provide a value for this field.',
        },
        localized: {
          displayName: 'Localized',
          shortDesc: 'Whether the field supports localization',
          longDesc: 'If enabled, the field can have different values for different locales.',
        },
      },
    },
    update_field_of_content_type: {
      displayName: 'Update a Field of a Content Type',
      shortDesc: 'Updates a field inside a specific content type',
      longDesc: 'Updates the properties of an existing field in a content type.',
      groups: ['Content Types'],
      options: {
        space_id: {
          displayName: 'Space',
          shortDesc: 'The Contentful space to use',
          longDesc: 'Select the Contentful space containing the content type.',
        },
        environment_id: {
          displayName: 'Environment',
          shortDesc: 'The environment to use (default: master)',
          longDesc:
            'Select the environment within the space. Defaults to "master" if not specified.',
        },
        content_type_id: {
          displayName: 'Content Type',
          shortDesc: 'The content type containing the field',
          longDesc: 'Select the content type to modify.',
        },
        field_id: {
          displayName: 'Field',
          shortDesc: 'The field to update',
          longDesc: 'Select the field to update.',
        },
        field_name: {
          displayName: 'Field Name',
          shortDesc: 'New display name for the field',
          longDesc: 'The updated display name for the field.',
        },
        required: {
          displayName: 'Required',
          shortDesc: 'Whether the field is required',
          longDesc: 'Update whether entries must provide a value for this field.',
        },
        localized: {
          displayName: 'Localized',
          shortDesc: 'Whether the field supports localization',
          longDesc: 'Update whether the field can have different values for different locales.',
        },
      },
    },
    delete_field_from_content_type: {
      displayName: 'Delete a Field from a Content Type',
      shortDesc: 'Removes a field from a specific content type',
      longDesc:
        'Removes a field from a content type. The field is first marked as omitted, then removed entirely. Existing entry data for this field will be lost.',
      groups: ['Content Types'],
      options: {
        space_id: {
          displayName: 'Space',
          shortDesc: 'The Contentful space to use',
          longDesc: 'Select the Contentful space containing the content type.',
        },
        environment_id: {
          displayName: 'Environment',
          shortDesc: 'The environment to use (default: master)',
          longDesc:
            'Select the environment within the space. Defaults to "master" if not specified.',
        },
        content_type_id: {
          displayName: 'Content Type',
          shortDesc: 'The content type containing the field',
          longDesc: 'Select the content type to modify.',
        },
        field_id: {
          displayName: 'Field',
          shortDesc: 'The field to remove',
          longDesc: 'Select the field to permanently remove from the content type.',
        },
      },
    },
    search_content_types: {
      displayName: 'Search Content Types',
      shortDesc: 'Searches for content types',
      longDesc:
        'Searches for content types with optional text filtering. Returns a paginated list of content types with their field definitions.',
      groups: ['Content Types'],
      options: {
        space_id: {
          displayName: 'Space',
          shortDesc: 'The Contentful space to search',
          longDesc: 'Select the Contentful space to search in.',
        },
        environment_id: {
          displayName: 'Environment',
          shortDesc: 'The environment to use (default: master)',
          longDesc:
            'Select the environment within the space. Defaults to "master" if not specified.',
        },
        query: {
          displayName: 'Search Query',
          shortDesc: 'Text search query',
          longDesc: 'Optional text to search across content type names and descriptions.',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of results to return',
          longDesc: 'The maximum number of content types to return. Default is 100.',
        },
        skip: {
          displayName: 'Skip',
          shortDesc: 'Number of results to skip',
          longDesc: 'The number of content types to skip for pagination. Default is 0.',
        },
      },
    },
  },
  triggers: {
    watch_event: {
      displayName: 'Watch an Event',
      shortDesc: 'Triggers when a new event occurs',
      longDesc:
        'Creates a webhook in Contentful that triggers when selected events occur. Supports entry, asset, and content type events such as creation, updates, publishing, and deletion.',
      groups: ['Events'],
      options: {
        space_id: {
          displayName: 'Space',
          shortDesc: 'The Contentful space to monitor',
          longDesc: 'Select the Contentful space to monitor for events.',
        },
        environment_id: {
          displayName: 'Environment',
          shortDesc: 'The environment to use (default: master)',
          longDesc:
            'Select the environment within the space. Defaults to "master" if not specified.',
        },
        event_types: {
          displayName: 'Event Types',
          shortDesc: 'The types of events to watch for',
          longDesc:
            'Select one or more event types to trigger on. Events include entry, asset, and content type lifecycle events.',
        },
      },
    },
  },
};

export default ContentfulAppEn;
