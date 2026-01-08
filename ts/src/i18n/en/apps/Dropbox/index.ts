const DropboxAppEn = {
  displayName: 'Dropbox',
  groups: ['Cloud Storage & File Management'],
  connectionMessage: {
    title: 'OAuth Connection',
    content:
      'Dropbox uses OAuth 2.0 for authentication. You will be redirected to Dropbox to authorize access to your files and folders.',
  },
  shortDesc:
    'Connect with Dropbox to manage files, folders, and shared links in your cloud storage',
  longDesc:
    'Integrate with Dropbox to automate file management, sharing, and synchronization. Dropbox is a cloud-based file storage solution that allows users to store, share, and collaborate on files and folders. This integration enables you to create, copy, move, and delete files and folders, manage shared links, track file revisions, and monitor for new or modified files.',
  actions: {
    // File operations
    create_text_file: {
      groups: ['Files'],
      displayName: 'Create Text File',
      shortDesc: 'Create a new text file in Dropbox',
      longDesc:
        'Create a new text file with the specified content at the given path in your Dropbox. If a file already exists at the path and autorename is enabled, a new name will be generated.',
      options: {
        path: {
          displayName: 'File Path',
          shortDesc: 'Full path for the new file',
          longDesc:
            'The full path where the file should be created, including the filename (e.g., "/Documents/notes.txt").',
        },
        content: {
          displayName: 'Content',
          shortDesc: 'Text content for the file',
          longDesc: 'The text content to write to the file.',
        },
        autorename: {
          displayName: 'Auto Rename',
          shortDesc: 'Automatically rename if file exists',
          longDesc:
            'If enabled and a file with the same name exists, Dropbox will automatically generate a new name.',
        },
        mute: {
          displayName: 'Mute',
          shortDesc: 'Suppress change notifications',
          longDesc:
            'If enabled, users will not receive notifications about this file being created.',
        },
      },
    },
    upload_file: {
      groups: ['Files'],
      displayName: 'Upload File',
      shortDesc: 'Upload a file to Dropbox',
      longDesc:
        'Upload a file from binary content to the specified path in your Dropbox. Supports files up to 150MB.',
      options: {
        path: {
          displayName: 'Destination Path',
          shortDesc: 'Full path for the uploaded file',
          longDesc:
            'The full path where the file should be uploaded, including the filename (e.g., "/Documents/report.pdf"). If not provided, the file will be uploaded to the root folder with its original name.',
        },
        file: {
          displayName: 'File',
          shortDesc: 'The file to upload',
          longDesc: 'The file to upload to Dropbox.',
        },
        autorename: {
          displayName: 'Auto Rename',
          shortDesc: 'Automatically rename if file exists',
          longDesc:
            'If enabled and a file with the same name exists, Dropbox will automatically generate a new name.',
        },
        mute: {
          displayName: 'Mute',
          shortDesc: 'Suppress change notifications',
          longDesc:
            'If enabled, users will not receive notifications about this file being uploaded.',
        },
        strictConflict: {
          displayName: 'Strict Conflict',
          shortDesc: 'Fail on conflict instead of renaming',
          longDesc:
            'If enabled, the upload will fail if a file with the same name exists, even if autorename is enabled.',
        },
      },
    },
    download_file: {
      groups: ['Files'],
      displayName: 'Download File',
      shortDesc: 'Download a file from Dropbox',
      longDesc:
        'Download the content of a file from your Dropbox. Returns the file content as base64-encoded binary data along with file metadata.',
      options: {
        path: {
          displayName: 'File Path',
          shortDesc: 'Path to the file to download',
          longDesc:
            'The full path to the file you want to download (e.g., "/Documents/report.pdf").',
        },
      },
    },
    get_file_link: {
      groups: ['Files'],
      displayName: 'Get Temporary Link',
      shortDesc: 'Get a temporary download link for a file',
      longDesc:
        'Get a temporary direct link to download a file. The link is valid for 4 hours and can be used to stream content directly.',
      options: {
        path: {
          displayName: 'File Path',
          shortDesc: 'Path to the file',
          longDesc: 'The full path to the file for which you want to generate a temporary link.',
        },
      },
    },
    delete_file: {
      groups: ['Files'],
      displayName: 'Delete File',
      shortDesc: 'Delete a file from Dropbox',
      longDesc:
        'Permanently delete a file from your Dropbox. This action cannot be undone through the API.',
      options: {
        path: {
          displayName: 'File Path',
          shortDesc: 'Path to the file to delete',
          longDesc: 'The full path to the file you want to delete.',
        },
      },
    },
    copy_file: {
      groups: ['Files'],
      displayName: 'Copy File',
      shortDesc: 'Copy a file to a new location',
      longDesc:
        'Copy a file from one location to another within your Dropbox. The original file remains unchanged.',
      options: {
        fromPath: {
          displayName: 'Source Path',
          shortDesc: 'Path to the file to copy',
          longDesc: 'The full path to the source file.',
        },
        toPath: {
          displayName: 'Destination Path',
          shortDesc: 'Path for the copied file',
          longDesc: 'The full path where the file should be copied to.',
        },
        autorename: {
          displayName: 'Auto Rename',
          shortDesc: 'Automatically rename if destination exists',
          longDesc: 'If enabled and a file exists at the destination, generate a new name.',
        },
        allowOwnershipTransfer: {
          displayName: 'Allow Ownership Transfer',
          shortDesc: 'Allow ownership transfer for shared content',
          longDesc:
            'If enabled, allows the copy operation to transfer ownership of the content if needed.',
        },
      },
    },
    move_file: {
      groups: ['Files'],
      displayName: 'Move File',
      shortDesc: 'Move a file to a new location',
      longDesc: 'Move a file from one location to another within your Dropbox.',
      options: {
        fromPath: {
          displayName: 'Source Path',
          shortDesc: 'Path to the file to move',
          longDesc: 'The full path to the source file.',
        },
        toPath: {
          displayName: 'Destination Path',
          shortDesc: 'Path for the moved file',
          longDesc: 'The full path where the file should be moved to.',
        },
        autorename: {
          displayName: 'Auto Rename',
          shortDesc: 'Automatically rename if destination exists',
          longDesc: 'If enabled and a file exists at the destination, generate a new name.',
        },
        allowOwnershipTransfer: {
          displayName: 'Allow Ownership Transfer',
          shortDesc: 'Allow ownership transfer for shared content',
          longDesc:
            'If enabled, allows the move operation to transfer ownership of the content if needed.',
        },
      },
    },
    // Folder operations
    create_folder: {
      groups: ['Folders'],
      displayName: 'Create Folder',
      shortDesc: 'Create a new folder in Dropbox',
      longDesc: 'Create a new folder at the specified path in your Dropbox.',
      options: {
        path: {
          displayName: 'Folder Path',
          shortDesc: 'Full path for the new folder',
          longDesc:
            'The full path where the folder should be created (e.g., "/Documents/Projects").',
        },
        autorename: {
          displayName: 'Auto Rename',
          shortDesc: 'Automatically rename if folder exists',
          longDesc: 'If enabled and a folder with the same name exists, generate a new name.',
        },
      },
    },
    delete_folder: {
      groups: ['Folders'],
      displayName: 'Delete Folder',
      shortDesc: 'Delete a folder from Dropbox',
      longDesc:
        'Permanently delete a folder and all its contents from your Dropbox. This action cannot be undone through the API.',
      options: {
        path: {
          displayName: 'Folder Path',
          shortDesc: 'Path to the folder to delete',
          longDesc: 'The full path to the folder you want to delete.',
        },
      },
    },
    copy_folder: {
      groups: ['Folders'],
      displayName: 'Copy Folder',
      shortDesc: 'Copy a folder to a new location',
      longDesc:
        'Copy a folder and all its contents from one location to another within your Dropbox.',
      options: {
        fromPath: {
          displayName: 'Source Path',
          shortDesc: 'Path to the folder to copy',
          longDesc: 'The full path to the source folder.',
        },
        toPath: {
          displayName: 'Destination Path',
          shortDesc: 'Path for the copied folder',
          longDesc: 'The full path where the folder should be copied to.',
        },
        autorename: {
          displayName: 'Auto Rename',
          shortDesc: 'Automatically rename if destination exists',
          longDesc: 'If enabled and a folder exists at the destination, generate a new name.',
        },
        allowOwnershipTransfer: {
          displayName: 'Allow Ownership Transfer',
          shortDesc: 'Allow ownership transfer for shared content',
          longDesc:
            'If enabled, allows the copy operation to transfer ownership of the content if needed.',
        },
      },
    },
    move_folder: {
      groups: ['Folders'],
      displayName: 'Move Folder',
      shortDesc: 'Move a folder to a new location',
      longDesc: 'Move a folder and all its contents from one location to another within your Dropbox.',
      options: {
        fromPath: {
          displayName: 'Source Path',
          shortDesc: 'Path to the folder to move',
          longDesc: 'The full path to the source folder.',
        },
        toPath: {
          displayName: 'Destination Path',
          shortDesc: 'Path for the moved folder',
          longDesc: 'The full path where the folder should be moved to.',
        },
        autorename: {
          displayName: 'Auto Rename',
          shortDesc: 'Automatically rename if destination exists',
          longDesc: 'If enabled and a folder exists at the destination, generate a new name.',
        },
        allowOwnershipTransfer: {
          displayName: 'Allow Ownership Transfer',
          shortDesc: 'Allow ownership transfer for shared content',
          longDesc:
            'If enabled, allows the move operation to transfer ownership of the content if needed.',
        },
      },
    },
    list_folder: {
      groups: ['Folders'],
      displayName: 'List Folder Contents',
      shortDesc: 'List files and folders in a directory',
      longDesc:
        'Retrieve a list of all files and subfolders within a specified folder in your Dropbox.',
      options: {
        path: {
          displayName: 'Folder Path',
          shortDesc: 'Path to the folder to list',
          longDesc:
            'The full path to the folder whose contents you want to list. Use empty string for root.',
        },
        recursive: {
          displayName: 'Recursive',
          shortDesc: 'Include contents of subfolders',
          longDesc:
            'If enabled, also include files and folders from all subfolders recursively.',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of items to return',
          longDesc: 'The maximum number of items to return. Default is 2000.',
        },
      },
    },
    // Search
    search: {
      groups: ['Search'],
      displayName: 'Search',
      shortDesc: 'Search for files and folders in Dropbox',
      longDesc:
        'Search for files and folders in your Dropbox by name or content. Returns matching items with their metadata.',
      options: {
        query: {
          displayName: 'Search Query',
          shortDesc: 'Text to search for',
          longDesc: 'The search query. Searches file and folder names.',
        },
        path: {
          displayName: 'Path',
          shortDesc: 'Folder to search within',
          longDesc:
            'Optionally limit the search to a specific folder path. Leave empty to search all of Dropbox.',
        },
        maxResults: {
          displayName: 'Max Results',
          shortDesc: 'Maximum number of results',
          longDesc: 'The maximum number of search results to return. Default is 100.',
        },
        orderBy: {
          displayName: 'Order By',
          shortDesc: 'Sort order for results',
          longDesc:
            'How to order the search results: by relevance or by modified time.',
        },
        fileStatus: {
          displayName: 'File Status',
          shortDesc: 'Filter by file status',
          longDesc:
            'Filter search results by file status: active (existing files) or deleted (removed files).',
        },
        filenameOnly: {
          displayName: 'Filename Only',
          shortDesc: 'Search only in file names',
          longDesc:
            'If enabled, search will only match file names, not file contents.',
        },
        fileExtensions: {
          displayName: 'File Extensions',
          shortDesc: 'Filter by file extensions',
          longDesc:
            'Comma-separated list of file extensions to filter by (e.g., "pdf,doc,txt").',
        },
        fileCategories: {
          displayName: 'File Categories',
          shortDesc: 'Filter by file categories',
          longDesc:
            'Comma-separated list of file categories to filter by (e.g., "image,document,video").',
        },
      },
    },
    // Sharing
    create_shared_link: {
      groups: ['Sharing'],
      displayName: 'Create Shared Link',
      shortDesc: 'Create a shared link for a file',
      longDesc:
        'Create a shared link for a file in your Dropbox that can be shared with others. You can configure visibility and expiration settings.',
      options: {
        path: {
          displayName: 'File Path',
          shortDesc: 'Path to the file to share',
          longDesc: 'The full path to the file for which you want to create a shared link.',
        },
        requested_visibility: {
          displayName: 'Visibility',
          shortDesc: 'Who can access this link',
          longDesc:
            'The visibility level for the shared link: public (anyone), team_only (team members), or password (requires password).',
        },
        expires: {
          displayName: 'Expiration Date',
          shortDesc: 'When the link expires',
          longDesc:
            'Optional expiration date for the link in ISO 8601 format (e.g., "2024-12-31T23:59:59Z").',
        },
      },
    },
    list_shared_links: {
      groups: ['Sharing'],
      displayName: 'List Shared Links',
      shortDesc: 'List shared links for a file or all files',
      longDesc:
        'Retrieve a list of shared links. You can list all shared links or filter to a specific file path.',
      options: {
        path: {
          displayName: 'File Path',
          shortDesc: 'Filter by file path',
          longDesc:
            'Optionally specify a file path to list only shared links for that file. Leave empty to list all shared links.',
        },
        direct_only: {
          displayName: 'Direct Only',
          shortDesc: 'Return only direct links',
          longDesc:
            'If enabled, only return shared links that directly reference the file, not links to parent folders.',
        },
      },
    },
    revoke_shared_link: {
      groups: ['Sharing'],
      displayName: 'Revoke Shared Link',
      shortDesc: 'Revoke a shared link',
      longDesc:
        'Revoke a shared link so it can no longer be used to access the file. This action cannot be undone.',
      options: {
        url: {
          displayName: 'Shared Link URL',
          shortDesc: 'The URL of the shared link to revoke',
          longDesc: 'The full URL of the shared link you want to revoke.',
        },
      },
    },
    // Revisions
    list_file_revisions: {
      groups: ['Revisions'],
      displayName: 'List File Revisions',
      shortDesc: 'List revision history for a file',
      longDesc:
        'Retrieve a list of all revisions (versions) of a file. This allows you to see the history of changes to the file.',
      options: {
        path: {
          displayName: 'File Path',
          shortDesc: 'Path to the file',
          longDesc: 'The full path to the file whose revisions you want to list.',
        },
        mode: {
          displayName: 'Mode',
          shortDesc: 'How to identify the file',
          longDesc:
            'How the path parameter identifies the file: "path" (by file path) or "id" (by file ID).',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of revisions',
          longDesc: 'The maximum number of revisions to return. Default is 10.',
        },
      },
    },
    restore_file_revision: {
      groups: ['Revisions'],
      displayName: 'Restore File Revision',
      shortDesc: 'Restore a file to a previous revision',
      longDesc:
        'Restore a file to a previous revision (version). This creates a new revision with the content from the specified revision.',
      options: {
        path: {
          displayName: 'File Path',
          shortDesc: 'Path to the file',
          longDesc: 'The full path to the file you want to restore.',
        },
        rev: {
          displayName: 'Revision',
          shortDesc: 'Revision ID to restore',
          longDesc:
            'The revision identifier (rev) of the version you want to restore. Get this from list_file_revisions.',
        },
      },
    },
  },
  triggers: {
    new_file: {
      groups: ['Files'],
      displayName: 'New File',
      shortDesc: 'Triggers when a new file is added to a folder',
      longDesc:
        'This trigger fires whenever a new file is created in the specified folder. Monitor for new uploads, file creations, or files moved into the folder.',
      options: {
        folder: {
          displayName: 'Folder Path',
          shortDesc: 'The folder to monitor for new files',
          longDesc:
            'Specify the path to the folder you want to monitor for new files. Use empty string for root folder.',
        },
      },
    },
    new_folder: {
      groups: ['Folders'],
      displayName: 'New Folder',
      shortDesc: 'Triggers when a new folder is created',
      longDesc:
        'This trigger fires whenever a new folder is created within the specified parent folder.',
      options: {
        parentFolder: {
          displayName: 'Parent Folder',
          shortDesc: 'The parent folder to monitor',
          longDesc:
            'Specify the path to the parent folder you want to monitor for new subfolders.',
        },
      },
    },
    file_modified: {
      groups: ['Files'],
      displayName: 'File Modified',
      shortDesc: 'Triggers when a file is modified',
      longDesc:
        'This trigger fires whenever a file is modified in the specified folder. This includes content changes, not just metadata updates.',
      options: {
        folder: {
          displayName: 'Folder Path',
          shortDesc: 'The folder to monitor for modified files',
          longDesc:
            'Specify the path to the folder you want to monitor for file modifications.',
        },
      },
    },
  },
};

export default DropboxAppEn;
