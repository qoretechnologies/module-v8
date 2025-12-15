import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SENDGRID_APP_NAME, SendGridError } from '../constants';
import { createSendGridClient } from '../helpers/constants';
import { SendGridBounceResponseType } from '../response-types/bounce';

const action = 'get_all_bounces';

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
  element_type: SendGridBounceResponseType,
} satisfies TQoreResponseType;

interface ISendGridBounce {
  email: string;
  reason: string;
  status: string;
  created: number;
}

const getAllSendGridBounces = QoreAppCreator.createLocalizedAction<typeof options>({
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
        url: '/v3/suppression/bounces',
        method: 'GET',
        qs: queryParams,
      });

      return response.body as ISendGridBounce[];
    } catch (error) {
      throw new SendGridError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default getAllSendGridBounces;
