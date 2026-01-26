import { configDotenv } from 'dotenv';
import {
  GetTwilioCall,
  GetTwilioExecution,
  GetTwilioMessage,
  GetTwilioRecording,
  GetTwilioTranscription,
  ListTwilioCalls,
  ListTwilioExecutions,
  ListTwilioMessageMedia,
  ListTwilioMessages,
  ListTwilioRecordings,
  ListTwilioTranscriptions,
} from '../apps/twilio/actions';
import { getTwilioCallAllowedValues } from '../apps/twilio/helpers/get-call-allowed-values';
import { getTwilioExecutionAllowedValues } from '../apps/twilio/helpers/get-execution-allowed-values';
import { getTwilioFlowAllowedValues } from '../apps/twilio/helpers/get-flow-allowed-values';
import { getTwilioMessageAllowedValues } from '../apps/twilio/helpers/get-message-allowed-values';
import { getTwilioMessagingServiceAllowedValues } from '../apps/twilio/helpers/get-messaging-service-allowed-values';
import { getTwilioPhoneNumberAllowedValues } from '../apps/twilio/helpers/get-phone-number-allowed-values';
import { getTwilioRecordingAllowedValues } from '../apps/twilio/helpers/get-recording-allowed-values';
import { getTwilioTranscriptionAllowedValues } from '../apps/twilio/helpers/get-transcription-allowed-values';
import {
  NewTwilioMessage,
  NewTwilioRecording,
  NewTwilioTranscription,
} from '../apps/twilio/triggers';
import { Debugger, DebugLevels } from '../utils/Debugger';
import { checkAllowedValues } from './utils';

configDotenv({ path: '.env' });

