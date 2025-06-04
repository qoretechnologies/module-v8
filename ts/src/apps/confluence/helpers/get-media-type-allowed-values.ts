import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const ConfluenceMediaTypeAllowedValues = [
  {
    value: 'image/png',
    display_name: 'PNG Image',
    desc: 'Portable Network Graphics image format',
  },
  {
    value: 'image/jpeg',
    display_name: 'JPEG Image',
    desc: 'Joint Photographic Experts Group image format',
  },
  {
    value: 'image/gif',
    display_name: 'GIF Image',
    desc: 'Graphics Interchange Format image',
  },
  {
    value: 'image/svg+xml',
    display_name: 'SVG Image',
    desc: 'Scalable Vector Graphics image format',
  },
  {
    value: 'application/pdf',
    display_name: 'PDF Document',
    desc: 'Portable Document Format',
  },
  {
    value: 'application/msword',
    display_name: 'Word Document',
    desc: 'Microsoft Word document',
  },
  {
    value: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    display_name: 'Word Document (DOCX)',
    desc: 'Microsoft Word Open XML document',
  },
  {
    value: 'application/vnd.ms-excel',
    display_name: 'Excel Spreadsheet',
    desc: 'Microsoft Excel spreadsheet',
  },
  {
    value: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    display_name: 'Excel Spreadsheet (XLSX)',
    desc: 'Microsoft Excel Open XML spreadsheet',
  },
  {
    value: 'application/vnd.ms-powerpoint',
    display_name: 'PowerPoint Presentation',
    desc: 'Microsoft PowerPoint presentation',
  },
  {
    value: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    display_name: 'PowerPoint Presentation (PPTX)',
    desc: 'Microsoft PowerPoint Open XML presentation',
  },
  {
    value: 'text/plain',
    display_name: 'Text File',
    desc: 'Plain text file',
  },
  {
    value: 'text/csv',
    display_name: 'CSV File',
    desc: 'Comma-separated values file',
  },
  {
    value: 'application/zip',
    display_name: 'ZIP Archive',
    desc: 'ZIP compressed archive',
  },
  {
    value: 'video/mp4',
    display_name: 'MP4 Video',
    desc: 'MPEG-4 video file',
  },
  {
    value: 'audio/mpeg',
    display_name: 'MP3 Audio',
    desc: 'MPEG audio file',
  },
] satisfies IQoreAllowedValue<string>[];
