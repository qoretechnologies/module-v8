import { configDotenv } from 'dotenv';
import {
  create_collector,
  create_contact,
  get_collector,
  get_response,
  get_survey,
  list_collectors,
  list_contacts,
  list_responses,
  list_surveys,
  send_survey,
  update_collector,
  delete_collector,
  get_response_counts,
  update_contact,
  delete_contact,
  list_contact_lists,
  add_contacts_to_list,
  get_survey_rollup,
  get_user_details,
  list_survey_folders,
} from '../apps/survey-monkey/actions';
import { getSurveyMonkeyCollectorAllowedValues } from '../apps/survey-monkey/helpers/get-collector-allowed-values';
import { getSurveyMonkeySurveyAllowedValues } from '../apps/survey-monkey/helpers/get-survey-allowed-values';
import {
  new_response,
  response_disqualified,
  response_updated,
  collector_updated,
} from '../apps/survey-monkey/triggers';
import { Debugger, DebugLevels } from '../utils/Debugger';
import { checkAllowedValues } from './utils';

configDotenv({ path: '.env' });

Debugger.level = DebugLevels.Verbose;

describe('SurveyMonkey Integration Tests', () => {
  const token = process.env.SURVEYMONKEY_TOKEN || '';

  const baseContext = {
    conn_opts: {
      token,
    } as any,
  };

  const sharedTestValues = {
    surveyId: '',
    collectorId: '',
    responseId: '',
    createdContactId: '',
    createdCollectorId: '',
  };

  beforeAll(async () => {
    if (!token) {
      throw new Error('SURVEYMONKEY_TOKEN is not set in environment variables');
    }
  });

  afterAll(async () => {
    // Cleanup created resources to avoid test pollution
    if (sharedTestValues.createdContactId) {
      try {
        if ('api_function' in delete_contact) {
          await delete_contact.api_function(
            { contact_id: sharedTestValues.createdContactId },
            undefined,
            baseContext
          );
          console.log(`Cleaned up contact: ${sharedTestValues.createdContactId}`);
        }
      } catch (error: any) {
        console.warn(`Failed to cleanup contact ${sharedTestValues.createdContactId}: ${error.message}`);
      }
    }

    if (sharedTestValues.createdCollectorId && sharedTestValues.surveyId) {
      try {
        if ('api_function' in delete_collector) {
          await delete_collector.api_function(
            {
              survey_id: sharedTestValues.surveyId,
              collector_id: sharedTestValues.createdCollectorId,
            },
            undefined,
            baseContext
          );
          console.log(`Cleaned up collector: ${sharedTestValues.createdCollectorId}`);
        }
      } catch (error: any) {
        console.warn(`Failed to cleanup collector ${sharedTestValues.createdCollectorId}: ${error.message}`);
      }
    }
  });

  describe('Should test allowed values helpers', () => {
    const allowedValuesConfig = {
      logSingleValue: true,
      logAllValues: false,
      checkNonEmpty: true,
    };

    it('Should get survey allowed values', async () => {
      const allowedValues = await getSurveyMonkeySurveyAllowedValues(baseContext);

      checkAllowedValues(allowedValues, allowedValuesConfig);

      if (allowedValues.length > 0) {
        sharedTestValues.surveyId = allowedValues[0].value;
      }
    });

    it('Should get collector allowed values', async () => {
      if (!sharedTestValues.surveyId) {
        console.log('No survey found, skipping collector allowed values test');
        return;
      }

      const contextWithOpts = {
        ...baseContext,
        opts: { survey_id: sharedTestValues.surveyId },
      };

      const allowedValues = await getSurveyMonkeyCollectorAllowedValues(contextWithOpts);

      checkAllowedValues(allowedValues, { ...allowedValuesConfig, checkNonEmpty: false });

      if (allowedValues.length > 0) {
        sharedTestValues.collectorId = allowedValues[0].value;
      }
    });
  });

  describe('Should test Survey actions', () => {
    it('Should list surveys', async () => {
      const action = list_surveys;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          limit: 10,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      if (result.length > 0 && !sharedTestValues.surveyId) {
        sharedTestValues.surveyId = result[0].id;
      }
    });

    it('Should get a survey', async () => {
      if (!sharedTestValues.surveyId) {
        console.log('No survey found, skipping get survey test');
        return;
      }

      const action = get_survey;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          survey_id: sharedTestValues.surveyId,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(sharedTestValues.surveyId);
      expect(result.title).toBeDefined();
    });
  });

  describe('Should test Contact actions', () => {
    it('Should list contacts', async () => {
      const action = list_contacts;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          limit: 10,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('Should create a contact', async () => {
      const action = create_contact;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const testEmail = `test-${Date.now()}@automation-test.example.com`;

      const result = await action.api_function(
        {
          first_name: 'Test',
          last_name: 'Contact',
          email: testEmail,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.email).toBe(testEmail);

      sharedTestValues.createdContactId = result.id;
    });
  });

  describe('Should test Collector actions', () => {
    it('Should list collectors', async () => {
      if (!sharedTestValues.surveyId) {
        console.log('No survey found, skipping list collectors test');
        return;
      }

      const action = list_collectors;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          survey_id: sharedTestValues.surveyId,
          limit: 10,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      if (result.length > 0 && !sharedTestValues.collectorId) {
        sharedTestValues.collectorId = result[0].id;
      }
    });

    it('Should create a collector', async () => {
      if (!sharedTestValues.surveyId) {
        console.log('No survey found, skipping create collector test');
        return;
      }

      const action = create_collector;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          survey_id: sharedTestValues.surveyId,
          name: `Test Collector ${Date.now()}`,
          type: 'weblink',
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBeDefined();
      expect(result.type).toBe('weblink');

      sharedTestValues.createdCollectorId = result.id;
    });

    it('Should get a collector', async () => {
      const collectorIdToGet = sharedTestValues.createdCollectorId || sharedTestValues.collectorId;

      if (!sharedTestValues.surveyId || !collectorIdToGet) {
        console.log('No survey or collector found, skipping get collector test');
        return;
      }

      const action = get_collector;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          survey_id: sharedTestValues.surveyId,
          collector_id: collectorIdToGet,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(collectorIdToGet);
    });
  });

  describe('Should test Response actions', () => {
    it('Should list responses', async () => {
      if (!sharedTestValues.surveyId) {
        console.log('No survey found, skipping list responses test');
        return;
      }

      const action = list_responses;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          survey_id: sharedTestValues.surveyId,
          limit: 10,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      if (result.length > 0) {
        sharedTestValues.responseId = result[0].id;
      }
    });

    it('Should get a response', async () => {
      if (!sharedTestValues.surveyId || !sharedTestValues.responseId) {
        console.log('No survey or response found, skipping get response test');
        return;
      }

      const action = get_response;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          survey_id: sharedTestValues.surveyId,
          response_id: sharedTestValues.responseId,
          include_answers: true,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(sharedTestValues.responseId);
    });
  });

  describe('Should test Send Survey action', () => {
    it('Should send survey action exists and has api_function', async () => {
      const action = send_survey;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      // We skip the actual send test as it requires a valid email collector setup
      // and would send actual emails. Just verify the action structure.
      expect(action.api_function).toBeDefined();
    });
  });

  describe('Should test webhook registration', () => {
    // SurveyMonkey API validates that the webhook URL is reachable
    // so we need a real webhook endpoint or use a webhook testing service
    const webhookUrl = process.env.SURVEYMONKEY_WEBHOOK_URL || 'https://example.com/webhook';
    let regInfo: { id: string } | undefined;

    it('Should register webhook for new_response trigger', async () => {
      if (!sharedTestValues.surveyId) {
        console.log('No survey found, skipping webhook registration test');
        return;
      }

      const trigger = new_response;

      if (!('webhook_register' in trigger) || !trigger.webhook_register)
        throw new Error('webhook_register not found in trigger');

      try {
        regInfo = (await trigger.webhook_register(
          { ...baseContext, opts: { survey_id: sharedTestValues.surveyId } },
          webhookUrl
        )) as { id: string };

        expect(regInfo).toBeDefined();
        expect(regInfo?.id).toBeDefined();
      } catch (error: any) {
        // SurveyMonkey validates URL reachability - skip if URL is not reachable
        if (error.message?.includes('Unable to connect to subscription url')) {
          console.log(
            'SurveyMonkey requires a reachable webhook URL. Set SURVEYMONKEY_WEBHOOK_URL to a real endpoint.'
          );
          return;
        }
        throw error;
      }
    });

    it('Should deregister webhook for new_response trigger', async () => {
      if (!regInfo) {
        console.log('No webhook registration info, skipping deregistration test');
        return;
      }

      const trigger = new_response;

      if (!('webhook_deregister' in trigger) || !trigger.webhook_deregister)
        throw new Error('webhook_deregister not found in trigger');

      await trigger.webhook_deregister(baseContext, webhookUrl, regInfo);
    });
  });

  describe('Should test trigger example event data', () => {
    it('Should get example event data for new_response trigger', async () => {
      if (!sharedTestValues.surveyId) {
        console.log('No survey found, skipping example event data test');
        return;
      }

      const trigger = new_response;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      const result = await trigger.get_example_event_data({
        ...baseContext,
        opts: { survey_id: sharedTestValues.surveyId },
      });

      // Result can be null if no responses exist
      if (result) {
        expect(result.event_type).toBe('response_completed');
        expect(result.object_type).toBe('survey');
        expect(result.object_id).toBe(sharedTestValues.surveyId);
        expect(result.resources).toBeDefined();
        expect(result.resources.survey_id).toBe(sharedTestValues.surveyId);
      }
    });
  });

  // New action tests
  describe('Should test new Survey Management actions', () => {
    it('Should get response counts', async () => {
      if (!sharedTestValues.surveyId) {
        console.log('No survey found, skipping get response counts test');
        return;
      }

      const action = get_response_counts;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          survey_id: sharedTestValues.surveyId,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.survey_id).toBe(sharedTestValues.surveyId);
      expect(typeof result.total_responses).toBe('number');
    });

    it('Should get survey rollup', async () => {
      if (!sharedTestValues.surveyId) {
        console.log('No survey found, skipping get survey rollup test');
        return;
      }

      const action = get_survey_rollup;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          survey_id: sharedTestValues.surveyId,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.survey_id).toBe(sharedTestValues.surveyId);
    });
  });

  describe('Should test Collector Management actions', () => {
    it('Should update a collector', async () => {
      const collectorIdToUpdate = sharedTestValues.createdCollectorId || sharedTestValues.collectorId;

      if (!sharedTestValues.surveyId || !collectorIdToUpdate) {
        console.log('No survey or collector found, skipping update collector test');
        return;
      }

      const action = update_collector;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          survey_id: sharedTestValues.surveyId,
          collector_id: collectorIdToUpdate,
          name: `Updated Collector ${Date.now()}`,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(collectorIdToUpdate);
    });
  });

  describe('Should test Contact Management actions', () => {
    it('Should update a contact', async () => {
      if (!sharedTestValues.createdContactId) {
        console.log('No created contact found, skipping update contact test');
        return;
      }

      const action = update_contact;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          contact_id: sharedTestValues.createdContactId,
          first_name: 'Updated',
          last_name: 'Contact',
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(sharedTestValues.createdContactId);
      expect(result.first_name).toBe('Updated');
    });
  });

  describe('Should test Contact List actions', () => {
    it('Should list contact lists', async () => {
      const action = list_contact_lists;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          limit: 10,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('Should have add_contacts_to_list action with api_function', async () => {
      const action = add_contacts_to_list;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      expect(action.api_function).toBeDefined();
    });
  });

  describe('Should test User and Organization actions', () => {
    it('Should get user details', async () => {
      const action = get_user_details;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({}, undefined, baseContext);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.email).toBeDefined();
    });

    it('Should list survey folders', async () => {
      const action = list_survey_folders;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          limit: 10,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Should test new triggers', () => {
    it('Should have response_disqualified trigger with required functions', async () => {
      const trigger = response_disqualified;

      expect('webhook_register' in trigger).toBe(true);
      expect('webhook_deregister' in trigger).toBe(true);
      expect('get_example_event_data' in trigger).toBe(true);
    });

    it('Should have response_updated trigger with required functions', async () => {
      const trigger = response_updated;

      expect('webhook_register' in trigger).toBe(true);
      expect('webhook_deregister' in trigger).toBe(true);
      expect('get_example_event_data' in trigger).toBe(true);
    });

    it('Should have collector_updated trigger with required functions', async () => {
      const trigger = collector_updated;

      expect('webhook_register' in trigger).toBe(true);
      expect('webhook_deregister' in trigger).toBe(true);
      expect('get_example_event_data' in trigger).toBe(true);
    });

    it('Should get example event data for response_updated trigger', async () => {
      if (!sharedTestValues.surveyId) {
        console.log('No survey found, skipping example event data test');
        return;
      }

      const trigger = response_updated;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      const result = await trigger.get_example_event_data({
        ...baseContext,
        opts: { survey_id: sharedTestValues.surveyId },
      });

      // Result can be null if no responses exist
      if (result) {
        expect(result.event_type).toBe('response_updated');
        expect(result.object_type).toBe('survey');
        expect(result.object_id).toBe(sharedTestValues.surveyId);
      }
    });

    it('Should get example event data for collector_updated trigger', async () => {
      if (!sharedTestValues.surveyId) {
        console.log('No survey found, skipping example event data test');
        return;
      }

      const trigger = collector_updated;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      const result = await trigger.get_example_event_data({
        ...baseContext,
        opts: { survey_id: sharedTestValues.surveyId },
      });

      // Result can be null if no collectors exist
      if (result) {
        expect(result.event_type).toBe('collector_updated');
        expect(result.object_type).toBe('survey');
        expect(result.object_id).toBe(sharedTestValues.surveyId);
      }
    });
  });
});
