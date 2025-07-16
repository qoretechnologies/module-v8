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

const getCurrentTimer = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SENSIBO_APP_NAME,
  options,
  action: 'get_current_timer',
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
        path: `pods/${device}/timer`,
      });
    } catch (error) {
      throw new SensiboError(`Failed to get the current timer: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
  },
});

export default getCurrentTimer;
