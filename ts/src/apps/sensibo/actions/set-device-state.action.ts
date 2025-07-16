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
  on: {
    type: 'boolean',
    preselected: true,
    required: false,
  },
  mode: {
    type: 'string',
    required: false,
  },
  fanLevel: {
    type: 'string',
    required: false,
  },
  targetTemperature: {
    type: 'number',
    required: false,
  },
  temperatureUnit: {
    type: 'string',
    required: false,
  },
  swing: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const setDeviceState = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SENSIBO_APP_NAME,
  options,
  action: 'set_device_state',
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (obj, _opts, context) => {
    const { token, device } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['device'],
      ErrorClass: SensiboError,
    });

    const { on, mode, fanLevel, targetTemperature, temperatureUnit, swing } = obj || {};

    try {
      return await sensiboApiClient({
        token,
        method: 'POST',
        body: {
          ...(on !== undefined && { on }),
          ...(mode && { mode }),
          ...(fanLevel && { fanLevel }),
          ...(targetTemperature !== undefined && { targetTemperature }),
          ...(temperatureUnit && { temperatureUnit }),
          ...(swing && { swing }),
        },
        path: `pods/${device}/acStates`,
      });
    } catch (error) {
      throw new SensiboError(`Failed to set the device state: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
  },
});

export default setDeviceState;
