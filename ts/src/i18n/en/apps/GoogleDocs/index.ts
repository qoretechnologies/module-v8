/* eslint-disable max-len */
const GoogleDocsAppEn = {
  displayName: 'Google Docs',
  groups: ['Documents & Documentation', 'Google Workspace Suite'],
  shortDesc: 'Connect with Google Docs to manage your documents',
  longDesc:
    'Integrate with Google Docs to create, update, and manage your documents. This integration allows you to perform actions and respond to events in your Google Docs account, enabling you to automate document management and collaboration workflows.',
  actions: {
    search_documents: {
      displayName: 'Search documents',
      shortDesc: 'Search for Google Docs documents with advanced filtering and sorting options.',
      longDesc:
        'Search for Google Docs documents in Google Drive using various criteria including filename, folder location, and custom queries. Supports sorting by different fields and directions with pagination.',
      options: {
        filename: {
          displayName: 'Filename',
          shortDesc: 'Name of the document to search for',
          longDesc: 'The name or partial name of the Google Docs document to search for.',
        },
        search_type: {
          displayName: 'Search type',
          shortDesc: 'Type of filename matching',
          longDesc:
            'How to match the filename - either contains the text or exact match. Default is contains.',
        },
        folder: {
          displayName: 'Folder',
          shortDesc: 'Folder to search within',
          longDesc:
            'The Google Drive folder ID to limit the search to. If not specified, searches all accessible folders.',
        },
        order_by: {
          displayName: 'Order by',
          shortDesc: 'Sorting criteria for results',
          longDesc:
            'List of sorting criteria to apply to the search results. Each item specifies a field and direction.',
          type: {
            element_type: {
              fields: {
                field: {
                  displayName: 'Field',
                  shortDesc: 'Field to sort by',
                  longDesc:
                    'The field to sort the results by (e.g., name, modifiedTime, createdTime).',
                },
                direction: {
                  displayName: 'Direction',
                  shortDesc: 'Sort direction',
                  longDesc: 'The direction to sort - either ascending (asc) or descending (desc).',
                },
              },
            },
          },
        },
        page_size: {
          displayName: 'Page size',
          shortDesc: 'Maximum number of results to return',
          longDesc:
            'The maximum number of documents to return in a single request. Default is 100.',
        },
        custom_query: {
          displayName: 'Custom query',
          shortDesc: 'Additional search criteria',
          longDesc:
            'Custom Google Drive search query to add additional filtering criteria beyond the basic options.',
        },
      },
    },
    append_text_to_document: {
      displayName: 'Append text to document',
      shortDesc: 'Add text to an existing Google Docs document at a specified position.',
      longDesc:
        'Appends text to a Google Docs document with options for positioning (beginning, end, or specific index), text formatting, and line breaks. Supports bold, italic, underline, font size, and font family styling.',
      options: {
        document_id: {
          displayName: 'Document ID',
          shortDesc: 'The Google Docs document to modify',
          longDesc: 'The unique identifier of the Google Docs document to append text to.',
        },
        text: {
          displayName: 'Text',
          shortDesc: 'Text content to append',
          longDesc: 'The text content to be added to the document.',
        },
        insert_position: {
          displayName: 'Insert position',
          shortDesc: 'Where to insert the text',
          longDesc:
            'Specifies where in the document to insert the text: at the end, beginning, or at a specific index position.',
        },
        index: {
          displayName: 'Index',
          shortDesc: 'Specific position index',
          longDesc:
            'The specific character index position where text should be inserted (required when insert_position is "index").',
        },
        add_line_break: {
          displayName: 'Add line break',
          shortDesc: 'Add line break with text',
          longDesc:
            'Whether to add a line break before or after the inserted text for better formatting.',
        },
        text_style: {
          displayName: 'Text style',
          shortDesc: 'Formatting options for text',
          longDesc: 'Formatting options to apply to the inserted text.',
          type: {
            fields: {
              bold: {
                displayName: 'Bold',
                shortDesc: 'Make text bold',
                longDesc: 'Whether to make the text bold.',
              },
              italic: {
                displayName: 'Italic',
                shortDesc: 'Make text italic',
                longDesc: 'Whether to make the text italic.',
              },
              underline: {
                displayName: 'Underline',
                shortDesc: 'Underline text',
                longDesc: 'Whether to underline the text.',
              },
              font_size: {
                displayName: 'Font size',
                shortDesc: 'Text font size in points',
                longDesc: 'The font size for the text in points.',
              },
              font_family: {
                displayName: 'Font family',
                shortDesc: 'Font family name',
                longDesc: 'The font family to use for the text (e.g., "Arial", "Times New Roman").',
              },
            },
          },
        },
      },
    },

    create_document_from_template: {
      displayName: 'Create document from template',
      shortDesc:
        'Create a new Google Docs document from an existing template with placeholder replacements.',
      longDesc:
        'Creates a new Google Docs document by copying a template and replacing placeholders with specified values. Supports text replacements, image insertions, automatic sharing with template collaborators, and exporting to various formats.',
      options: {
        template_id: {
          displayName: 'Template ID',
          shortDesc: 'Template document to copy',
          longDesc:
            'The Google Docs document ID to use as a template for creating the new document.',
        },
        new_document_name: {
          displayName: 'New document name',
          shortDesc: 'Name for the new document',
          longDesc: 'The name to give the newly created document.',
        },
        destination_folder_id: {
          displayName: 'Destination folder',
          shortDesc: 'Folder to create document in',
          longDesc:
            'The Google Drive folder ID where the new document should be created. If not specified, it will be created in the root folder.',
        },
        replacements: {
          displayName: 'Text replacements',
          shortDesc: 'Placeholder text replacements',
          longDesc: 'List of placeholder text replacements to make in the template.',
          type: {
            element_type: {
              fields: {
                placeholder: {
                  displayName: 'Placeholder',
                  shortDesc: 'Placeholder text to replace',
                  longDesc:
                    'The placeholder text in the template to be replaced (e.g., "{{NAME}}").',
                },
                replacement_text: {
                  displayName: 'Replacement text',
                  shortDesc: 'Text to replace placeholder with',
                  longDesc: 'The text that will replace the placeholder in the new document.',
                },
                match_case: {
                  displayName: 'Match case',
                  shortDesc: 'Case-sensitive replacement',
                  longDesc: 'Whether the placeholder replacement should be case-sensitive.',
                },
              },
            },
          },
        },
        remove_unused_fields: {
          displayName: 'Remove unused fields',
          shortDesc: 'Remove unreplaced placeholders',
          longDesc: 'Whether to remove placeholder text that was not replaced with actual values.',
        },
        share_with_template_collaborators: {
          displayName: 'Share with template collaborators',
          shortDesc: 'Share with template collaborators',
          longDesc:
            'Whether to automatically share the new document with all collaborators of the original template.',
        },
        export_format: {
          displayName: 'Export format',
          shortDesc: 'Format to export document as',
          longDesc: 'Optional format to export the created document as (PDF, DOCX, etc.).',
        },
        images: {
          displayName: 'Image replacements',
          shortDesc: 'Placeholder image replacements',
          longDesc: 'List of placeholder image replacements to make in the template.',
          type: {
            element_type: {
              fields: {
                placeholder: {
                  displayName: 'Placeholder',
                  shortDesc: 'Image placeholder text',
                  longDesc: 'The placeholder text in the template to be replaced with an image.',
                },
                image_url: {
                  displayName: 'Image URL',
                  shortDesc: 'URL of the image to insert',
                  longDesc: 'The URL of the image that will replace the placeholder.',
                },
                width: {
                  displayName: 'Width',
                  shortDesc: 'Image width in points',
                  longDesc: 'The width of the inserted image in points.',
                },
                height: {
                  displayName: 'Height',
                  shortDesc: 'Image height in points',
                  longDesc: 'The height of the inserted image in points.',
                },
              },
            },
          },
        },
      },
    },
    create_document_from_text: {
      displayName: 'Create document from text',
      shortDesc: 'Create a new Google Docs document from text content.',
      longDesc:
        'Creates a new Google Docs document from provided text content. Supports HTML parsing for rich formatting and can optionally export the document to various formats.',
      options: {
        document_name: {
          displayName: 'Document name',
          shortDesc: 'Name for the new document',
          longDesc: 'The name to give the newly created document.',
        },
        document_content: {
          displayName: 'Document content',
          shortDesc: 'Text content for the document',
          longDesc:
            'The text content to be inserted into the new document. Can be plain text or HTML.',
        },
        parse_html: {
          displayName: 'Parse HTML',
          shortDesc: 'Parse content as HTML',
          longDesc:
            'Whether to parse the document content as HTML to preserve formatting like bold, italic, and other styling.',
        },
        folder_id: {
          displayName: 'Folder ID',
          shortDesc: 'Folder to create document in',
          longDesc:
            'The Google Drive folder ID where the new document should be created. If not specified, it will be created in the root folder.',
        },
        export_format: {
          displayName: 'Export format',
          shortDesc: 'Format to export document as',
          longDesc: 'Optional format to export the created document as (PDF, DOCX, etc.).',
        },
      },
    },
    get_document_by_id: {
      displayName: 'Get document by ID',
      shortDesc: 'Retrieve detailed information about a Google Docs document.',
      longDesc:
        'Retrieves comprehensive information about a Google Docs document including metadata, permissions, content, and sharing settings. Also provides the document content as plain text.',
      options: {
        document_id: {
          displayName: 'Document ID',
          shortDesc: 'Google Docs document ID',
          longDesc:
            'The unique identifier of the Google Docs document to retrieve information for.',
        },
      },
    },
    upload_document: {
      displayName: 'Upload document',
      shortDesc: 'Upload a file and convert it to Google Docs format.',
      longDesc:
        'Uploads a document file (Word, PDF, etc.) to Google Drive and converts it to Google Docs format for editing and collaboration.',
      options: {
        folder: {
          displayName: 'Folder',
          shortDesc: 'Destination folder for upload',
          longDesc:
            'The Google Drive folder ID where the uploaded document should be stored. If not specified, it will be uploaded to the root folder.',
        },
        file: {
          displayName: 'File',
          shortDesc: 'Document file to upload',
          longDesc: 'The document file to upload and convert to Google Docs format.',
        },
        file_name: {
          displayName: 'File name',
          shortDesc: 'Custom name for uploaded file',
          longDesc:
            'Optional custom name for the uploaded file. If not provided, the original filename will be used.',
        },
      },
    },
  },
  triggers: {
    new_document: {
      displayName: 'New document',
      shortDesc: 'Triggers when a new Google Docs document is created.',
      longDesc:
        'Monitors for new Google Docs documents created in Google Drive. Can be filtered by folder, filename patterns, and optionally includes document content in the trigger payload.',
      options: {
        folder_id: {
          displayName: 'Folder ID',
          shortDesc: 'Specific folder to monitor',
          longDesc:
            'The Google Drive folder ID to monitor for new documents. If not specified, monitors all accessible folders.',
        },
        filename: {
          displayName: 'Filename filter',
          shortDesc: 'Filter by document name',
          longDesc:
            'Optional filename filter to only trigger for documents with names that match this pattern.',
        },
        search_type: {
          displayName: 'Search type',
          shortDesc: 'How to match the filename',
          longDesc:
            'Determines how the filename filter is applied - either contains the text or matches exactly.',
        },
        include_content: {
          displayName: 'Include content',
          shortDesc: 'Include document content in trigger',
          longDesc:
            'Whether to include the actual document content in the trigger payload. This may increase processing time and payload size.',
        },
      },
    },
  },
};

export default GoogleDocsAppEn;
