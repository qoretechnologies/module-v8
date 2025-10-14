/* eslint-disable max-len */
const FirebaseAppEn = {
  displayName: 'Firebase',
  shortDesc: 'Connect to Firebase to manage storage, authentication, and push notifications',
  longDesc:
    'The Firebase integration provides comprehensive access to Firebase services including Cloud Storage for file management, Authentication for user management, and Firebase Cloud Messaging for push notifications. Automate file uploads, user account operations, and notification delivery across your Firebase projects.',
  actions: {
    list_users: {
      displayName: 'List Users',
      shortDesc: 'Retrieve a list of users from Firebase Authentication',
      longDesc:
        'Fetches users from Firebase Authentication with support for pagination. Returns user details including email, display name, verification status, and authentication metadata. Use pagination parameters to retrieve large user lists efficiently.',
      options: {
        project_id: {
          displayName: 'Project ID',
          shortDesc: 'The Firebase project to query',
          longDesc:
            'Select the Firebase project from which you want to retrieve users. The project must have Firebase Authentication enabled.',
        },
        max_results: {
          displayName: 'Max Results',
          shortDesc: 'Maximum number of users to return',
          longDesc:
            'Specify the maximum number of users to retrieve in a single request. Defaults to 100 if not specified. Use pagination for larger datasets.',
        },
        next_page_token: {
          displayName: 'Next Page Token',
          shortDesc: 'Token for retrieving the next page of results',
          longDesc:
            'Provide the pagination token from a previous response to retrieve the next set of users. Leave empty for the first page.',
        },
      },
    },
    get_user: {
      displayName: 'Get User',
      shortDesc: 'Retrieve detailed information about a specific Firebase user',
      longDesc:
        'Fetches comprehensive details for a specific user from Firebase Authentication including email, display name, photo URL, verification status, account creation date, and custom attributes. Useful for user profile lookups and account verification.',
      options: {
        project_id: {
          displayName: 'Project ID',
          shortDesc: 'The Firebase project containing the user',
          longDesc:
            'Select the Firebase project where the user account exists. The project must have Firebase Authentication enabled.',
        },
        user_id: {
          displayName: 'User ID',
          shortDesc: 'The unique identifier of the user',
          longDesc:
            'Specify the Firebase user ID (localId) of the user whose details you want to retrieve. This is the unique identifier assigned by Firebase Authentication.',
        },
      },
    },
    send_push_notification: {
      displayName: 'Send Push Notification',
      shortDesc: 'Send a push notification via Firebase Cloud Messaging',
      longDesc:
        'Sends push notifications to specific device tokens or topics using Firebase Cloud Messaging (FCM). Supports rich notifications with titles, body text, images, and custom data payloads. Configure priority levels for Android and iOS delivery.',
      options: {
        project_id: {
          displayName: 'Project ID',
          shortDesc: 'The Firebase project for sending notifications',
          longDesc:
            'Select the Firebase project that will send the push notification. The project must have Firebase Cloud Messaging configured.',
        },
        token_or_topic: {
          displayName: 'Token or Topic',
          shortDesc: 'Device token or topic name',
          longDesc:
            'Specify either a device registration token for sending to a specific device, or a topic name (prefixed with /topics/) for sending to all devices subscribed to that topic.',
        },
        title: {
          displayName: 'Title',
          shortDesc: 'Notification title',
          longDesc:
            'The title text that will be displayed in the notification. Keep it concise and informative.',
        },
        body: {
          displayName: 'Body',
          shortDesc: 'Notification message body',
          longDesc:
            'The main content of the notification message. This text appears below the title in the notification display.',
        },
        image: {
          displayName: 'Image',
          shortDesc: 'Optional image URL for the notification',
          longDesc:
            'Provide a URL to an image that will be displayed in the notification. The image should be publicly accessible and in a supported format (JPEG, PNG).',
        },
        data: {
          displayName: 'Data',
          shortDesc: 'Custom data payload',
          longDesc:
            'Additional custom key-value pairs to include with the notification. This data can be accessed by your app when the notification is received.',
        },
        priority: {
          displayName: 'Priority',
          shortDesc: 'Notification delivery priority',
          longDesc:
            'Set the priority level for notification delivery. High priority notifications are delivered immediately and may wake the device. Normal priority allows for more battery-efficient delivery.',
        },
      },
    },
    upload_file: {
      displayName: 'Upload File',
      shortDesc: 'Upload a file to Firebase Cloud Storage',
      longDesc:
        'Uploads a file to a specified bucket in Firebase Cloud Storage. Returns metadata including file path, content type, size, and generation information. Optionally include custom metadata key-value pairs with the upload.',
      options: {
        project_id: {
          displayName: 'Project ID',
          shortDesc: 'The Firebase project for storage',
          longDesc:
            'Select the Firebase project where the file will be stored. The project must have Firebase Cloud Storage enabled.',
        },
        file_path: {
          displayName: 'File Path',
          shortDesc: 'Destination path in storage',
          longDesc:
            'Specify the full path where the file should be stored in the bucket, including the filename and any directory structure (e.g., "images/profile/avatar.jpg").',
        },
        bucket: {
          displayName: 'Bucket',
          shortDesc: 'Storage bucket name',
          longDesc:
            'Select the Cloud Storage bucket where the file will be uploaded. The bucket must exist in the selected Firebase project.',
        },
        file: {
          displayName: 'File',
          shortDesc: 'The file to upload',
          longDesc:
            'Select or provide the file to upload. The file will be transferred to Firebase Cloud Storage at the specified path.',
        },
        metadata: {
          displayName: 'Metadata',
          shortDesc: 'Custom metadata key-value pairs',
          longDesc:
            'Optional custom metadata to associate with the uploaded file. Provide as key-value pairs that can be retrieved later with the file information.',
        },
      },
    },
    get_file_metadata: {
      displayName: 'Get File Metadata',
      shortDesc: 'Retrieve metadata for a specific file in Cloud Storage',
      longDesc:
        'Fetches comprehensive metadata for a file stored in Firebase Cloud Storage including content type, size, creation date, update date, MD5 hash, custom metadata, and cache control settings. Useful for file verification and management.',
      options: {
        project_id: {
          displayName: 'Project ID',
          shortDesc: 'The Firebase project containing the file',
          longDesc:
            'Select the Firebase project where the file is stored. The project must have Firebase Cloud Storage enabled.',
        },
        bucket: {
          displayName: 'Bucket',
          shortDesc: 'Storage bucket containing the file',
          longDesc:
            'Select the Cloud Storage bucket where the file is located. The bucket must exist in the selected Firebase project.',
        },
        file_path: {
          displayName: 'File Path',
          shortDesc: 'Path to the file in storage',
          longDesc:
            'Specify the full path to the file in the bucket, including the filename and any directory structure.',
        },
      },
    },
    list_files_in_bucket: {
      displayName: 'List Files in Bucket',
      shortDesc: 'List all files in a Cloud Storage bucket',
      longDesc:
        'Retrieves a list of files from a Firebase Cloud Storage bucket with support for filtering by prefix and pagination. Returns file metadata including paths, content types, sizes, and timestamps. Useful for browsing and managing stored files.',
      options: {
        project_id: {
          displayName: 'Project ID',
          shortDesc: 'The Firebase project containing the bucket',
          longDesc:
            'Select the Firebase project where the storage bucket exists. The project must have Firebase Cloud Storage enabled.',
        },
        bucket: {
          displayName: 'Bucket',
          shortDesc: 'Storage bucket to list files from',
          longDesc:
            'Select the Cloud Storage bucket whose files you want to list. The bucket must exist in the selected Firebase project.',
        },
        prefix: {
          displayName: 'Prefix',
          shortDesc: 'Optional prefix to filter files',
          longDesc:
            'Filter results to only include files whose paths start with this prefix. Useful for listing files in a specific directory or with a specific naming pattern.',
        },
        max_results: {
          displayName: 'Max Results',
          shortDesc: 'Maximum number of files to return',
          longDesc:
            'Specify the maximum number of files to retrieve in a single request. Defaults to 100 if not specified. Use pagination for larger result sets.',
        },
        page_token: {
          displayName: 'Page Token',
          shortDesc: 'Token for retrieving the next page',
          longDesc:
            'Provide the pagination token from a previous response to retrieve the next set of files. Leave empty for the first page.',
        },
      },
    },
    list_buckets: {
      displayName: 'List Buckets',
      shortDesc: 'List all Cloud Storage buckets in a Firebase project',
      longDesc:
        'Retrieves all Cloud Storage buckets configured for a Firebase project. Returns bucket details including names, locations, storage classes, creation dates, and update timestamps. Useful for bucket management and discovery.',
      options: {
        project_id: {
          displayName: 'Project ID',
          shortDesc: 'The Firebase project to query',
          longDesc:
            'Select the Firebase project whose storage buckets you want to list. The project must have Firebase Cloud Storage enabled.',
        },
      },
    },
    delete_file: {
      displayName: 'Delete File',
      shortDesc: 'Delete a file from Cloud Storage',
      longDesc:
        'Permanently removes a file from Firebase Cloud Storage. This operation is irreversible, so use with caution. Returns confirmation of the deletion including the file path and bucket name.',
      options: {
        project_id: {
          displayName: 'Project ID',
          shortDesc: 'The Firebase project containing the file',
          longDesc:
            'Select the Firebase project where the file is stored. The project must have Firebase Cloud Storage enabled.',
        },
        bucket: {
          displayName: 'Bucket',
          shortDesc: 'Storage bucket containing the file',
          longDesc:
            'Select the Cloud Storage bucket where the file to be deleted is located. The bucket must exist in the selected Firebase project.',
        },
        file_path: {
          displayName: 'File Path',
          shortDesc: 'Path to the file to delete',
          longDesc:
            'Specify the full path to the file in the bucket that should be deleted, including the filename and any directory structure. This operation is permanent and cannot be undone.',
        },
      },
    },
  },
  triggers: {
    new_user: {
      displayName: 'New User',
      shortDesc: 'Triggers when a new user is created in Firebase Authentication',
      longDesc:
        'Monitors Firebase Authentication for new user registrations and triggers when new accounts are created. Captures user details including email, display name, verification status, and authentication provider information. Useful for user onboarding workflows, welcome emails, and account setup automation.',
      options: {
        project_id: {
          displayName: 'Project ID',
          shortDesc: 'The Firebase project to monitor',
          longDesc:
            'Select the Firebase project whose Authentication service you want to monitor for new user registrations. The project must have Firebase Authentication enabled.',
        },
      },
    },
  },
};

export default FirebaseAppEn;
