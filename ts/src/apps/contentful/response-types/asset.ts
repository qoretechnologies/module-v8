import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const ContentfulAssetResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'string', short_desc: 'Asset ID' },
    created_at: { type: 'date', short_desc: 'Creation timestamp' },
    updated_at: { type: 'date', short_desc: 'Last update timestamp' },
    version: { type: 'int', short_desc: 'Current version number' },
    title: { type: 'string', short_desc: 'Asset title' },
    description: { type: 'string', short_desc: 'Asset description' },
    file_name: { type: 'string', short_desc: 'File name' },
    content_type: { type: 'string', short_desc: 'MIME type' },
    url: { type: 'string', short_desc: 'File URL' },
    size: { type: 'int', short_desc: 'File size in bytes' },
  },
} satisfies TQoreResponseType;

export const ContentfulAssetListResponseType = {
  type: 'list',
  element_type: ContentfulAssetResponseType,
} satisfies TQoreResponseType;
