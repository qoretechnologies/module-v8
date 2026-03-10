import { configDotenv } from 'dotenv';
import {
  CreateAmazonS3TextObject,
  DeleteAmazonS3Object,
  GetAmazonS3File,
  GetAmazonS3Object,
  ListAmazonS3Buckets,
  ListAmazonS3Files,
  ListAmazonS3Objects,
  UploadAmazonS3File,
} from '../apps/amazon-s3/actions';
import { getAmazonS3BucketAllowedValues } from '../apps/amazon-s3/helpers/get-bucket-allowed-values';
import { getAmazonS3ObjectAllowedValues } from '../apps/amazon-s3/helpers/get-object-allowed-values';
import { NewAmazonS3Bucket, NewOrUpdatedAmazonS3File } from '../apps/amazon-s3/triggers';
import { Debugger, DebugLevels } from '../utils/Debugger';

configDotenv({ path: '.env' });
Debugger.level = DebugLevels.Verbose;

describe.skip('Amazon S3', () => {
  const base_context = {
    conn_opts: {} as any,
  };

  beforeAll(() => {
    const accessKey = process.env.AMAZON_ACCESS_KEY_ID;
    const secretKey = process.env.AMAZON_SECRET_ACCESS_KEY;

    if (!accessKey || !secretKey) {
      throw new Error(`
        Please set the AMAZON_ACCESS_KEY_ID and AMAZON_SECRET_ACCESS_KEY environment variables.
      `);
    }

    base_context.conn_opts = {
      access_key_id: accessKey,
      secret_access_key: secretKey,
    };
  });

  const bucket = 'qorus-testing-1';
  let object: string | undefined;
  let createdFile: string | undefined;

  describe('Should test allowed values', () => {
    it('Should get bucket allowed values', async () => {
      const allowed_values = await getAmazonS3BucketAllowedValues({
        ...base_context,
        opts: {
          region: 'eu-north-1',
        },
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();
    });

    it('Should get object allowed values', async () => {
      const allowed_values = await getAmazonS3ObjectAllowedValues({
        ...base_context,
        opts: {
          region: 'eu-north-1',
          bucket_name: bucket,
        },
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();
    });
  });

  describe('Should test actions', () => {
    // it('Should create a bucket', async () => {
    //   const action = createAmazonS3Bucket;

    //   if (!('api_function' in action)) throw new Error('api_function not found in action');

    //   const result = await action.api_function(
    //     {
    //       bucket_name: 'qorus-testing-1',
    //       region: 'eu-north-1',
    //     },
    //     undefined,
    //     base_context
    //   );

    //   expect(result).toBeDefined();
    //   expect(result.bucket_name).toBe('qorus-testing-1');
    // });

    it('Should list buckets', async () => {
      const action = ListAmazonS3Buckets;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          region: 'eu-north-1',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.buckets).toBeDefined();
      expect(Array.isArray(result.buckets)).toBe(true);
    });

    it('Should create a text object with basic parameters', async () => {
      const action = CreateAmazonS3TextObject;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          region: 'eu-north-1',
          bucket_name: bucket,
          object_key: 'test-files/sample.txt',
          content: 'This is a test file content for S3 upload.',
          content_type: 'text/plain',
          storage_class: 'STANDARD',
          metadata: {
            author: 'test-user',
            purpose: 'unit-testing',
          },
          tags: {
            Environment: 'Testing',
            Project: 'S3Integration',
            TEST: 'test',
          },
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.size).toBeGreaterThan(0);
      expect(result.etag).toBeDefined();

      object = result.object_key;
    });

    it('Should upload a PDF file with metadata and tags', async () => {
      const action = UploadAmazonS3File;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const pdfContent =
        'JVBERi0xLjQKJZOMi54gUmVwb3J0TGFiIEdlbmVyYXRlZCBQREYgZG9jdW1lbnQgaHR0cDovL3d3dy5yZXBvcnRsYWIuY29tCjEgMCBvYmoKPDwKL0YxIDIgMCBSIC9GMiAzIDAgUgo+PgplbmRvYmoKMiAwIG9iago8PAovQmFzZUZvbnQgL0hlbHZldGljYSAvRW5jb2RpbmcgL1dpbkFuc2lFbmNvZGluZyAvTmFtZSAvRjEgL1N1YnR5cGUgL1R5cGUxIC9UeXBlIC9Gb250Cj4+CmVuZG9iagozIDAgb2JqCjw8Ci9CYXNlRm9udCAvSGVsdmV0aWNhLUJvbGQgL0VuY29kaW5nIC9XaW5BbnNpRW5jb2RpbmcgL05hbWUgL0YyIC9TdWJ0eXBlIC9UeXBlMSAvVHlwZSAvRm9udAo+PgplbmRvYmoKNCAwIG9iago8PAovQ29udGVudHMgOCAwIFIgL01lZGlhQm94IFsgMCAwIDYxMiA3OTIgXSAvUGFyZW50IDcgMCBSIC9SZXNvdXJjZXMgPDwKL0ZvbnQgMSAwIFIgL1Byb2NTZXQgWyAvUERGIC9UZXh0IC9JbWFnZUIgL0ltYWdlQyAvSW1hZ2VJIF0KPj4gL1JvdGF0ZSAwIC9UcmFucyA8PAoKPj4gCiAgL1R5cGUgL1BhZ2UKPj4KZW5kb2JqCjUgMCBvYmoKPDwKL1BhZ2VNb2RlIC9Vc2VOb25lIC9QYWdlcyA3IDAgUiAvVHlwZSAvQ2F0YWxvZwo+PgplbmRvYmoKNiAwIG9iago8PAovQXV0aG9yIChcKGFub255bW91c1wpKSAvQ3JlYXRpb25EYXRlIChEOjIwMjUwOTAxMTIyMjAxKzAwJzAwJykgL0NyZWF0b3IgKFwodW5zcGVjaWZpZWRcKSkgL0tleXdvcmRzICgpIC9Nb2REYXRlIChEOjIwMjUwOTAxMTIyMjAxKzAwJzAwJykgL1Byb2R1Y2VyIChSZXBvcnRMYWIgUERGIExpYnJhcnkgLSB3d3cucmVwb3J0bGFiLmNvbSkgCiAgL1N1YmplY3QgKFwodW5zcGVjaWZpZWRcKSkgL1RpdGxlIChcKGFub255bW91c1wpKSAvVHJhcHBlZCAvRmFsc2UKPj4KZW5kb2JqCjcgMCBvYmoKPDwKL0NvdW50IDEgL0tpZHMgWyA0IDAgUiBdIC9UeXBlIC9QYWdlcwo+PgplbmRvYmoKOCAwIG9iago8PAovRmlsdGVyIFsgL0FTQ0lJODVEZWNvZGUgL0ZsYXRlRGVjb2RlIF0gL0xlbmd0aCAzMDcKPj4Kc3RyZWFtCkdhdCVbYnRjLzEmOzlMdE1FKUdPNj5UPi9ZR2gqMyFAMiMzPik8b08pRVteIU03Ny1iIWhyTDc8R1ZDYV0wI1U5NlVTaThoYkNuZ2A5ITs5RVFBL1NlLG8xXkdIdU9zZl1WPj8kTE87MjBQTzgvciloPmJxZlxeKU0tTiRtLl9CWWs0ZGIwOD1RZC1aWiZoIjc0RF9JWVwxVU0wYFxZW1BhRShUK2JZZGpTZVI8XldrNCU5bltKMThobXVjaDxWQXJXdShAcCxdY3IxM2JSV2w9U05TOC1OVUAnYHFPJT5xYE5nUSQmPy1vO0UhXjJEZnBiQi5WayZkc1hRZEAxPidKczo9KiI7QCtMSCJWRm5HXFgkMzRoU0lHPkBnPiQiPmVObD5iX1ZfaSpkXmA7azQ/fj5lbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA5CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDA3MyAwMDAwMCBuIAowMDAwMDAwMTE0IDAwMDAwIG4gCjAwMDAwMDAyMjEgMDAwMDAgbiAKMDAwMDAwMDMzMyAwMDAwMCBuIAowMDAwMDAwNTI2IDAwMDAwIG4gCjAwMDAwMDA1OTQgMDAwMDAgbiAKMDAwMDAwMDg3NyAwMDAwMCBuIAowMDAwMDAwOTM2IDAwMDAwIG4gCnRyYWlsZXIKPDwKL0lEIApbPDc3NTU2ZjUxNTQ5YjhmOGJiNGVkMzkzMTRkYTc0N2IwPjw3NzU1NmY1MTU0OWI4ZjhiYjRlZDM5MzE0ZGE3NDdiMD5dCiUgUmVwb3J0TGFiIGdlbmVyYXRlZCBQREYgZG9jdW1lbnQgLS0gZGlnZXN0IChodHRwOi8vd3d3LnJlcG9ydGxhYi5jb20pCgovSW5mbyA2IDAgUgovUm9vdCA1IDAgUgovU2l6ZSA5Cj4+CnN0YXJ0eHJlZgoxMzMzCiUlRU9GCg==';

      const result = await action.api_function(
        {
          region: 'eu-north-1',
          bucket_name: bucket,
          file: {
            name: 'test-document.pdf',
            mime_type: 'application/pdf',
            content: pdfContent,
          },
          object_key: 'uploads/test-document.pdf',
          storage_class: 'STANDARD',
          metadata: {
            author: 'test-user',
            department: 'engineering',
            'upload-source': 'unit-test',
          },
          tags: {
            Environment: 'Testing',
            FileType: 'PDF',
            Automated: 'true',
          },
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.bucket_name).toBe(bucket);
      expect(result.object_key).toBe('uploads/test-document.pdf');
      expect(result.original_filename).toBe('test-document.pdf');

      createdFile = result.object_key;
    });

    it('Should get file', async () => {
      const action = GetAmazonS3File;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          bucket_name: bucket,
          region: 'eu-north-1',
          object_key: createdFile,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.name).toBeDefined();
      expect(result.content).toBeDefined();
    });

    it('Should get the object', async () => {
      const action = GetAmazonS3Object;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          bucket_name: bucket,
          region: 'eu-north-1',
          object_key: createdFile,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.object_key).toBe(createdFile);
    });

    it('Should list files', async () => {
      const action = ListAmazonS3Files;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          bucket_name: bucket,
          region: 'eu-north-1',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.files).toBeDefined();
      expect(Array.isArray(result.files)).toBe(true);
    });

    it('Should list objects', async () => {
      const action = ListAmazonS3Objects;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          bucket_name: bucket,
          region: 'eu-north-1',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.objects).toBeDefined();
      expect(Array.isArray(result.objects)).toBe(true);
    });

    it('Should delete the created object', async () => {
      const action = DeleteAmazonS3Object;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          region: 'eu-north-1',
          bucket_name: bucket,
          object_key: object,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('Should delete the created file', async () => {
      const action = DeleteAmazonS3Object;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          bucket_name: bucket,
          region: 'eu-north-1',
          object_key: createdFile,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });

  describe('Should test triggers event example data', () => {
    it('Should get example event data for new file trigger', async () => {
      const trigger = NewOrUpdatedAmazonS3File;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      const result = await trigger.get_example_event_data({
        ...base_context,
        opts: { region: 'eu-north-1', bucket_name: bucket } as any,
      });

      expect(result).toBeDefined();
      expect(result.bucket_name).toBe(bucket);
    });

    it('Should get example event data for new bucket trigger', async () => {
      const trigger = NewAmazonS3Bucket;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      const result = await trigger.get_example_event_data({
        ...base_context,
        opts: { region: 'eu-north-1', bucket_name: bucket } as any,
      });

      expect(result).toBeDefined();
      expect(result.bucket_name).toBe(bucket);
    });
  });
});
