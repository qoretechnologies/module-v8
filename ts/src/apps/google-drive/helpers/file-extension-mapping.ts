export const GOOGLE_DRIVE_EXTENSION_MIME_MAP: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  txt: 'text/plain',
  csv: 'text/csv',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  html: 'text/html',
  json: 'application/json',
};

export const GoogleDriveExtensionAllowedValues = Object.keys(GOOGLE_DRIVE_EXTENSION_MIME_MAP).map(
  (ext) => ({
    value: ext,
    display_name: ext.toUpperCase(),
  })
);

export const GOOGLE_DRIVE_DOC_MIME_MAPPINGS: Record<string, string> = {
  'text/plain': 'application/vnd.google-apps.document',
  'application/rtf': 'application/vnd.google-apps.document',
  'application/vnd.oasis.opendocument.text': 'application/vnd.google-apps.document',
  'application/pdf': 'application/vnd.google-apps.document',
  'application/msword': 'application/vnd.google-apps.document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'application/vnd.google-apps.document',
  'application/vnd.ms-excel': 'application/vnd.google-apps.spreadsheet',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
    'application/vnd.google-apps.spreadsheet',
  'text/csv': 'application/vnd.google-apps.spreadsheet',
  'application/vnd.ms-powerpoint': 'application/vnd.google-apps.presentation',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation':
    'application/vnd.google-apps.presentation',
};
