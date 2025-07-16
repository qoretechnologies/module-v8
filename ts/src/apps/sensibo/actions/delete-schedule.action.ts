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
} satisfies TQoreOptions;

const deleteSchedule = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SENSIBO_APP_NAME,
  options,
  action: 'delete_schedule',
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (obj, _opts, context) => {
    const { token, device, schedule } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['device', 'schedule'],
      ErrorClass: SensiboError,
    });

    try {
      return await sensiboApiClient({
        token,
        method: 'DELETE',
        path: `pods/${device}/schedules/${schedule}`,
      });
    } catch (error) {
      throw new SensiboError(`Failed to delete the schedule: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
  },
});

export default deleteSchedule;
