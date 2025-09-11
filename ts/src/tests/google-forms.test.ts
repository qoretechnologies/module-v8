import { IQoreAppActionWithFunction } from '@qoretechnologies/ts-toolkit';

import { createGoogleDriveClient } from '../apps/google-drive/helpers/constants';
import {
  CreateGoogleForm,
  GetGoogleFormById,
  GetGoogleFormResponseById,
  GetGoogleFormResponses,
  SearchGoogleForms,
} from '../apps/google-forms/actions';
import { getGoogleFormIdAllowedValues } from '../apps/google-forms/helpers/get-form-id-allowed-values';
import { getGoogleFormQuestionIdAllowedValues } from '../apps/google-forms/helpers/get-form-question-id-allowed-values';
import { getGoogleFormResponseIdAllowedValues } from '../apps/google-forms/helpers/get-response-id-allowed-values';
import { delay } from '../global/helpers';
import { Debugger, DebugLevels } from '../utils/Debugger';
import { configDotenv } from 'dotenv';

Debugger.level = DebugLevels.Verbose;
configDotenv({ path: '.env' });

describe('Google Drive', () => {
  const base_context = {
    conn_opts: {
      token: '',
    } as any,
  };

  beforeAll(async () => {
    const refreshToken = process.env.GOOGLE_FORMS_REFRESH_TOKEN;
    const clientId = process.env.GOOGLE_FORMS_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_FORMS_CLIENT_SECRET;

    if (!refreshToken || !clientId || !clientSecret) {
      throw new Error(
        `Please set the` +
          `GOOGLE_FORMS_REFRESH_TOKEN, GOOGLE_FORMS_CLIENT_ID, and GOOGLE_FORMS_CLIENT_SECRET environment variables.`
      );
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

  let createdFormId: string | undefined;
  let formId: string | undefined;
  let responseId: string | undefined;

  describe('Should test google drive allowed values', () => {
    it('Should get Google Form IDs', async () => {
      const allowed_values = await getGoogleFormIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();

      formId =
        allowed_values.find((value) => value.display_name === 'Event Feedback')?.value ||
        allowed_values[0].value;
    });

    it('Should get Google Form Question IDs', async () => {
      const allowed_values = await getGoogleFormQuestionIdAllowedValues({
        ...base_context,
        opts: { form_id: formId },
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();
    });

    it('Should get Google Form Response IDs', async () => {
      const allowed_values = await getGoogleFormResponseIdAllowedValues({
        ...base_context,
        opts: { form_id: formId },
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();

      responseId = allowed_values[0].value;
    });
  });

  describe('Should test google forms actions', () => {
    it('Should create a new form', async () => {
      const action = CreateGoogleForm as IQoreAppActionWithFunction;
      const result = await action.api_function(
        {
          title: 'Ultimate Test Form',
          description: 'This form tests all supported question types and fields.',
          document_title: 'Ultimate Test Document',
          settings: {
            email_collection: 'VERIFIED',
            is_quiz: true,
          },
          questions: [
            {
              title: 'Short Answer Text',
              type: 'TEXT',
              required: true,
              help_text: 'Please enter a short answer.',
            },
            {
              title: 'Long Answer Paragraph',
              type: 'PARAGRAPH',
              required: false,
              help_text: 'Please enter a detailed response.',
            },
            {
              title: 'Multiple Choice Question',
              type: 'MULTIPLE_CHOICE',
              required: true,
              help_text: 'Choose one option.',
              choices: ['Option A', 'Option B', 'Option C'],
              shuffle_choices: true,
              correct_answer: 'Option B',
              points: 2,
              feedback: 'Option B is the correct answer.',
            },
            {
              title: 'Checkboxes Question',
              type: 'CHECKBOX',
              required: false,
              help_text: 'Select all that apply.',
              choices: ['Choice 1', 'Choice 2', 'Choice 3'],
              shuffle_choices: true,
              correct_answer: 'Choice 1,Choice 3',
              points: 3,
              feedback: 'You needed to pick 1 and 3.',
            },
            {
              title: 'Dropdown Question',
              type: 'DROPDOWN',
              required: true,
              help_text: 'Select an option from the dropdown.',
              choices: ['Item 1', 'Item 2', 'Item 3'],
              correct_answer: 'Item 2',
              points: 1,
              feedback: 'Item 2 was correct.',
            },
            {
              title: 'Scale Question',
              type: 'SCALE',
              required: true,
              help_text: 'Rate from 1 to 5.',
              scale_min: 1,
              scale_max: 5,
              scale_min_label: 'Bad',
              scale_max_label: 'Excellent',
            },
            {
              title: 'Date Question',
              type: 'DATE',
              required: false,
              help_text: 'Pick a date.',
            },
            {
              title: 'Time Question',
              type: 'TIME',
              required: false,
              help_text: 'Pick a time.',
            },
          ],
        },
        undefined,
        base_context
      );
      expect(result).toBeDefined();
      expect(result.form_id).toBeDefined();

      createdFormId = result.form_id;
    });

    it('Should get form by ID', async () => {
      const action = GetGoogleFormById as IQoreAppActionWithFunction;
      const result = await action.api_function(
        {
          form_id: createdFormId,
          include_questions: true,
        },
        undefined,
        base_context
      );
      expect(result).toBeDefined();
      expect(result.form_id).toBe(createdFormId);
    });

    it('Should search forms', async () => {
      const action = SearchGoogleForms as IQoreAppActionWithFunction;

      const result = await action.api_function(
        {
          filename: 'Ultimate Test Document',
          search_type: 'exact',
          limit: 1,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.forms).toBeDefined();
      expect(result.forms.length).toBeGreaterThan(0);
    });

    it('Should get form responses', async () => {
      const action = GetGoogleFormResponses as IQoreAppActionWithFunction;

      const result = await action.api_function(
        {
          form_id: formId,
          limit: 10,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.responses).toBeDefined();
      expect(Array.isArray(result.responses)).toBe(true);
    });

    it('Should get form response by ID', async () => {
      const action = GetGoogleFormResponseById as IQoreAppActionWithFunction;

      const result = await action.api_function(
        {
          form_id: formId,
          response_id: responseId,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.response.response_id).toBe(responseId);
      expect(result.form_id).toBe(formId);
    });

    // Google forms api method is not implemented yet
    // (getting api error although the method is in documentation already)
    //   it('Should update form publish settings', async () => {
    //     const action = updateGoogleFormPublishSettings as IQoreAppActionWithFunction;

    //     const result = await action.api_function(
    //       {
    //         form_id: createdFormId,
    //         is_accepting_responses: true,
    //         is_published: true,
    //       },
    //       undefined,
    //       base_context
    //     );

    //     expect(result).toBeDefined();
    //     expect(result.form_id).toBe(createdFormId);
    //     expect(result.is_accepting_responses).toBe(true);
    //     expect(result.is_published).toBe(true);
    //   });
  });

  describe('Clean up', () => {
    beforeEach(async () => {
      await delay(1000);
    });

    it('Should delete created form', async () => {
      const client = createGoogleDriveClient(base_context.conn_opts.token);

      await client.files.delete({
        fileId: createdFormId,
        supportsAllDrives: true,
      });
    });
  });
});
