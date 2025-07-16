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
} satisfies TQoreOptions;

const getClimateReactSettings = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SENSIBO_APP_NAME,
  options,
  action: 'get_climate_react_settings',
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (obj, _opts, context) => {
    const { token, device } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['device'],
      ErrorClass: SensiboError,
    });

    try {
      return await sensiboApiClient({
        token,
        path: `pods/${device}/smartmode`,
      });
    } catch (error) {
      throw new SensiboError(`Failed to get the climate react settings: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
  },
});

export default getClimateReactSettings;
