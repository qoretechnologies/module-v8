import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const OutlookAttachmentMimeTypeAllowedValues = [
  { value: 'application/pdf', display_name: 'PDF Document' },
  { value: 'application/msword', display_name: 'Word Document (.doc)' },
  {
    value: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    display_name: 'Word Document (.docx)',
  },
  { value: 'application/vnd.ms-excel', display_name: 'Excel Spreadsheet (.xls)' },
  {
    value: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    display_name: 'Excel Spreadsheet (.xlsx)',
  },
  { value: 'application/vnd.ms-powerpoint', display_name: 'PowerPoint Presentation (.ppt)' },
  {
    value: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    display_name: 'PowerPoint Presentation (.pptx)',
  },
  { value: 'text/plain', display_name: 'Plain Text' },
  { value: 'text/html', display_name: 'HTML' },
  { value: 'text/csv', display_name: 'CSV' },
  { value: 'application/zip', display_name: 'ZIP Archive' },
  { value: 'application/x-rar-compressed', display_name: 'RAR Archive' },
  { value: 'image/jpeg', display_name: 'JPEG Image' },
  { value: 'image/png', display_name: 'PNG Image' },
  { value: 'image/gif', display_name: 'GIF Image' },
  { value: 'audio/mpeg', display_name: 'MP3 Audio' },
  { value: 'video/mp4', display_name: 'MP4 Video' },
  { value: 'message/rfc822', display_name: 'Email Message' },
  { value: 'application/json', display_name: 'JSON' },
  { value: 'application/xml', display_name: 'XML' },
] satisfies IQoreAllowedValue<string>[];
