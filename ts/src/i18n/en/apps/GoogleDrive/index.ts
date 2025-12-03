import { BaseTranslation } from '../../../i18n-types';

const GoogleDriveAppEn = {
  displayName: 'Google Drive',
  groups: ['Cloud Storage & File Management', 'Google Workspace Suite'],
  shortDesc: 'Connect with Google Drive to manage your files and folders',
  longDesc:
    'Integrate with Google Drive to manage your files and folders. This integration allows you to perform actions and respond to events in your Google Drive account, enabling you to automate file management and sharing workflows.',
  triggers: {
    new_file: {
      displayName: 'New File',
      shortDesc: 'Triggers when a new file is added to Google Drive.',
      longDesc:
        'Monitors Google Drive for new files that match your criteria. Can filter by folder, filename, and file type, with options to include file content in the trigger data.',
      options: {
        folder_id: {
          displayName: 'Folder ID',
          shortDesc: 'The Google Drive folder to monitor',
          longDesc:
            'The ID of the Google Drive folder to monitor for new files. If not specified, all files in the drive will be monitored.',
        },
        filename: {
          displayName: 'Filename',
          shortDesc: 'Filter files by name',
          longDesc:
            'Only detect files with names matching this value. Can be used with the search type option to control matching behavior.',
        },
        search_type: {
          displayName: 'Search Type',
          shortDesc: 'How to match filenames',
          longDesc:
            'Determines how the filename filter is applied. "Contains" will match any file containing the specified text, while "Exact Match" requires the complete filename to match.',
        },
        file_types: {
          displayName: 'File Types',
          shortDesc: 'Filter files by MIME type',
          longDesc:
            'Only detect files of the specified MIME types. Multiple types can be selected to include various file formats.',
        },
        include_content: {
          displayName: 'Include Content',
          shortDesc: 'Include file content in the trigger data',
          longDesc:
            'When enabled, the trigger will include the file content in the event data. For text-based files, the content will also be available as plain text. This may increase processing time for large files.',
        },
      },
      event_info: {
        desc: 'Contains information about the newly created Google Drive file, including metadata and optionally the file content.',
      },
    },
    new_folder: {
      displayName: 'New Folder',
      shortDesc: 'Triggers when a new folder is created in Google Drive.',
      longDesc:
        'Monitors Google Drive for newly created folders that match your criteria. You can filter by parent folder and folder name to narrow down the folders being monitored.',
      options: {
        folder_name: {
          displayName: 'Folder Name',
          shortDesc: 'Filter folders by name',
          longDesc:
            'Only detect folders with names matching this value. Can be used with the search type option to control matching behavior.',
        },
        folder_id: {
          displayName: 'Parent Folder ID',
          shortDesc: 'The parent Google Drive folder to monitor',
          longDesc:
            'The ID of the parent Google Drive folder to monitor for new folders. If not specified, all folders across the drive will be monitored.',
        },
        search_type: {
          displayName: 'Search Type',
          shortDesc: 'How to match folder names',
          longDesc:
            'Determines how the folder name filter is applied. "Contains" will match any folder containing the specified text, while "Exact Match" requires the complete folder name to match.',
        },
      },
      event_info: {
        desc: 'Contains information about the newly created Google Drive folder, including metadata such as ID, name, and creation time.',
      },
    },
  },
  actions: {
    add_file_sharing_preference: {
      displayName: 'Add File Sharing Preference',
      shortDesc: 'Set sharing permissions for a Google Drive file',
      longDesc:
        'Modify who can access a file in Google Drive by setting specific sharing preferences. Supports organization-wide sharing, public sharing, and sharing with specific individuals by email.',
      options: {
        file_id: {
          displayName: 'File ID',
          shortDesc: 'ID of the file to share',
          longDesc:
            'The Google Drive file ID of the document, spreadsheet, or other file you want to modify sharing settings for.',
        },
        sharing_preference: {
          displayName: 'Sharing Preference',
          shortDesc: 'How to share the file',
          longDesc:
            'Determines who can access the file and what permissions they have. Choose between organization sharing, public sharing, or sharing with specific individuals.',
        },
        organization_domain: {
          displayName: 'Organization Domain',
          shortDesc: 'Domain for organization sharing',
          longDesc:
            'The domain name of your organization (e.g., example.com). Required when using organization-based sharing options.',
        },
        email_address: {
          displayName: 'Email Address',
          shortDesc: 'Person to share with',
          longDesc:
            'The email address of the specific person you want to share the file with. Required when using email-based sharing.',
        },
        sharing_role: {
          displayName: 'Permission Level',
          shortDesc: 'Access level to grant',
          longDesc:
            'The type of access to grant to the person when sharing via email. Options include viewer (can view), commenter (can comment), or editor (can edit).',
        },
      },
    },
    copy_file: {
      displayName: 'Copy File',
      shortDesc: 'Creates a copy of a Google Drive file with optional parameters.',
      longDesc:
        'Creates a copy of an existing file in Google Drive. Allows you to specify a new name for the copy, ' +
        'place it in a different folder or drive, and optionally convert compatible files to Google Documents format.',
      options: {
        file_id: {
          displayName: 'File',
          shortDesc: 'The file to copy',
          longDesc: 'The ID of the file you want to create a copy of.',
        },
        new_name: {
          displayName: 'New Name',
          shortDesc: 'Name for the new copy',
          longDesc:
            'Name to give to the new file. If not specified, the original file name will be used with "Copy of" prefix.',
        },
        convert_to_document: {
          displayName: 'Convert to Google Document',
          shortDesc: 'Convert file to Google Docs format',
          longDesc:
            'If enabled, compatible files (like .docx, .txt, etc.) will be converted to Google Docs format when copied.',
        },
        folder_id: {
          displayName: 'Folder',
          shortDesc: 'Destination folder',
          longDesc:
            'The folder where the copy should be placed. If not specified, the file will be copied to the root of the selected drive.',
        },
      },
    },
    delete_file: {
      displayName: 'Delete File',
      shortDesc: 'Deletes a file or moves it to trash in Google Drive.',
      longDesc:
        'Removes a file from Google Drive. By default, files are moved to trash and can be recovered later. ' +
        'Set the "permanently delete" option to true to bypass the trash and delete the file permanently.',
      options: {
        file_id: {
          displayName: 'File',
          shortDesc: 'The file to delete',
          longDesc: 'The ID of the file you want to delete from Google Drive.',
        },
        permanently_delete: {
          displayName: 'Permanently Delete',
          shortDesc: 'Skip the trash and delete permanently',
          longDesc:
            'If enabled, the file will be permanently deleted, bypassing the trash. This operation cannot be undone.',
        },
      },
    },
    create_file_from_text: {
      displayName: 'Create File From Text',
      shortDesc: 'Creates a new text file or Google Doc from provided content.',
      longDesc:
        'Creates a new file in Google Drive with the specified text content. ' +
        'You can choose to create a plain text file or convert it directly to a Google Document. ' +
        'The file can be placed in a specific folder or in the root of your drive.',
      options: {
        folder_id: {
          displayName: 'Folder',
          shortDesc: 'Location for the new file',
          longDesc:
            'The folder where the new file should be created. If not specified, the file will be created in the root of your drive.',
        },
        file_name: {
          displayName: 'File Name',
          shortDesc: 'Name for the new file',
          longDesc:
            'The name to give to the new file, including any extension (e.g., "notes.txt").',
        },
        file_content: {
          displayName: 'File Content',
          shortDesc: 'Text content for the file',
          longDesc:
            'The text content to be written to the file. This can include plain text, formatted text, or markdown (if converting to a Google Document).',
        },
        convert_to_document: {
          displayName: 'Convert to Google Document',
          shortDesc: 'Create as Google Doc instead of text file',
          longDesc:
            'If enabled, the content will be used to create a Google Document instead of a plain text file. This allows for rich text formatting.',
        },
      },
    },
    create_folder: {
      displayName: 'Create Folder',
      shortDesc: 'Creates a new folder in Google Drive.',
      longDesc:
        'Creates a new folder in Google Drive. You can specify a parent folder where the new folder ' +
        'should be created, or leave it blank to create the folder in the root of your Drive.',
      options: {
        parent_folder_id: {
          displayName: 'Parent Folder',
          shortDesc: 'Location for the new folder',
          longDesc:
            'The folder where the new folder should be created. If not specified, the folder will be created in the root of your Drive.',
        },
        folder_name: {
          displayName: 'Folder Name',
          shortDesc: 'Name for the new folder',
          longDesc: 'The name to give to the new folder.',
        },
      },
    },
    create_shortcut: {
      displayName: 'Create Shortcut',
      shortDesc: 'Creates a shortcut to a file in a specific folder.',
      longDesc:
        'Creates a shortcut (link) to an existing file in Google Drive. The shortcut will be placed in the specified folder. ' +
        'Shortcuts allow you to organize files without creating duplicates, giving you access to the same file from multiple locations.',
      options: {
        file_id: {
          displayName: 'Target File',
          shortDesc: 'File to create a shortcut to',
          longDesc:
            'The file that the shortcut will point to. This file will remain in its original location.',
        },
        folder_id: {
          displayName: 'Destination Folder',
          shortDesc: 'Folder to place the shortcut in',
          longDesc: 'The folder where the new shortcut will be created.',
        },
        shortcut_name: {
          displayName: 'Shortcut Name',
          shortDesc: 'Custom name for the shortcut (optional)',
          longDesc:
            'Optional custom name for the shortcut. If not provided, the original file name will be used.',
        },
      },
    },
    move_file: {
      displayName: 'Move File',
      shortDesc: 'Moves a file to a different folder in Google Drive.',
      longDesc:
        'Moves a file from its current location to a different folder in Google Drive. ' +
        'You can optionally keep the file in its original location(s), which effectively creates a copy ' +
        'of the file in the new location while maintaining the original.',
      options: {
        file_id: {
          displayName: 'File',
          shortDesc: 'File to move',
          longDesc: 'The file that you want to move to a different folder.',
        },
        folder_id: {
          displayName: 'Destination Folder',
          shortDesc: 'Folder to move the file to',
          longDesc: 'The folder where you want to move the file to.',
        },
        keep_in_original_folders: {
          displayName: 'Keep in Original Folders',
          shortDesc: 'Keep file in original locations',
          longDesc:
            'If enabled, the file will remain in its original folder(s) and also be added to the destination folder. If disabled (default), the file will be removed from its original location(s).',
        },
      },
    },
    replace_file: {
      displayName: 'Replace File',
      shortDesc: 'Replace an existing file in Google Drive with a new one.',
      longDesc:
        'Uploads a new file to Google Drive to replace an existing file. The original file ID is preserved, but its contents and optionally name and extension are updated.',
      options: {
        file_to_replace: {
          displayName: 'File to Replace',
          shortDesc: 'The file that will be replaced',
          longDesc:
            'The ID of the existing Google Drive file that you want to replace with new content.',
        },
        file: {
          displayName: 'New File',
          shortDesc: 'The new file to upload',
          longDesc: 'The file content that will replace the existing file in Google Drive.',
        },
        file_name: {
          displayName: 'File Name',
          shortDesc: 'Optional new name for the file',
          longDesc:
            'A new name for the file. If not provided, the original name of the uploaded file will be used.',
        },
        file_extension: {
          displayName: 'File Extension',
          shortDesc: 'Optional new file extension',
          longDesc:
            'A new extension for the file. This will also update the file MIME type if a known extension is provided.',
        },
      },
    },
    list_files: {
      displayName: 'List Files',
      shortDesc: 'Retrieve files from Google Drive with filtering and sorting options.',
      longDesc:
        'Fetches a list of files from Google Drive with support for various filters, custom queries, sorting, and pagination.',
      options: {
        filename: {
          displayName: 'Filename',
          shortDesc: 'Filter by filename',
          longDesc:
            'Filter results to files whose names match the specified value, based on the selected search type.',
        },
        search_type: {
          displayName: 'Search Type',
          shortDesc: 'How to match the filename',
          longDesc:
            'Specify whether to search for files with names that contain the specified text or that exactly match it.',
        },
        folder: {
          displayName: 'Folder',
          shortDesc: 'Filter by parent folder',
          longDesc:
            'Filter results to only include files that are contained within the specified folder.',
        },
        file_types: {
          displayName: 'File Types',
          shortDesc: 'Filter by file types',
          longDesc:
            'Filter results to only include files of the specified types. Multiple types can be selected.',
        },
        order_by: {
          displayName: 'Order By',
          shortDesc: 'Fields and directions to sort results by',
          longDesc:
            'Specify how to sort the returned files. You can add multiple sorting criteria, each with a field and direction.',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'Field to sort by',
                longDesc:
                  'The file property to use for sorting, such as name, creation time, or modification time.',
              },
              direction: {
                displayName: 'Direction',
                shortDesc: 'Sort direction',
                longDesc: 'The direction to sort in, either ascending (asc) or descending (desc).',
              },
            },
          },
        },
        page_size: {
          displayName: 'Page Size',
          shortDesc: 'Maximum number of files to return',
          longDesc:
            'The maximum number of files to return in a single request. Default is 100. Maximum allowed is 1000.',
        },
        custom_query: {
          displayName: 'Custom Query',
          shortDesc: 'Advanced search query to filter results',
          longDesc: 'Specify a custom search query to filter the results.',
        },
      },
    },
    upload_file: {
      displayName: 'Upload File',
      shortDesc: 'Upload a file to Google Drive with optional conversion to Google Docs format.',
      longDesc:
        'Uploads a file to a specific folder in Google Drive with options to customize the file name, format, and convert to Google Docs format when applicable.',
      options: {
        folder: {
          displayName: 'Folder',
          shortDesc: 'Google Drive folder to upload the file to',
          longDesc: 'The ID of the Google Drive folder where the file will be uploaded. Required.',
        },
        file: {
          displayName: 'File',
          shortDesc: 'File to upload',
          longDesc: 'The file to be uploaded to Google Drive. Required.',
        },
        convert_to_document: {
          displayName: 'Convert to Google Format',
          shortDesc: 'Convert file to Google Docs format when possible',
          longDesc:
            'When enabled, compatible files (documents, spreadsheets, presentations, etc.) will be converted to their equivalent Google Workspace formats.',
        },
        file_name: {
          displayName: 'File Name',
          shortDesc: 'Custom file name (optional)',
          longDesc:
            'Optional custom name for the file. If not provided, the original file name will be used.',
        },
        file_extension: {
          displayName: 'File Extension',
          shortDesc: 'Change file extension (optional)',
          longDesc:
            'Optional file extension to change the format of the file. Only applies when custom file name is provided.',
        },
      },
    },
    find_or_create_file: {
      displayName: 'Find or Create File',
      shortDesc: 'Search for a file in Google Drive and optionally create it if not found.',
      longDesc:
        'Searches for a file in Google Drive with options for exact or partial name matching, folder filtering, and file type filtering. If the file is not found, it can optionally create a new file with the provided content.',
      options: {
        filename: {
          displayName: 'File Name',
          shortDesc: 'Name of the file to search for',
          longDesc: 'The name of the file to search for in Google Drive. Required.',
        },
        search_type: {
          displayName: 'Search Type',
          shortDesc: 'How to match the filename',
          longDesc:
            'Choose between "contains" (partial match) or "exact" (exact match) for the filename search. Default is "contains".',
        },
        folder: {
          displayName: 'Folder',
          shortDesc: 'Limit search to specific folder (optional)',
          longDesc: 'Optional Google Drive folder ID to limit the search to a specific folder.',
        },
        file_types: {
          displayName: 'File Types',
          shortDesc: 'Filter by file types (optional)',
          longDesc: 'Optional list of MIME types to filter the search results by file type.',
        },
        create_if_not_exists: {
          displayName: 'Create If Not Found',
          shortDesc: 'Create the file if not found',
          longDesc:
            'When enabled, if the file is not found, a new file will be created with the provided content.',
        },
        file: {
          displayName: 'File Content',
          shortDesc: 'Content for the new file if created',
          longDesc:
            'The file content to use when creating a new file if the search does not find a match.',
        },
        convert_to_document: {
          displayName: 'Convert to Google Format',
          shortDesc: 'Convert file to Google Docs format when possible',
          longDesc:
            'When enabled, compatible files (documents, spreadsheets, presentations, etc.) will be converted to their equivalent Google Workspace formats when created.',
        },
        file_extension: {
          displayName: 'File Extension',
          shortDesc: 'Specify file extension for the new file',
          longDesc: 'Optional file extension to specify the format of the new file if created.',
        },
      },
    },
    find_or_create_folder: {
      displayName: 'Find or Create Folder',
      shortDesc: 'Search for a folder in Google Drive and optionally create it if not found.',
      longDesc:
        'Searches for a folder in Google Drive with options for exact or partial name matching and parent folder filtering. If the folder is not found, it can optionally create a new folder with the specified name.',
      options: {
        folder_name: {
          displayName: 'Folder Name',
          shortDesc: 'Name of the folder to search for',
          longDesc: 'The name of the folder to search for in Google Drive. Required.',
        },
        search_type: {
          displayName: 'Search Type',
          shortDesc: 'How to match the folder name',
          longDesc:
            'Choose between "contains" (partial match) or "exact" (exact match) for the folder name search. Default is "contains".',
        },
        parent_folder: {
          displayName: 'Parent Folder',
          shortDesc: 'Limit search to a specific parent folder (optional)',
          longDesc:
            'Optional Google Drive folder ID to limit the search to folders within a specific parent folder.',
        },
        create_if_not_exists: {
          displayName: 'Create If Not Found',
          shortDesc: 'Create the folder if not found',
          longDesc:
            'When enabled, if the folder is not found, a new folder will be created with the specified name.',
        },
      },
    },
    get_file: {
      displayName: 'Get File by ID',
      shortDesc: 'Retrieves a single file from Google Drive by its ID with detailed metadata.',
      longDesc:
        'Fetches a file from Google Drive using its unique ID, returning comprehensive metadata and optionally the file content. Supports retrieving Google Docs with various export format options.',
      options: {
        file_id: {
          displayName: 'File ID',
          shortDesc: 'The unique ID of the Google Drive file to retrieve',
          longDesc:
            'The Google Drive file ID. This is the unique identifier found in the URL when viewing a file in Google Drive.',
        },
        include_content: {
          displayName: 'Include Content',
          shortDesc: 'Include the file content in the response',
          longDesc:
            'When enabled, retrieves the file content and returns it encoded in base64 format. For text files, also attempts to provide the content as plain text. This may increase response time for larger files.',
        },
        convert_export_format: {
          displayName: 'Export Format',
          shortDesc: 'Format to export Google Docs files',
          longDesc:
            'For Google Workspace files (Docs, Sheets, Slides, etc.), specifies the format to export the file. Only applicable when Include Content is enabled and the file is a Google Workspace document.',
        },
      },
    },
    get_folder: {
      displayName: 'Get Folder by ID',
      shortDesc: 'Retrieves a folder from Google Drive by its ID with detailed metadata.',
      longDesc:
        'Fetches a folder from Google Drive using its unique ID, returning comprehensive metadata and optionally a list of its immediate children (files and subfolders).',
      options: {
        folder_id: {
          displayName: 'Folder ID',
          shortDesc: 'The unique ID of the Google Drive folder to retrieve',
          longDesc:
            'The Google Drive folder ID. This is the unique identifier found in the URL when viewing a folder in Google Drive.',
        },
        include_children: {
          displayName: 'Include Children',
          shortDesc: "Include the folder's immediate children in the response",
          longDesc:
            'When enabled, retrieves the list of files and subfolders directly contained in this folder. Each child includes basic metadata such as name, ID, type, and modification dates.',
        },
        children_limit: {
          displayName: 'Children Limit',
          shortDesc: 'Maximum number of children to return',
          longDesc:
            'Limits the number of children items returned when Include Children is enabled. The response will indicate if there are more children beyond this limit. Default is 100.',
        },
      },
    },
  },
} satisfies BaseTranslation;

export default GoogleDriveAppEn;
