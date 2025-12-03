/* eslint-disable max-len */
const FirestoreAppEn = {
  displayName: 'Firestore',
  groups: ['Databases & Backend Services'],
  shortDesc: 'Connect to Google Cloud Firestore to manage your NoSQL document database.',
  longDesc:
    'The Firestore integration enables you to interact with Google Cloud Firestore, a flexible, scalable NoSQL cloud database. Create, read, update, and delete documents, manage collections, and execute queries to automate your document database operations seamlessly.',
  triggers: {
    new_document: {
      displayName: 'New Document',
      shortDesc: 'Triggers when a new document is created in a Firestore collection',
      longDesc:
        'Monitors a Firestore collection for newly created documents. Documents are ordered based on your specified criteria, and the trigger activates when new documents appear at the top of the ordered list. You can optionally filter documents and customize the ordering to track specific types of documents.',
      options: {
        project_id: {
          displayName: 'Project ID',
          shortDesc: 'The Google Cloud project ID',
          longDesc:
            'The unique identifier for your Google Cloud project containing the Firestore database',
        },
        collection_path: {
          displayName: 'Collection Path',
          shortDesc: 'The path to the Firestore collection',
          longDesc:
            'The full path to the collection you want to monitor. For nested collections, use the format: parent_collection/parent_doc_id/nested_collection',
        },
        filters: {
          displayName: 'Filters',
          shortDesc: 'Optional filters to apply to documents',
          longDesc:
            'Define one or more filters to narrow down which documents will trigger the event. Multiple filters are combined with AND logic.',
          type: {
            element_type: {
              fields: {
                field: {
                  displayName: 'Field',
                  shortDesc: 'The document field to filter on',
                  longDesc: 'Select the field name in the document that you want to filter',
                },
                operator: {
                  displayName: 'Operator',
                  shortDesc: 'The comparison operator',
                  longDesc:
                    'The comparison operation to perform between the field value and your specified value',
                },
                value: {
                  displayName: 'Value',
                  shortDesc: 'The value to compare against',
                  longDesc:
                    'The value to use in the comparison. The value will be automatically converted to the appropriate type (string, number, boolean, or null)',
                },
              },
            },
          },
        },
        order_by: {
          displayName: 'Order By',
          shortDesc: 'Specify how to order documents',
          longDesc:
            'Define the ordering criteria for documents. The trigger will activate for documents that appear at the top of the ordered list. If not specified, documents are ordered by creation time in descending order (newest first).',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'The field to order by',
                longDesc: 'Select the document field to use for ordering',
              },
              direction: {
                displayName: 'Direction',
                shortDesc: 'Sort direction',
                longDesc:
                  'Choose ascending (oldest/smallest first) or descending (newest/largest first) order',
              },
            },
          },
        },
      },
    },
  },
  actions: {
    list_projects: {
      displayName: 'List Projects',
      shortDesc: 'List all Google Cloud projects accessible with the current credentials',
      longDesc:
        'Retrieves a list of all Google Cloud projects that are accessible with your credentials. You can filter projects by name and use pagination to navigate through large result sets. This is useful for discovering which projects contain Firestore databases.',
      options: {
        name: {
          displayName: 'Project Name',
          shortDesc: 'Filter projects by name',
          longDesc:
            'Optional filter to search for projects containing this name. The search is case-insensitive and matches partial names.',
        },
        page_size: {
          displayName: 'Page Size',
          shortDesc: 'Number of projects to return per page',
          longDesc:
            'The maximum number of projects to return in a single request. Default is 100. Use this with pagination tokens to retrieve large result sets.',
        },
        next_page_token: {
          displayName: 'Next Page Token',
          shortDesc: 'Token for retrieving the next page of results',
          longDesc:
            'Pagination token obtained from a previous request. Use this to retrieve the next page of projects when there are more results than the page size.',
        },
      },
    },
    create_document: {
      groups: ['Documents'],
      displayName: 'Create Document',
      shortDesc: 'Create a new document in a Firestore collection',
      longDesc:
        'Creates a new document in the specified Firestore collection. You can either let Firestore auto-generate a document ID or provide your own. The document data can be specified through structured fields or as a custom hash object.',
      options: {
        project_id: {
          displayName: 'Project ID',
          shortDesc: 'The Google Cloud project ID',
          longDesc:
            'The unique identifier for your Google Cloud project containing the Firestore database',
        },
        collection_path: {
          displayName: 'Collection Path',
          shortDesc: 'The path to the Firestore collection',
          longDesc:
            'The full path to the collection where the document will be created. For nested collections, use the format: parent_collection/parent_doc_id/nested_collection',
        },
        document_id: {
          displayName: 'Document ID',
          shortDesc: 'Custom document ID (optional)',
          longDesc:
            'Optional custom identifier for the document. If not provided, Firestore will auto-generate a unique ID. Document IDs must be valid UTF-8 strings and cannot contain forward slashes.',
        },
        data: {
          displayName: 'Document Data',
          shortDesc: 'The data to store in the document',
          longDesc:
            'The structured data to store in the document. This will be dynamically typed based on the collection schema if available. Each field will be stored with its appropriate Firestore data type.',
        },
        additional_data: {
          displayName: 'Additional Data',
          shortDesc: 'Additional fields to include in the document',
          longDesc:
            'Optional additional fields to merge with the structured data. Use this to add fields that are not part of the predefined schema or to include dynamic fields.',
        },
      },
    },
    get_document: {
      groups: ['Documents'],
      displayName: 'Get Document',
      shortDesc: 'Retrieve a specific document from a Firestore collection',
      longDesc:
        'Fetches a single document by its ID from a Firestore collection. Returns the complete document data including metadata such as creation time and last update time. This action will fail if the document does not exist.',
      options: {
        project_id: {
          displayName: 'Project ID',
          shortDesc: 'The Google Cloud project ID',
          longDesc:
            'The unique identifier for your Google Cloud project containing the Firestore database',
        },
        collection_path: {
          displayName: 'Collection Path',
          shortDesc: 'The path to the Firestore collection',
          longDesc:
            'The full path to the collection containing the document. For nested collections, use the format: parent_collection/parent_doc_id/nested_collection',
        },
        document_id: {
          displayName: 'Document ID',
          shortDesc: 'The ID of the document to retrieve',
          longDesc:
            'The unique identifier of the document you want to retrieve. This is the document ID that was either auto-generated or specified when the document was created.',
        },
      },
    },
    update_document: {
      groups: ['Documents'],
      displayName: 'Update Document',
      shortDesc: 'Update an existing document in a Firestore collection',
      longDesc:
        'Updates an existing document in Firestore with new data. You can choose to merge the new data with existing fields or replace the entire document. By default, the update merges new fields while preserving unspecified fields.',
      options: {
        project_id: {
          displayName: 'Project ID',
          shortDesc: 'The Google Cloud project ID',
          longDesc:
            'The unique identifier for your Google Cloud project containing the Firestore database',
        },
        collection_path: {
          displayName: 'Collection Path',
          shortDesc: 'The path to the Firestore collection',
          longDesc:
            'The full path to the collection containing the document. For nested collections, use the format: parent_collection/parent_doc_id/nested_collection',
        },
        document_id: {
          displayName: 'Document ID',
          shortDesc: 'The ID of the document to update',
          longDesc:
            'The unique identifier of the document you want to update. The document must exist or the operation will fail.',
        },
        data: {
          displayName: 'Document Data',
          shortDesc: 'The new data for the document',
          longDesc:
            'The data to update in the document. When merge is enabled, only the specified fields will be updated. When merge is disabled, this data will replace the entire document.',
        },
        additional_data: {
          displayName: 'Additional Data',
          shortDesc: 'Additional fields to update',
          longDesc:
            'Optional additional fields to merge with the structured data. Use this to update fields that are not part of the predefined schema or to include dynamic fields.',
        },
        merge: {
          displayName: 'Merge',
          shortDesc: 'Whether to merge with existing data',
          longDesc:
            'When true (default), only the specified fields are updated and other fields remain unchanged. When false, the entire document is replaced with the new data.',
        },
      },
    },
    delete_document: {
      groups: ['Documents'],
      displayName: 'Delete Document',
      shortDesc: 'Delete a document from a Firestore collection',
      longDesc:
        'Permanently deletes a document from a Firestore collection. This operation cannot be undone. The document must exist or the operation will fail. All subcollections under the document will NOT be automatically deleted.',
      options: {
        project_id: {
          displayName: 'Project ID',
          shortDesc: 'The Google Cloud project ID',
          longDesc:
            'The unique identifier for your Google Cloud project containing the Firestore database',
        },
        collection_path: {
          displayName: 'Collection Path',
          shortDesc: 'The path to the Firestore collection',
          longDesc:
            'The full path to the collection containing the document. For nested collections, use the format: parent_collection/parent_doc_id/nested_collection',
        },
        document_id: {
          displayName: 'Document ID',
          shortDesc: 'The ID of the document to delete',
          longDesc:
            'The unique identifier of the document you want to delete. The document must exist or the operation will fail.',
        },
      },
    },
    list_documents: {
      groups: ['Documents'],
      displayName: 'List Documents',
      shortDesc: 'List all documents in a Firestore collection',
      longDesc:
        'Retrieves all documents from a specified Firestore collection. You can limit the number of results and specify ordering criteria. This action returns the complete document data along with metadata for each document.',
      options: {
        project_id: {
          displayName: 'Project ID',
          shortDesc: 'The Google Cloud project ID',
          longDesc:
            'The unique identifier for your Google Cloud project containing the Firestore database',
        },
        collection_path: {
          displayName: 'Collection Path',
          shortDesc: 'The path to the Firestore collection',
          longDesc:
            'The full path to the collection whose documents you want to list. For nested collections, use the format: parent_collection/parent_doc_id/nested_collection',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of documents to return',
          longDesc:
            'The maximum number of documents to retrieve. Default is 100. Use this to control the size of the result set and improve performance.',
        },
        order_by: {
          displayName: 'Order By',
          shortDesc: 'Field to order documents by',
          longDesc:
            'Optional field name to use for ordering the documents. The field must exist in the documents and be of a comparable type (string, number, date).',
        },
        order_direction: {
          displayName: 'Order Direction',
          shortDesc: 'Sort direction for ordering',
          longDesc:
            'The direction to sort documents when an order_by field is specified. Choose ascending for lowest to highest or descending for highest to lowest.',
        },
      },
    },
    list_collections: {
      groups: ['Collections'],
      displayName: 'List Collections',
      shortDesc: 'List all collections in a Firestore database or document',
      longDesc:
        'Retrieves all collection IDs at the root level of a Firestore database or within a specific document. This is useful for discovering the structure of your Firestore database and navigating nested collections.',
      options: {
        project_id: {
          displayName: 'Project ID',
          shortDesc: 'The Google Cloud project ID',
          longDesc:
            'The unique identifier for your Google Cloud project containing the Firestore database',
        },
        parent_document_path: {
          displayName: 'Parent Document Path',
          shortDesc: 'Path to the parent document (optional)',
          longDesc:
            'Optional path to a document whose subcollections you want to list. If not specified, lists root-level collections. Format: collection_id/document_id',
        },
      },
    },
    get_collection: {
      displayName: 'Get Collection',
      shortDesc: 'Get information about a Firestore collection',
      longDesc:
        'Retrieves metadata and information about a specific Firestore collection. This includes checking if the collection exists, whether it has documents, and optionally retrieving sample documents from the collection.',
      options: {
        project_id: {
          displayName: 'Project ID',
          shortDesc: 'The Google Cloud project ID',
          longDesc:
            'The unique identifier for your Google Cloud project containing the Firestore database',
        },
        collection_id: {
          displayName: 'Collection ID',
          shortDesc: 'The ID of the collection',
          longDesc:
            'The identifier of the collection you want to retrieve information about. This is the collection name without any parent path.',
        },
        parent_document_path: {
          displayName: 'Parent Document Path',
          shortDesc: 'Path to the parent document (optional)',
          longDesc:
            'Optional path to the parent document if this is a subcollection. If not specified, assumes this is a root-level collection. Format: collection_id/document_id',
        },
        include_sample_documents: {
          displayName: 'Include Sample Documents',
          shortDesc: 'Whether to include sample documents',
          longDesc:
            'When true, includes sample documents from the collection in the response. This helps you understand the structure and content of the collection.',
        },
        sample_limit: {
          displayName: 'Sample Limit',
          shortDesc: 'Number of sample documents to include',
          longDesc:
            'The maximum number of sample documents to retrieve when include_sample_documents is true. Default is 5.',
        },
      },
    },
    query_documents: {
      displayName: 'Query Documents',
      shortDesc: 'Query documents in a Firestore collection with filters and ordering',
      longDesc:
        'Performs advanced queries on a Firestore collection with support for multiple filters, ordering, and limits. This allows you to search for specific documents based on field values and retrieve them in a particular order.',
      options: {
        project_id: {
          displayName: 'Project ID',
          shortDesc: 'The Google Cloud project ID',
          longDesc:
            'The unique identifier for your Google Cloud project containing the Firestore database',
        },
        collection_path: {
          displayName: 'Collection Path',
          shortDesc: 'The path to the Firestore collection',
          longDesc:
            'The full path to the collection you want to query. For nested collections, use the format: parent_collection/parent_doc_id/nested_collection',
        },
        filters: {
          displayName: 'Filters',
          shortDesc: 'Filter criteria for documents',
          longDesc:
            'Optional list of filters to apply to the query. Multiple filters are combined with AND logic. Each filter specifies a field, comparison operator, and value to match.',
          type: {
            element_type: {
              fields: {
                field: {
                  displayName: 'Field',
                  shortDesc: 'The document field to filter on',
                  longDesc:
                    'The name of the field in the document to apply the filter to. The field must exist in the documents being queried.',
                },
                operator: {
                  displayName: 'Operator',
                  shortDesc: 'The comparison operator',
                  longDesc:
                    'The comparison operator to use for filtering. Options include equality, inequality, comparison operators, and array operators.',
                },
                value: {
                  displayName: 'Value',
                  shortDesc: 'The value to compare against',
                  longDesc:
                    'The value to use in the comparison. The value type should match the field type in the documents (string, number, boolean, etc.).',
                },
              },
            },
          },
        },
        order_by: {
          displayName: 'Order By',
          shortDesc: 'Ordering criteria for results',
          longDesc:
            'Optional list of ordering criteria to apply to the query results. Documents will be sorted by the specified fields in the order they are listed.',
          type: {
            element_type: {
              fields: {
                field: {
                  displayName: 'Field',
                  shortDesc: 'The field to order by',
                  longDesc:
                    'The name of the field to use for ordering. The field must exist in the documents and be of a comparable type.',
                },
                direction: {
                  displayName: 'Direction',
                  shortDesc: 'Sort direction',
                  longDesc:
                    'The direction to sort: ascending (lowest to highest) or descending (highest to lowest).',
                },
              },
            },
          },
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of documents to return',
          longDesc:
            'The maximum number of documents to retrieve. Default is 100. Use this to control query performance and result set size.',
        },
      },
    },
    backup_to_google_cloud_storage: {
      displayName: 'Backup to Google Cloud Storage',
      shortDesc: 'Export Firestore data to Google Cloud Storage',
      longDesc:
        'Creates a backup of your Firestore database or specific collections by exporting the data to Google Cloud Storage. This is useful for disaster recovery, data migration, or creating snapshots of your database at a point in time.',
      options: {
        project_id: {
          displayName: 'Project ID',
          shortDesc: 'The Google Cloud project ID',
          longDesc:
            'The unique identifier for your Google Cloud project containing the Firestore database to backup',
        },
        output_uri_prefix: {
          displayName: 'Output URI Prefix',
          shortDesc: 'GCS bucket URI where backup will be stored',
          longDesc:
            'The Google Cloud Storage URI prefix where the backup files will be written. Format: gs://bucket-name/path/to/backup. The bucket must already exist and you must have write permissions.',
        },
        collection_ids: {
          displayName: 'Collection IDs',
          shortDesc: 'Specific collections to backup (optional)',
          longDesc:
            'Optional list of collection IDs to backup. If not specified, the entire database will be backed up. Use this to create selective backups of specific collections.',
        },
      },
    },
    restore_from_google_cloud_storage: {
      displayName: 'Restore from Google Cloud Storage',
      shortDesc: 'Import Firestore data from Google Cloud Storage',
      longDesc:
        'Restores Firestore data from a previous backup stored in Google Cloud Storage. This operation can restore the entire database or specific collections. Warning: This will overwrite existing documents with the same IDs.',
      options: {
        project_id: {
          displayName: 'Project ID',
          shortDesc: 'The Google Cloud project ID',
          longDesc:
            'The unique identifier for your Google Cloud project where the data will be restored',
        },
        input_uri_prefix: {
          displayName: 'Input URI Prefix',
          shortDesc: 'GCS bucket URI where backup is stored',
          longDesc:
            'The Google Cloud Storage URI prefix where the backup files are located. This should match the output_uri_prefix used when creating the backup. Format: gs://bucket-name/path/to/backup',
        },
        collection_ids: {
          displayName: 'Collection IDs',
          shortDesc: 'Specific collections to restore (optional)',
          longDesc:
            'Optional list of collection IDs to restore from the backup. If not specified, all collections in the backup will be restored. Use this to selectively restore specific collections.',
        },
      },
    },
  },
};

export default FirestoreAppEn;
