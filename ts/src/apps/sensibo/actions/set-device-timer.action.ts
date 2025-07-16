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
  minutesFromNow: {
    type: 'number',
    required: true,
  },
  acState: {
    type: {
      type: 'hash',
      fields: {
        on: { type: 'boolean', required: true },
        mode: { type: 'string', required: true },
        fanLevel: { type: 'string', required: false },
        targetTemperature: { type: 'number', required: false },
        temperatureUnit: { type: 'string', required: false },
        swing: { type: 'string', required: false },
      },
    },
  },
} satisfies TQoreOptions;

const setDeviceTimer = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SENSIBO_APP_NAME,
  options,
  action: 'set_device_timer',
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (obj, _opts, context) => {
    const { token, device, ...data } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['device', 'minutesFromNow', 'acState'],
      ErrorClass: SensiboError,
    });

    try {
      return await sensiboApiClient({
        token,
        method: 'PUT',
        body: data,
        path: `pods/${device}/timer`,
      });
    } catch (error) {
      throw new SensiboError(`Failed to set the device timer: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
  },
});

export default setDeviceTimer;
