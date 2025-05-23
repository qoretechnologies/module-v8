export interface GoogleDocsExportConfig {
  format: string;
  mimeType: string;
  extension: string;
}

export const GOOGLE_DOCS_EXPORT_CONFIGS: Record<string, GoogleDocsExportConfig> = {
  docx: {
    format: 'docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    extension: '.docx',
  },
  pdf: {
    format: 'pdf',
    mimeType: 'application/pdf',
    extension: '.pdf',
  },
  rtf: {
    format: 'rtf',
    mimeType: 'application/rtf',
    extension: '.rtf',
  },
  html: {
    format: 'html',
    mimeType: 'text/html',
    extension: '.html',
  },
  plain: {
    format: 'plain',
    mimeType: 'text/plain',
    extension: '.txt',
  },
};

export const googleDocsExportFormatAllowedValues = Object.entries(GOOGLE_DOCS_EXPORT_CONFIGS).map(
  ([key, config]) => ({
    value: key,
    display_name: `${
      key === 'docx'
        ? 'Microsoft Word'
        : key === 'pdf'
          ? 'PDF Document'
          : key === 'rtf'
            ? 'Rich Text Format'
            : key === 'html'
              ? 'HTML Document'
              : 'Plain Text'
    } (${config.extension})`,
  })
);
