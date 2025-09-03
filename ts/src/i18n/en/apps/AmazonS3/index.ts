/* eslint-disable max-len */
const AmazonS3AppEn = {
  displayName: 'AWS S3',
  shortDesc:
    'Seamlessly connect to Amazon S3 to manage buckets, upload files, and automate your cloud storage workflows.',
  longDesc:
    'The Amazon S3 integration provides comprehensive actions and triggers to interact with Amazon Simple Storage Service. Whether you need to manage buckets, upload and download files, or monitor changes to your S3 objects, this integration simplifies your cloud storage automation and file management workflows.',
  triggers: {
    new_bucket: {
      displayName: 'New Bucket',
      shortDesc: 'Triggers when a new S3 bucket is created',
      longDesc:
        'Monitors for newly created S3 buckets and triggers when a bucket is detected. Useful for tracking bucket creation events and implementing automated governance policies.',
      options: {
        region: {
          displayName: 'Region',
          shortDesc: 'AWS region to monitor for new buckets',
          longDesc:
            'The AWS region where the S3 client will be configured to monitor for new bucket creation events.',
        },
      },
    },
    new_or_updated_file: {
      displayName: 'New or Updated File',
      shortDesc: 'Triggers when files are created or modified in an S3 bucket',
      longDesc:
        'Monitors an S3 bucket for new or updated files and triggers when changes are detected. Supports prefix filtering to monitor specific directories or file patterns.',
      options: {
        region: {
          displayName: 'Region',
          shortDesc: 'AWS region where the bucket is located',
          longDesc: 'The AWS region where the S3 bucket is located for monitoring file changes.',
        },
        bucket_name: {
          displayName: 'Bucket Name',
          shortDesc: 'S3 bucket to monitor for file changes',
          longDesc: 'The name of the S3 bucket to monitor for new or updated files.',
        },
        prefix: {
          displayName: 'Prefix Filter',
          shortDesc: 'Optional prefix to filter objects (e.g., "uploads/")',
          longDesc:
            'Optional prefix to limit monitoring to objects with specific key prefixes, useful for monitoring specific directories or file patterns.',
        },
      },
    },
  },
  actions: {
    create_bucket: {
      displayName: 'Create Bucket',
      shortDesc: 'Create a new S3 bucket',
      longDesc:
        'Creates a new S3 bucket with configurable access control and object lock settings. Bucket names must be globally unique and follow AWS naming conventions.',
      options: {
        bucket_name: {
          displayName: 'Bucket Name',
          shortDesc: 'Name for the new bucket (must be globally unique)',
          longDesc:
            'The name for the new S3 bucket. Must be globally unique across all AWS accounts and follow S3 naming conventions (lowercase letters, numbers, hyphens only).',
        },
        region: {
          displayName: 'Region',
          shortDesc: 'AWS region where the bucket will be created',
          longDesc:
            'The AWS region where the S3 bucket will be created. Affects latency and data residency.',
        },
        acl: {
          displayName: 'Access Control List (ACL)',
          shortDesc: 'Access permissions for the bucket',
          longDesc:
            'Predefined access control list that defines who can access the bucket and what permissions they have.',
        },
        object_lock_enabled: {
          displayName: 'Object Lock Enabled',
          shortDesc: 'Enable object lock for compliance and data retention',
          longDesc:
            'Enables S3 Object Lock to prevent object deletion or modification for compliance and data retention requirements.',
        },
      },
    },
    create_text_object: {
      displayName: 'Create Text Object',
      shortDesc: 'Upload text content directly to S3',
      longDesc:
        'Creates an S3 object with text content, supporting various text formats and content types. Useful for uploading configuration files, logs, or document content.',
      options: {
        region: {
          displayName: 'Region',
          shortDesc: 'AWS region where the bucket is located',
          longDesc: 'The AWS region where the target S3 bucket is located.',
        },
        bucket_name: {
          displayName: 'Bucket Name',
          shortDesc: 'Target S3 bucket for the text object',
          longDesc: 'The name of the S3 bucket where the text object will be created.',
        },
        object_key: {
          displayName: 'Object Key',
          shortDesc: 'S3 object key (file path) for the text content',
          longDesc:
            'The S3 object key that serves as the unique identifier and path for the text object within the bucket.',
        },
        content: {
          displayName: 'Content',
          shortDesc: 'Text content to upload',
          longDesc: 'The text content that will be uploaded to S3 as the object body.',
        },
        content_type: {
          displayName: 'Content Type',
          shortDesc: 'MIME type for the text content',
          longDesc: 'The MIME type that describes the format of the text content being uploaded.',
        },
        storage_class: {
          displayName: 'Storage Class',
          shortDesc: 'S3 storage class for cost optimization',
          longDesc:
            'The S3 storage class that determines the storage costs and retrieval characteristics of the object.',
        },
        metadata: {
          displayName: 'Metadata',
          shortDesc: 'Custom metadata key-value pairs',
          longDesc:
            'Custom metadata as key-value pairs that will be stored with the object for additional context or application use.',
        },
        tags: {
          displayName: 'Tags',
          shortDesc: 'Object tags for organization and cost tracking',
          longDesc:
            'Key-value pairs used for object organization, cost allocation, and lifecycle management.',
        },
      },
    },
    upload_file: {
      displayName: 'Upload File',
      shortDesc: 'Upload a file to S3',
      longDesc:
        'Uploads a file to S3 with support for custom object keys, storage classes, metadata, and tagging. Handles binary files through base64 encoding.',
      options: {
        region: {
          displayName: 'Region',
          shortDesc: 'AWS region where the bucket is located',
          longDesc: 'The AWS region where the target S3 bucket is located.',
        },
        bucket_name: {
          displayName: 'Bucket Name',
          shortDesc: 'Target S3 bucket for the file upload',
          longDesc: 'The name of the S3 bucket where the file will be uploaded.',
        },
        file: {
          displayName: 'File',
          shortDesc: 'File to upload to S3',
          longDesc:
            'The file to be uploaded to S3, including its content, filename, and MIME type.',
        },
        object_key: {
          displayName: 'Object Key',
          shortDesc: 'Custom S3 object key (optional, uses filename if not provided)',
          longDesc:
            'Optional custom S3 object key for the uploaded file. If not provided, the original filename will be used.',
        },
        storage_class: {
          displayName: 'Storage Class',
          shortDesc: 'S3 storage class for cost optimization',
          longDesc:
            'The S3 storage class that determines the storage costs and retrieval characteristics of the uploaded file.',
        },
        metadata: {
          displayName: 'Metadata',
          shortDesc: 'Custom metadata key-value pairs',
          longDesc:
            'Custom metadata as key-value pairs that will be stored with the uploaded file.',
        },
        tags: {
          displayName: 'Tags',
          shortDesc: 'File tags for organization and cost tracking',
          longDesc:
            'Key-value pairs used for file organization, cost allocation, and lifecycle management.',
        },
      },
    },
    get_object: {
      displayName: 'Get Object',
      shortDesc: 'Retrieve S3 object with detailed metadata',
      longDesc:
        'Retrieves an S3 object with comprehensive metadata including size, modification dates, storage class, and custom metadata. Optionally includes object content.',
      options: {
        region: {
          displayName: 'Region',
          shortDesc: 'AWS region where the bucket is located',
          longDesc: 'The AWS region where the source S3 bucket is located.',
        },
        bucket_name: {
          displayName: 'Bucket Name',
          shortDesc: 'Source S3 bucket containing the object',
          longDesc: 'The name of the S3 bucket containing the object to retrieve.',
        },
        object_key: {
          displayName: 'Object Key',
          shortDesc: 'S3 object key to retrieve',
          longDesc:
            'The S3 object key that uniquely identifies the object to retrieve within the bucket.',
        },
        include_content: {
          displayName: 'Include Content',
          shortDesc: 'Whether to include the object content in the response',
          longDesc:
            'When enabled, includes the actual object content in the response. Disable for metadata-only retrieval to improve performance.',
        },
        version_id: {
          displayName: 'Version ID',
          shortDesc: 'Specific version of the object to retrieve (for versioned buckets)',
          longDesc:
            'Optional version ID to retrieve a specific version of the object from a versioned S3 bucket.',
        },
      },
    },
    get_file: {
      displayName: 'Get File',
      shortDesc: 'Download file from S3',
      longDesc:
        'Downloads a file from S3 and returns it in standard file format for direct use. Simpler alternative to Get Object when only the file content is needed.',
      options: {
        region: {
          displayName: 'Region',
          shortDesc: 'AWS region where the bucket is located',
          longDesc: 'The AWS region where the source S3 bucket is located.',
        },
        bucket_name: {
          displayName: 'Bucket Name',
          shortDesc: 'Source S3 bucket containing the file',
          longDesc: 'The name of the S3 bucket containing the file to download.',
        },
        object_key: {
          displayName: 'Object Key',
          shortDesc: 'S3 object key of the file to download',
          longDesc:
            'The S3 object key that uniquely identifies the file to download within the bucket.',
        },
        version_id: {
          displayName: 'Version ID',
          shortDesc: 'Specific version of the file to download (for versioned buckets)',
          longDesc:
            'Optional version ID to download a specific version of the file from a versioned S3 bucket.',
        },
      },
    },
    list_objects: {
      displayName: 'List Objects',
      shortDesc: 'List all objects in an S3 bucket',
      longDesc:
        'Lists all objects in an S3 bucket including files and directories with support for pagination, prefixes, and delimiters for hierarchical navigation.',
      options: {
        region: {
          displayName: 'Region',
          shortDesc: 'AWS region where the bucket is located',
          longDesc: 'The AWS region where the target S3 bucket is located.',
        },
        bucket_name: {
          displayName: 'Bucket Name',
          shortDesc: 'S3 bucket to list objects from',
          longDesc: 'The name of the S3 bucket from which to list objects.',
        },
        prefix: {
          displayName: 'Prefix Filter',
          shortDesc: 'Optional prefix to filter objects',
          longDesc:
            'Optional prefix to limit results to objects with keys that start with this prefix.',
        },
        max_keys: {
          displayName: 'Max Keys',
          shortDesc: 'Maximum number of objects to return',
          longDesc:
            'The maximum number of objects to return in a single request. Use with continuation tokens for pagination.',
        },
        continuation_token: {
          displayName: 'Continuation Token',
          shortDesc: 'Token for pagination of results',
          longDesc:
            'Continuation token from a previous request to retrieve the next page of results.',
        },
        delimiter: {
          displayName: 'Delimiter',
          shortDesc: 'Delimiter for hierarchical listing (e.g., "/")',
          longDesc:
            'Character used to group objects into a hierarchy. Common prefixes will be returned separately.',
        },
        start_after: {
          displayName: 'Start After',
          shortDesc: 'Object key to start listing after',
          longDesc: 'Start listing objects lexicographically after this key.',
        },
      },
    },
    list_files: {
      displayName: 'List Files',
      shortDesc: 'List files in an S3 bucket (excludes directories)',
      longDesc:
        'Lists only actual files in an S3 bucket, excluding directories and common prefixes. Supports file extension filtering and provides file-specific statistics.',
      options: {
        region: {
          displayName: 'Region',
          shortDesc: 'AWS region where the bucket is located',
          longDesc: 'The AWS region where the target S3 bucket is located.',
        },
        bucket_name: {
          displayName: 'Bucket Name',
          shortDesc: 'S3 bucket to list files from',
          longDesc: 'The name of the S3 bucket from which to list files.',
        },
        prefix: {
          displayName: 'Prefix Filter',
          shortDesc: 'Optional prefix to filter files',
          longDesc:
            'Optional prefix to limit results to files with keys that start with this prefix.',
        },
        max_keys: {
          displayName: 'Max Keys',
          shortDesc: 'Maximum number of files to return',
          longDesc: 'The maximum number of files to return in a single request.',
        },
        file_extensions: {
          displayName: 'File Extensions',
          shortDesc: 'Filter by specific file extensions (e.g., ["pdf", "jpg"])',
          longDesc:
            'Optional list of file extensions to filter results. Only files with matching extensions will be returned.',
        },
        continuation_token: {
          displayName: 'Continuation Token',
          shortDesc: 'Token for pagination of results',
          longDesc:
            'Continuation token from a previous request to retrieve the next page of results.',
        },
      },
    },
    delete_object: {
      displayName: 'Delete Object',
      shortDesc: 'Delete an object from S3',
      longDesc:
        'Deletes an object from S3 with support for versioned objects and governance retention bypass. Use with caution as deletions may be permanent.',
      options: {
        region: {
          displayName: 'Region',
          shortDesc: 'AWS region where the bucket is located',
          longDesc: 'The AWS region where the target S3 bucket is located.',
        },
        bucket_name: {
          displayName: 'Bucket Name',
          shortDesc: 'S3 bucket containing the object to delete',
          longDesc: 'The name of the S3 bucket containing the object to delete.',
        },
        object_key: {
          displayName: 'Object Key',
          shortDesc: 'S3 object key to delete',
          longDesc:
            'The S3 object key that uniquely identifies the object to delete within the bucket.',
        },
        version_id: {
          displayName: 'Version ID',
          shortDesc: 'Specific version to delete (for versioned buckets)',
          longDesc:
            'Optional version ID to delete a specific version of the object from a versioned S3 bucket.',
        },
        bypass_governance_retention: {
          displayName: 'Bypass Governance Retention',
          shortDesc: 'Bypass governance-mode object lock retention',
          longDesc:
            'When enabled, bypasses governance-mode Object Lock retention. Requires appropriate permissions.',
        },
      },
    },
    list_buckets: {
      displayName: 'List Buckets',
      shortDesc: 'List all S3 buckets in the account',
      longDesc:
        'Lists all S3 buckets in the AWS account with creation dates and regions. Optionally includes detailed location information for each bucket.',
      options: {
        region: {
          displayName: 'Region',
          shortDesc: 'AWS region for the S3 client',
          longDesc: 'The AWS region where the S3 client will be configured for listing buckets.',
        },
        include_location: {
          displayName: 'Include Location',
          shortDesc: 'Whether to fetch the actual region for each bucket',
          longDesc:
            'When enabled, fetches the actual AWS region for each bucket. Disable for faster responses when region information is not needed.',
        },
      },
    },
  },
};

export default AmazonS3AppEn;
