import { VerifyEmailIdentityCommand } from '@aws-sdk/client-ses';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import {
  getAmazonDefaultRegion,
  getAWSRegionAllowedValues,
} from '../../../global/helpers/get-amazon-region-allowed-values';
import { AMAZON_SES_APP_NAME, AmazonSESError } from '../constants';
import { createSESClient, isValidEmail } from '../helpers/constants';

const options = {
  region: {
    required: false,
    preselected: true,
    type: 'string',
    allowed_values_creatable: true,
    get_default_value: getAmazonDefaultRegion,
    get_allowed_values: getAWSRegionAllowedValues,
  },
  email_address: {
    required: true,
    type: 'string',
  },
} satisfies TQoreOptions;

const verifyEmailAddress = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AMAZON_SES_APP_NAME,
  action: 'verify_email_address',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { access_key_id, secret_access_key, email_address } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['access_key_id', 'secret_access_key'],
      optionFields: ['email_address'],
      ErrorClass: AmazonSESError,
    });

    const region = obj?.region || context?.conn_opts?.region;

    if (!isValidEmail(email_address)) {
      throw new AmazonSESError('Invalid email address format');
    }

    try {
      const sesClient = createSESClient({
        access_key_id,
        secret_access_key,
        region: region || 'us-east-1',
      });

      const command = new VerifyEmailIdentityCommand({
        EmailAddress: email_address,
      });

      await sesClient.send(command);

      return {
        email_address,
        verification_status: 'Pending',
        verification_initiated_at: new Date().toISOString(),
        region: region || 'us-east-1',
        success: true,
        message:
          `Verification email sent to ${email_address}.\n` +
          `Please check your inbox and click the verification link.`,
        next_steps: [
          'Check your email inbox for a verification message from Amazon SES',
          'Click the verification link in the email to complete the verification process',
          'Once verified, you can use this email address as a source for sending emails',
        ],
      };
    } catch (error) {
      throw new AmazonSESError(`Failed to verify email address: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      email_address: { type: 'string' },
      verification_status: { type: 'string' },
      verification_initiated_at: { type: 'string' },
      region: { type: 'string' },
      success: { type: 'bool' },
      message: { type: 'string' },
      next_steps: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
    },
  },
});

export default verifyEmailAddress;
