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
  enable: {
    type: 'boolean',
    required: true,
  },
} satisfies TQoreOptions;

const enableClimateReact = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SENSIBO_APP_NAME,
  options,
  action: 'enable_climate_react',
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (obj, _opts, context) => {
    const { token, device, enable } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['device', 'enable'],
      ErrorClass: SensiboError,
    });

    try {
      return await sensiboApiClient({
        token,
        path: `pods/${device}/smartmode`,
        method: 'PUT',
        body: {
          enable,
        },
      });
    } catch (error) {
      throw new SensiboError(`Failed to enable climate react: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
  },
});

export default enableClimateReact;
