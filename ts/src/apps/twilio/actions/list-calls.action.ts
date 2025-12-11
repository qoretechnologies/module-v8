import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { CallListInstanceEachOptions } from 'twilio/lib/rest/api/v2010/account/call';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { TWILIO_APP_NAME, TwilioError } from '../constants';
import { createTwilioClient } from '../helpers/constants';
import { TwilioCallStatusAllowedValues } from '../helpers/get-call-allowed-values';
import { TwilioCallResponseType } from '../response-types/call';
import { getTwilioPhoneNumberAllowedValues } from '../helpers/get-phone-number-allowed-values';

const action = 'list_calls';

const options = {
  to: {
    type: 'string',
    required: false,
  },
  from: {
    type: 'string',
    required: false,
    get_allowed_values: getTwilioPhoneNumberAllowedValues,
    allowed_values_creatable: true,
  },
  status: {
    type: 'string',
    required: false,
    allowed_values: TwilioCallStatusAllowedValues,
  },
  startTimeAfter: {
    type: 'date',
    required: false,
  },
  startTimeBefore: {
    type: 'date',
    required: false,
  },
  endTimeAfter: {
    type: 'date',
    required: false,
  },
  endTimeBefore: {
    type: 'date',
    required: false,
  },
  limit: {
    type: 'integer',
    default_value: 50,
    required: false,
  },
  pageSize: {
    type: 'integer',
    default_value: 50,
    required: false,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'list',
  element_type: TwilioCallResponseType,
} satisfies TQoreResponseType;

type TListCallsRequest = CallListInstanceEachOptions;

const listTwilioCalls = QoreAppCreator.createLocalizedAction<typeof options>({
  app: TWILIO_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { username, password } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['username', 'password'],
      ErrorClass: TwilioError,
    });

    const client = createTwilioClient(username, password);

    const {
      to,
      from,
      status,
      startTimeAfter,
      startTimeBefore,
      endTimeAfter,
      endTimeBefore,
      limit,
      pageSize,
    } = obj || {};

    try {
      const listOptions: TListCallsRequest = {
        ...(to && { to }),
        ...(from && { from }),
        ...(status && { status: status as any }),
        ...(startTimeAfter && { startTimeAfter: new Date(startTimeAfter) }),
        ...(startTimeBefore && { startTimeBefore: new Date(startTimeBefore) }),
        ...(endTimeAfter && { endTimeAfter: new Date(endTimeAfter) }),
        ...(endTimeBefore && { endTimeBefore: new Date(endTimeBefore) }),
        ...(limit !== undefined && { limit }),
        ...(pageSize !== undefined && { pageSize }),
      };

      return await client.calls.list(listOptions);
    } catch (error) {
      throw new TwilioError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default listTwilioCalls;
