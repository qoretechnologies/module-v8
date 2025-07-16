import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { SENSIBO_APP_NAME, SensiboError } from '../constants';
import { sensiboApiClient } from '../helpers/constants';
import { getSensiboDeviceAllowedValues } from '../helpers/get-device-allowed-values';

const options = {
  device: {
    type: 'string',
    required: true,
    get_allowed_values: getSensiboDeviceAllowedValues,
  },
  schedule: {
    type: 'string',
    required: true,
  },
  isEnabled: {
    type: 'boolean',
    required: true,
  },
} satisfies TQoreOptions;

const toggleSchedule = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SENSIBO_APP_NAME,
  options,
  action: 'toggle_schedule',
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (obj, _opts, context) => {
    const { token, device, schedule, isEnabled } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['device', 'schedule', 'isEnabled'],
      ErrorClass: SensiboError,
    });

    try {
      return await sensiboApiClient({
        token,
        method: 'PUT',
        path: `pods/${device}/schedules/${schedule}`,
        body: {
          isEnabled,
        },
      });
    } catch (error) {
      throw new SensiboError(`Failed to toggle the schedule: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
  },
});

export default toggleSchedule;
