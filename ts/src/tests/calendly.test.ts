import { configDotenv } from 'dotenv';
import {
  GetCalendlyEvent,
  GetCalendlyEventInvitee,
  GetCalendlyEventType,
  ListCalendlyEventInvitees,
  ListCalendlyEvents,
  ListCalendlyEventTypes,
  ListCalendlyGroups,
} from '../apps/calendly/actions';
import { getCalendlyEventIdAllowedValues } from '../apps/calendly/helpers/get-event-id-allowed-values';
import { getCalendlyEventInviteeIdAllowedValues } from '../apps/calendly/helpers/get-event-invitee-allowed-values';
import { getCalendlyEventTypeIdAllowedValues } from '../apps/calendly/helpers/get-event-type-allowed-values';
import {
  getCalendlyGroupAllowedValues,
  getCalendlyGroupIdAllowedValues,
} from '../apps/calendly/helpers/get-group-allowed-values';
import { getCalendlyOrganizationDefaultValue } from '../apps/calendly/helpers/get-organization-default-value';
import { getCalendlyOrganizationMemberAllowedValues } from '../apps/calendly/helpers/get-user-organization-member-allowed-values';
import {
  CanceledCalendlyEvent,
  CanceledCalendlyInvitee,
  NewCalendlyInviteeCreated,
  NewCalendlyInviteeNoShowCreated,
} from '../apps/calendly/triggers';
import CalendlyNewFormSubmissionCreated from '../apps/calendly/triggers/routing-form-submission-created.trigger';
import { Debugger, DebugLevels } from '../utils/Debugger';

Debugger.level = DebugLevels.Verbose;

configDotenv({ path: '.env' });

describe('Calendly', () => {
  const base_context = {
    conn_opts: {
      token: '',
    } as any,
  };

  beforeAll(() => {
    const token = process.env.CALENDLY_TOKEN;

    if (!token) {
      throw new Error(`
        Please set the CALENDLY_TOKEN environment variable.
      `);
    }

    base_context.conn_opts.token = token;
  });

  let organization: string | undefined;
  let event: string | undefined;
  // let group: string | undefined;
  let event_invitee: string | undefined;
  let event_type: string | undefined;

  describe('Should test calendly allowed values', () => {
    it('Should get group allowed values', async () => {
      const allowed_values = await getCalendlyGroupAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();
    });

    it('Should get group id allowed values', async () => {
      const allowed_values = await getCalendlyGroupIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();

      // group = allowed_values[0].value;
    });

    it('Should get organization member allowed values', async () => {
      const allowed_values = await getCalendlyOrganizationMemberAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();
    });

    it('Should get event id allowed values', async () => {
      const allowed_values = await getCalendlyEventIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();

      event = allowed_values[0].value;
    });

    it('Should get user organization default value', async () => {
      const value = await getCalendlyOrganizationDefaultValue(base_context);

      expect(value).toBeDefined();

      organization = value;
    });

    it('Should get event invitee allowed values', async () => {
      const allowed_values = await getCalendlyEventInviteeIdAllowedValues({
        ...base_context,
        opts: {
          event_id: event,
        },
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();

      event_invitee = allowed_values[0].value;
    });

    it('Should get event type allowed values', async () => {
      const allowed_values = await getCalendlyEventTypeIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();

      event_type = allowed_values[0].value;
    });
  });

  describe('Should test calendly actions', () => {
    it('Should list events', async () => {
      const action = ListCalendlyEvents;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({}, undefined, base_context);

      expect(result).toBeDefined();
      expect(result.collection).toBeDefined();
      expect(result.collection.length).toBeGreaterThan(0);
    });

    it('Should list event invitees', async () => {
      const action = ListCalendlyEventInvitees;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          event_id: event,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.collection).toBeDefined();
      expect(result.collection.length).toBeGreaterThan(0);
    });

    it('Should list groups', async () => {
      const action = ListCalendlyGroups;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          organization,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.collection).toBeDefined();
      expect(result.collection.length).toBeGreaterThan(0);
    });

    it('Should get event', async () => {
      const action = GetCalendlyEvent;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          event_id: event,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.uri).toBeDefined();
    });

    // Plan has to be upgraded to standard
    // it('Should get group', async () => {
    //   const action = GetCalendlyGroup;

    //   if (!('api_function' in action)) throw new Error('api_function not found in action');

    //   const result = await action.api_function(
    //     {
    //       group_id: group,
    //     },
    //     undefined,
    //     base_context
    //   );

    //   expect(result).toBeDefined();
    //   expect(result.uri).toBeDefined();
    // });

    it('Should get event invitee', async () => {
      const action = GetCalendlyEventInvitee;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          event_id: event,
          invitee: event_invitee,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.uri).toBeDefined();
    });

    it('Should list event types', async () => {
      const action = ListCalendlyEventTypes;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          organization,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.collection).toBeDefined();
      expect(result.collection.length).toBeGreaterThan(0);
    });

    it('Should get event type', async () => {
      const action = GetCalendlyEventType;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          event_type_id: event_type,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.uri).toBeDefined();
    });
  });

  describe('Should test Calendly triggers event example data', () => {
    it('Should get example event data for new canceled event trigger', async () => {
      const trigger = CanceledCalendlyEvent;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      const result = await trigger.get_example_event_data(base_context);
      expect(result).toBeDefined();
      expect(result.uri).toBeDefined();
    });

    it('Should get example event data for new invitee created trigger', async () => {
      const trigger = NewCalendlyInviteeCreated;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      const result = await trigger.get_example_event_data(base_context);

      expect(result).toBeDefined();
      expect(result.payload).toBeDefined();
    });

    it('Should get example event data for new invitee canceled trigger', async () => {
      const trigger = CanceledCalendlyInvitee;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      const result = await trigger.get_example_event_data(base_context);
      expect(result).toBeDefined();
      expect(result.payload).toBeDefined();
    });

    it('Should get example event data for new invitee no show created trigger', async () => {
      const trigger = NewCalendlyInviteeNoShowCreated;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      const result = await trigger.get_example_event_data(base_context);
      expect(result).toBeDefined();
      expect(result.payload).toBeDefined();
    });

    it('Should get example event data for new routing form submission trigger', async () => {
      const trigger = CalendlyNewFormSubmissionCreated;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      const result = await trigger.get_example_event_data(base_context);
      expect(result).toBeDefined();
      expect(result.payload).toBeDefined();
    });
  });

  // Should upgrade plan to standard to test webhooks
  // describe('Should test Calendly triggers webhook registration', () => {
  //   describe('Should test new form submission webhook registration', () => {
  //     let webhook: { id: string; tag: string } | undefined;
  //     it('Should register the new form submission webhook', async () => {
  //       const trigger = CalendlyNewFormSubmissionCreated;

  //       if (!('webhook_register' in trigger) || !trigger.webhook_register)
  //         throw new Error('webhook_register not found in trigger');

  //       const result = await trigger.webhook_register(base_context, 'https://example.com/webhook');

  //       expect(result).toBeDefined();
  //       expect(result?.webhook.uri).toBeDefined();

  //       webhook = result?.webhook;
  //     });

  //     it('Should deregister the webhook', async () => {
  //       const trigger = CalendlyNewFormSubmissionCreated;

  //       if (!('webhook_deregister' in trigger) || !trigger.webhook_deregister)
  //         throw new Error('webhook_deregister not found in trigger');

  //       if (!webhook) throw new Error('webhook is not defined');

  //       await trigger.webhook_deregister(base_context, 'https://example.com/webhook', {
  //         webhook,
  //       });
  //     });
  //   });
  // });
});
