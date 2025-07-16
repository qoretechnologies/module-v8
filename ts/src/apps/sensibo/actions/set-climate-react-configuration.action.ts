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
  enabled: {
    type: 'boolean',
    required: true,
  },
  lowTemperatureThreshold: {
    type: 'number',
    required: true,
  },
  lowTemperatureState: {
    required: true,
    type: {
      type: 'hash',
      fields: {
        on: { type: 'boolean', required: true },
      },
    },
  },
  highTemperatureThreshold: {
    type: 'number',
    required: true,
  },
  highTemperatureState: {
    type: {
      type: 'hash',
      fields: {
        on: { type: 'boolean', required: true },
        mode: {
          type: 'string',
          required: true,
          allowed_values_creatable: true,
          allowed_values: [{ value: 'cool', display_name: 'Cool' }],
        },
      },
    },
  },
} satisfies TQoreOptions;

const setClimateReactConfiguration = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SENSIBO_APP_NAME,
  options,
  action: 'set_climate_react_configuration',
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (obj, _opts, context) => {
    const { token, device, ...data } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: [
        'device',
        'enabled',
        'lowTemperatureThreshold',
        'lowTemperatureState',
        'highTemperatureThreshold',
        'highTemperatureState',
      ],
      ErrorClass: SensiboError,
    });

    try {
      return await sensiboApiClient({
        token,
        path: `pods/${device}/smartmode`,
        method: 'POST',
        body: data,
      });
    } catch (error) {
      throw new SensiboError(`Failed to set climate react configuration: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
  },
});

export default setClimateReactConfiguration;
