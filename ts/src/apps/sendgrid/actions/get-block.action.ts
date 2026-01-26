import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SENDGRID_APP_NAME, SendGridError } from '../constants';
import { createSendGridClient } from '../helpers/constants';
import { getSendGridBlockAllowedValues } from '../helpers/get-block-allowed-values';
import { SendGridBlockResponseType } from '../response-types/block';

const action = 'get_block';

const options = {
  email: {
    type: 'string',
    required: true,
    get_allowed_values: getSendGridBlockAllowedValues,
  },
} satisfies TQoreOptions;

const responseType = SendGridBlockResponseType;

interface ISendGridBlock {
  email: string;
  reason: string;
  created: number;
}

const getSendGridBlock = QoreAppCreator.createLocalizedAction<typeof options>({
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

    try {
      const [response] = await client.request({
        url: `/v3/suppression/blocks/${encodeURIComponent(email)}`,
        method: 'GET',
      });

      const blocks = response.body as ISendGridBlock[];
      if (Array.isArray(blocks) && blocks.length > 0) {
        return blocks[0];
      }

      return response.body as ISendGridBlock;
    } catch (error) {
      throw new SendGridError(
        `Failed to ${humanizeNameTitle(action)}: ${error.message || error}`
      );
    }
  },
});

export default getSendGridBlock;
