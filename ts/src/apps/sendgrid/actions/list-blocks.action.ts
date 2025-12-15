import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SENDGRID_APP_NAME, SendGridError } from '../constants';
import { createSendGridClient } from '../helpers/constants';
import { SendGridBlockResponseType } from '../response-types/block';

const action = 'list_blocks';

const options = {
  startTime: {
    type: 'integer',
    required: false,
  },
  endTime: {
    type: 'integer',
    required: false,
  },
  limit: {
    type: 'integer',
    default_value: 500,
    required: false,
  },
  offset: {
    type: 'integer',
    default_value: 0,
    required: false,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'list',
  element_type: SendGridBlockResponseType,
} satisfies TQoreResponseType;

interface ISendGridBlock {
  email: string;
  reason: string;
  created: number;
}

const listSendGridBlocks = QoreAppCreator.createLocalizedAction<typeof options>({
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

    const { startTime, endTime, limit, offset } = obj || {};

    try {
      const queryParams: Record<string, number> = {};

      if (startTime !== undefined) {
        queryParams.start_time = startTime;
      }
      if (endTime !== undefined) {
        queryParams.end_time = endTime;
      }
      if (limit !== undefined) {
        queryParams.limit = limit;
      }
      if (offset !== undefined) {
        queryParams.offset = offset;
      }

      const [response] = await client.request({
        url: '/v3/suppression/blocks',
        method: 'GET',
        qs: queryParams,
      });

      return response.body as ISendGridBlock[];
    } catch (error: any) {
      throw new SendGridError(
        `Failed to ${humanizeNameTitle(action)}: ${error.message || error}`
      );
    }
  },
});

export default listSendGridBlocks;
