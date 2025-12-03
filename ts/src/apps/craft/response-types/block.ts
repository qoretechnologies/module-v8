import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const CraftBlockMetadataResponseType = {
  type: 'hash',
  fields: {
    lastModifiedAt: { type: 'string' },
    createdAt: { type: 'string' },
    lastModifiedBy: { type: 'string' },
    createdBy: { type: 'string' },
    comments: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            id: { type: 'string' },
            author: { type: 'string' },
            content: { type: 'string' },
            createdAt: { type: 'string' },
          },
        },
      },
    },
  },
} satisfies TQoreResponseType;

export const CraftTextBlockResponseType = {
  type: 'hash',
  fields: {
    type: { type: 'string' },
    id: { type: 'string' },
    textStyle: { type: 'string' },
    textAlignment: { type: 'string' },
    font: { type: 'string' },
    cardLayout: { type: 'string' },
    markdown: { type: 'string' },
    indentationLevel: { type: 'number' },
    listStyle: { type: 'string' },
    decorations: {
      type: {
        type: 'list',
        element_type: 'string',
      },
    },
    color: { type: 'string' },
    taskInfo: {
      type: {
        type: 'hash',
        fields: {
          state: { type: 'string' },
          scheduleDate: { type: 'string' },
          deadlineDate: { type: 'string' },
        },
      },
    },
    metadata: {
      type: CraftBlockMetadataResponseType,
    },
  },
} satisfies TQoreResponseType;

export const CraftTitleResponseType = {
  type: 'hash',
  fields: {
    value: { type: 'string' },
    attributes: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            type: { type: 'string' },
            url: { type: 'string' },
            blockId: { type: 'string' },
            color: { type: 'string' },
            date: { type: 'string' },
            userId: { type: 'string' },
            markerId: { type: 'string' },
            start: { type: 'number' },
            end: { type: 'number' },
          },
        },
      },
    },
  },
} satisfies TQoreResponseType;

