import { configDotenv } from 'dotenv';
import {
  AppendTextToGoogleDocsDocument,
  CreateGoogleDocsDocumentFromTemplate,
  CreateGoogleDocsDocumentFromText,
  GetGoogleDocsDocumentById,
  UploadGoogleDocsDocument,
} from '../apps/google-docs/actions';
import { getGoogleDocsDocumentIdAllowedValues } from '../apps/google-docs/helpers/get-document-id-allowed-values';
import { getGoogleDocsTemplatePlaceholderAllowedValues } from '../apps/google-docs/helpers/get-template-placeholders';
import { createGoogleDriveClient } from '../apps/google-drive/helpers/constants';
import { delay } from '../global/helpers';
import { Debugger, DebugLevels } from '../utils/Debugger';
import GoogleDocsNewDocumentTrigger from '../apps/google-docs/triggers/new-document.trigger';

Debugger.level = DebugLevels.Verbose;
configDotenv({ path: '.env' });

describe('Google Docs', () => {
  const base_context = {
    conn_opts: {
      token: '',
    } as any,
  };

  beforeAll(async () => {
    const refreshToken = process.env.GOOGLE_DOCS_REFRESH_TOKEN;
    const clientId = process.env.GOOGLE_DOCS_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_DOCS_CLIENT_SECRET;

    if (!refreshToken || !clientId || !clientSecret) {
      throw new Error(`
        Please set the GOOGLE_DOCS_REFRESH_TOKEN, GOOGLE_DOCS_CLIENT_ID, 
        and GOOGLE_DOCS_CLIENT_SECRET environment variables.
      `);
    }

    const data = {
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    };

    const formBody = Object.keys(data)
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key as keyof typeof data])}`
      )
      .join('&');

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formBody,
    });

    const responseData = await response.json();
    if (!responseData?.access_token) {
      throw new Error('Failed to get access token');
    }

    base_context.conn_opts.token = responseData.access_token;
  });

  let document: string | undefined;
  let template: string | undefined;
  let placeholders: string[] | undefined;
  let document_from_template: string | undefined;
  let document_from_text: string | undefined;
  let uploaded_document: string | undefined;

  describe('Should test google docs allowed values', () => {
    it('Should get file allowed values', async () => {
      const allowed_values = await getGoogleDocsDocumentIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();

      document = allowed_values.find((item) => item.display_name === 'Qorus Docs Test')?.value;
      template = allowed_values.find((item) => item.display_name === 'Qorus Template Test')?.value;
    });

    it('Should get allowed values for template placeholders', async () => {
      const allowed_values = await getGoogleDocsTemplatePlaceholderAllowedValues({
        ...base_context,
        opts: {
          template_id: template,
        },
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      placeholders = allowed_values.map((item) => item.value);
    });
  });

  describe('Should test google docs actions', () => {
    it('Should append text to a document', async () => {
      const action = AppendTextToGoogleDocsDocument;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          document_id: document,
          add_line_break: true,
          text_style: {
            bold: true,
            font_family: 'Arial',
            font_size: 12,
            italic: true,
            underline: true,
          },
          text: 'This is a test text',
        },
        undefined,
        base_context
      );
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('Should create a file from template', async () => {
      const action = CreateGoogleDocsDocumentFromTemplate;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          template_id: template,
          new_document_name: 'Qorus Filled Template Test',
          share_with_template_collaborators: true,
          remove_unused_fields: true,
          replacements: placeholders?.map((placeholder) => ({
            placeholder,
            replacement_text: `This is a test text for ${placeholder.replace(/{{|}}/g, '').toLowerCase()}`,
            match_case: true,
          })),
        },
        undefined,
        base_context
      );
      expect(result).toBeDefined();
      expect(result.success).toBe(true);

      document_from_template = result.document_id;
    });

    it('Should create a file from text', async () => {
      const action = CreateGoogleDocsDocumentFromText;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          export_format: 'pdf',
          document_name: 'Qorus Text Test',
          parse_html: false,
          // eslint-disable-next-line max-len
          document_content: `<h1>Sample Document</h1><p>This is a <b>bold</b>, <i>italic</i>, and <u>underlined</u> sentence with a <a href="https://example.com">link</a>.</p>    <h2>List Example</h2><ul><li>First bullet point</li><li>Second bullet point</li></ul><ol><li>First numbered item</li><li>Second numbered item</li></ol><h2>Table Example</h2><table><tr><th>Header 1</th><th>Header 2</th></tr><tr><td>Row 1 Col 1</td><td>Row 1 Col 2</td></tr><tr><td>Row 2 Col 1</td><td>Row 2 Col 2</td></tr></table><p>End of document.</p>`,
        },
        undefined,
        base_context
      );
      expect(result).toBeDefined();
      expect(result.success).toBe(true);

      document_from_text = result.document_id;
    });

    it('Should get file by id', async () => {
      const action = GetGoogleDocsDocumentById;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          document_id: document_from_text,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.document_id).toBe(document_from_text);
    });

    it('Should upload a document', async () => {
      const action = UploadGoogleDocsDocument;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const file = {
        name: 'test.txt',
        mime_type: 'text/plain',
        content: Buffer.from('This is a test file').toString('base64'),
      };

      const result = await action.api_function(
        {
          file,
          file_name: 'another_test',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      uploaded_document = result.id;
    });

    describe('Should test triggers event example data', () => {
      it('Should get example event data for new document trigger', async () => {
        const trigger = GoogleDocsNewDocumentTrigger;

        if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
          throw new Error('get_example_event_data not found in trigger');

        const result = await trigger.get_example_event_data({
          ...base_context,
          opts: { include_content: true } as any,
        });

        console.dir(result, { depth: null });

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
      });
    });
  });

  describe('Clean up', () => {
    beforeEach(async () => {
      await delay(1000);
    });

    it('Should delete document created from template', async () => {
      const client = createGoogleDriveClient(base_context.conn_opts.token);
      await client.files.delete({
        fileId: document_from_template,
      });
    });

    it('Should delete created document created from text', async () => {
      const client = createGoogleDriveClient(base_context.conn_opts.token);
      await client.files.delete({
        fileId: document_from_text,
      });
    });

    it('Should delete uploaded document', async () => {
      const client = createGoogleDriveClient(base_context.conn_opts.token);
      await client.files.delete({
        fileId: uploaded_document,
      });
    });
  });
});
