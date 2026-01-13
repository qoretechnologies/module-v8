
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { PUSHOVER_APP_NAME, PushoverError } from '../constants';
import { pushoverClient, PushoverResponse } from '../client';

const action = 'validate_user';

const options = {
  device: {
    required: false,
    type: 'string',
  },
} satisfies TQoreOptions;

interface ValidateUserResponse extends PushoverResponse {
  devices: string[];
  licenses: string[];
  group?: number;
}

const validateUser = QoreAppCreator.createLocalizedAction<typeof options>({
  app: PUSHOVER_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, user } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'user'],
      ErrorClass: PushoverError,
    });

    const { device } = obj || {};

    const body: Record<string, any> = {};
    if (device) {
      body.device = device;
    }

    const response = await pushoverClient.postWithAuth<ValidateUserResponse>('/users/validate.json', body, {
      appToken: token,
      userKey: user,
    });

    return {
      valid: true,
      request_id: response.request,
      devices: response.devices || [],
      device_count: (response.devices || []).length,
      licenses: response.licenses || [],
      is_group: response.group === 1,
    };
  },
  response_type: {
    type: 'hash',
    fields: {
      valid: { type: 'bool' },
      request_id: { type: 'string' },
      devices: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
      device_count: { type: 'number' },
      licenses: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
      is_group: { type: 'bool' },
    },
  },
});

export default validateUser;
