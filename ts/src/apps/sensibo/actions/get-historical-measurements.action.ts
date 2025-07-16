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
  days: {
    type: 'number',
    required: false,
  },
} satisfies TQoreOptions;

const getHistoricalMeasurements = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SENSIBO_APP_NAME,
  options,
  action: 'get_historical_measurements',
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (obj, _opts, context) => {
    const { token, device } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['device'],
      ErrorClass: SensiboError,
    });

    const days = obj?.days;

    try {
      return await sensiboApiClient({
        token,
        params: {
          ...(days && { days: days.toString() }),
        },
        path: `pods/${device}/historicalMeasurements`,
      });
    } catch (error) {
      throw new SensiboError(`Failed to get the historical measurements: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
  },
});

export default getHistoricalMeasurements;
