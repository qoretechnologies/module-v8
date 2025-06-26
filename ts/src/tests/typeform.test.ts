import { configDotenv } from 'dotenv';
import {
  CreateTypeformForm,
  CreateTypeformImage,
  DeleteTypeformForm,
  DeleteTypeformImage,
  GetTypeformForm,
  ListTypeformForms,
  ListTypeformImages,
  ListTypeformResponses,
  ListTypeformWorkspaces,
} from '../apps/typeform/actions';
import { getTypeformFormIdAllowedValues } from '../apps/typeform/helpers/get-form-allowed-values';
import { getTypeformImageIdAllowedValues } from '../apps/typeform/helpers/get-image-allowed-values';
import { getTypeformWorkspaceIdAllowedValues } from '../apps/typeform/helpers/get-workspace-allowed-values';
import { NewTypeformFormResponse } from '../apps/typeform/triggers';

configDotenv({ path: '.env' });

describe('Test Typeform Actions', () => {
  const base_context = {
    conn_opts: {
      token: '',
    } as any,
  };

  beforeAll(() => {
    const token = process.env.TYPEFORM_TOKEN;

    if (!token) {
      throw new Error(`Please set the TYPEFORM_TOKEN environment variable.`);
    }

    base_context.conn_opts.token = token;
  });

  let form_id: string | undefined;
  let created_image_id: string | undefined;
  let created_form_id: string | undefined;
  describe('Should test Typeform allowed values', () => {
    it('Should get workspace allowed values', async () => {
      const allowed_values = await getTypeformWorkspaceIdAllowedValues(base_context);
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get form allowed values', async () => {
      const allowed_values = await getTypeformFormIdAllowedValues(base_context);
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      form_id =
        allowed_values.find((item) => item.display_name === 'Qorus Test Form')?.value ||
        allowed_values[0].value;
    });

    it('Should get image allowed values', async () => {
      const allowed_values = await getTypeformImageIdAllowedValues(base_context);
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });
  });

  describe('Should test Typeform actions', () => {
    it('Should list forms', async () => {
      const action = ListTypeformForms;
      if (!('api_function' in action)) throw new Error('api_function not found in action');
      const result = await action.api_function(
        {
          order: {
            field: 'created_at',
            direction: 'asc',
          },
        },
        undefined,
        base_context
      );
      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.items.length).toBeGreaterThan(0);
    });

    it('Should list workspaces', async () => {
      const action = ListTypeformWorkspaces;
      if (!('api_function' in action)) throw new Error('api_function not found in action');
      const result = await action.api_function({}, undefined, base_context);
      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.items.length).toBeGreaterThan(0);
    });

    it('Should get form by ID', async () => {
      const action = GetTypeformForm;
      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!form_id) throw new Error('form_id is not defined');

      const result = await action.api_function({ form_id }, undefined, base_context);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.id).toBe(form_id);
    });

    it('Should list images', async () => {
      const action = ListTypeformImages;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({}, undefined, base_context);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('Should create an image', async () => {
      const action = CreateTypeformImage;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          image: {
            content:
              'iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAIAAAAC64paAAAAG0lEQVR42mOccuMbA7mAcVTzqOZRzaOaB1YzABKjL70rq/b4AAAAAElFTkSuQmCC',
            mime_type: 'image/gif',
            name: 'newimage.gif',
          },
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();

      created_image_id = result.id;
    });

    it('Should delete an image', async () => {
      const action = DeleteTypeformImage;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      await action.api_function(
        {
          image_id: created_image_id,
        },
        undefined,
        base_context
      );
    });

    it('Should create a form', async () => {
      const action = CreateTypeformForm;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          title: 'A Test Form',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();

      created_form_id = result.id;
    });

    it('Should delete the created form', async () => {
      const action = DeleteTypeformForm;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      await action.api_function(
        {
          form_id: created_form_id,
        },
        undefined,
        base_context
      );
    });

    it('Should list form responses', async () => {
      const action = ListTypeformResponses;

      if (!('api_function' in action)) throw new Error('api_function not found in action');
      form_id = 'xMHowUR4';

      if (!form_id) throw new Error('form_id is not defined');

      const result = await action.api_function(
        {
          form_id,
          page_size: 5,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.items.length).toBeGreaterThan(0);
    });
  });

  describe('Should test Typeform triggers webhook registration', () => {
    let webhook: { id: string; tag: string } | undefined;
    it('Should register the webhook', async () => {
      const trigger = NewTypeformFormResponse;

      if (!('webhook_register' in trigger) || !trigger.webhook_register)
        throw new Error('webhook_register not found in trigger');

      if (!form_id) throw new Error('form_id is not defined');

      const result = await trigger.webhook_register(
        {
          ...base_context,
          opts: {
            form_id,
          },
        },
        'https://example.com/webhook'
      );

      expect(result).toBeDefined();
      expect(result?.webhook.id).toBeDefined();
      expect(result?.webhook.tag).toBeDefined();

      webhook = result?.webhook;
    });

    it('Should deregister the webhook', async () => {
      const trigger = NewTypeformFormResponse;

      if (!('webhook_deregister' in trigger) || !trigger.webhook_deregister)
        throw new Error('webhook_deregister not found in trigger');

      if (!webhook) throw new Error('webhook is not defined');
      if (!form_id) throw new Error('form_id is not defined');

      await trigger.webhook_deregister(
        {
          ...base_context,
          opts: {
            form_id,
          },
        },
        'https://example.com/webhook',
        {
          webhook,
        }
      );
    });
  });
});
