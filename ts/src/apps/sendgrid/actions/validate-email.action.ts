import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SENDGRID_APP_NAME, SendGridError } from '../constants';
import { createSendGridClient } from '../helpers/constants';

const action = 'validate_email';

const options = {
  email: {
    type: 'string',
    required: true,
  },
  source: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'hash',
  fields: {
    email: { type: 'string' },
    verdict: { type: 'string' },
    score: { type: 'float' },
    local: { type: 'string' },
    host: { type: 'string' },
    suggestion: { type: 'string' },
    checks: {
      type: {
        type: 'hash',
        fields: {
          domain: {
            type: {
              type: 'hash',
              fields: {
                has_valid_address_syntax: { type: 'bool' },
                has_mx_or_a_record: { type: 'bool' },
                is_suspected_disposable_address: { type: 'bool' },
              },
            },
          },
          local_part: {
            type: {
              type: 'hash',
              fields: {
                is_suspected_role_address: { type: 'bool' },
              },
            },
          },
          additional: {
            type: {
              type: 'hash',
              fields: {
                has_known_bounces: { type: 'bool' },
                has_suspected_bounces: { type: 'bool' },
              },
            },
          },
        },
      },
    },
    ip_address: { type: 'string' },
  },
} satisfies TQoreResponseType;

interface ISendGridEmailValidation {
  result: {
    email: string;
    verdict: string;
    score: number;
    local: string;
    host: string;
    suggestion?: string;
    checks: {
      domain: {
        has_valid_address_syntax: boolean;
        has_mx_or_a_record: boolean;
        is_suspected_disposable_address: boolean;
      };
      local_part: {
        is_suspected_role_address: boolean;
      };
      additional: {
        has_known_bounces: boolean;
        has_suspected_bounces: boolean;
      };
    };
    ip_address?: string;
  };
}

const validateSendGridEmail = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SENDGRID_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token, email } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['email'],
      connectionFields: ['token'],
      ErrorClass: SendGridError,
    });

    const client = createSendGridClient(token);

    const { source } = obj || {};

    try {
      const requestBody: { email: string; source?: string } = { email };

      if (source) {
        requestBody.source = source;
      }

      const [response] = await client.request({
        url: '/v3/validations/email',
        method: 'POST',
        body: requestBody,
      });

      const data = response.body as ISendGridEmailValidation;
      return data.result;
    } catch (error) {
      throw new SendGridError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default validateSendGridEmail;
