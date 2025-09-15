import { configDotenv } from 'dotenv';
import { getAmazonSESSendStatistics } from '../apps/amazon-ses/actions';
import { getAmazonSESVerifiedEmailAllowedValues } from '../apps/amazon-ses/helpers/get-verified-email-allowed-values';
import { NewAmazonSESVerifiedIdentityTrigger } from '../apps/amazon-ses/triggers';
import { Debugger, DebugLevels } from '../utils/Debugger';

configDotenv({ path: '.env' });
Debugger.level = DebugLevels.Verbose;

describe('Amazon SES', () => {
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

  const testRegion = 'us-east-1';

  describe('Should test allowed values', () => {
    it('Should get verified email allowed values', async () => {
      const allowed_values = await getAmazonSESVerifiedEmailAllowedValues({
        ...base_context,
        opts: {
          region: testRegion,
        },
      });

      expect(allowed_values).toBeDefined();
      expect(Array.isArray(allowed_values)).toBe(true);
      expect(allowed_values[0].value).toBeDefined();
      expect(typeof allowed_values[0].value).toBe('string');
      expect(allowed_values[0].display_name).toBeDefined();
    });
  });

  describe('Should test actions', () => {
    // it('Should verify an email address', async () => {
    //   const action = verifyAmazonSESEmailAddress;

    //   if (!('api_function' in action)) throw new Error('api_function not found in action');

    //   const result = await action.api_function(
    //     {
    //       region: testRegion,
    //       email_address: emailToVerify,
    //     },
    //     undefined,
    //     base_context
    //   );

    //   expect(result).toBeDefined();
    //   expect(result.email_address).toBe(emailToVerify);
    //   expect(result.verification_status).toBe('Pending');
    //   expect(result.success).toBe(true);
    //   expect(result.message).toContain('Verification email sent');
    //   expect(result.next_steps).toBeDefined();
    //   expect(Array.isArray(result.next_steps)).toBe(true);
    //   expect(result.identity_arn).toContain(emailToVerify);
    //   expect(result.verification_initiated_at).toBeDefined();
    // });

    // it('Should send a text email', async () => {
    //   const action = sendAmazonSESEmail;

    //   if (!('api_function' in action)) throw new Error('api_function not found in action');

    //   const result = await action.api_function(
    //     {
    //       region: testRegion,
    //       from_email: testFromEmail,
    //       to_emails: testToEmail,
    //       subject: 'Test Email from SES Integration Test',
    //       body_text: 'This is a test email sent from the Amazon SES integration unit test.',
    //       charset: 'UTF-8',
    //     },
    //     undefined,
    //     base_context
    //   );

    //   expect(result).toBeDefined();
    //   expect(result.message_id).toBeDefined();
    //   expect(result.from_email).toBe(testFromEmail);
    //   expect(result.to_emails).toContain(testToEmail);
    //   expect(result.subject).toBe('Test Email from SES Integration Test');
    //   expect(result.body_text).toContain('test email sent from');
    //   expect(result.success).toBe(true);
    //   expect(result.sent_at).toBeDefined();
    // });

    it('Should get send statistics', async () => {
      const action = getAmazonSESSendStatistics;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          region: testRegion,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.region).toBe(testRegion);
      expect(result.data_points_count).toBeDefined();
      expect(typeof result.data_points_count).toBe('number');
      expect(result.send_data_points).toBeDefined();
      expect(Array.isArray(result.send_data_points)).toBe(true);
      expect(result.summary).toBeDefined();
      expect(result.summary.total_delivery_attempts).toBeDefined();
      expect(result.summary.total_bounces).toBeDefined();
      expect(result.summary.total_complaints).toBeDefined();
      expect(result.summary.total_rejects).toBeDefined();
      expect(result.summary.overall_bounce_rate).toContain('%');
      expect(result.summary.overall_complaint_rate).toContain('%');
      expect(result.summary.overall_reject_rate).toContain('%');
      expect(result.retrieved_at).toBeDefined();
      expect(result.success).toBe(true);
    });
  });

  describe('Should test triggers event example data', () => {
    it('Should get example event data for new verified identity trigger', async () => {
      const trigger = NewAmazonSESVerifiedIdentityTrigger;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      const result = await trigger.get_example_event_data({
        ...base_context,
        opts: { region: testRegion } as any,
      });

      if (result) {
        expect(result.email_address).toBeDefined();
        expect(result.identity_type).toBe('EmailAddress');
        expect(result.verification_status).toBe('Success');
        expect(result.verified_at).toBeDefined();
        expect(result.region).toBe(testRegion);
        expect(result.identity_arn).toContain('identity');
      }
    });
  });
});
