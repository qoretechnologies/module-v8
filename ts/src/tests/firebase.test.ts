import { configDotenv } from 'dotenv';
import { GetFirebaseUser, ListFirebaseUsers } from '../apps/firebase/actions';
import { getFirebaseBucketAllowedValues } from '../apps/firebase/helpers/get-bucket-allowed-values';
import { getFirebaseUserAllowedValues } from '../apps/firebase/helpers/get-user-allowed-values';
import { Debugger, DebugLevels } from '../utils/Debugger';

configDotenv({ path: '.env' });
Debugger.level = DebugLevels.Verbose;

describe('Firebase', () => {
  const base_context = {
    conn_opts: {
      token: '',
    } as any,
  };

  beforeAll(async () => {
    const refreshToken = process.env.FIREBASE_REFRESH_TOKEN;
    const clientId = process.env.FIREBASE_CLIENT_ID;
    const clientSecret = process.env.FIREBASE_CLIENT_SECRET;

    if (!refreshToken || !clientId || !clientSecret) {
      throw new Error(`
        Please set the FIREBASE_REFRESH_TOKEN, FIREBASE_CLIENT_ID, 
        and FIREBASE_CLIENT_SECRET environment variables.
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

  const projectId = 'qorus-testing';
  let testUserId: string | undefined;
  // let testBucket: string | undefined;
  // let testFilePath: string | undefined;

  describe('Should test allowed values', () => {
    it('Should get user allowed values', async () => {
      const allowed_values = await getFirebaseUserAllowedValues({
        ...base_context,
        opts: { project_id: projectId } as any,
      });

      expect(allowed_values).toBeDefined();
      expect(Array.isArray(allowed_values)).toBeTruthy();

      if (allowed_values.length > 0) {
        expect(allowed_values[0].value).toBeDefined();
        testUserId = allowed_values[0].value;
      }
    });

    it('Should get bucket allowed values', async () => {
      const allowed_values = await getFirebaseBucketAllowedValues({
        ...base_context,
        opts: { project_id: projectId } as any,
      });

      expect(allowed_values).toBeDefined();
      expect(Array.isArray(allowed_values)).toBeTruthy();

      if (allowed_values.length > 0) {
        expect(allowed_values[0].value).toBeDefined();
        // testBucket = allowed_values[0].value;
      }
    });
  });

  describe('Should test actions', () => {
    it('Should list users', async () => {
      const action = ListFirebaseUsers;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          project_id: projectId,
          max_results: 10,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.users).toBeDefined();
      expect(Array.isArray(result.users)).toBeTruthy();
      expect(result.user_count).toBeDefined();
      expect(typeof result.user_count).toBe('number');

      if (result.users.length > 0) {
        testUserId = result.users[0].localId;
      }
    });

    it('Should get user', async () => {
      if (!testUserId) {
        console.log('Skipping get user test - no user ID available');
        return;
      }

      const action = GetFirebaseUser;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          project_id: projectId,
          user_id: testUserId,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.user_id).toBe(testUserId);
      expect(result.email).toBeDefined();
    });

    // it('Should send push notification to device token', async () => {
    //   const action = SendFirebasePushNotification;

    //   if (!('api_function' in action)) throw new Error('api_function not found in action');

    //   // Using a test device token - will likely fail but tests the action structure
    //   const testDeviceToken = 'test_device_token_for_testing';

    //   try {
    //     const result = await action.api_function(
    //       {
    //         project_id: projectId,
    //         token_or_topic: testDeviceToken,
    //         title: 'Test Notification',
    //         body: 'This is a test notification from automated tests',
    //         priority: 'high',
    //       },
    //       undefined,
    //       base_context
    //     );

    //     expect(result).toBeDefined();
    //     expect(result.message_id).toBeDefined();
    //     expect(result.target).toBe(testDeviceToken);
    //     expect(result.target_type).toBe('token');
    //   } catch (error) {
    //     console.log('Push notification test failed as expected with test token');
    //   }
    // });

    // it('Should list buckets', async () => {
    //   const action = ListFirebaseBuckets;

    //   if (!('api_function' in action)) throw new Error('api_function not found in action');

    //   const result = await action.api_function(
    //     {
    //       project_id: projectId,
    //     },
    //     undefined,
    //     base_context
    //   );

    //   expect(result).toBeDefined();
    //   expect(result.buckets).toBeDefined();
    //   expect(Array.isArray(result.buckets)).toBeTruthy();
    //   expect(result.bucket_count).toBeDefined();
    //   expect(typeof result.bucket_count).toBe('number');

    //   if (result.buckets.length > 0) {
    //     testBucket = result.buckets[0].name;
    //   }
    // });

    // it('Should upload file', async () => {
    //   if (!testBucket) {
    //     console.log('Skipping upload file test - no bucket available');
    //     return;
    //   }

    //   const action = UploadFirebaseFile;

    //   if (!('api_function' in action)) throw new Error('api_function not found in action');

    //   testFilePath = `test-files/test-${Date.now()}.txt`;
    //   const testContent = Buffer.from('This is a test file content').toString('base64');

    //   const result = await action.api_function(
    //     {
    //       project_id: projectId,
    //       bucket: testBucket,
    //       file: {
    //         name: 'test.txt',
    //         content: testContent,
    //         mime_type: 'text/plain',
    //       },
    //       metadata: {
    //         test: 'true',
    //         uploaded_by: 'automated_test',
    //       },
    //     },
    //     undefined,
    //     base_context
    //   );

    //   expect(result).toBeDefined();
    //   expect(result.file_path).toBe(testFilePath);
    //   expect(result.bucket).toBe(testBucket);
    //   expect(result.content_type).toBe('text/plain');
    //   expect(result.size).toBeGreaterThan(0);
    //   expect(result.md5_hash).toBeDefined();
    // });

    // it('Should get file metadata', async () => {
    //   if (!testBucket || !testFilePath) {
    //     console.log('Skipping get file metadata test - no file available');
    //     return;
    //   }

    //   const action = GetFirebaseFileMetadata;

    //   if (!('api_function' in action)) throw new Error('api_function not found in action');

    //   const result = await action.api_function(
    //     {
    //       project_id: projectId,
    //       bucket: testBucket,
    //       file_path: testFilePath,
    //     },
    //     undefined,
    //     base_context
    //   );

    //   expect(result).toBeDefined();
    //   expect(result.file_path).toBe(testFilePath);
    //   expect(result.bucket).toBe(testBucket);
    //   expect(result.content_type).toBe('text/plain');
    //   expect(result.size).toBeGreaterThan(0);
    //   expect(result.created_at).toBeDefined();
    //   expect(result.updated_at).toBeDefined();
    // });

    // it('Should list files in bucket', async () => {
    //   if (!testBucket) {
    //     console.log('Skipping list files test - no bucket available');
    //     return;
    //   }

    //   const action = ListFirebaseFilesInBucket;

    //   if (!('api_function' in action)) throw new Error('api_function not found in action');

    //   const result = await action.api_function(
    //     {
    //       project_id: projectId,
    //       bucket: testBucket,
    //       prefix: 'test-files/',
    //       max_results: 10,
    //     },
    //     undefined,
    //     base_context
    //   );

    //   expect(result).toBeDefined();
    //   expect(result.bucket).toBe(testBucket);
    //   expect(result.files).toBeDefined();
    //   expect(Array.isArray(result.files)).toBeTruthy();
    //   expect(result.file_count).toBeDefined();
    //   expect(typeof result.file_count).toBe('number');
    // });

    // it('Should delete file', async () => {
    //   if (!testBucket || !testFilePath) {
    //     console.log('Skipping delete file test - no file available');
    //     return;
    //   }

    //   const action = DeleteFirebaseFile;

    //   if (!('api_function' in action)) throw new Error('api_function not found in action');

    //   const result = await action.api_function(
    //     {
    //       project_id: projectId,
    //       bucket: testBucket,
    //       file_path: testFilePath,
    //     },
    //     undefined,
    //     base_context
    //   );

    //   expect(result).toBeDefined();
    //   expect(result.deleted).toBe(true);
    //   expect(result.file_path).toBe(testFilePath);
    //   expect(result.bucket).toBe(testBucket);
    //   expect(result.message).toBeDefined();
    // });
  });
});
