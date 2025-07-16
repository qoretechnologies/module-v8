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
  property: {
    type: 'string',
    required: true,
    allowed_values: [
      { value: 'on', display_name: 'on' },
      { value: 'mode', display_name: 'mode' },
      { value: 'fanLevel', display_name: 'fanLevel' },
      { value: 'targetTemperature', display_name: 'targetTemperature' },
      { value: 'temperatureUnit', display_name: 'temperatureUnit' },
      { value: 'swing', display_name: 'swing' },
    ],
    on_change: ['refetch'],
  },
  value: {
    type: 'softstring',
    get_dynamic_type: (context) => {
      const property = context?.opts?.property;

      if (['mode', 'fanLevel', 'swing'].includes(property)) {
        return 'string';
      } else if (['targetTemperature'].includes(property)) {
        return 'number';
      } else if (['on'].includes(property)) {
        return 'boolean';
      } else {
        return 'any';
      }
    },
    required: true,
  },
} satisfies TQoreOptions;

const changeDeviceProperty = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SENSIBO_APP_NAME,
  options,
  action: 'change_device_property',
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (obj, _opts, context) => {
    const { token, device, property, value } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['device', 'property', 'value'],
      ErrorClass: SensiboError,
    });

    try {
      return await sensiboApiClient({
        token,
        method: 'POST',
        body: {
          newValue: value,
        },
        path: `/pods/${device}/acStates/${property}`,
      });
    } catch (error) {
      throw new SensiboError(`Failed to get the device: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
  },
});

export default changeDeviceProperty;
