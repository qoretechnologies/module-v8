import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { SENSIBO_APP_NAME, SensiboError } from '../constants';
import { sensiboApiClient } from '../helpers/constants';

const getDevices = QoreAppCreator.createLocalizedAction({
  app: SENSIBO_APP_NAME,
  action: 'get_devices',
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: SensiboError,
    });

    try {
      return await sensiboApiClient({
        token,
        params: {
          fields: '*',
        },
        path: `users/me/pods`,
      });
    } catch (error) {
      throw new SensiboError(`Failed to get devices: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      result: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
          },
        },
      },
      status: { type: 'string' },
      isPartial: { type: 'boolean' },
    },
  },
});

export default getDevices;
