import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SENDGRID_APP_NAME, SendGridError } from '../constants';
import { createSendGridClient } from '../helpers/constants';
import { getSendGridBlockAllowedValues } from '../helpers/get-block-allowed-values';

const action = 'delete_blocks';

const options = {
  deleteAll: {
    type: 'bool',
    required: false,
    default_value: false,
  },
  emails: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    required: false,
    get_allowed_values: getSendGridBlockAllowedValues,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'hash',
  fields: {
    success: { type: 'bool' },
    deletedEmails: {
      type: {
        type: 'list',
        element_type: 'string',
      },
    },
    deleteAll: { type: 'bool' },
  },
} satisfies TQoreResponseType;

const deleteSendGridBlocks = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SENDGRID_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: SendGridError,
    });

    const client = createSendGridClient(token);

    const { deleteAll, emails } = obj || {};

    if (!deleteAll && (!emails || emails.length === 0)) {
      throw new SendGridError(
        'Either deleteAll must be true or at least one email must be provided'
      );
    }

    try {
      const requestBody: { delete_all?: boolean; emails?: string[] } = {};

      if (deleteAll) {
        requestBody.delete_all = true;
      } else if (emails && emails.length > 0) {
        requestBody.delete_all = false;
        requestBody.emails = emails;
      }

      await client.request({
        url: '/v3/suppression/blocks',
        method: 'DELETE',
        body: requestBody,
      });

      return {
        success: true,
        deletedEmails: deleteAll ? [] : emails || [],
        deleteAll: deleteAll || false,
      };
    } catch (error: any) {
      throw new SendGridError(
        `Failed to ${humanizeNameTitle(action)}: ${error.message || error}`
      );
    }
  },
});

export default deleteSendGridBlocks;
