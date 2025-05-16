export const GoogleDriveFileTypeAllowedValues = [
  { display_name: 'Images (any format)', value: 'image/' },
  { display_name: 'Videos (any format)', value: 'video/' },
  { display_name: 'Audio files (any format)', value: 'audio/' },
  { display_name: 'Documents and text files (any format)', value: 'text/' },
  { display_name: 'PDFs', value: 'application/pdf' },
  { display_name: 'Google Docs', value: 'application/vnd.google-apps.document' },
  { display_name: 'Google Drawing', value: 'application/vnd.google-apps.drawing' },
  { display_name: 'Google Fusion Tables', value: 'application/vnd.google-apps.fusiontable' },
  { display_name: 'Google Slides', value: 'application/vnd.google-apps.presentation' },
  { display_name: 'Google Sheets', value: 'application/vnd.google-apps.spreadsheet' },
  { display_name: 'Google Forms', value: 'application/vnd.google-apps.form' },
  { display_name: 'Google Sites', value: 'application/vnd.google-apps.site' },
  { display_name: 'Google Folders', value: 'application/vnd.google-apps.folder' },
];

export const GoogleDriveOrderByFieldAllowedValues = [
  { display_name: 'Created Time', value: 'createdTime' },
  { display_name: 'Modified Time', value: 'modifiedTime' },
  { display_name: 'Name', value: 'name' },
  { display_name: 'Folder', value: 'folder' },
  { display_name: 'Recency', value: 'recency' },
];

export const GoogleDriveOrderByDirectionAllowedValues = [
  { display_name: 'Ascending', value: 'asc' },
  { display_name: 'Descending', value: 'desc' },
];

export const GoogleDriveOrderByAllowedValues = [
  {
    display_name: 'Modified Time (Newest First)',
    value: { field: 'modifiedTime', direction: 'desc' },
  },
  {
    display_name: 'Modified Time (Oldest First)',
    value: { field: 'modifiedTime', direction: 'asc' },
  },
  {
    display_name: 'Created Time (Newest First)',
    value: { field: 'createdTime', direction: 'desc' },
  },
  {
    display_name: 'Created Time (Oldest First)',
    value: { field: 'createdTime', direction: 'asc' },
  },
  {
    display_name: 'Name (A-Z)',
    value: { field: 'name', direction: 'asc' },
  },
  {
    display_name: 'Name (Z-A)',
    value: { field: 'name', direction: 'desc' },
  },
];