export const CraftPageBlockResponseType = {
  type: 'hash',
  fields: {
    type: { type: 'string' },
    id: { type: 'string' },
    title: {
      type: {
        type: 'hash',
        fields: {
          value: { type: 'string' },
          attributes: {
            type: {
              type: 'list',
              element_type: {
                type: 'hash',
                fields: {
                  type: { type: 'string' },
                  url: { type: 'string' },
                  blockId: { type: 'string' },
                  color: { type: 'string' },
                  date: { type: 'string' },
                  userId: { type: 'string' },
                  markerId: { type: 'string' },
                  start: { type: 'number' },
                  end: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
    markdown: { type: 'string' },
    indentationLevel: { type: 'number' },
    listStyle: { type: 'string' },
    decorations: {
      type: {
        type: 'list',
        element_type: 'string',
      },
    },
    color: { type: 'string' },
    taskInfo: {
      type: {
        type: 'hash',
        fields: {
          state: { type: 'string' },
          scheduleDate: { type: 'string' },
          deadlineDate: { type: 'string' },
        },
      },
    },
    metadata: {
      type: CraftBlockMetadataResponseType,
    },
    textStyle: { type: 'string' },
    textAlignment: { type: 'string' },
    font: { type: 'string' },
    cardLayout: { type: 'string' },
    content: {
      type: {
        type: 'list',
        element_type: 'any',
      },
    },
  },
} satisfies TQoreResponseType;

export const CraftCollectionItemBlockResponseType = {
  type: 'hash',
  fields: {
    type: { type: 'string' },
    id: { type: 'string' },
    title: { type: 'string' },
    properties: { type: 'hash' },
    markdown: { type: 'string' },
    metadata: {
      type: CraftBlockMetadataResponseType,
    },
    content: {
      type: {
        type: 'list',
        element_type: 'any',
      },
    },
  },
} satisfies TQoreResponseType;

export const CraftImageBlockResponseType = {
  type: 'hash',
  fields: {
    type: { type: 'string' },
    id: { type: 'string' },
    url: { type: 'string' },
    altText: { type: 'string' },
    size: { type: 'string' },
    width: { type: 'string' },
    uploaded: { type: 'boolean' },
    markdown: { type: 'string' },
    indentationLevel: { type: 'number' },
    listStyle: { type: 'string' },
    decorations: {
      type: {
        type: 'list',
        element_type: 'string',
      },
    },
    color: { type: 'string' },
    taskInfo: {
      type: {
        type: 'hash',
        fields: {
          state: { type: 'string' },
          scheduleDate: { type: 'string' },
          deadlineDate: { type: 'string' },
        },
      },
    },
    metadata: {
      type: CraftBlockMetadataResponseType,
    },
  },
} satisfies TQoreResponseType;

export const CraftVideoBlockResponseType = {
  type: 'hash',
  fields: {
    type: { type: 'string' },
    id: { type: 'string' },
    url: { type: 'string' },
    altText: { type: 'string' },
    size: { type: 'string' },
    width: { type: 'string' },
    uploaded: { type: 'boolean' },
    markdown: { type: 'string' },
    indentationLevel: { type: 'number' },
    listStyle: { type: 'string' },
    decorations: {
      type: {
        type: 'list',
        element_type: 'string',
      },
    },
    color: { type: 'string' },
    taskInfo: {
      type: {
        type: 'hash',
        fields: {
          state: { type: 'string' },
          scheduleDate: { type: 'string' },
          deadlineDate: { type: 'string' },
        },
      },
    },
    metadata: {
      type: CraftBlockMetadataResponseType,
    },
  },
} satisfies TQoreResponseType;

export const CraftFileBlockResponseType = {
  type: 'hash',
  fields: {
    type: { type: 'string' },
    id: { type: 'string' },
    url: { type: 'string' },
    fileName: { type: 'string' },
    blockLayout: { type: 'string' },
    uploaded: { type: 'boolean' },
    mimeType: { type: 'string' },
    fileSize: { type: 'number' },
    markdown: { type: 'string' },
    indentationLevel: { type: 'number' },
    listStyle: { type: 'string' },
    decorations: {
      type: {
        type: 'list',
        element_type: 'string',
      },
    },
    color: { type: 'string' },
    taskInfo: {
      type: {
        type: 'hash',
        fields: {
          state: { type: 'string' },
          scheduleDate: { type: 'string' },
          deadlineDate: { type: 'string' },
        },
      },
    },
    metadata: {
      type: CraftBlockMetadataResponseType,
    },
  },
} satisfies TQoreResponseType;

export const CraftDrawingBlockResponseType = {
  type: 'hash',
  fields: {
    type: { type: 'string' },
    id: { type: 'string' },
    url: { type: 'string' },
    markdown: { type: 'string' },
    indentationLevel: { type: 'number' },
    listStyle: { type: 'string' },
    decorations: {
      type: {
        type: 'list',
        element_type: 'string',
      },
    },
    color: { type: 'string' },
    taskInfo: {
      type: {
        type: 'hash',
        fields: {
          state: { type: 'string' },
          scheduleDate: { type: 'string' },
          deadlineDate: { type: 'string' },
        },
      },
    },
    metadata: {
      type: CraftBlockMetadataResponseType,
    },
  },
} satisfies TQoreResponseType;

export const CraftWhiteboardBlockResponseType = {
  type: 'hash',
  fields: {
    type: { type: 'string' },
    id: { type: 'string' },
    url: { type: 'string' },
    markdown: { type: 'string' },
    indentationLevel: { type: 'number' },
    listStyle: { type: 'string' },
    decorations: {
      type: {
        type: 'list',
        element_type: 'string',
      },
    },
    color: { type: 'string' },
    taskInfo: {
      type: {
        type: 'hash',
        fields: {
          state: { type: 'string' },
          scheduleDate: { type: 'string' },
          deadlineDate: { type: 'string' },
        },
      },
    },
    metadata: {
      type: CraftBlockMetadataResponseType,
    },
  },
} satisfies TQoreResponseType;

export const CraftTableBlockResponseType = {
  type: 'hash',
  fields: {
    type: { type: 'string' },
    id: { type: 'string' },
    markdown: { type: 'string' },
    indentationLevel: { type: 'number' },
    listStyle: { type: 'string' },
    decorations: {
      type: {
        type: 'list',
        element_type: 'string',
      },
    },
    color: { type: 'string' },
    taskInfo: {
      type: {
        type: 'hash',
        fields: {
          state: { type: 'string' },
          scheduleDate: { type: 'string' },
          deadlineDate: { type: 'string' },
        },
      },
    },
    metadata: {
      type: CraftBlockMetadataResponseType,
    },
  },
} satisfies TQoreResponseType;

export const CraftCollectionBlockResponseType = {
  type: 'hash',
  fields: {
    type: { type: 'string' },
    id: { type: 'string' },
    markdown: { type: 'string' },
    indentationLevel: { type: 'number' },
    listStyle: { type: 'string' },
    decorations: {
      type: {
        type: 'list',
        element_type: 'string',
      },
    },
    color: { type: 'string' },
    taskInfo: {
      type: {
        type: 'hash',
        fields: {
          state: { type: 'string' },
          scheduleDate: { type: 'string' },
          deadlineDate: { type: 'string' },
        },
      },
    },
    metadata: {
      type: CraftBlockMetadataResponseType,
    },
  },
} satisfies TQoreResponseType;

export const CraftCodeBlockResponseType = {
  type: 'hash',
  fields: {
    type: { type: 'string' },
    id: { type: 'string' },
    rawCode: { type: 'string' },
    language: { type: 'string' },
    markdown: { type: 'string' },
    indentationLevel: { type: 'number' },
    listStyle: { type: 'string' },
    decorations: {
      type: {
        type: 'list',
        element_type: 'string',
      },
    },
    color: { type: 'string' },
    taskInfo: {
      type: {
        type: 'hash',
        fields: {
          state: { type: 'string' },
          scheduleDate: { type: 'string' },
          deadlineDate: { type: 'string' },
        },
      },
    },
    metadata: {
      type: CraftBlockMetadataResponseType,
    },
  },
} satisfies TQoreResponseType;

export const CraftRichLinkBlockResponseType = {
  type: 'hash',
  fields: {
    type: { type: 'string' },
    id: { type: 'string' },
    url: { type: 'string' },
    title: { type: 'string' },
    description: { type: 'string' },
    layout: { type: 'string' },
    markdown: { type: 'string' },
    indentationLevel: { type: 'number' },
    listStyle: { type: 'string' },
    decorations: {
      type: {
        type: 'list',
        element_type: 'string',
      },
    },
    color: { type: 'string' },
    taskInfo: {
      type: {
        type: 'hash',
        fields: {
          state: { type: 'string' },
          scheduleDate: { type: 'string' },
          deadlineDate: { type: 'string' },
        },
      },
    },
    metadata: {
      type: CraftBlockMetadataResponseType,
    },
  },
} satisfies TQoreResponseType;

export const CraftLineBlockResponseType = {
  type: 'hash',
  fields: {
    type: { type: 'string' },
    id: { type: 'string' },
    lineStyle: { type: 'string' },
    markdown: { type: 'string' },
    indentationLevel: { type: 'number' },
    listStyle: { type: 'string' },
    decorations: {
      type: {
        type: 'list',
        element_type: 'string',
      },
    },
    color: { type: 'string' },
    taskInfo: {
      type: {
        type: 'hash',
        fields: {
          state: { type: 'string' },
          scheduleDate: { type: 'string' },
          deadlineDate: { type: 'string' },
        },
      },
    },
    metadata: {
      type: CraftBlockMetadataResponseType,
    },
  },
} satisfies TQoreResponseType;

export const CraftBlockResponseType = {
  type: 'hash',
  fields: {
    ...CraftTextBlockResponseType.fields,
    ...CraftPageBlockResponseType.fields,
    ...CraftCollectionItemBlockResponseType.fields,
    ...CraftImageBlockResponseType.fields,
    ...CraftVideoBlockResponseType.fields,
    ...CraftFileBlockResponseType.fields,
    ...CraftDrawingBlockResponseType.fields,
    ...CraftWhiteboardBlockResponseType.fields,
    ...CraftTableBlockResponseType.fields,
    ...CraftCollectionBlockResponseType.fields,
    ...CraftCodeBlockResponseType.fields,
    ...CraftRichLinkBlockResponseType.fields,
    ...CraftLineBlockResponseType.fields,
  },
} satisfies TQoreResponseType;