describe('Should test Twilio app', () => {
  Debugger.level = DebugLevels.Verbose;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  const baseContext: Record<string, any> = {
    conn_opts: {
      username: accountSid,
      password: authToken,
    },
  };

  const allowedValuesCheckConfig = {
    checkNonEmpty: true,
  };

  beforeAll(() => {
    if (!accountSid || !authToken) {
      throw new Error(
        'TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set in .env file to run tests'
      );
    }
  });

  describe('Should test Twilio allowed values', () => {
    let flowSid: string;
    let recordingSid: string;

    it('Should get message allowed values', async () => {
      const allowedValues = await getTwilioMessageAllowedValues(baseContext);

      checkAllowedValues(allowedValues, allowedValuesCheckConfig);
    });

    it('Should get messaging service allowed values', async () => {
      const allowedValues = await getTwilioMessagingServiceAllowedValues(baseContext);

      checkAllowedValues(allowedValues, allowedValuesCheckConfig);
    });

    it('Should get phone number allowed values', async () => {
      const allowedValues = await getTwilioPhoneNumberAllowedValues(baseContext);

      checkAllowedValues(allowedValues, allowedValuesCheckConfig);
    });

    it('Should get call allowed values', async () => {
      const allowedValues = await getTwilioCallAllowedValues(baseContext);

      checkAllowedValues(allowedValues, allowedValuesCheckConfig);
    });

    it('Should get flow allowed values', async () => {
      const allowedValues = await getTwilioFlowAllowedValues(baseContext);

      checkAllowedValues(allowedValues, allowedValuesCheckConfig);

      flowSid = allowedValues[0]?.value;
    });

    it('Should get execution allowed values', async () => {
      const allowedValues = await getTwilioExecutionAllowedValues({
        ...baseContext,
        opts: { flowSid },
      });

      checkAllowedValues(allowedValues, allowedValuesCheckConfig);
    });

    it('Should get recording allowed values', async () => {
      const allowedValues = await getTwilioRecordingAllowedValues(baseContext);

      checkAllowedValues(allowedValues, allowedValuesCheckConfig);

      recordingSid = allowedValues[0]?.value;
    });

    it('Should get transcription allowed values', async () => {
      if (!recordingSid) {
        console.log('Skipping: No recording SID available for transcription test');
        return;
      }

      const allowedValues = await getTwilioTranscriptionAllowedValues({
        ...baseContext,
        opts: { recordingSid },
      });

      checkAllowedValues(allowedValues, {
        checkNonEmpty: false,
      });
    });
  });

  describe('Should test Twilio actions (read-only, no credits required)', () => {
    let messageSid: string;
    let callSid: string;
    let flowSid: string;
    let executionSid: string;
    let recordingSid: string;
    let transcriptionSid: string;

    it('Should list messages', async () => {
      const action = ListTwilioMessages;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('Action does not have an api_function');

      const result = await action.api_function(
        {
          limit: 10,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      if (result.length > 0) {
        expect(result[0]).toHaveProperty('sid');
        expect(result[0]).toHaveProperty('status');
        expect(result[0]).toHaveProperty('to');
        expect(result[0]).toHaveProperty('from');
        messageSid = result[0].sid;
      }
    });

    it('Should get a specific message (if exists)', async () => {
      if (!messageSid) {
        console.log('Skipping: No message SID available');
        return;
      }

      const action = GetTwilioMessage;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('Action does not have an api_function');

      const result = await action.api_function(
        {
          messageSid,
        },
        undefined,
        baseContext
      );

      console.log('Get Message Result:', result?.sid);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('sid');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('to');
      expect(result).toHaveProperty('from');
      expect(result).toHaveProperty('body');
      expect(result.sid).toBe(messageSid);
    });

    it('Should list message media (if exists)', async () => {
      if (!messageSid) {
        console.log('Skipping: No message SID available');
        return;
      }

      const action = ListTwilioMessageMedia;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('Action does not have an api_function');

      const result = await action.api_function(
        {
          messageSid,
          limit: 10,
        },
        undefined,
        baseContext
      );

      console.log('List Message Media Result:', result?.length, 'media items');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('Should list calls', async () => {
      const action = ListTwilioCalls;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('Action does not have an api_function');

      const result = await action.api_function(
        {
          limit: 10,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      if (result.length > 0) {
        expect(result[0]).toHaveProperty('sid');
        expect(result[0]).toHaveProperty('status');
        callSid = result[0].sid;
      }
    });

    it('Should get a specific call (if exists)', async () => {
      if (!callSid) {
        console.log('Skipping: No call SID available');
        return;
      }

      const action = GetTwilioCall;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('Action does not have an api_function');

      const result = await action.api_function(
        {
          callSid,
        },
        undefined,
        baseContext
      );

      console.log('Get Call Result:', result?.sid);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('sid');
      expect(result).toHaveProperty('status');
      expect(result.sid).toBe(callSid);
    });

    it('Should list recordings', async () => {
      const action = ListTwilioRecordings;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('Action does not have an api_function');

      const result = await action.api_function(
        {
          limit: 10,
        },
        undefined,
        baseContext
      );

      console.log('List Recordings Result:', result?.length, 'recordings');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      if (result.length > 0) {
        expect(result[0]).toHaveProperty('sid');
        expect(result[0]).toHaveProperty('status');
        recordingSid = result[0].sid;
      }
    });

    it('Should get a specific recording (if exists)', async () => {
      if (!recordingSid) {
        console.log('Skipping: No recording SID available');
        return;
      }

      const action = GetTwilioRecording;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('Action does not have an api_function');

      const result = await action.api_function(
        {
          recordingSid,
        },
        undefined,
        baseContext
      );

      console.log('Get Recording Result:', result?.sid);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('sid');
      expect(result).toHaveProperty('status');
      expect(result.sid).toBe(recordingSid);
    });

    it('Should list transcriptions (if recording exists)', async () => {
      if (!recordingSid) {
        console.log('Skipping: No recording SID available');
        return;
      }

      const action = ListTwilioTranscriptions;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('Action does not have an api_function');

      const result = await action.api_function(
        {
          recordingSid,
          limit: 10,
        },
        undefined,
        baseContext
      );

      console.log('List Transcriptions Result:', result?.length, 'transcriptions');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      if (result.length > 0) {
        expect(result[0]).toHaveProperty('sid');
        expect(result[0]).toHaveProperty('status');
        transcriptionSid = result[0].sid;
      }
    });

    it('Should get a specific transcription (if exists)', async () => {
      if (!recordingSid || !transcriptionSid) {
        console.log('Skipping: No recording or transcription SID available');
        return;
      }

      const action = GetTwilioTranscription;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('Action does not have an api_function');

      const result = await action.api_function(
        {
          recordingSid,
          transcriptionSid,
        },
        undefined,
        baseContext
      );

      console.log('Get Transcription Result:', result?.sid);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('sid');
      expect(result).toHaveProperty('status');
      expect(result.sid).toBe(transcriptionSid);
    });

    it('Should list executions (if flow exists)', async () => {
      const flowValues = await getTwilioFlowAllowedValues(baseContext);
      if (!flowValues || flowValues.length === 0) {
        console.log('Skipping: No flows available');
        return;
      }

      flowSid = flowValues[0]?.value;

      const action = ListTwilioExecutions;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('Action does not have an api_function');

      const result = await action.api_function(
        {
          flowSid,
          limit: 10,
        },
        undefined,
        baseContext
      );

      console.log('List Executions Result:', result?.length, 'executions');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      if (result.length > 0) {
        expect(result[0]).toHaveProperty('sid');
        expect(result[0]).toHaveProperty('status');
        executionSid = result[0].sid;
      }
    });

    it('Should get a specific execution (if exists)', async () => {
      if (!flowSid || !executionSid) {
        console.log('Skipping: No flow or execution SID available');
        return;
      }

      const action = GetTwilioExecution;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('Action does not have an api_function');

      const result = await action.api_function(
        {
          flowSid,
          executionSid,
        },
        undefined,
        baseContext
      );

      console.log('Get Execution Result:', result?.sid);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('sid');
      expect(result).toHaveProperty('status');
      expect(result.sid).toBe(executionSid);
    });
  });

  describe('Should test Twilio triggers event example data', () => {
    it('Should get example event data for new message trigger', async () => {
      const trigger = NewTwilioMessage;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      const result = await trigger.get_example_event_data({
        ...baseContext,
      });

      console.log('New Message Trigger Example Data:', result?.sid);

      expect(result).toBeDefined();
      if (result) {
        expect(result).toHaveProperty('sid');
        expect(result).toHaveProperty('status');
        expect(result).toHaveProperty('to');
        expect(result).toHaveProperty('from');
        expect(result).toHaveProperty('body');
      }
    });

    it('Should get example event data for new recording trigger', async () => {
      const trigger = NewTwilioRecording;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      const result = await trigger.get_example_event_data({
        ...baseContext,
      });

      console.log('New Recording Trigger Example Data:', result?.sid);

      expect(result).toBeDefined();
      if (result) {
        expect(result).toHaveProperty('sid');
        expect(result).toHaveProperty('status');
        expect(result).toHaveProperty('callSid');
      }
    });

    it('Should get example event data for new transcription trigger', async () => {
      const trigger = NewTwilioTranscription;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      const result = await trigger.get_example_event_data({
        ...baseContext,
      });

      console.log('New Transcription Trigger Example Data:', result?.sid);

      expect(result).toBeDefined();
      if (result) {
        expect(result).toHaveProperty('sid');
        expect(result).toHaveProperty('status');
        expect(result).toHaveProperty('recordingSid');
      }
    });
  });
});
