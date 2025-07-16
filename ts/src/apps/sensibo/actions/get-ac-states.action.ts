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
  limit: { type: 'number', required: false },
} satisfies TQoreOptions;

const getAcStates = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SENSIBO_APP_NAME,
  options,
  action: 'get_ac_states',
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (obj, _opts, context) => {
    const { token, device } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['device'],
      ErrorClass: SensiboError,
    });

    const limit = obj?.limit;

    try {
      return await sensiboApiClient({
        token,
        params: {
          ...(limit && { limit: limit.toString() }),
        },
        path: `pods/${device}/acStates`,
      });
    } catch (error) {
      throw new SensiboError(`Failed to get the AC states: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
  },
});

export default getAcStates;
