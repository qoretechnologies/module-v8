/* eslint-disable max-len */
const ConfluenceAppEn = {
  displayName: 'Confluence',
  groups: ['Documents & Documentation'],
  shortDesc:
    'Confluence is a collaboration tool used to help teams collaborate and share knowledge efficiently.',
  longDesc:
    'Confluence is a powerful collaboration tool that allows teams to create, share, and manage content in a centralized platform. It is designed to enhance team productivity by providing a space for documentation, project management, and knowledge sharing. With features like real-time editing, commenting, and integration with other tools, Confluence helps teams work together more effectively.',
  triggers: {
    new_attachment: {
      displayName: 'New Attachment',
      shortDesc: 'Triggers when a new attachment is uploaded to Confluence.',
      longDesc:
        'Monitors Confluence for newly uploaded attachments with optional filtering by status and media type. Triggers when new attachments are detected.',
      options: {
        status: {
          displayName: 'Status',
          shortDesc: 'Filter by attachment status',
          longDesc: 'Filter attachments by their status (current, archived, or trashed).',
        },
        mediaType: {
          displayName: 'Media Type',
          shortDesc: 'Filter by media type',
          longDesc: 'Filter attachments by their media type (e.g., image/png, application/pdf).',
        },
      },
    },
    new_blogpost: {
      displayName: 'New Blogpost',
      shortDesc: 'Triggers when a new blogpost is created in Confluence.',
      longDesc:
        'Monitors Confluence for newly created blogposts with optional filtering by space, status, and body format. Triggers when new blogposts are detected.',
      options: {
        space_id: {
          displayName: 'Space ID',
          shortDesc: 'Filter by Confluence space',
          longDesc: 'Filter blogposts by the Confluence space they belong to.',
        },
        status: {
          displayName: 'Status',
          shortDesc: 'Filter by blogpost status',
          longDesc: 'Filter blogposts by their status (current, deleted, or trashed).',
        },
        body_format: {
          displayName: 'Body Format',
          shortDesc: 'Content format to retrieve',
          longDesc:
            'The format to retrieve the blogpost content in (storage format or Atlas Document Format).',
        },
      },
    },
    new_page: {
      displayName: 'New Page',
      shortDesc: 'Triggers when a new page is created in Confluence.',
      longDesc:
        'Monitors Confluence for newly created pages with optional filtering by space, status, body format, and subtype. Triggers when new pages are detected.',
      options: {
        space_id: {
          displayName: 'Space ID',
          shortDesc: 'Filter by Confluence space',
          longDesc: 'Filter pages by the Confluence space they belong to.',
        },
        status: {
          displayName: 'Status',
          shortDesc: 'Filter by page status',
          longDesc: 'Filter pages by their status (current, archived, deleted, or trashed).',
        },
        body_format: {
          displayName: 'Body Format',
          shortDesc: 'Content format to retrieve',
          longDesc:
            'The format to retrieve the page content in (storage format or Atlas Document Format).',
        },
        subtype: {
          displayName: 'Subtype',
          shortDesc: 'Filter by page subtype',
          longDesc: 'Filter pages by their subtype (live pages or regular pages).',
        },
      },
    },
  },
};

export default ConfluenceAppEn;
